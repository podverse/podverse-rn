import AsyncStorage from '@react-native-community/async-storage'
import messaging from '@react-native-firebase/messaging'
import { Alert, Linking, NativeModules } from 'react-native'
import { requestNotifications, RESULTS } from 'react-native-permissions'
import { getGlobal } from 'reactn'
import { checkIfFDroidAppVersion } from '../lib/deviceDetection'
import { translate } from '../lib/i18n'
import { debugLogger, errorLogger } from '../lib/logger'
import { PV } from '../resources'
import { getBearerToken } from './auth'
import { fcmTokenGetLocally, saveOrUpdateFCMDevice } from './fcmDevices'
import { request } from './request'
import { saveOrUpdateUPDevice, upDeviceDelete } from './upDevices'

const { PVUnifiedPushModule } = NativeModules

const _fileName = 'src/services/notifications.ts'

/* Shared notification helpers */

export const checkIfNotificationsEnabled = async () => {
  if (checkIfFDroidAppVersion()) {
    return checkIfUPNotificationsEnabled()
  } else {
    const localFCMSaved = await fcmTokenGetLocally()
    return !!localFCMSaved
  }
}

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

/* FCM notification helpers (used in Apple and Google Play releases) */

export const enableFCMNotifications = async (callback: any) => {
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
      errorLogger(_fileName, 'enableFCMNotifications', err)
    }
  }
}

// TODO: handle disableFCMNotifications

/* UP notification helpers (used in F-Droid releases) */

export const checkIfUPNotificationsEnabled = async () => {
  const value = await AsyncStorage.getItem(PV.Keys.NOTIFICATIONS_UNIFIED_PUSH_ENABLED)
  return !!value
}

export const setUPDistributor = async (upDistributor: string) => {
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
      await PVUnifiedPushModule.setUPDistributor(upDistributor)
    } else {
      Alert.alert(PV.Alerts.ENABLE_NOTIFICATIONS_SETTINGS.title, PV.Alerts.ENABLE_NOTIFICATIONS_SETTINGS.message, [
        { text: translate('Cancel') },
        { text: translate('Go to Settings'), onPress: () => Linking.openSettings() }
      ])
    }

    await AsyncStorage.setItem(PV.Keys.NOTIFICATIONS_UNIFIED_PUSH_ENABLED, 'TRUE')
  }
}

export const enableUPNotifications = async (newUpEndpoint: string) => {
  const { session } = getGlobal()

  if (!session?.isLoggedIn) {
    Alert.alert(
      PV.Alerts.LOGIN_TO_ENABLE_PODCAST_NOTIFICATIONS.title,
      PV.Alerts.LOGIN_TO_ENABLE_PODCAST_NOTIFICATIONS.message
    )
  } else {
    const keys = await PVUnifiedPushModule.getUPPushKeys()

    const upPublicKey = keys.publicKey
    const upAuthKey = keys.authKey
    debugLogger(`UnifiedPush publicKey: ${upPublicKey}`)
    debugLogger(`UnifiedPush authKey: ${upAuthKey}`)

    await saveOrUpdateUPDevice(newUpEndpoint, upPublicKey, upAuthKey)
  }
}

export const disableUPNotifications = async () => {
  const upEndpoint = await PVUnifiedPushModule.getCurrentDistributor()
  await upDeviceDelete(upEndpoint)
  await AsyncStorage.removeItem(PV.Keys.NOTIFICATIONS_UNIFIED_PUSH_ENABLED)
}
