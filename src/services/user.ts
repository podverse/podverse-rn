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

export const toggleSubscribeToUser = async (id: string) => {
  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  const response = await request({
    endpoint: `/user/toggle-subscribe/${id}`,
    headers: { Authorization: bearerToken }
  })

  return response.json()
}
