import AsyncStorage from '@react-native-community/async-storage'
import { PV } from '../resources'

export const getSavedQueryPodcastsScreenSort = async () => {
  let savedQuery = null
  try {
    savedQuery = await AsyncStorage.getItem(PV.Keys.SAVED_QUERY_PODCASTS_SCREEN_SORT)
  } catch (error) {
    console.log('getSavedQueryPodcastsScreenSort error', error)
  }
  return savedQuery
}

export const setSavedQueryPodcastsScreenSort = async (sort: string | null) => {
  try {
    if (sort) {
      await AsyncStorage.setItem(PV.Keys.SAVED_QUERY_PODCASTS_SCREEN_SORT, sort)
    } else {
      await AsyncStorage.removeItem(PV.Keys.SAVED_QUERY_PODCASTS_SCREEN_SORT)
    }
  } catch (error) {
    console.log('setSavedQueryPodcastsScreenSort error', error)
  }
}
