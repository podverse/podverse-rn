import AsyncStorage from '@react-native-community/async-storage'
import { NowPlayingItem } from 'podverse-shared'
import { getGlobal, setGlobal } from 'reactn'
import { PV } from '../../resources'
import { checkIfShouldUseServerData } from '../../services/auth'
import {
  addOrUpdateHistoryItem,
  clearHistoryItems as clearHistoryItemsService,
  defaultHistoryItemsIndex,
  filterItemFromHistoryItems,
  filterItemFromHistoryItemsIndex,
  generateHistoryItemsIndex,
  getHistoryItems as getHistoryItemsService,
  getHistoryItemsIndex,
  getHistoryItemsIndexLocally,
  getHistoryItemsLocally,
  removeHistoryItem as removeHistoryItemService,
  setHistoryItemsIndexLocally
} from '../../services/userHistoryItem'
import { clearEpisodesCountForPodcastEpisode } from './newEpisodesCount'
import { downloadedEpisodeMarkForDeletion } from './downloads'

export const clearHistoryItems = async () => {
  const globalState = getGlobal()
  await clearHistoryItemsService()
  const historyItemsIndex = await getHistoryItemsIndex()

  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        historyItems: [],
        historyItemsCount: 0,
        historyItemsIndex,
        historyQueryPage: 1
      }
    }
  })
  return []
}

export const getHistoryItems = async (page: number, existingItems: any[]) => {
  const globalState = getGlobal()

  const { userHistoryItems, userHistoryItemsCount } = await getHistoryItemsService(page)
  await updateHistoryItemsIndex()
  const historyItemsIndex = await getHistoryItemsIndexLocally()

  const historyQueryPage = page || 1

  let combinedHistoryItems = [] as any
  if (historyQueryPage > 1 && Array.isArray(existingItems) && existingItems.length > 0) {
    combinedHistoryItems = combinedHistoryItems.concat(existingItems)
  }
  combinedHistoryItems = combinedHistoryItems.concat(userHistoryItems)

  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        historyItems: combinedHistoryItems,
        historyItemsCount: userHistoryItemsCount,
        historyItemsIndex,
        historyQueryPage
      }
    }
  })

  return combinedHistoryItems
}

export const updateHistoryItemsIndex = async () => {
  const globalState = getGlobal()
  const useServerData = await checkIfShouldUseServerData()
  let historyItemsIndex = defaultHistoryItemsIndex
  if (useServerData) {
    historyItemsIndex = await getHistoryItemsIndex()
  } else {
    const { userHistoryItems: localHistoryItems } = await getHistoryItemsLocally()
    historyItemsIndex = generateHistoryItemsIndex(localHistoryItems)
    await setHistoryItemsIndexLocally(historyItemsIndex)
  }

  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        historyItemsIndex
      }
    }
  })
}

export const removeHistoryItem = async (item: NowPlayingItem) => {
  const globalState = getGlobal()
  const { historyItems, historyItemsIndex } = globalState.session.userInfo
  await removeHistoryItemService(item)

  const remainingHistoryItems = filterItemFromHistoryItems(historyItems, item)
  const remainingHistoryItemsIndex = filterItemFromHistoryItemsIndex(historyItemsIndex, item)

  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        historyItems: remainingHistoryItems,
        historyItemsIndex: remainingHistoryItemsIndex
      }
    }
  })

  return historyItems
}

export const markAsPlayed = async (item: NowPlayingItem) => {
  const { session } = getGlobal()
  const { historyItemsIndex } = session.userInfo

  if (item.episodeId) {
    let playbackPosition = 0
    let mediaFileDuration = null
    const historyItem = historyItemsIndex?.episodes?.[item.episodeId]

    if (historyItem) {
      mediaFileDuration = historyItem.mediaFileDuration || 0
      playbackPosition = historyItem.userPlaybackPosition
    }
  
    const forceUpdateOrderDate = false
    const skipSetNowPlaying = true
    const completed = true
    await addOrUpdateHistoryItem(
      item,
      playbackPosition,
      mediaFileDuration,
      forceUpdateOrderDate,
      skipSetNowPlaying,
      completed
    )
  }
}

export const toggleMarkAsPlayed = async (item: NowPlayingItem, shouldMarkAsPlayed: boolean) => {
  const { session } = getGlobal()
  const { historyItemsIndex } = session.userInfo

  if (item.episodeId) {
    let playbackPosition = 0
    let mediaFileDuration = null
    const historyItem = historyItemsIndex?.episodes?.[item.episodeId]

    if (historyItem) {
      mediaFileDuration = historyItem.mediaFileDuration || 0
      playbackPosition = historyItem.userPlaybackPosition
    }
  
    const forceUpdateOrderDate = false
    const skipSetNowPlaying = true
    const completed = shouldMarkAsPlayed

    if ((item?.podcastId || item?.addByRSSPodcastFeedUrl) && item?.episodeId) {
      await clearEpisodesCountForPodcastEpisode(item?.podcastId || item?.addByRSSPodcastFeedUrl, item.episodeId)
    }

    const autoDeleteEpisodeOnEnd = await AsyncStorage.getItem(PV.Keys.AUTO_DELETE_EPISODE_ON_END)
    if (autoDeleteEpisodeOnEnd && shouldMarkAsPlayed) {
      downloadedEpisodeMarkForDeletion(item.episodeId)
    }

    await addOrUpdateHistoryItem(
      item,
      playbackPosition,
      mediaFileDuration,
      forceUpdateOrderDate,
      skipSetNowPlaying,
      completed
    )
  }
}
