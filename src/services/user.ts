import AsyncStorage from '@react-native-community/async-storage'
import RNSecureKeyStore from 'react-native-secure-key-store'
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

export const toggleSubscribeToUser = async (id: string, isLoggedIn: boolean) => {
  return isLoggedIn ? toggleSubscribeToUserOnServer(id) : toggleSubscribeToUserLocally(id)
}

const toggleSubscribeToUserLocally = async (id: string) => {
  let items = []
  const itemsString = await AsyncStorage.getItem(PV.Keys.SUBSCRIBED_USER_IDS)

  if (itemsString) {
    items = JSON.parse(itemsString)
  }

  const index = items.indexOf(id)
  if (index > -1) {
    items.splice(index, 1)
  } else {
    items.push(id)
  }

  AsyncStorage.setItem(PV.Keys.SUBSCRIBED_USER_IDS, JSON.stringify(items))
  return items
}

const toggleSubscribeToUserOnServer = async (id: string) => {
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
