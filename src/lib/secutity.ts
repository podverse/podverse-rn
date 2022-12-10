import { Platform } from 'react-native'
import * as RNKeychain from 'react-native-keychain'
import RNSecureKeyStore from 'react-native-secure-key-store'
import { PV } from '../resources'
import { errorLogger } from './logger'

export const credentialsPlaceholderUsername = 'username'

export const migrateCredentialsIfNeeded = async () => {
  const allPodcastCredentialsString = await RNSecureKeyStore.get(PV.Keys.ADD_BY_RSS_PODCASTS_CREDENTIALS)
  const hasExistingPodcastCreds = allPodcastCredentialsString
    ? Object.keys(JSON.parse(allPodcastCredentialsString)).length > 0
    : false
  const existingLoginCreds = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)

  if (!!existingLoginCreds) {
    try {
      await RNKeychain.setInternetCredentials(PV.Keys.BEARER_TOKEN, 'Bearer', existingLoginCreds)
      await RNSecureKeyStore.remove(PV.Keys.BEARER_TOKEN)
    } catch (error) {
      errorLogger('Login creds migration error: ', error)
    }
  }

  if (!!hasExistingPodcastCreds) {
    try {
      await RNKeychain.setInternetCredentials(
        PV.Keys.ADD_BY_RSS_PODCASTS_CREDENTIALS,
        credentialsPlaceholderUsername,
        allPodcastCredentialsString
      )
      await RNSecureKeyStore.remove(PV.Keys.ADD_BY_RSS_PODCASTS_CREDENTIALS)
    } catch (error) {
      errorLogger('Podcasts creds migration error: ', error)
    }
  }
}

/* 
  Since react-native-keychain does not clear storage on app delete,
  we're manually clearing every possible keychain key the app may have
  on first app launch.
  https://github.com/oblador/react-native-keychain/issues/135
*/
export const resetAllAppKeychain = async () => {
  if (Platform.OS === 'ios') {
    await RNKeychain.resetInternetCredentials(PV.Keys.ADD_BY_RSS_PODCASTS_CREDENTIALS)
    await RNKeychain.resetInternetCredentials(PV.Keys.BEARER_TOKEN)
    await RNKeychain.resetInternetCredentials(PV.Keys.V4V_PROVIDERS_CONNECTED)
    await RNKeychain.resetInternetCredentials(PV.Keys.V4V_SETTINGS)
    await RNKeychain.resetInternetCredentials(PV.Keys.V4V_PROVIDERS_ALBY_ACCESS_DATA)
    await RNKeychain.resetInternetCredentials(PV.Keys.V4V_PROVIDERS_ALBY_CODE_VERIFIER)
  }
}
