import RNSecureKeyStore from 'react-native-secure-key-store'
import { PV } from '../resources'
import { request } from './request'

export const addOrRemovePlaylistItem = async (data: any) => {
  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  const response = await request({
    endpoint: '/playlist/add-or-remove',
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

export const createPlaylist = async (data: any) => {
  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  const response = await request({
    endpoint: '/playlist',
    method: 'POST',
    headers: {
      'Authorization': bearerToken,
      'Content-Type': 'application/json'
    },
    body: data,
    opts: { credentials: 'include' }
  })

  return response.json()
}

export const deletePlaylist = async (data: any) => {
  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  const response = await request({
    endpoint: '/mediaRef',
    method: 'DELETE',
    headers: { Authorization: bearerToken },
    body: data,
    opts: { credentials: 'include' }
  })

  return response.json()
}

export const getPlaylists = async (query: any = {}, nsfwMode: boolean) => {
  const filteredQuery = {
    ...(query.playlistId ? { playlistId: query.playlistId } : {})
  }

  const response = await request({
    endpoint: '/playlist',
    query: filteredQuery
  }, nsfwMode)

  return response.json()
}

export const getPlaylist = async (id: string) => {
  const response = await request({
    endpoint: `/playlist/${id}`
  })

  return response.json()
}

export const toggleSubscribeToPlaylist = async (id: string) => {
  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  const response = await request({
    endpoint: `/playlist/toggle-subscribe/${id}`,
    headers: { Authorization: bearerToken }
  })

  return response.json()
}

export const updatePlaylist = async (data: any) => {
  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  const response = await request({
    endpoint: '/playlist',
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
