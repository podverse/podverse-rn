import { getBearerToken } from './auth'
import { request } from './request'

export const createMediaRef = async (data: any) => {
  const bearerToken = await getBearerToken()

  const response = await request({
    endpoint: '/mediaRef',
    method: 'POST',
    headers: {
      ...(bearerToken ? { Authorization: bearerToken } : {}),
      'Content-Type': 'application/json'
    },
    body: data,
    ...(bearerToken ? { opts: { credentials: 'include' } } : {}),
    shouldShowAuthAlert: true
  })

  return response && response.data
}

export const deleteMediaRef = async (id: string) => {
  const bearerToken = await getBearerToken()
  const response = await request({
    endpoint: `/mediaRef/${id}`,
    method: 'DELETE',
    headers: { Authorization: bearerToken },
    opts: { credentials: 'include' },
    shouldShowAuthAlert: true
  })

  return response && response.data
}

export const getMediaRef = async (id: string) => {
  const response = await request({
    endpoint: `/mediaRef/${id}`
  })

  return response && response.data
}

export const getMediaRefs = async (query: any = {}) => {
  const searchTitle = query.searchTitle ? encodeURIComponent(query.searchTitle) : ''

  const filteredQuery = {
    ...(query.page ? { page: query.page } : { page: 1 }),
    ...(query.sort ? { sort: query.sort } : {}),
    ...(query.podcastId ? { podcastId: query.podcastId } : {}),
    ...(query.episodeId ? { episodeId: query.episodeId } : {}),
    ...(searchTitle ? { searchTitle } : {}),
    ...(query.includeEpisode ? { includeEpisode: true } : {}),
    ...(query.includePodcast ? { includePodcast: true } : {}),
    ...(query.hasVideo ? { hasVideo: true } : {})
  } as any

  if (query.categories) {
    filteredQuery.categories = query.categories
  }

  if (query.subscribedOnly && query.podcastId && query.podcastId.length === 0) {
    return [0, 0]
  }

  if (query.episodeId && query.episodeId.length === 0) {
    return [0, 0]
  }

  const response = await request({
    endpoint: '/mediaRef',
    query: filteredQuery
  })

  return response && response.data
}

export const updateMediaRef = async (data: any) => {
  const bearerToken = await getBearerToken()
  const response = await request({
    endpoint: '/mediaRef',
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
