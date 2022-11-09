import { Alert } from 'react-native'
import {resetInternetCredentials} from "react-native-keychain"
import { getGlobal, setGlobal } from 'reactn'
import { shouldShowMembershipAlert } from '../../lib/membership'
import { safelyUnwrapNestedVariable } from '../../lib/utility'
import { PV } from '../../resources'
import { UserInfo } from '../../resources/Interfaces'
import {
  getAuthenticatedUserInfo,
  getAuthenticatedUserInfoLocally as getAuthenticatedUserInfoLocallyService,
  login,
  signUp
} from '../../services/auth'
import { fcmTokenGetLocally } from '../../services/fcmDevices'
import { getPodcastCredentials, parseAllAddByRSSPodcasts,
  setAddByRSSPodcastFeedUrlsLocally } from '../../services/parser'
import { toggleSubscribeToPodcast } from '../../services/podcast'
import { setAllQueueItemsLocally } from '../../services/queue'
import { setAllHistoryItemsLocally } from '../../services/userHistoryItem'
import { getNowPlayingItemLocally,
  getNowPlayingItemOnServer, 
  setNowPlayingItemLocally} from '../../services/userNowPlayingItem'
import { addAddByRSSPodcast, addAddByRSSPodcastWithCredentials } from './parser'
import { combineWithAddByRSSPodcasts, getSubscribedPodcasts } from './podcast'

export type Credentials = {
  addByRSSPodcastFeedUrls?: []
  email: string
  password: string
  name?: string
  subscribedPodcastIds?: []
}

export const getAuthUserInfo = async (callback?: () => void) => {
  try {
    const [results] = await Promise.all([
      getAuthenticatedUserInfo()
    ])
    const userInfo = results[0]
    const isLoggedIn = results[1]
    const shouldShowAlert = shouldShowMembershipAlert(userInfo)

    const globalState = getGlobal()

    setGlobal({
      session: {
        userInfo,
        isLoggedIn,
        v4v: globalState.session.v4v
      },
      overlayAlert: {
        ...globalState.overlayAlert,
        showAlert: shouldShowAlert
      }
    }, () => {
      callback?.()
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
      isLoggedIn,
      v4v: globalState.session.v4v
    },
    overlayAlert: {
      ...globalState.overlayAlert,
      showAlert: shouldShowAlert
    }
  })

  return isLoggedIn
}

export const askToSyncWithNowPlayingItem = async (callback?: any) => {
  try {
    const [localNowPlayingItem, serverNowPlayingItem] = await Promise.all([
      getNowPlayingItemLocally(),
      getNowPlayingItemOnServer()
    ])

    if (serverNowPlayingItem) {
      if (
        (!localNowPlayingItem ||
        (localNowPlayingItem.clipId && localNowPlayingItem.clipId !== serverNowPlayingItem.clipId) ||
        (!localNowPlayingItem.clipId && localNowPlayingItem.episodeId !== serverNowPlayingItem.episodeId))
      ) {
        const askToSyncWithLastHistoryItem = PV.Alerts.ASK_TO_SYNC_WITH_LAST_HISTORY_ITEM(
          serverNowPlayingItem,
          callback
        )
        Alert.alert(
          askToSyncWithLastHistoryItem.title,
          askToSyncWithLastHistoryItem.message,
          askToSyncWithLastHistoryItem.buttons
        )

        return
      } else if (
        !localNowPlayingItem.clipId
        && localNowPlayingItem.episodeId === serverNowPlayingItem.episodeId
      ) {
        // If the server and local nowPlayingItem's are the same episode,
        // then resume from the server item's userPlaybackPosition
        // instead of the localNowPlayingItem's
        await setNowPlayingItemLocally(serverNowPlayingItem, serverNowPlayingItem.userPlaybackPosition || 0)
      }
    }
    callback?.()
  } catch (error) {
    console.log('askToSyncWithNowPlayingItem error', error)
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
    const globalState = getGlobal()
    const localUserInfo = globalState.session.userInfo
    const serverUserInfo = await login(credentials.email, credentials.password)
    const { v4v } = globalState.session

    const localFCMSaved = await fcmTokenGetLocally()
    serverUserInfo.notificationsEnabled = !!localFCMSaved

    setGlobal(
      {
        session: {
          userInfo: serverUserInfo,
          isLoggedIn: true,
          v4v
        }
      },
      () => {
        try {
          const callback = async (newUserInfo: UserInfo) => {
            await syncItemsWithLocalStorage(newUserInfo)
            await getSubscribedPodcasts()
            await askToSyncWithNowPlayingItem()
            await parseAllAddByRSSPodcasts()
            await combineWithAddByRSSPodcasts()
          }
          askToSyncLocalPodcastsWithServer(localUserInfo, serverUserInfo, callback)
        } catch (error) {
          console.log('loginUser setGlobal callback error:', error)
        }
      }
    )
  } catch (error) {
    throw error
  }
}

const askToSyncLocalPodcastsWithServer = async (
  localUserInfo: UserInfo, serverUserInfo: UserInfo, callback: any) => {
  const localSubscribedPodcastIds: string[] = localUserInfo?.subscribedPodcastIds || []
  const localAddByRSSPodcastFeedUrls: string[] = localUserInfo?.addByRSSPodcastFeedUrls || []
  const serverSubscribedPodcastIds: string[] = serverUserInfo?.subscribedPodcastIds || []
  const serverAddByRSSPodcastFeedUrls: string[] = serverUserInfo?.addByRSSPodcastFeedUrls || []

  const unsavedSubscribedPodcastIds = localSubscribedPodcastIds?.filter(
    (localId: string) => !serverSubscribedPodcastIds?.includes(localId)
  )
  const unsavedAddByRSSPodcastFeedUrls = localAddByRSSPodcastFeedUrls?.filter(
    (localFeedUrl: string) => !serverAddByRSSPodcastFeedUrls?.includes(localFeedUrl)
  )
  
  const handleSync = async () => {
    for (const unsavedSubscribedPodcastId of unsavedSubscribedPodcastIds) {
      await toggleSubscribeToPodcast(unsavedSubscribedPodcastId)
    }

    for (const unsavedAddByRSSPodcastFeedUrl of unsavedAddByRSSPodcastFeedUrls) {
      const feedCredentials = await getPodcastCredentials(unsavedAddByRSSPodcastFeedUrl)
      if (feedCredentials) {
        await addAddByRSSPodcastWithCredentials(unsavedAddByRSSPodcastFeedUrl, feedCredentials)
      } else {
        await addAddByRSSPodcast(unsavedAddByRSSPodcastFeedUrl)
      }
    }

    await getAuthUserInfo()
    const newUserInfo = await getAuthenticatedUserInfo()
    await callback(newUserInfo)
  }

  const hasUnsavedPodcasts = unsavedSubscribedPodcastIds.length > 0
    || unsavedAddByRSSPodcastFeedUrls.length > 0
  if (hasUnsavedPodcasts) {
    Alert.alert(
      PV.Alerts.ASK_TO_SYNC_LOCAL_PODCASTS_WITH_SERVER(handleSync, callback).title,
      PV.Alerts.ASK_TO_SYNC_LOCAL_PODCASTS_WITH_SERVER(handleSync, callback).message,
      PV.Alerts.ASK_TO_SYNC_LOCAL_PODCASTS_WITH_SERVER(handleSync, callback).buttons
    )
  } else {
    const newUserInfo = await getAuthenticatedUserInfo()
    await callback(newUserInfo)
  }
}

export const logoutUser = async () => {
  try {
    await resetInternetCredentials(PV.Keys.BEARER_TOKEN)    
    await getAuthUserInfo()
  } catch (error) {
    console.log(error)
    Alert.alert('Error', error.message, PV.Alerts.BUTTONS.OK)
  }
}

export const signUpUser = async (credentials: Credentials) => {
  const globalState = getGlobal()
  const subscribedPodcastIds = safelyUnwrapNestedVariable(() => globalState.session.userInfo.subscribedPodcastIds, [])
  const addByRSSPodcastFeedUrls =
    safelyUnwrapNestedVariable(() => globalState.session.userInfo.addByRSSPodcastFeedUrls, [])

  if (subscribedPodcastIds.length > 0) {
    credentials.subscribedPodcastIds = subscribedPodcastIds
  }

  if (addByRSSPodcastFeedUrls.length > 0) {
    credentials.addByRSSPodcastFeedUrls = addByRSSPodcastFeedUrls
  }

  await signUp(credentials)
}
