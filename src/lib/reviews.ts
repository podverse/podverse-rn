import AsyncStorage from '@react-native-community/async-storage'
import InAppReview from 'react-native-in-app-review'
import { PV } from '../resources'

export const requestAppStoreReview = () => {
  if (InAppReview.isAvailable()) {
    InAppReview.RequestInAppReview()
  }
}

export const requestAppStoreReviewForEpisodePlayed = async () => {
  const EPISODES_PLAYED_LIMIT = 20
  const numberOfPlayedEpisodesString: string | null = await AsyncStorage.getItem(PV.Keys.NUMBER_OF_EPISODES_PLAYED)
  let numberOfPlayedEpisodes = numberOfPlayedEpisodesString ? Number(numberOfPlayedEpisodesString) : 0
  if (numberOfPlayedEpisodes < EPISODES_PLAYED_LIMIT) {
    numberOfPlayedEpisodes += 1
    await AsyncStorage.setItem(PV.Keys.NUMBER_OF_EPISODES_PLAYED, String(numberOfPlayedEpisodes))
  } else {
    await AsyncStorage.setItem(PV.Keys.NUMBER_OF_EPISODES_PLAYED, '0')
    requestAppStoreReview()
  }
}

export const requestAppStoreReviewForSubscribedPodcast = async () => {
  const SUBSCRIBED_PODCASTS_REQUEST_LIMIT = 5
  const numberOfSubscritptionsString: string | null = await AsyncStorage.getItem(PV.Keys.NUMBER_OF_SUBSCRIBED_PODCASTS)
  let numberOfSubscribedPodcasts = numberOfSubscritptionsString ? Number(numberOfSubscritptionsString) : 0
  if (numberOfSubscribedPodcasts < SUBSCRIBED_PODCASTS_REQUEST_LIMIT) {
    numberOfSubscribedPodcasts += 1
    await AsyncStorage.setItem(PV.Keys.NUMBER_OF_SUBSCRIBED_PODCASTS, String(numberOfSubscribedPodcasts))
  } else {
    await AsyncStorage.setItem(PV.Keys.NUMBER_OF_SUBSCRIBED_PODCASTS, '0')
    requestAppStoreReview()
  }
}
