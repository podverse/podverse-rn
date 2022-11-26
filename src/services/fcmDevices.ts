import AsyncStorage from '@react-native-community/async-storage'
import { PV } from '../resources'
import { getBearerToken } from './auth'
import { request } from './request'

const fcmTokenSaveLocally = async (fcmToken: string) => {
  await AsyncStorage.setItem(PV.Keys.FCM_TOKEN_LAST_USED, fcmToken)
}

export const fcmTokenGetLocally = () => {
  return AsyncStorage.getItem(PV.Keys.FCM_TOKEN_LAST_USED)
}

export const saveOrUpdateFCMDevice = async (newFCMToken: string) => {
  const lastUsedFCMToken = await fcmTokenGetLocally()
  if (newFCMToken === lastUsedFCMToken) {
    // do nothing
  } else if (!lastUsedFCMToken) {
    await fcmDeviceCreate(newFCMToken)
  } else {
    await fcmDeviceUpdate(lastUsedFCMToken, newFCMToken)
  }
}

export const fcmDeviceCreate = async (fcmToken: string) => {
  const bearerToken = await getBearerToken()

  const response = await request({
    endpoint: '/fcm-device/create',
    method: 'POST',
    headers: {
      ...(bearerToken ? { Authorization: bearerToken } : {}),
      'Content-Type': 'application/json'
    },
    body: {
      fcmToken
    },
    ...(bearerToken ? { opts: { credentials: 'include' } } : {}),
    shouldShowAuthAlert: true
  })

  await fcmTokenSaveLocally(fcmToken)

  return response && response.data
}

export const fcmDeviceDelete = async (fcmToken: string) => {
  const bearerToken = await getBearerToken()

  const response = await request({
    endpoint: '/fcm-device/delete',
    method: 'POST',
    headers: {
      ...(bearerToken ? { Authorization: bearerToken } : {}),
      'Content-Type': 'application/json'
    },
    body: {
      fcmToken
    },
    ...(bearerToken ? { opts: { credentials: 'include' } } : {}),
    shouldShowAuthAlert: true
  })

  return response && response.data
}

export const fcmDeviceUpdate = async (previousFCMToken: string, nextFCMToken: string) => {
  const bearerToken = await getBearerToken()

  const response = await request({
    endpoint: '/fcm-device/update',
    method: 'POST',
    headers: {
      ...(bearerToken ? { Authorization: bearerToken } : {}),
      'Content-Type': 'application/json'
    },
    body: {
      previousFCMToken,
      nextFCMToken
    },
    ...(bearerToken ? { opts: { credentials: 'include' } } : {})
  })

  await fcmTokenSaveLocally(nextFCMToken)

  return response && response.data
}
