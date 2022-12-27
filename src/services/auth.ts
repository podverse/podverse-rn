import AsyncStorage from '@react-native-community/async-storage'
import { Alert, Linking } from 'react-native'
import * as RNKeychain from 'react-native-keychain'
import { errorLogger } from '../lib/logger'
import { translate } from '../lib/i18n'
import { hasValidNetworkConnection } from '../lib/network'
import { PV } from '../resources'
import { Credentials, logoutUser } from '../state/actions/auth'
import { fcmTokenGetLocally } from './fcmDevices'
import { getQueueItems } from './queue'
import { request } from './request'
import { getHistoryItems, getHistoryItemsIndex, getHistoryItemsIndexLocally } from './userHistoryItem'

const _fileName = 'src/services/auth.ts'

export const getBearerToken = async () => {
  let bearerToken = ''
  try {
    const creds = await RNKeychain.getInternetCredentials(PV.Keys.BEARER_TOKEN)
    if (creds) {
      bearerToken = creds.password
    }
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
  const [isLoggedIn, isConnected] = await Promise.all([checkIfLoggedIn(), hasValidNetworkConnection()])
  return isLoggedIn && isConnected
}

export const getAuthenticatedUserInfo = async () => {
  const [bearerToken, isConnected] = await Promise.all([getBearerToken(), hasValidNetworkConnection()])

  if (isConnected && bearerToken) {
    return getAuthenticatedUserInfoFromServer(bearerToken)
  } else {
    return getAuthenticatedUserInfoLocally()
  }
}

export const getAuthenticatedUserInfoLocally = async () => {
  let addByRSSPodcastFeedUrls = []
  let subscribedPlaylistIds = []
  let subscribedPodcastIds = []
  let subscribedUserIds = []
  let queueItems = []
  let historyItems = []
  let historyItemsIndex = {}
  let isLoggedIn = false
  let notificationsEnabled = false

  try {
    const addByRSSPodcastFeedUrlsString = await AsyncStorage.getItem(PV.Keys.ADD_BY_RSS_PODCAST_FEED_URLS)
    if (addByRSSPodcastFeedUrlsString) {
      addByRSSPodcastFeedUrls = JSON.parse(addByRSSPodcastFeedUrlsString)
    }
  } catch (error) {
    if (Array.isArray(addByRSSPodcastFeedUrls)) {
      await AsyncStorage.setItem(PV.Keys.ADD_BY_RSS_PODCAST_FEED_URLS, JSON.stringify(addByRSSPodcastFeedUrls))
    }
  }

  try {
    const subscribedPlaylistIdsString = await AsyncStorage.getItem(PV.Keys.SUBSCRIBED_PLAYLIST_IDS)
    if (subscribedPlaylistIdsString) {
      subscribedPlaylistIds = JSON.parse(subscribedPlaylistIdsString)
    }
  } catch (error) {
    if (Array.isArray(subscribedPlaylistIds)) {
      await AsyncStorage.setItem(PV.Keys.SUBSCRIBED_PLAYLIST_IDS, JSON.stringify(subscribedPlaylistIds))
    }
  }

  try {
    const subscribedPodcastIdsString = await AsyncStorage.getItem(PV.Keys.SUBSCRIBED_PODCAST_IDS)
    if (subscribedPodcastIdsString) {
      subscribedPodcastIds = JSON.parse(subscribedPodcastIdsString)
    }
  } catch (error) {
    if (Array.isArray(subscribedPodcastIds)) {
      await AsyncStorage.setItem(PV.Keys.SUBSCRIBED_PODCAST_IDS, JSON.stringify(subscribedPodcastIds))
    }
  }

  try {
    const subscribedUserIdsString = await AsyncStorage.getItem(PV.Keys.SUBSCRIBED_USER_IDS)
    if (subscribedUserIdsString) {
      subscribedUserIds = JSON.parse(subscribedUserIdsString)
    }
  } catch (error) {
    if (Array.isArray(subscribedUserIds)) {
      await AsyncStorage.setItem(PV.Keys.SUBSCRIBED_USER_IDS, JSON.stringify(subscribedUserIds))
    }
  }

  try {
    queueItems = await getQueueItems()
  } catch (error) {
    errorLogger(_fileName, 'getAuthenticatedUserInfoLocally', error)
  }

  try {
    const historyItemsJSON = await AsyncStorage.getItem(PV.Keys.HISTORY_ITEMS)
    if (historyItemsJSON) {
      historyItems = JSON.parse(historyItemsJSON)
    }
  } catch (error) {
    if (Array.isArray(historyItems)) {
      await AsyncStorage.setItem(PV.Keys.HISTORY_ITEMS, JSON.stringify(historyItems))
    }
  }

  historyItemsIndex = await getHistoryItemsIndexLocally()

  const localFCMSaved = await fcmTokenGetLocally()
  notificationsEnabled = !!localFCMSaved

  const bearerToken = await getBearerToken()
  isLoggedIn = !!bearerToken

  return [
    {
      addByRSSPodcastFeedUrls,
      subscribedPlaylistIds,
      subscribedPodcastIds,
      subscribedUserIds,
      queueItems,
      historyItems,
      historyItemsIndex,
      notificationsEnabled
    },
    isLoggedIn
  ]
}

export const getAuthenticatedUserInfoFromServer = async (bearerToken: string) => {
  try {
    const response = await request({
      endpoint: '/auth/get-authenticated-user-info',
      method: 'POST',
      headers: {
        Authorization: bearerToken,
        'Content-Type': 'application/json'
      }
    })

    const data = (response && response.data) || {}
    const { addByRSSPodcastFeedUrls, subscribedPodcastIds = [] } = data
    const page = 1

    const [{ userHistoryItems, userHistoryItemsCount }, queueItems] = await Promise.all([
      getHistoryItems(page),
      getQueueItems()
    ])
    // getHistoryItemsIndex must be called after getHistoryItems finishes.
    const historyItemsIndex = await getHistoryItemsIndex()

    // Add history and queue properities to response to be added to the global state
    data.historyItems = userHistoryItems
    data.historyItemsCount = userHistoryItemsCount
    data.historyItemsIndex = historyItemsIndex
    data.historyQueryPage = page
    data.queueItems = queueItems

    const localFCMSaved = await fcmTokenGetLocally()
    data.notificationsEnabled = !!localFCMSaved

    if (Array.isArray(addByRSSPodcastFeedUrls)) {
      await AsyncStorage.setItem(PV.Keys.ADD_BY_RSS_PODCAST_FEED_URLS, JSON.stringify(addByRSSPodcastFeedUrls))
    }

    if (Array.isArray(subscribedPodcastIds)) {
      await AsyncStorage.setItem(PV.Keys.SUBSCRIBED_PODCAST_IDS, JSON.stringify(subscribedPodcastIds))
    }

    return [data, true]
  } catch (error) {
    /*  
      If the bearerToken is saved locally, but a 401 is returned from the server,
      then assume the bearerToken has somehow become invalid, and notify the user
      that something went wrong, and log them out of their account.
    */
    if (error?.response?.status === 401) {
      Alert.alert(PV.Alerts.AUTH_INVALID.title, PV.Alerts.AUTH_INVALID.message, PV.Alerts.AUTH_INVALID.buttons)
      await logoutUser()
    }

    throw error
  }
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
    try {
      await RNKeychain.setInternetCredentials(PV.Keys.BEARER_TOKEN, 'Bearer', data.token)
    } catch (e) {
      if (e.message.includes('Could not encrypt data with alias')) {
        Alert.alert(translate('Login Status Not Saved'), translate('Saving login credentials error'), [
          {
            text: translate('No Thanks')
          },
          {
            onPress: () => {
              logoutUser()
              Linking.openSettings()
            },
            text: translate('Go to Settings')
          }
        ])
      } else {
        throw e
      }
    }
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

export const resetPassword = async (newPassword: string, resetToken: string) => {
  const response = await request({
    endpoint: '/auth/reset-password',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      password: newPassword,
      resetPasswordToken: resetToken
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

export const verifyEmail = async (token: string) => {
  let ok = false
  try {
    const response = await request({
      endpoint: '/auth/verify-email',
      method: 'GET',
      query: {
        token
      }
    })

    if (response?.status === 200) {
      ok = true
    }
  } catch (error) {
    errorLogger(_fileName, 'verifyEmail', error)
  }
  return ok
}
