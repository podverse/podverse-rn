import * as RNKeychain from "react-native-keychain"
import RNSecureKeyStore from 'react-native-secure-key-store'
import { PV } from '../resources'

export const migrateCredentialsIfNeeded = async () => {
    const allPodcastCredentialsString = await RNSecureKeyStore.get(PV.Keys.ADD_BY_RSS_PODCASTS_CREDENTIALS)
    const hasExistingPodcastCreds = allPodcastCredentialsString 
                                        ? Object.keys(JSON.parse(allPodcastCredentialsString)).length > 0 
                                        : false
    const existingLoginCreds = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)

    if(!!existingLoginCreds) {
        try {
            await RNKeychain.setInternetCredentials(PV.Keys.BEARER_TOKEN, "Bearer", existingLoginCreds)
            await RNSecureKeyStore.remove(PV.Keys.BEARER_TOKEN)
        } catch (err) {
            console.log("Login creds migration error: ", err)
        }
    }

    if(!!hasExistingPodcastCreds) {
        try {
            await RNKeychain.setInternetCredentials(PV.Keys.ADD_BY_RSS_PODCASTS_CREDENTIALS, 
                "", 
                allPodcastCredentialsString)
            await RNSecureKeyStore.remove(PV.Keys.ADD_BY_RSS_PODCASTS_CREDENTIALS)
        } catch(err){
            console.log("Podcasts creds migration error: ", err)
        }
    }
}