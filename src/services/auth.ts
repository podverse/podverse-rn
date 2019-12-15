import AsyncStorage from '@react-native-community/async-storage'
import RNSecureKeyStore, { ACCESSIBLE } from 'react-native-secure-key-store'
import { hasValidNetworkConnection } from '../lib/network'
import { PV } from '../resources'
import { Credentials } from '../state/actions/auth'
import { request } from './request'

export const getBearerToken = async () => {
  let bearerToken = ''
  try {
    bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  } catch (error) {
    return bearerToken
  }
  return bearerToken
}

export const checkIfLoggedIn = async () => {
  const bearerToken = await getBearerToken()
  return !!bearerToken
}

export const checkIfShouldUseServerData = async () => {
  const isLoggedIn = await checkIfLoggedIn()
  const isConnected = await hasValidNetworkConnection()
  return isLoggedIn && isConnected
}

export const getAuthenticatedUserInfo = async () => {
  const bearerToken = await getBearerToken()
  const isConnected = await hasValidNetworkConnection()

  if (isConnected && bearerToken) {
    return getAuthenticatedUserInfoFromServer(bearerToken)
  } else {
    return getAuthenticatedUserInfoLocally()
  }
}

export const getAuthenticatedUserInfoLocally = async () => {
  let subscribedPlaylistIds = []
  let subscribedPodcastIds = []
  let subscribedUserIds = []
  let queueItems = []
  let historyItems = []
  let isLoggedIn = false

  try {
    const subscribedPlaylistIdsString = await AsyncStorage.getItem(
      PV.Keys.SUBSCRIBED_PLAYLIST_IDS
    )
    if (subscribedPlaylistIdsString) {
      subscribedPlaylistIds = JSON.parse(subscribedPlaylistIdsString)
    }
  } catch (error) {
    if (Array.isArray(subscribedPlaylistIds)) {
      await AsyncStorage.setItem(
        PV.Keys.SUBSCRIBED_PLAYLIST_IDS,
        JSON.stringify(subscribedPlaylistIds)
      )
    }
  }

  try {
    const subscribedPodcastIdsString = await AsyncStorage.getItem(
      PV.Keys.SUBSCRIBED_PODCAST_IDS
    )
    if (subscribedPodcastIdsString) {
      subscribedPodcastIds = JSON.parse(subscribedPodcastIdsString)
    }
  } catch (error) {
    if (Array.isArray(subscribedPodcastIds)) {
      await AsyncStorage.setItem(
        PV.Keys.SUBSCRIBED_PODCAST_IDS,
        JSON.stringify(subscribedPodcastIds)
      )
    }
  }

  try {
    const subscribedUserIdsString = await AsyncStorage.getItem(
      PV.Keys.SUBSCRIBED_USER_IDS
    )
    if (subscribedUserIdsString) {
      subscribedUserIds = JSON.parse(subscribedUserIdsString)
    }
  } catch (error) {
    if (Array.isArray(subscribedUserIds)) {
      await AsyncStorage.setItem(
        PV.Keys.SUBSCRIBED_USER_IDS,
        JSON.stringify(subscribedUserIds)
      )
    }
  }

  try {
    const queueItemsJSON = await AsyncStorage.getItem(PV.Keys.QUEUE_ITEMS)
    if (queueItemsJSON) {
      queueItems = JSON.parse(queueItemsJSON)
    }
  } catch (error) {
    if (Array.isArray(queueItems)) {
      await AsyncStorage.setItem(
        PV.Keys.QUEUE_ITEMS,
        JSON.stringify(queueItems)
      )
    }
  }

  try {
    const historyItemsJSON = await AsyncStorage.getItem(PV.Keys.HISTORY_ITEMS)
    if (historyItemsJSON) {
      historyItems = JSON.parse(historyItemsJSON)
    }
  } catch (error) {
    if (Array.isArray(historyItems)) {
      await AsyncStorage.setItem(
        PV.Keys.HISTORY_ITEMS,
        JSON.stringify(historyItems)
      )
    }
  }

  const bearerToken = await getBearerToken()
  isLoggedIn = !!bearerToken

  return [
    {
      subscribedPlaylistIds,
      subscribedPodcastIds,
      subscribedUserIds,
      queueItems,
      historyItems
    },
    isLoggedIn
  ]
}

export const getAuthenticatedUserInfoFromServer = async (
  bearerToken: string
) => {
  const response = await request({
    endpoint: '/auth/get-authenticated-user-info',
    method: 'POST',
    headers: {
      'Authorization': bearerToken,
      'Content-Type': 'application/json'
    }
  })

  const data = (response && response.data) || []
  const { subscribedPodcastIds = [] } = data

  if (Array.isArray(subscribedPodcastIds)) {
    await AsyncStorage.setItem(
      PV.Keys.SUBSCRIBED_PODCAST_IDS,
      JSON.stringify(subscribedPodcastIds)
    )
  }

  return [data, true]
}

export const login = async (email: string, password: string) => {
  const response = await request({
    method: 'POST',
    endpoint: '/auth/login?includeBodyToken=true',
    headers: { 'Content-Type': 'application/json' },
    body: {
      email,
      password
    },
    opts: { credentials: 'include' }
  })

  const data = (response && response.data) || []
  if (data.token) {
    await RNSecureKeyStore.set(PV.Keys.BEARER_TOKEN, data.token, {
      accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY
    })
  }

  return data
}

export const sendResetPassword = async (email: string) => {
  const response = await request({
    endpoint: '/auth/send-reset-password',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      email
    }
  })

  return response && response.data
}

export const sendVerificationEmail = async (email: string) => {
  const response = await request({
    endpoint: '/auth/send-verification',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      email
    }
  })

  return response && response.data
}

export const signUp = async (credentials: Credentials) => {
  const response = await request({
    endpoint: '/auth/sign-up',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: credentials
  })

  return response.data
}
