import { Alert } from 'react-native'
import RNSecureKeyStore from 'react-native-secure-key-store'
import { setGlobal } from 'reactn'
import { getMembershipStatus } from '../../lib/utility'
import { PV } from '../../resources'
import { getAuthenticatedUserInfo, login, signUp } from '../../services/auth'
import { getSubscribedPodcasts } from './podcast'

export type Credentials = {
  email: string,
  password: string,
  name: string
}

export const getAuthUserInfo = async () => {
  try {
    const results = await getAuthenticatedUserInfo()
    const userInfo = results[0]
    const isLoggedIn = results[1]

    if (isLoggedIn) {
      await alertIfMembershipExpired(userInfo)
    }

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

export const loginUser = async (credentials: Credentials) => {
  try {
    const userInfo = await login(credentials.email, credentials.password)
    await alertIfMembershipExpired(userInfo)
    await getSubscribedPodcasts(userInfo.subscribedPodcastIds || [])
    setGlobal({ session: { userInfo, isLoggedIn: true } })
    return userInfo
  } catch (error) {
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

export const signUpUser = async (credentials: Credentials) => {
  await signUp(credentials.email, credentials.password, credentials.name)
  return getAuthUserInfo()
}

const alertIfMembershipExpired = async (userInfo: any) => {
  const membershipStatus = getMembershipStatus(userInfo)

  if (membershipStatus === PV.MembershipStatus.FREE_TRIAL_EXPIRED) {
    await Alert.alert(
      PV.Alerts.FREE_TRIAL_EXPIRED.title,
      PV.Alerts.FREE_TRIAL_EXPIRED.message,
      PV.Alerts.FREE_TRIAL_EXPIRED.buttons
    )
    throw PV.Errors.FREE_TRIAL_EXPIRED.error()
  } else if (membershipStatus === PV.MembershipStatus.PREMIUM_EXPIRED) {
    await Alert.alert(
      PV.Alerts.PREMIUM_MEMBERSHIP_EXPIRED.title,
      PV.Alerts.PREMIUM_MEMBERSHIP_EXPIRED.message,
      PV.Alerts.PREMIUM_MEMBERSHIP_EXPIRED.buttons
    )
    throw PV.Errors.PREMIUM_MEMBERSHIP_EXPIRED.error()
  }
}
