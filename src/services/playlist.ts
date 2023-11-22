import AsyncStorage from '@react-native-community/async-storage'
import { PV } from '../resources'
import { checkIfLoggedIn, getBearerToken } from './auth'
import { request } from './request'

export const addOrRemovePlaylistItem = async (playlistId: string, episodeId?: string, mediaRefId?: string) => {
  const bearerToken = await getBearerToken()
  const data = {
    playlistId,
    ...(!mediaRefId ? { episodeId } : { mediaRefId })
  }

  const response = await request({
    endpoint: '/playlist/add-or-remove',
    method: 'PATCH',
    headers: {
      Authorization: bearerToken,
      'Content-Type': 'application/json'
    },
    body: data,
    opts: { credentials: 'include' },
    shouldShowAuthAlert: true
  })

  return response && response.data
}

export const addOrRemovePlaylistItemToDefaultPlaylist = async (episodeId?: string, mediaRefId?: string) => {
  const bearerToken = await getBearerToken()
  const data = {
    ...(!mediaRefId ? { episodeId } : { mediaRefId })
  }

  const response = await request({
    endpoint: '/playlist/default/add-or-remove',
    method: 'PATCH',
    headers: {
      Authorization: bearerToken,
      'Content-Type': 'application/json'
    },
    body: data,
    opts: { credentials: 'include' },
    shouldShowAuthAlert: true
  })

  return response && response.data
}

export const createPlaylist = async (data: any) => {
  const bearerToken = await getBearerToken()
  const response = await request({
    endpoint: '/playlist',
    method: 'POST',
    headers: {
      Authorization: bearerToken,
      'Content-Type': 'application/json'
    },
    body: data,
    opts: { credentials: 'include' },
    shouldShowAuthAlert: true
  })

  return response && response.data
}

export const deletePlaylistOnServer = async (id: string) => {
  const bearerToken = await getBearerToken()
  const response = await request({
    endpoint: `/playlist/${id}`,
    method: 'DELETE',
    headers: { Authorization: bearerToken },
    opts: { credentials: 'include' },
    shouldShowAuthAlert: true
  })

  return response && response.data
}

export const getPlaylists = async (query: any = {}) => {
  const filteredQuery = {
    ...(query.playlistId ? { playlistId: query.playlistId } : {})
  }

  const response = await request({
    endpoint: '/playlist',
    query: filteredQuery
  })

  return response && response.data
}

export const getPlaylist = async (id: string) => {
  const response = await request({
    endpoint: `/playlist/${id}`
  })

  return response && response.data
}

export const toggleSubscribeToPlaylist = async (playlistId: string) => {
  const isLoggedIn = await checkIfLoggedIn()
  return isLoggedIn ? toggleSubscribeToPlaylistOnServer(playlistId) : toggleSubscribeToPlaylistLocally(playlistId)
}

const toggleSubscribeToPlaylistLocally = async (id: string) => {
  let items = []

  const itemsString = await AsyncStorage.getItem(PV.Keys.SUBSCRIBED_PLAYLIST_IDS)
  if (itemsString) {
    items = JSON.parse(itemsString)
  }

  const index = items.indexOf(id)
  if (index > -1) {
    items.splice(index, 1)
  } else {
    items.push(id)
  }

  if (Array.isArray(items)) await AsyncStorage.setItem(PV.Keys.SUBSCRIBED_PLAYLIST_IDS, JSON.stringify(items))

  return items
}

const toggleSubscribeToPlaylistOnServer = async (id: string) => {
  const bearerToken = await getBearerToken()
  const response = await request({
    endpoint: `/playlist/toggle-subscribe/${id}`,
    headers: { Authorization: bearerToken },
    shouldShowAuthAlert: true
  })

  return response && response.data
}

export const updatePlaylist = async (data: any) => {
  const bearerToken = await getBearerToken()
  const response = await request({
    endpoint: '/playlist',
    method: 'PATCH',
    headers: {
      Authorization: bearerToken,
      'Content-Type': 'application/json'
    },
    body: data,
    opts: { credentials: 'include' },
    shouldShowAuthAlert: true
  })

  return response && response.data
}
