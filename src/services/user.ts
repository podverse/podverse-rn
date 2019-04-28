import RNSecureKeyStore from 'react-native-secure-key-store'
import { NowPlayingItem } from '../lib/NowPlayingItem'
import { PV } from '../resources'
import { request } from './request'

export const getPublicUser = async (id: string) => {
  const response = await request({
    endpoint: `/user/${id}`
  })

  return response.json()
}

export const getUserMediaRefs = async (userId: string, query: any = {}, nsfwMode: boolean) => {
  const filteredQuery = {
    ...(query.page ? { page: query.page } : { page: 1 }),
    ...(query.sort ? { sort: query.sort } : { sort: 'most-recent' })
  }

  const response = await request({
    endpoint: `/user/${userId}/mediaRefs`,
    query: filteredQuery
  }, nsfwMode)

  return response.json()
}

export const getUserPlaylists = async (userId: string, query: any = {}) => {
  const filteredQuery = {
    ...(query.page ? { page: query.page } : { page: 1 })
  }

  const response = await request({
    endpoint: `/user/${userId}/playlists`,
    query: filteredQuery
  })

  return response.json()
}

export const getPublicUsersByQuery = async (query: any = {}) => {
  const filteredQuery = {
    ...(query.page ? { page: query.page } : { page: 1 }),
    ...(query.userIds ? { userIds: query.userIds } : {})
  }

  const response = await request({
    endpoint: `/user`,
    query: filteredQuery
  })

  return response.json()
}

export const toggleSubscribeToUser = async (id: string) => {
  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  const response = await request({
    endpoint: `/user/toggle-subscribe/${id}`,
    headers: { Authorization: bearerToken }
  })

  return response.json()
}

export const getLoggedInUserMediaRefs = async (query: any = {}, nsfwMode?: boolean) => {
  const filteredQuery = {
    ...(query.page ? { page: query.page } : { page: 1 }),
    ...(query.sort ? { sort: query.sort } : { sort: 'top-past-week' })
  } as any

  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  const response = await request({
    endpoint: '/user/mediaRefs',
    query: filteredQuery,
    headers: { Authorization: bearerToken }
  }, nsfwMode)

  return response.json()
}

export const getLoggedInUserPlaylists = async (nsfwMode?: boolean) => {
  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  const response = await request({
    endpoint: '/user/playlists',
    headers: { Authorization: bearerToken }
  }, nsfwMode)

  return response.json()
}

export const deleteLoggedInUser = async () => {
  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  const response = await request({
    endpoint: '/user',
    method: 'DELETE',
    headers: { Authorization: bearerToken },
    opts: { credentials: 'include' }
  })

  return response.json()
}

export const updateLoggedInUser = async (data: any) => {
  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  const response = await request({
    endpoint: '/user',
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
    endpoint: '/user/add-or-update-history-item',
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

export const clearUserHistoryItems = async () => {
  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  const response = await request({
    endpoint: '/user/history-item/clear-all',
    method: 'DELETE',
    headers: {
      'Authorization': bearerToken,
      'Content-Type': 'application/json'
    },
    opts: { credentials: 'include' }
  })

  return response.json()
}

export const removeUserHistoryItem = async (episodeId?: string, mediaRefId?: string) => {
  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  const query = { ...(!mediaRefId ? { episodeId } : { mediaRefId }) }
  const response = await request({
    endpoint: '/user/history-item',
    query,
    method: 'DELETE',
    headers: {
      'Authorization': bearerToken,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    opts: { credentials: 'include' }
  })

  return response.json()
}

export const downloadLoggedInUserData = async (id: string) => {
  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  const response = await request({
    endpoint: '/user/download',
    method: 'GET',
    headers: { Authorization: bearerToken },
    opts: { credentials: 'include' }
  })

  return response.json()
}

export const updateUserQueueItems = async (queueItems: any) => {
  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  const response = await request({
    endpoint: '/user/update-queue',
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
