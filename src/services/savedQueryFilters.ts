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

export const getSavedQueryEpisodesScreen = async () => {
  let savedQuery = null
  try {
    savedQuery = await AsyncStorage.getItem(PV.Keys.SAVED_QUERY_EPISODES_SCREEN)
    if (savedQuery) {
      savedQuery = JSON.parse(savedQuery)
    }
  } catch (error) {
    console.log('getSavedQueryEpisodesScreen error', error)
  }
  return savedQuery
}

export const setSavedQueryEpisodesScreen = async (
  queryFrom: string,
  querySort: string,
  selectedCategory?: string,
  selectedCategorySub?: string
) => {
  try {
    if (queryFrom && querySort) {
      const savedQuery = {
        queryFrom,
        querySort,
        selectedCategory: selectedCategory || '',
        selectedCategorySub: selectedCategorySub || ''
      }
      await AsyncStorage.setItem(PV.Keys.SAVED_QUERY_EPISODES_SCREEN, JSON.stringify(savedQuery))
    } else {
      await AsyncStorage.removeItem(PV.Keys.SAVED_QUERY_EPISODES_SCREEN)
    }
  } catch (error) {
    console.log('setSavedQueryEpisodesScreen error', error)
  }
}
