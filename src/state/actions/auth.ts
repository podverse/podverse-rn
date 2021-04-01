import AsyncStorage from '@react-native-community/async-storage'
import { Alert } from 'react-native'
import RNSecureKeyStore from 'react-native-secure-key-store'
import { getGlobal, setGlobal } from 'reactn'
import { safelyUnwrapNestedVariable, shouldShowMembershipAlert } from '../../lib/utility'
import { PV } from '../../resources'
import {
  getAuthenticatedUserInfo,
  getAuthenticatedUserInfoLocally as getAuthenticatedUserInfoLocallyService,
  login,
  signUp
} from '../../services/auth'
import { setAddByRSSPodcastFeedUrlsLocally } from '../../services/parser'
import { setAllQueueItemsLocally } from '../../services/queue'
import { setAllHistoryItemsLocally } from '../../services/userHistoryItem'
import { getNowPlayingItemLocally, getNowPlayingItemOnServer } from '../../services/userNowPlayingItem'
import { getSubscribedPodcasts } from './podcast'

export type Credentials = {
  addByRSSPodcastFeedUrls?: []
  email: string
  password: string
  name?: string
  subscribedPodcastIds?: []
}

export const getAuthUserInfo = async () => {
  try {
    const results = await getAuthenticatedUserInfo()
    const userInfo = results[0]
    const isLoggedIn = results[1]
    const shouldShowAlert = shouldShowMembershipAlert(userInfo)
    const lnPayEnabled = await AsyncStorage.getItem(PV.Keys.LNPAY_ENABLED)

    const globalState = getGlobal()
    setGlobal({
      session: {
        userInfo,
        isLoggedIn,
        lightningPayEnabled: lnPayEnabled ? JSON.parse(lnPayEnabled) : false
      },
      overlayAlert: {
        ...globalState.overlayAlert,
        showAlert: shouldShowAlert
      }
    })

    return isLoggedIn
  } catch (error) {
    try {
      console.log('getAuthUserInfo action', error)
      const isLoggedIn = await getAuthenticatedUserInfoLocally()
      return isLoggedIn
    } catch (error) {
      throw error
    }
  }
}

export const getAuthenticatedUserInfoLocally = async () => {
  // If an error happens, try to get the same data from local storage.
  const results = await getAuthenticatedUserInfoLocallyService()
  const userInfo = results[0]
  const isLoggedIn = results[1]
  const shouldShowAlert = shouldShowMembershipAlert(userInfo)
  const globalState = getGlobal()
  setGlobal({
    session: {
      userInfo,
      isLoggedIn
    },
    overlayAlert: {
      ...globalState.overlayAlert,
      showAlert: shouldShowAlert
    }
  })

  return isLoggedIn
}

export const askToSyncWithNowPlayingItem = async () => {
  const localNowPlayingItem = await getNowPlayingItemLocally()
  const serverNowPlayingItem = await getNowPlayingItemOnServer()

  if (serverNowPlayingItem) {
    if (
      (!localNowPlayingItem ||
      (localNowPlayingItem.clipId && localNowPlayingItem.clipId !== serverNowPlayingItem.clipId) ||
      (!localNowPlayingItem.clipId && localNowPlayingItem.episodeId !== serverNowPlayingItem.episodeId)) &&
      serverNowPlayingItem.userPlaybackPosition !== 0
    ) {
      const askToSyncWithLastHistoryItem = PV.Alerts.ASK_TO_SYNC_WITH_LAST_HISTORY_ITEM(serverNowPlayingItem)
      Alert.alert(
        askToSyncWithLastHistoryItem.title,
        askToSyncWithLastHistoryItem.message,
        askToSyncWithLastHistoryItem.buttons
      )
    }
  }
}

// If a new player item should be loaded, the local history/queue must be up-to-date
// so that the item plays from the correct userPlaybackPosition. The only time where
// this is needed currently is when a user logs in, and they select to play their last item from history.
// If we don't call syncItemsWithLocalStorage before loading the item,
// syncNowPlayingItemWithTrack won't
const syncItemsWithLocalStorage = async (userInfo: any) => {
  if (userInfo && Array.isArray(userInfo.addByRSSPodcastFeedUrls)) {
    await setAddByRSSPodcastFeedUrlsLocally(userInfo.addByRSSPodcastFeedUrls)
  }

  if (userInfo && Array.isArray(userInfo.historyItems)) {
    await setAllHistoryItemsLocally(userInfo.historyItems)
  }

  if (userInfo && Array.isArray(userInfo.queueItems)) {
    await setAllQueueItemsLocally(userInfo.queueItems)
  }
}

export const loginUser = async (credentials: Credentials) => {
  try {
    const userInfo = await login(credentials.email, credentials.password)
    await syncItemsWithLocalStorage(userInfo)
    await getSubscribedPodcasts()
    await askToSyncWithNowPlayingItem()

    setGlobal({ session: { userInfo, isLoggedIn: true } })
    return userInfo
  } catch (error) {
    throw error
  }
}

export const logoutUser = async () => {
  try {
    await RNSecureKeyStore.remove(PV.Keys.BEARER_TOKEN)
    await getAuthUserInfo()
  } catch (error) {
    console.log(error)
    Alert.alert('Error', error.message, PV.Alerts.BUTTONS.OK)
  }
}

export const signUpUser = async (credentials: Credentials) => {
  const globalState = getGlobal()
  const subscribedPodcastIds = safelyUnwrapNestedVariable(() => globalState.session.userInfo.subscribedPodcastIds, [])

  if (subscribedPodcastIds.length > 0) {
    credentials.subscribedPodcastIds = subscribedPodcastIds
  }

  await signUp(credentials)
}
