/* eslint-disable max-len */
import AsyncStorage from '@react-native-community/async-storage'
import { PV } from '../resources'
import { matomoTrackPageView } from './matomo'

export const getTrackingConsentAcknowledged = async () => {
  return AsyncStorage.getItem(PV.Keys.TRACKING_TERMS_ACKNOWLEDGED)
}

export const setTrackingConsentAcknowledged = async () => {
  return AsyncStorage.setItem(PV.Keys.TRACKING_TERMS_ACKNOWLEDGED, 'true')
}

export const checkIfTrackingIsEnabled = async () => {
  return AsyncStorage.getItem(PV.Keys.TRACKING_ENABLED)
}

export const setTrackingEnabled = async (isEnabled: boolean) => {
  if (isEnabled) {
    await AsyncStorage.setItem(PV.Keys.TRACKING_ENABLED, 'true')
  } else {
    await AsyncStorage.removeItem(PV.Keys.TRACKING_ENABLED)
  }
}

export const trackPageView = async (path: string, title: string, titleToEncode?: string) => {
  const trackingEnabled = await checkIfTrackingIsEnabled()
  if (trackingEnabled) {
    try {
      const finalTitle = `${title}${titleToEncode ? encodeURIComponent(titleToEncode) : ''}`
      await matomoTrackPageView(path, finalTitle)
    } catch (error) {
      console.log('trackPageView error', error)
    }
  }
}

export const trackPlayerScreenPageView = (item: any) => {
  try {
    if (item.clipId) {
      trackPageView(
        '/clip/' + item.clipId,
        'Player Screen - Clip - ' + encodeURIComponent(item.podcastTitle) + ' - ' + encodeURIComponent(item.episodeTitle) + ' - ' + encodeURIComponent(item.clipTitle)
      )
    }
    if (item.episodeId) {
      trackPageView(
        '/episode/' + item.episodeId,
        'Player Screen - Episode - ' + encodeURIComponent(item.podcastTitle) + ' - ' + encodeURIComponent(item.episodeTitle)
      )
    }
    if (item.podcastId) {
      trackPageView('/podcast/' + item.podcastId, 'Player Screen - Podcast - ' + encodeURIComponent(item.podcastTitle))
    }
  } catch (error) {
    console.log('trackPlayerScreenPageView error', error)
  }
}
