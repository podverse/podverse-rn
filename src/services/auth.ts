import RNSecureKeyStore, { ACCESSIBLE } from 'react-native-secure-key-store'
import { NowPlayingItem } from '../lib/NowPlayingItem'
import { PV } from '../resources'
import { request } from './request'

export const getAuthenticatedUserInfo = async () => {
  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  const response = await request({
    endpoint: '/auth/get-authenticated-user-info',
    method: 'POST',
    headers: {
      'Authorization': bearerToken,
      'Content-Type': 'application/json'
    }
  })

  return response.json()
}

export const login = async (email: string, password: string) => {
  const response = await request({
    method: 'POST',
    endpoint: '/auth/login',
    headers: { 'Content-Type': 'application/json' },
    body: {
      email,
      password
    },
    query: { includeBodyToken: true },
    opts: { credentials: 'include' }
  })

  const data = await response.json()
  if (data.token) {
    RNSecureKeyStore.set(PV.Keys.BEARER_TOKEN, data.token, { accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY })
  }

  return data
}

export const getLoggedInUserMediaRefs = async (query: any = {}, nsfwMode?: boolean) => {
  const filteredQuery = {
    ...(query.page ? { page: query.page } : { page: 1 }),
    ...(query.sort ? { sort: query.sort } : { sort: 'top-past-week' })
  } as any

  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  const response = await request({
    endpoint: '/auth/mediaRefs',
    query: filteredQuery,
    headers: { Authorization: bearerToken }
  }, nsfwMode)

  return response.json()
}

export const getLoggedInUserPlaylists = async (nsfwMode?: boolean) => {
  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  const response = await request({
    endpoint: '/auth/playlists',
    headers: { Authorization: bearerToken }
  }, nsfwMode)

  return response.json()
}

export const sendResetPassword = async (email: string) => {
  const response = await request({
    endpoint: '/auth/send-reset-password',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      email
    },
    opts: { credentials: 'include' }
  })

  return response.json()
}

export const signUp = async (email: string, password: string, name: string) => {
  const response = await request({
    endpoint: '/auth/sign-up',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      email,
      password,
      name
    },
    query: { includeBodyToken: true },
    opts: { credentials: 'include' }
  })

  const data = await response.json()

  if (data.token) {
    RNSecureKeyStore.set(PV.Keys.BEARER_TOKEN, data.token, { accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY })
  }

  return data
}

export const deleteLoggedInUser = async () => {
  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  const response = await request({
    endpoint: '/auth/user',
    method: 'DELETE',
    headers: { Authorization: bearerToken },
    opts: { credentials: 'include' }
  })

  return response.json()
}

export const updateLoggedInUser = async (data: any) => {
  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  const response = await request({
    endpoint: '/auth/user',
    method: 'PATCH',
    headers: {
      'Authorization': bearerToken,
      'Content-Type': 'application/json'
    },
    body: data,
    opts: { credentials: 'include' }
  })

  return response.json()
}

export const addOrUpdateUserHistoryItem = async (nowPlayingItem: NowPlayingItem) => {
  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  const response = await request({
    endpoint: '/auth/user/add-or-update-history-item',
    method: 'PATCH',
    headers: {
      'Authorization': bearerToken,
      'Content-Type': 'application/json'
    },
    body: { historyItem: nowPlayingItem },
    opts: { credentials: 'include' }
  })

  return response.json()
}

export const downloadLoggedInUserData = async (id: string) => {
  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  const response = await request({
    endpoint: '/auth/user/download',
    method: 'GET',
    headers: { Authorization: bearerToken },
    opts: { credentials: 'include' }
  })

  return response.json()
}

export const updateUserQueueItems = async (queueItems: any) => {
  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  const response = await request({
    endpoint: '/auth/user/update-queue',
    method: 'PATCH',
    headers: {
      'Authorization': bearerToken,
      'Content-Type': 'application/json'
    },
    body: { queueItems },
    opts: { credentials: 'include' }
  })

  return response.json()
}
