import RNSecureKeyStore from 'react-native-secure-key-store'
import { PV } from '../resources'
import { request } from './request'

export const createMediaRef = async (data: any) => {
  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  const response = await request({
    endpoint: '/mediaRef',
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

export const deleteMediaRef = async () => {
  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  const response = await request({
    endpoint: '/mediaRef',
    method: 'DELETE',
    headers: { Authorization: bearerToken },
    opts: { credentials: 'include' }
  })

  return response.json()
}

export const getMediaRefs = async (query: any = {}, nsfwMode: boolean) => {
  console.log(query)
  const filteredQuery = {
    ...(query.page ? { page: query.page } : { page: 1 }),
    ...(query.sort ? { sort: query.sort } : { sort: 'top-past-week' }),
    ...(query.podcastId ? { podcastId: query.podcastId } : {}),
    ...(query.episodeId ? { episodeId: query.episodeId } : {}),
    ...(query.searchAllFieldsText ? { searchAllFieldsText: query.searchAllFieldsText } : {}),
    ...(query.includeEpisode ? { includeEpisode: true } : {}),
    ...(query.includePodcast ? { includePodcast: true } : {})
  }
  console.log(filteredQuery)
  const response = await request({
    endpoint: '/mediaRef',
    query: filteredQuery
  }, nsfwMode)

  return response.json()
}

export const getMediaRef = async (id: string) => {
  const response = await request({
    endpoint: `/mediaRef/${id}`
  })

  return response.json()
}

export const updateMediaRef = async (data: any) => {
  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  const response = await request({
    endpoint: '/mediaRef',
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
