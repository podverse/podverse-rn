import AsyncStorage from '@react-native-community/async-storage'
import { getGlobal } from 'reactn'
import { PV } from '../resources'
import { getEpisodesSincePubDate } from './episode'

export const getNewEpisodeCountLastRefreshDate = async () => {
  const dateStr = await AsyncStorage.getItem(PV.Keys.NEW_EPISODE_COUNT_LAST_REFRESHED)

  const dateISOString = !!dateStr
    ? new Date(dateStr).toISOString()
    : new Date().toISOString()

  return dateISOString
}

export const getNewEpisodeCountCustomRSSLastRefreshDate = async () => {
  const dateStr = await AsyncStorage.getItem(PV.Keys.NEW_EPISODE_COUNT_CUSTOM_RSS_LAST_REFRESHED)

  const dateISOString = !!dateStr
    ? new Date(dateStr).toISOString()
    : new Date().toISOString()

  return dateISOString
}

export const getNewEpisodesCount = async () => {
  const dataStr = await AsyncStorage.getItem(PV.Keys.NEW_EPISODES_COUNT_DATA)
  let data = {}
  try {
    data = dataStr ? JSON.parse(dataStr) : {}
  } catch (err) {
    //
  }

  return data
}

export const handleUpdateNewEpisodesCountAddByRSS = async (podcastId: string, newEpisodesFoundCount: number) => {
  const newEpisodesCount = await getNewEpisodesCount()
  const previousCount = newEpisodesCount[podcastId] || 0
  if (podcastId) {
    newEpisodesCount[podcastId] = previousCount + newEpisodesFoundCount
  }
  await AsyncStorage.setItem(PV.Keys.NEW_EPISODES_COUNT_DATA, JSON.stringify(newEpisodesCount))
  return newEpisodesCount
}

export const handleUpdateNewEpisodesCount = async () => {
  const global = getGlobal()
  const dateISOString = await getNewEpisodeCountLastRefreshDate()
  const subscribedPodcastIds = global?.session?.userInfo?.subscribedPodcastIds
  const newEpisodesCounts = await getNewEpisodesCount()

  if (subscribedPodcastIds && subscribedPodcastIds.length > 0) {
    const newEpisodes = await getEpisodesSincePubDate(dateISOString, subscribedPodcastIds)

    for (const newEpisode of newEpisodes) {
      if (newEpisode?.podcast?.id) {
        const previousCount = newEpisodesCounts[newEpisode?.podcast?.id] || 0
        newEpisodesCounts[newEpisode?.podcast?.id] = previousCount + 1
      }
    }

    await AsyncStorage.setItem(PV.Keys.NEW_EPISODES_COUNT_DATA, JSON.stringify(newEpisodesCounts))
  }

  await AsyncStorage.setItem(PV.Keys.NEW_EPISODE_COUNT_LAST_REFRESHED, new Date().toISOString())

  return newEpisodesCounts
}

export const clearEpisodesCount = async () => {
  await AsyncStorage.setItem(PV.Keys.NEW_EPISODES_COUNT_DATA, JSON.stringify({}))
}

export const clearEpisodesCountForPodcast = async (podcastId: string) => {
  const newEpisodesCount = await getNewEpisodesCount()
  try {
    if (newEpisodesCount[podcastId]) {
      newEpisodesCount[podcastId] = 0
    }
    
    await AsyncStorage.setItem(PV.Keys.NEW_EPISODES_COUNT_DATA, JSON.stringify(newEpisodesCount))
  } catch (error) {
    console.log('clearEpisodesCountForPodcast error', error)
  }
  return newEpisodesCount
}

export const toggleHideNewEpisodesBadges = async () => {
  const hideNewEpisodesBadges = await AsyncStorage.getItem(PV.Keys.NEW_EPISODES_BADGES_HIDE)
  const newValue = !!hideNewEpisodesBadges ? false : 'TRUE'
  if (newValue) {
    await AsyncStorage.setItem(PV.Keys.NEW_EPISODES_BADGES_HIDE, newValue)
  } else {
    await AsyncStorage.removeItem(PV.Keys.NEW_EPISODES_BADGES_HIDE)
  }
  return !!newValue
}
