import AsyncStorage from '@react-native-community/async-storage'
import { NowPlayingItem } from 'podverse-shared'
import { getGlobal } from 'reactn'
import { PV } from '../resources'
import { checkIfShouldUseServerData, getBearerToken } from './auth'
import { request } from './request'
import { setNowPlayingItem } from './userNowPlayingItem'

export const addOrUpdateHistoryItem = async (
  item: NowPlayingItem,
  playbackPosition: number,
  mediaFileDuration?: number | null,
  forceUpdateOrderDate?: boolean,
  skipSetNowPlaying?: boolean,
  completed?: boolean
) => {
  if (!skipSetNowPlaying) {
    await setNowPlayingItem(item, playbackPosition)
  }

  const useServerData = await checkIfShouldUseServerData()
  return useServerData
    ? addOrUpdateHistoryItemOnServer(item, playbackPosition, mediaFileDuration, forceUpdateOrderDate, completed)
    : addOrUpdateHistoryItemLocally(item, playbackPosition, mediaFileDuration)
}

export const clearHistoryItems = async () => {
  const useServerData = await checkIfShouldUseServerData()
  return useServerData ? clearHistoryItemsOnServer() : clearHistoryItemsLocally()
}

export const getHistoryItems = async (query?: any) => {
  const useServerData = await checkIfShouldUseServerData()
  return useServerData ? getHistoryItemsFromServer(query) : getHistoryItemsLocally()
}

export const getHistoryItemsIndex = async () => {
  const useServerData = await checkIfShouldUseServerData()
  return useServerData ? getHistoryItemsIndexFromServer() : getHistoryItemsIndexLocally()
}

export const removeHistoryItem = async (item: NowPlayingItem) => {
  const useServerData = await checkIfShouldUseServerData()
  return useServerData ? removeHistoryItemOnServer(item.episodeId, item.clipId) : removeHistoryItemLocally(item)
}

export const getHistoryItemIndexInfoForEpisode = (episodeId: string) => {
  const globalState = getGlobal()
  const mediaFileDuration = globalState.session?.userInfo?.historyItemsIndex?.episodes[episodeId]?.mediaFileDuration
  const userPlaybackPosition =
    globalState.session?.userInfo?.historyItemsIndex?.episodes[episodeId]?.userPlaybackPosition

  return {
    mediaFileDuration,
    userPlaybackPosition
  }
}

export const addOrUpdateHistoryItemLocally = async (
  item: NowPlayingItem,
  playbackPosition: number,
  mediaFileDuration?: number | null
) => {
  playbackPosition = Math.floor(playbackPosition) || 0
  mediaFileDuration = mediaFileDuration && Math.floor(mediaFileDuration) || 0
  const results = await getHistoryItemsLocally()
  const { userHistoryItems } = results
  const filteredItems = filterItemFromHistoryItems(userHistoryItems, item)
  item.episodeDuration = mediaFileDuration ? mediaFileDuration : item.episodeDuration
  item.userPlaybackPosition = playbackPosition
  filteredItems.unshift(item)
  await setAllHistoryItemsLocally(filteredItems)
}

const addOrUpdateHistoryItemOnServer = async (
  nowPlayingItem: NowPlayingItem,
  playbackPosition: number,
  mediaFileDuration?: number | null,
  forceUpdateOrderDate?: boolean,
  completed?: boolean
) => {
  playbackPosition = Math.floor(playbackPosition) || 0
  await addOrUpdateHistoryItemLocally(nowPlayingItem, playbackPosition, mediaFileDuration)

  // Don't try to add the addByRSS episodes to the server
  if (nowPlayingItem && nowPlayingItem.addByRSSPodcastFeedUrl) {
    return
  }

  const bearerToken = await getBearerToken()
  const { clipId, episodeId } = nowPlayingItem

  await request({
    endpoint: '/user-history-item',
    method: 'PATCH',
    headers: {
      Authorization: bearerToken,
      'Content-Type': 'application/json'
    },
    body: {
      episodeId: clipId ? null : episodeId,
      mediaRefId: clipId,
      forceUpdateOrderDate: forceUpdateOrderDate === false ? false : true,
      ...(mediaFileDuration || mediaFileDuration === 0 ? { mediaFileDuration: Math.floor(mediaFileDuration) } : {}),
      userPlaybackPosition: playbackPosition,
      ...(completed ? { completed } : {})
    },
    opts: { credentials: 'include' }
  })
}

const clearHistoryItemsLocally = async () => {
  return setAllHistoryItemsLocally([])
}

const clearHistoryItemsOnServer = async () => {
  await clearHistoryItemsLocally()
  const bearerToken = await getBearerToken()
  const response = await request({
    endpoint: '/user-history-item/remove-all',
    method: 'DELETE',
    headers: {
      Authorization: bearerToken,
      'Content-Type': 'application/json'
    },
    opts: { credentials: 'include' }
  })

  return response && response.data
}

export const filterItemFromHistoryItems = (items: NowPlayingItem[] = [], item: NowPlayingItem) =>
  items.filter((x) => {
    if (item.clipId && x.clipId === item.clipId) {
      return false
    } else if (!item.clipId && !x.clipId && x.episodeId === item.episodeId) {
      return false
    }
    return true
  })

export const getHistoryItemsLocally = async () => {
  try {
    const itemsString = await AsyncStorage.getItem(PV.Keys.HISTORY_ITEMS)
    const userHistoryItems = itemsString ? JSON.parse(itemsString) : []
    return {
      userHistoryItems,
      userHistoryItemsCount: userHistoryItems.length
    }
  } catch (error) {
    return {}
  }
}

const getHistoryItemsFromServer = async (page: number) => {
  const bearerToken = await getBearerToken()

  const response = await request({
    endpoint: '/user-history-item',
    method: 'GET',
    headers: { Authorization: bearerToken },
    query: {
      page
    },
    opts: { credentials: 'include' }
  })

  const { userHistoryItems, userHistoryItemsCount } = response.data
  await setAllHistoryItemsLocally(userHistoryItems)

  return { userHistoryItems, userHistoryItemsCount }
}

export const filterItemFromHistoryItemsIndex = (historyItemsIndex: any, item: any) => {
  if (historyItemsIndex && historyItemsIndex.mediaRefs && historyItemsIndex.episodes > 0 && item) {
    if (item.clipId && historyItemsIndex.mediaRefs) {
      delete historyItemsIndex.mediaRefs[item.clipId]
    } else {
      delete historyItemsIndex.episodes[item.episodeId]
    }
  }
  return historyItemsIndex
}

const generateHistoryItemsIndex = (historyItems: any[]) => {
  const historyItemsIndex = {
    episodes: {},
    mediaRefs: {}
  }

  if (!historyItems) {
    historyItems = []
  }
  for (const historyItem of historyItems) {
    if (historyItem.mediaRefId) {
      historyItemsIndex.mediaRefs[historyItem.mediaRefId] = {
        mediaFileDuration: historyItem.mediaFileDuration || historyItem.episodeDuration,
        userPlaybackPosition: historyItem.userPlaybackPosition
      }
    } else if (historyItem.episodeId) {
      historyItemsIndex.episodes[historyItem.episodeId] = {
        mediaFileDuration: historyItem.mediaFileDuration || historyItem.episodeDuration,
        userPlaybackPosition: historyItem.userPlaybackPosition,
        ...(historyItem.completed ? { completed: historyItem.completed } : {})
      }
    }
  }
  return historyItemsIndex
}

export const getHistoryItemEpisodeFromIndexLocally = async (episodeId: string) => {
  const historyItemsIndex = await getHistoryItemsIndexLocally()
  return historyItemsIndex.episodes[episodeId]
}

export const getHistoryItemsIndexLocally = async () => {
  const results = await getHistoryItemsLocally()
  const { userHistoryItems } = results
  return generateHistoryItemsIndex(userHistoryItems)
}

const getHistoryItemsIndexFromServer = async () => {
  const bearerToken = await getBearerToken()
  const response = (await request({
    endpoint: '/user-history-item/metadata',
    method: 'GET',
    headers: {
      Authorization: bearerToken,
      'Content-Type': 'application/json'
    }
  })) as any

  const { userHistoryItems } = response.data
  return generateHistoryItemsIndex(userHistoryItems)
}

const removeHistoryItemLocally = async (item: NowPlayingItem) => {
  const results = await getHistoryItemsLocally()
  const { userHistoryItems } = results
  const filteredItems = filterItemFromHistoryItems(userHistoryItems, item)
  return setAllHistoryItemsLocally(filteredItems)
}

const removeHistoryItemOnServer = async (episodeId?: string, mediaRefId?: string) => {
  const bearerToken = await getBearerToken()
  const endpoint = `/user-history-item/${episodeId ? `episode/${episodeId}` : `mediaRef/${mediaRefId}`}`

  const response = await request({
    endpoint,
    method: 'DELETE',
    headers: {
      Authorization: bearerToken,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    opts: { credentials: 'include' }
  })

  return response && response.data
}

export const setAllHistoryItemsLocally = async (items: NowPlayingItem[]) => {
  if (Array.isArray(items)) {
    await AsyncStorage.setItem(PV.Keys.HISTORY_ITEMS, JSON.stringify(items))
  }
  return items
}
