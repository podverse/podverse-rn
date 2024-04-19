import url from 'url'
import { errorLogger } from '../lib/logger'
import { request } from './request'

const forceSecureRedirectDomains = {
  'feeds.gty.org': true,
  // we've found pdst.fm mp3s to use up to 6 redirects, which causes errors with Android downloads
  'pdst.fm': true
}

export const getSecureUrl = async (mediaUrl: string) => {
  let finalUrl = mediaUrl

  try {
    const hostname = url?.parse(mediaUrl)?.hostname
    if ((hostname && forceSecureRedirectDomains[hostname]) || mediaUrl.startsWith('http://')) {
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
    } else if (mediaUrl.indexOf('http://') >= 0) {
      /*
        Find and replace ALL "http://" matches because sometimes
        episodes use a tracker prefix url, then redirects to
        the actual URL passed in as a parameter
        For example: from Andrew Schulz's Flagrant with Akaash Singh
        https://chrt.fm/track/9DD8D/pdst.fm/e/http://feeds.soundcloud.com/stream/1351569700-flagrantpodcast-mr-beast.mp3
      */
        finalUrl = mediaUrl.replaceAll('http://', 'https://')
    }
  } catch (error) {
    errorLogger('getSecureUrl', 'Secure url not found for http mediaUrl. Info: ', error)
  }

  return finalUrl
}
