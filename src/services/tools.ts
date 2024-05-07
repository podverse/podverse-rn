import { Platform } from 'react-native'
import { errorLogger } from '../lib/logger'
import { request } from './request'

export const getSecureUrl = async (mediaUrl: string) => {
  let finalUrl = mediaUrl

  try {
    if (mediaUrl.startsWith('http://')) {
      const response = await request({
        endpoint: '/tools/findHTTPS',
        method: 'POST',
        body: { url: mediaUrl }
      })
    
      const secureUrlInfo = response?.data || {}
      const { secureUrl } = secureUrlInfo
  
      if (secureUrl?.startsWith('https://')) {
        finalUrl = secureUrl
      }
    } 
    
    /*
      Find and replace ALL "http://" matches because sometimes
      episodes use a tracker prefix url, then redirects to
      the actual URL passed in as a parameter
      For example: from Andrew Schulz's Flagrant with Akaash Singh
      https://chrt.fm/track/9DD8D/pdst.fm/e/http://feeds.soundcloud.com/stream/1351569700-flagrantpodcast-mr-beast.mp3
    */
    if (mediaUrl.indexOf('http://') >= 0) {
      finalUrl = mediaUrl.replace(/http:\/\//g, 'https://')
    }

    /*
      To avoid a "too many redirects" error with @kesha-antonov/react-native-background-downloader on Android
      when downloading episodes that have many redirects, we are first making a HEAD request to resolve the
      final URL before downloading the episode.
    */
    if (Platform.OS === 'android') {
      const redirectResponse = await request({
        method: 'HEAD'
      }, finalUrl)
      if (redirectResponse?.request?.responseURL) {
        finalUrl = redirectResponse.request.responseURL

        /*
          Sometimes the final redirected URL will begin with http. Change it to https
          to avoid "cleartext not allowed" errors on Android.
        */
        if (mediaUrl.indexOf('http://') >= 0) {
          finalUrl = mediaUrl.replace(/http:\/\//g, 'https://')
        }
      }
    }
  } catch (error) {
    errorLogger('getSecureUrl', 'Secure url not found for http mediaUrl. Info: ', error)
  }

  return finalUrl
}
