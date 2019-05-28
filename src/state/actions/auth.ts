import { Alert } from 'react-native'
import RNSecureKeyStore from 'react-native-secure-key-store'
import { setGlobal } from 'reactn'
import { PV } from '../../resources'
import { getAuthenticatedUserInfo, login, signUp } from '../../services/auth'
import { getSubscribedPodcasts } from './podcast'

export type Credentials = {
  email: string,
  password: string,
  name: string
}

export const loginUser = async (credentials: Credentials) => {
  const userInfo = await login(credentials.email, credentials.password)
  await getSubscribedPodcasts(userInfo.subscribedPodcastIds || [])
  setGlobal({ session: { userInfo, isLoggedIn: true } })
  return userInfo
}

export const signUpUser = async (credentials: Credentials) => {
  await signUp(credentials.email, credentials.password, credentials.name)
  return getAuthUserInfo()
}

export const getAuthUserInfo = async () => {
  try {
    const results = await getAuthenticatedUserInfo()
    const userInfo = results[0]
    const isLoggedIn = results[1]
    setGlobal({ session: { userInfo, isLoggedIn } })
    return userInfo
  } catch (error) {
    setGlobal({
      session: {
        userInfo: {
          subscribedPlaylistIds: [],
          subscribedPodcastIds: [],
          subscribedUserIds: []
        },
        isLoggedIn: false
      }
    })

    throw error
  }
}

export const logoutUser = async () => {
  try {
    RNSecureKeyStore.remove(PV.Keys.BEARER_TOKEN)
    await getAuthUserInfo()
  } catch (error) {
    Alert.alert('Error', error.message, [])
  }
}
