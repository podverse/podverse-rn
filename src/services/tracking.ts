/* eslint-disable max-len */
import AsyncStorage from '@react-native-community/async-storage'
import { Platform } from 'react-native'
import { getTrackingStatus, requestTrackingPermission } from 'react-native-tracking-transparency'
import { PV } from '../resources'
import { matomoTrackPageView } from './matomo'

export const getTrackingConsentAcknowledged = async () => {
  const trackingStatus = await getTrackingStatus()
  let result
  if (Platform.OS === 'ios' && trackingStatus !== 'not-determined') {
    result = true
  } else {
    result = await AsyncStorage.getItem(PV.Keys.TRACKING_TERMS_ACKNOWLEDGED)
  }

  return result
}

export const setTrackingConsentAcknowledged = async () => {
  return AsyncStorage.setItem(PV.Keys.TRACKING_TERMS_ACKNOWLEDGED, 'true')
}

export const checkIfTrackingIsEnabled = async () => {
  if (Platform.OS === 'ios') {
    const trackingStatus = await getTrackingStatus()
    return trackingStatus === 'authorized'
  } else {
    return AsyncStorage.getItem(PV.Keys.TRACKING_ENABLED)
  }
}

export const setTrackingEnabled = async (isEnabled?: boolean) => {
  let finalIsEnabled = false

  if (Platform.OS === 'ios') {
    const trackingStatus = await requestTrackingPermission()
    finalIsEnabled = trackingStatus === 'authorized'
  } else {
    if (isEnabled) {
      await AsyncStorage.setItem(PV.Keys.TRACKING_ENABLED, 'true')
      finalIsEnabled = true
    } else {
      await AsyncStorage.removeItem(PV.Keys.TRACKING_ENABLED)
    }
  }

  return finalIsEnabled
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

/* Don't track custom URLs as podcastIds or episodeIds since they could contain PII */
export const getTrackingIdText = (id?: string) => {
  if (id && id.indexOf('http') >= 0) {
    return 'custom-url'
  } else {
    return id || 'id-missing'
  }
}

export const trackPlayerScreenPageView = (item: any) => {
  try {
    if (item?.clipId) {
      trackPageView(
        '/clip/' + item.clipId,
        'Player Screen - Clip - ' + encodeURIComponent(item.podcastTitle) + ' - ' + encodeURIComponent(item.episodeTitle) + ' - ' + encodeURIComponent(item.clipTitle)
      )
    }
    if (item?.episodeId) {
      trackPageView(
        '/episode/' + item.episodeId,
        'Player Screen - Episode - ' + encodeURIComponent(item.podcastTitle) + ' - ' + encodeURIComponent(item.episodeTitle)
      )
    }
    if (item?.podcastId) {
      trackPageView('/podcast/' + item.podcastId, 'Player Screen - Podcast - ' + encodeURIComponent(item.podcastTitle))
    }
  } catch (error) {
    console.log('trackPlayerScreenPageView error', error)
  }
}
