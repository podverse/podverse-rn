import RNSecureKeyStore from 'react-native-secure-key-store'
import { PV } from '../resources'
import { request } from './request'

export const searchPodcasts = async (title?: string, author?: string, nsfwMode?: boolean) => {

  const response = await request({
    endpoint: '/podcast',
    query: {
      sort: 'alphabetical',
      ...(title ? { title } : {}),
      ...(author ? { author } : {}),
      page: 1
    }
  }, nsfwMode)

  return response.json()
}

export const getPodcasts = async (query: any = {}, nsfwMode?: boolean) => {
  const filteredQuery = {
    ...(query.page ? { page: query.page } : { page: 1 }),
    ...(query.sort ? { sort: query.sort } : { sort: 'top-past-week' }),
    ...(query.searchTitle ? { searchTitle: query.searchTitle } : {})
  } as any

  if (query.categories) {
    filteredQuery.categories = query.categories
  } else if (query.podcastIds) {
    filteredQuery.podcastId = query.podcastIds ? query.podcastIds.join(',') : ['no-results']
  }

  const response = await request({
    endpoint: '/podcast',
    query: filteredQuery
  }, nsfwMode)

  return response.json()
}

export const getPodcast = async (id: string) => {
  const response = await request({
    endpoint: `/podcast/${id}`
  })

  return response.json()
}

export const toggleSubscribeToPodcast = async (id: string) => {
  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  const response = await request({
    endpoint: `/podcast/toggle-subscribe/${id}`,
    headers: { Authorization: bearerToken }
  })

  return response.json()
}
