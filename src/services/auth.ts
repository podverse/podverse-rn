import AsyncStorage from '@react-native-community/async-storage'
import RNSecureKeyStore, { ACCESSIBLE } from 'react-native-secure-key-store'
import { PV } from '../resources'
import { request } from './request'

export const getAuthenticatedUserInfo = async () => {
  let bearerToken
  try {
    bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
  } catch (error) {
    // is not logged in
  }

  return bearerToken ? getAuthenticatedUserInfoFromServer(bearerToken) : getAuthenticatedUserInfoLocally()
}

const getAuthenticatedUserInfoLocally = async () => {
  let subscribedPlaylistIds = []
  let subscribedPodcastIds = []
  let subscribedUserIds = []

  try {
    const subscribedPlaylistIdsString = await AsyncStorage.getItem(PV.Keys.SUBSCRIBED_PLAYLIST_IDS)
    if (subscribedPlaylistIdsString) {
      subscribedPlaylistIds = JSON.parse(subscribedPlaylistIdsString)
    }
  } catch (error) {
    AsyncStorage.setItem(PV.Keys.SUBSCRIBED_PLAYLIST_IDS, JSON.stringify(subscribedPlaylistIds))
  }

  try {
    const subscribedPodcastIdsString = await AsyncStorage.getItem(PV.Keys.SUBSCRIBED_PODCAST_IDS)
    if (subscribedPodcastIdsString) {
      subscribedPodcastIds = JSON.parse(subscribedPodcastIdsString)
    }
  } catch (error) {
    AsyncStorage.setItem(PV.Keys.SUBSCRIBED_PODCAST_IDS, JSON.stringify(subscribedPodcastIds))
  }

  try {
    const subscribedUserIdsString = await AsyncStorage.getItem(PV.Keys.SUBSCRIBED_USER_IDS)
    if (subscribedUserIdsString) {
      subscribedUserIds = JSON.parse(subscribedUserIdsString)
    }
  } catch (error) {
    AsyncStorage.setItem(PV.Keys.SUBSCRIBED_USER_IDS, JSON.stringify(subscribedUserIds))
  }

  return [
    {
      subscribedPlaylistIds,
      subscribedPodcastIds,
      subscribedUserIds
    },
    false
  ]
}

export const getAuthenticatedUserInfoFromServer = async (bearerToken: string) => {
  const response = await request({
    endpoint: '/auth/get-authenticated-user-info',
    method: 'POST',
    headers: {
      'Authorization': bearerToken,
      'Content-Type': 'application/json'
    }
  })

  const results = await response.json()

  return [
    results,
    true
  ]
}

export const login = async (email: string, password: string) => {
  const response = await request({
    method: 'POST',
    endpoint: '/auth/login',
    headers: { 'Content-Type': 'application/json' },
    body: {
      email,
      password
    },
    query: { includeBodyToken: true },
    opts: { credentials: 'include' }
  })

  const data = await response.json()
  if (data.token) {
    RNSecureKeyStore.set(PV.Keys.BEARER_TOKEN, data.token, { accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY })
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
    },
    opts: { credentials: 'include' }
  })

  return response.json()
}

export const signUp = async (email: string, password: string, name: string) => {
  const response = await request({
    endpoint: '/auth/sign-up',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      email,
      password,
      name
    },
    query: { includeBodyToken: true },
    opts: { credentials: 'include' }
  })

  const data = await response.json()

  if (data.token) {
    RNSecureKeyStore.set(PV.Keys.BEARER_TOKEN, data.token, { accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY })
  }

  return data
}
