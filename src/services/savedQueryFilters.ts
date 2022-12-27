import AsyncStorage from '@react-native-community/async-storage'
import { errorLogger } from '../lib/logger'
import { PV } from '../resources'

const _fileName = 'src/services/savedQueryFilters.ts'

export const getSavedQueryPodcastsScreenSort = async () => {
  let savedQuery = null
  try {
    savedQuery = await AsyncStorage.getItem(PV.Keys.SAVED_QUERY_PODCASTS_SCREEN_SORT)
  } catch (error) {
    errorLogger(_fileName, 'getSavedQueryPodcastsScreenSort', error)
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
    errorLogger(_fileName, 'setSavedQueryPodcastsScreenSort', error)
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
    errorLogger(_fileName, 'getSavedQueryEpisodesScreen', error)
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
    errorLogger(_fileName, 'setSavedQueryEpisodesScreen', error)
  }
}
