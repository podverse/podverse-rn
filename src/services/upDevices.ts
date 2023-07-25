import { NativeModules } from 'react-native'
import { getBearerToken } from './auth'
import { request } from './request'

const { PVUnifiedPushModule } = NativeModules

export const saveOrUpdateUPDevice = async (newUPEndpoint: string, upPublicKey: string, upAuthKey: string) => {
  const lastUsedDistributor = await PVUnifiedPushModule.getCurrentDistributor()

  if (newUPEndpoint === lastUsedDistributor) {
    // do nothing
  } else if (!lastUsedDistributor) {
    await upDeviceCreate(newUPEndpoint, upPublicKey, upAuthKey)
  } else {
    await upDeviceUpdate(lastUsedDistributor, newUPEndpoint, upPublicKey, upAuthKey)
  }
}

export const upDeviceCreate = async (upEndpoint: string, upPublicKey: string, upAuthKey: string) => {
  const bearerToken = await getBearerToken()

  const response = await request({
    endpoint: '/up-device/create',
    method: 'POST',
    headers: {
      ...(bearerToken ? { Authorization: bearerToken } : {}),
      'Content-Type': 'application/json'
    },
    body: {
      upEndpoint,
      upPublicKey,
      upAuthKey
    },
    ...(bearerToken ? { opts: { credentials: 'include' } } : {}),
    shouldShowAuthAlert: true
  })

  return response && response.data
}

export const upDeviceDelete = async (upEndpoint: string) => {
  const bearerToken = await getBearerToken()

  const response = await request({
    endpoint: '/up-device/delete',
    method: 'POST',
    headers: {
      ...(bearerToken ? { Authorization: bearerToken } : {}),
      'Content-Type': 'application/json'
    },
    body: {
      upEndpoint
    },
    ...(bearerToken ? { opts: { credentials: 'include' } } : {}),
    shouldShowAuthAlert: true
  })

  return response && response.data
}

export const upDeviceUpdate = async (previousUPEndpoint: string,
    nextUPEndpoint: string, upPublicKey: string, upAuthKey: string) => {
  const bearerToken = await getBearerToken()

  const response = await request({
    endpoint: '/up-device/update',
    method: 'POST',
    headers: {
      ...(bearerToken ? { Authorization: bearerToken } : {}),
      'Content-Type': 'application/json'
    },
    body: {
      previousUPEndpoint,
      nextUPEndpoint,
      upPublicKey,
      upAuthKey
    },
    ...(bearerToken ? { opts: { credentials: 'include' } } : {})
  })

  return response && response.data
}
