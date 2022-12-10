import AsyncStorage from '@react-native-community/async-storage'
import { getGlobal } from 'reactn'
import { errorLogger } from '../lib/logger'
import { PV } from '../resources'
import { getEpisodesSincePubDate } from './episode'
import { getHistoryItemsIndex } from './userHistoryItem'

export const getNewEpisodeCountLastRefreshDate = async () => {
  const dateStr = await AsyncStorage.getItem(PV.Keys.NEW_EPISODE_COUNT_LAST_REFRESHED)

  let dateISOString = !!dateStr ? new Date(dateStr).toISOString() : new Date().toISOString()

  // If lastRefreshDate is over 3 months old, limit the date to 3 months ago.
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  if (new Date(dateISOString) < threeMonthsAgo) {
    dateISOString = threeMonthsAgo.toISOString()
  }

  return dateISOString
}

export const getNewEpisodeCountCustomRSSLastRefreshDate = async () => {
  const dateStr = await AsyncStorage.getItem(PV.Keys.NEW_EPISODE_COUNT_CUSTOM_RSS_LAST_REFRESHED)

  const dateISOString = !!dateStr ? new Date(dateStr).toISOString() : new Date().toISOString()

  return dateISOString
}

export const getNewEpisodesCount = async () => {
  const dataStr = await AsyncStorage.getItem(PV.Keys.NEW_EPISODES_COUNT_DATA_2)
  let data = {}
  try {
    data = dataStr ? JSON.parse(dataStr) : {}
  } catch (err) {
    //
  }

  return data
}

const updateNewEpisodesCountEpisode = (newEpisodesCount: any, episodeId: string, podcastId: string) => {
  const podcastNewEpisodesCountData = newEpisodesCount?.[podcastId] || { count: 0, data: {} }
  if (podcastNewEpisodesCountData?.data?.[episodeId]) {
    return newEpisodesCount
  } else {
    const previousCount = podcastNewEpisodesCountData.count || 0
    podcastNewEpisodesCountData.data[episodeId] = true
    podcastNewEpisodesCountData.count = previousCount + 1
    newEpisodesCount[podcastId] = podcastNewEpisodesCountData
    return newEpisodesCount
  }
}

export const handleUpdateNewEpisodesCountAddByRSS = async (podcastId: string, episodeIds: string[]) => {
  let updatedNewEpisodesCount = await getNewEpisodesCount()

  if (Array.isArray(episodeIds)) {
    for (const episodeId of episodeIds) {
      if (!podcastId || !episodeId) continue
      updatedNewEpisodesCount = updateNewEpisodesCountEpisode(updatedNewEpisodesCount, episodeId, podcastId)
    }
  }

  await AsyncStorage.setItem(PV.Keys.NEW_EPISODES_COUNT_DATA_2, JSON.stringify(updatedNewEpisodesCount))

  return updatedNewEpisodesCount
}

export const handleUpdateNewEpisodesCount = async () => {
  const global = getGlobal()
  const dateISOString = await getNewEpisodeCountLastRefreshDate()
  const subscribedPodcastIds = global?.session?.userInfo?.subscribedPodcastIds
  let updatedNewEpisodesCount = await getNewEpisodesCount()

  const historyItemsIndex = await getHistoryItemsIndex()

  if (subscribedPodcastIds && subscribedPodcastIds.length > 0) {
    const newEpisodes = await getEpisodesSincePubDate(dateISOString, subscribedPodcastIds)
    for (const newEpisode of newEpisodes) {
      const podcastId = newEpisode?.podcast?.id
      const episodeId = newEpisode?.id
      if (!podcastId || !episodeId) continue

      // Don't add to newEpisodesCount if item is already in historyItemsIndex.
      if (historyItemsIndex?.episodes?.[episodeId]) continue 

      updatedNewEpisodesCount = updateNewEpisodesCountEpisode(updatedNewEpisodesCount, episodeId, podcastId)
    }

    await AsyncStorage.setItem(PV.Keys.NEW_EPISODES_COUNT_DATA_2, JSON.stringify(updatedNewEpisodesCount))
  }

  await AsyncStorage.setItem(PV.Keys.NEW_EPISODE_COUNT_LAST_REFRESHED, new Date().toISOString())

  return updatedNewEpisodesCount
}

export const clearEpisodesCount = async () => {
  await AsyncStorage.setItem(PV.Keys.NEW_EPISODES_COUNT_DATA_2, JSON.stringify({}))
}

export const clearEpisodesCountForPodcast = async (podcastId: string) => {
  const newEpisodesCount = await getNewEpisodesCount()
  try {
    if (newEpisodesCount[podcastId]) {
      newEpisodesCount[podcastId] = { count: 0, data: {} }
    }

    await AsyncStorage.setItem(PV.Keys.NEW_EPISODES_COUNT_DATA_2, JSON.stringify(newEpisodesCount))
  } catch (error) {
    errorLogger('clearEpisodesCountForPodcast error', error)
  }
  return newEpisodesCount
}

export const clearEpisodesCountForPodcastEpisode = async (podcastId: string, episodeId: string) => {
  const newEpisodesCount = await getNewEpisodesCount()
  try {
    if (newEpisodesCount[podcastId]?.data?.[episodeId]) {
      delete newEpisodesCount[podcastId].data[episodeId]
      newEpisodesCount[podcastId].count = newEpisodesCount[podcastId].count ? newEpisodesCount[podcastId].count - 1 : 0
    }

    await AsyncStorage.setItem(PV.Keys.NEW_EPISODES_COUNT_DATA_2, JSON.stringify(newEpisodesCount))
  } catch (error) {
    errorLogger('clearEpisodesCountForPodcast error', error)
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
