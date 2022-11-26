import AsyncStorage from '@react-native-community/async-storage'
import { PV } from '../resources'
import { checkIfLoggedIn, getBearerToken } from './auth'
import { request } from './request'

export const getPublicUser = async (id: string) => {
  const response = await request({
    endpoint: `/user/${id}`
  })

  return response && response.data
}

export const getUserMediaRefs = async (userId: string, query: any = {}) => {
  const filteredQuery = {
    ...(query.page ? { page: query.page } : { page: 1 }),
    ...(query.sort ? { sort: query.sort } : { sort: 'most-recent' })
  }

  const response = await request({
    endpoint: `/user/${userId}/mediaRefs`,
    query: filteredQuery
  })

  return response && response.data
}

export const getUserPlaylists = async (userId: string, query: any = {}) => {
  const filteredQuery = {
    ...(query.page ? { page: query.page } : { page: 1 })
  }

  const response = await request({
    endpoint: `/user/${userId}/playlists`,
    query: filteredQuery
  })

  return response && response.data
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

  return response && response.data
}

export const toggleSubscribeToUser = async (id: string) => {
  const isLoggedIn = await checkIfLoggedIn()
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

  if (Array.isArray(items)) await AsyncStorage.setItem(PV.Keys.SUBSCRIBED_USER_IDS, JSON.stringify(items))
  return items
}

const toggleSubscribeToUserOnServer = async (id: string) => {
  const bearerToken = await getBearerToken()
  const response = await request({
    endpoint: `/user/toggle-subscribe/${id}`,
    headers: { Authorization: bearerToken },
    shouldShowAuthAlert: true
  })

  return response && response.data
}

export const getLoggedInUserMediaRefs = async (query: any = {}) => {
  const filteredQuery = {
    ...(query.page ? { page: query.page } : { page: 1 }),
    ...(query.sort ? { sort: query.sort } : {})
  } as any

  const bearerToken = await getBearerToken()
  const response = await request({
    endpoint: '/user/mediaRefs',
    query: filteredQuery,
    headers: { Authorization: bearerToken }
  })

  return response && response.data
}

export const getLoggedInUserPlaylistsCombined = async () => {
  const bearerToken = await getBearerToken()
  const response = await request({
    endpoint: '/user/playlists/combined',
    headers: { Authorization: bearerToken }
  })

  return response && response.data
}

export const getLoggedInUserPlaylists = async () => {
  const bearerToken = await getBearerToken()
  const response = await request({
    endpoint: '/user/playlists',
    headers: { Authorization: bearerToken }
  })

  return response && response.data
}

export const deleteLoggedInUser = async () => {
  const bearerToken = await getBearerToken()
  const response = await request({
    endpoint: '/user',
    method: 'DELETE',
    headers: { Authorization: bearerToken },
    opts: { credentials: 'include' }
  })

  return response && response.data
}

export const updateLoggedInUser = async (data: any) => {
  const bearerToken = await getBearerToken()
  const response = await request({
    endpoint: '/user',
    method: 'PATCH',
    headers: {
      Authorization: bearerToken,
      'Content-Type': 'application/json'
    },
    body: data,
    opts: { credentials: 'include' }
  })

  return response && response.data
}

export const downloadLoggedInUserData = async () => {
  const bearerToken = await getBearerToken()
  const response = await request({
    endpoint: '/user/download',
    method: 'GET',
    headers: { Authorization: bearerToken },
    opts: { credentials: 'include' }
  })

  return response && response.data
}

export const updateUserQueueItems = async (queueItems: any) => {
  const bearerToken = await getBearerToken()
  const response = await request({
    endpoint: '/user/update-queue',
    method: 'PATCH',
    headers: {
      Authorization: bearerToken,
      'Content-Type': 'application/json'
    },
    body: { queueItems },
    opts: { credentials: 'include' }
  })

  return response && response.data
}

export const saveSpecialUserInfoForPodcast = async (userInfo: any, podcastId: string) => {
  if (userInfo && podcastId) {
    const jsonData = JSON.stringify({ [podcastId]: userInfo })
    await AsyncStorage.setItem('SPECIAL_USER_INFO', jsonData)
  }
}

export const getSpecialUserInfoForPodcast = async (podcastId: string) => {
  const specialInfoString = await AsyncStorage.getItem('SPECIAL_USER_INFO')
  if (specialInfoString) {
    const specialInfo = JSON.parse(specialInfoString)
    return specialInfo[podcastId]
  }

  return null
}

export const clearSpecialUserInfoForPodcast = async (podcastId: string) => {
  let specialInfoString = await AsyncStorage.getItem('SPECIAL_USER_INFO')
  if (specialInfoString) {
    const specialInfo = JSON.parse(specialInfoString)
    delete specialInfo[podcastId]
    specialInfoString = JSON.stringify(specialInfo)
    await AsyncStorage.setItem('SPECIAL_USER_INFO', specialInfoString)
  }
}
