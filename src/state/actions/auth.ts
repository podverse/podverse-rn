import { Alert } from 'react-native'
import RNSecureKeyStore from 'react-native-secure-key-store'
import { setGlobal } from 'reactn'
import { NowPlayingItem } from '../../lib/NowPlayingItem'
import { PV } from '../../resources'
import { getAuthenticatedUserInfo, getLoggedInUserPlaylists as getLoggedInUserPlaylistsService,
  login, signUp, updateLoggedInUser as updateLoggedInUserService } from '../../services/auth'
import { addQueueItemLast, addQueueItemNext, removeQueueItem, setAllQueueItems } from '../../services/queue'
import { getSubscribedPodcasts } from './podcasts'

export type Credentials = {
  email: string,
  password: string,
  name: string
}

export const loginUser = async (credentials: Credentials) => {
  const user = await login(credentials.email, credentials.password)
  setGlobal({ session: { userInfo: user, isLoggedIn: true } })
  return user
}

export const signUpUser = async (credentials: Credentials) => {
  await signUp(credentials.email, credentials.password, credentials.name)
  return getAuthUserInfo()
}

export const getAuthUserInfo = async () => {
  try {
    const user = await getAuthenticatedUserInfo()
    await getSubscribedPodcasts(user.subscribedPodcastIds || [])
    setGlobal({ session: { userInfo: user, isLoggedIn: true } })
    return user
  } catch (error) {
    setGlobal({ session: { userInfo: null, isLoggedIn: false } })
    Alert.alert('Error', error.message, [])
  }
}

export const logoutUser = async () => {
  try {
    setGlobal({ session: { userInfo: {}, isLoggedIn: false } })
    RNSecureKeyStore.remove(PV.Keys.BEARER_TOKEN)
  } catch (error) {
    Alert.alert('Error', error.message, [])
  }
}

export const getLoggedInUserPlaylists = async () => {
  const results = await getLoggedInUserPlaylistsService()
  setGlobal({
    screenPlaylists: {
      flatListData: results[0]
    }
  })
}

export const updateLoggedInUser = async (data: any, globalState: any) => {
  const newUser = await updateLoggedInUserService(data)
  const screenProfilesFlatListData = globalState.screenProfiles.flatListData
  const screenProfileFlatListData = globalState.screenProfile.flatListData
  const foundIndex = screenProfilesFlatListData.findIndex((x: any) => x.id === data.id)

  if (foundIndex > -1) {
    screenProfilesFlatListData[foundIndex] = newUser
  }

  setGlobal({
    screenProfiles: {
      flatListData: screenProfilesFlatListData
    },
    screenProfile: {
      flatListData: screenProfileFlatListData,
      user: newUser
    }
  })
}

export const updateUserQueueItems = async (queueItems: NowPlayingItem[], isLoggedIn: boolean, globalState: any) => {
  const results = await setAllQueueItems(queueItems, isLoggedIn)
  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        queueItems: results
      }
    }
  })
  return results
}

export const addUserQueueItemNext = async (queueItem: NowPlayingItem, isLoggedIn: boolean, globalState: any) => {
  const results = await addQueueItemNext(queueItem, isLoggedIn)
  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        queueItems: results
      }
    }
  })
  return results
}

export const addUserQueueItemLast = async (queueItem: NowPlayingItem, isLoggedIn: boolean, globalState: any) => {
  const results = await addQueueItemLast(queueItem, isLoggedIn)
  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        queueItems: results
      }
    }
  })
  return results
}

export const removeUserQueueItem = async (queueItem: NowPlayingItem, isLoggedIn: boolean, globalState: any) => {
  const results = await removeQueueItem(queueItem, isLoggedIn)
  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        queueItems: results
      }
    }
  })
  return results
}
