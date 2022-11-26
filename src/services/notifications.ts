import { getBearerToken } from './auth'
import { request } from './request'

export const notificationSubscribe = async (podcastId: string) => {
  const bearerToken = await getBearerToken()

  const response = await request({
    endpoint: '/notification/podcast/subscribe',
    method: 'POST',
    headers: {
      ...(bearerToken ? { Authorization: bearerToken } : {}),
      'Content-Type': 'application/json'
    },
    body: {
      podcastId
    },
    ...(bearerToken ? { opts: { credentials: 'include' } } : {}),
    shouldShowAuthAlert: true
  })

  return response && response.data
}

export const notificationUnsubscribe = async (podcastId: string) => {
  const bearerToken = await getBearerToken()

  const response = await request({
    endpoint: '/notification/podcast/unsubscribe',
    method: 'POST',
    headers: {
      ...(bearerToken ? { Authorization: bearerToken } : {}),
      'Content-Type': 'application/json'
    },
    body: {
      podcastId
    },
    ...(bearerToken ? { opts: { credentials: 'include' } } : {}),
    shouldShowAuthAlert: true
  })

  return response && response.data
}
