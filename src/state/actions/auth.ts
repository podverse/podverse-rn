import { Alert } from 'react-native'
import RNSecureKeyStore from 'react-native-secure-key-store'
import { getGlobal, setGlobal } from 'reactn'
import { shouldShowMembershipAlert } from '../../lib/utility'
import { PV } from '../../resources'
import { getAuthenticatedUserInfo, getAuthenticatedUserInfoLocally, login, signUp } from '../../services/auth'
import { getSubscribedPodcasts } from './podcast'

export type Credentials = {
  email: string
  password: string
  name?: string
}

export const getAuthUserInfo = async () => {
  try {
    const results = await getAuthenticatedUserInfo()
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
    return userInfo
  } catch (error) {
    console.log('getAuthUserInfo action', error)

    try {
      // If an error happens, try to get the same data from local storage.
      const results = await getAuthenticatedUserInfoLocally()
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
    } catch (error) {
      throw error
    }
  }
}

export const loginUser = async (credentials: Credentials) => {
  try {
    const userInfo = await login(credentials.email, credentials.password)

    await getSubscribedPodcasts(userInfo.subscribedPodcastIds || [])
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
  await signUp(credentials)
}
