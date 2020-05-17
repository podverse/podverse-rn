import { hasValidDownloadingConnection, hasValidNetworkConnection } from '../lib/network'
import { PV } from '../resources'
import { getBearerToken } from './auth'
import { request } from './request'
const BadWords = require('bad-words')
const badWords = new BadWords()

export const createMediaRef = async (data: any) => {
  await hasValidNetworkConnection()
  await hasValidDownloadingConnection()
  const bearerToken = await getBearerToken()

  const response = await request({
    endpoint: '/mediaRef',
    method: 'POST',
    headers: {
      ...(bearerToken ? { Authorization: bearerToken } : {}),
      'Content-Type': 'application/json'
    },
    body: data,
    ...(bearerToken ? { opts: { credentials: 'include' } } : {})
  })

  return response && response.data
}

export const deleteMediaRef = async (id: string) => {
  const bearerToken = await getBearerToken()
  const response = await request({
    endpoint: `/mediaRef/${id}`,
    method: 'DELETE',
    headers: { Authorization: bearerToken },
    opts: { credentials: 'include' }
  })

  return response && response.data
}

export const getMediaRef = async (id: string) => {
  const response = await request({
    endpoint: `/mediaRef/${id}`
  })

  return response && response.data
}

export const getMediaRefs = async (query: any = {}, nsfwMode: boolean) => {
  const filteredQuery = {
    ...(query.page ? { page: query.page } : { page: 1 }),
    ...(query.sort ? { sort: query.sort } : { sort: 'top-past-week' }),
    ...(query.podcastId ? { podcastId: query.podcastId } : {}),
    ...(query.episodeId ? { episodeId: query.episodeId } : {}),
    ...(query.searchAllFieldsText ? { searchAllFieldsText: query.searchAllFieldsText } : {}),
    ...(query.includeEpisode ? { includeEpisode: true } : {}),
    ...(query.includePodcast ? { includePodcast: true } : {})
  } as any

  if (query.categories && query.categories !== PV.Filters._allCategoriesKey) {
    filteredQuery.categories = query.categories
  }

  if (query.subscribedOnly && query.podcastId && query.podcastId.length === 0) {
    return [0, 0]
  }

  if (query.episodeId && query.episodeId.length === 0) {
    return [0, 0]
  }

  const response = await request(
    {
      endpoint: '/mediaRef',
      query: filteredQuery
    },
    nsfwMode
  )

  if (query.censorNSFWResults && response && response.data) {
    let results = response.data[0]
    results = results.map((x: any) => {
      x.title = badWords.clean(x.title)
      x.episode.title = badWords.clean(x.episode.title)
      return x
    })

    return [results, response.data[1]]
  } else {
    return response && response.data
  }
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
    opts: { credentials: 'include' }
  })

  return response && response.data
}
