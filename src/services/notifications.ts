import AsyncStorage from '@react-native-community/async-storage'
import messaging from '@react-native-firebase/messaging'
import { getGlobal } from 'reactn'
import { Alert, Linking } from 'react-native'
import { requestNotifications, RESULTS } from 'react-native-permissions'
import { translate } from '../lib/i18n'
import { errorLogger } from '../lib/logger'
import { PV } from '../resources'
import { getBearerToken } from './auth'
import { saveOrUpdateFCMDevice } from './fcmDevices'
import { request } from './request'

const _fileName = 'src/services/notifications.ts'

/* Device native notification helpers */

// TODO: handle disableNotifications

export const enableNotifications = async (callback: any) => {
  const { session } = getGlobal()

  if (!session?.isLoggedIn) {
    Alert.alert(
      PV.Alerts.LOGIN_TO_ENABLE_PODCAST_NOTIFICATIONS.title,
      PV.Alerts.LOGIN_TO_ENABLE_PODCAST_NOTIFICATIONS.message
    )
  } else {
    try {
      const { status } = await requestNotifications(['alert', 'sound', 'badge'])
      const enabled = status === RESULTS.GRANTED || status === RESULTS.LIMITED
      if (enabled) {
        const fcmToken = await messaging().getToken()
        await saveOrUpdateFCMDevice(fcmToken)
        await callback()
      } else {
        Alert.alert(PV.Alerts.ENABLE_NOTIFICATIONS_SETTINGS.title, PV.Alerts.ENABLE_NOTIFICATIONS_SETTINGS.message, [
          { text: translate('Cancel') },
          { text: translate('Go to Settings'), onPress: () => Linking.openSettings() }
        ])
      }
    } catch (err) {
      errorLogger(_fileName, 'enableNotifications', err)
    }
  }
}

/* UP notification helpers */

export const getUPNotificationsEnabled = async () => {
  const value = await AsyncStorage.getItem(PV.Keys.NOTIFICATIONS_UNIFIED_PUSH_ENABLED)
  return !!value
}

export const setUPNotificationsEnabled = async () => {
  const { session } = getGlobal()

  if (!session?.isLoggedIn) {
    Alert.alert(
      PV.Alerts.LOGIN_TO_ENABLE_PODCAST_NOTIFICATIONS.title,
      PV.Alerts.LOGIN_TO_ENABLE_PODCAST_NOTIFICATIONS.message
    )
  } else {
    const { status } = await requestNotifications(['alert', 'sound', 'badge'])
    const enabled = status === RESULTS.GRANTED || status === RESULTS.LIMITED
    if (enabled) {
      // get upEndpoint
      // save upEndpoint to server
      // await saveOrUpdateFCMDevice(fcmToken)
    } else {
      Alert.alert(PV.Alerts.ENABLE_NOTIFICATIONS_SETTINGS.title, PV.Alerts.ENABLE_NOTIFICATIONS_SETTINGS.message, [
        { text: translate('Cancel') },
        { text: translate('Go to Settings'), onPress: () => Linking.openSettings() }
      ])
    }

    await AsyncStorage.setItem(PV.Keys.NOTIFICATIONS_UNIFIED_PUSH_ENABLED, 'TRUE')
  }
}

export const removeUPNotificationsEnabled = async () => {
  await AsyncStorage.removeItem(PV.Keys.NOTIFICATIONS_UNIFIED_PUSH_ENABLED)
}

/* Shared notification helpers */

export const notificationSubscribe = async (podcastId: string) => {
  const bearerToken = await getBearerToken()

  const response = await request({
    endpoint: '/notification/podcast/subscribe',
    method: 'POST',
    headers: {
      ...(bearerToken ? { Authorization: bearerToken } : {}),
      'Content-Type': 'application/json'
    },
    body: {
      podcastId
    },
    ...(bearerToken ? { opts: { credentials: 'include' } } : {}),
    shouldShowAuthAlert: true
  })

  return response && response.data
}

export const notificationUnsubscribe = async (podcastId: string) => {
  const bearerToken = await getBearerToken()

  const response = await request({
    endpoint: '/notification/podcast/unsubscribe',
    method: 'POST',
    headers: {
      ...(bearerToken ? { Authorization: bearerToken } : {}),
      'Content-Type': 'application/json'
    },
    body: {
      podcastId
    },
    ...(bearerToken ? { opts: { credentials: 'include' } } : {}),
    shouldShowAuthAlert: true
  })

  return response && response.data
}
