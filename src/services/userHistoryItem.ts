import AsyncStorage from '@react-native-community/async-storage'
import { unionBy } from 'lodash'
import { NowPlayingItem } from 'podverse-shared'
import { getGlobal } from 'reactn'
import { PV } from '../resources'
import PVEventEmitter from '../services/eventEmitter'
import { checkIfShouldUseServerData, getBearerToken } from './auth'
import { playerGetDuration, playerGetPosition } from './player'
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
  const func = useServerData
    ? () => addOrUpdateHistoryItemOnServer(item, playbackPosition, mediaFileDuration, forceUpdateOrderDate, completed)
    : () => addOrUpdateHistoryItemLocally(item, playbackPosition, mediaFileDuration)
  await func()

  // The historyItemsIndex does not automatically trigger components to re-render,
  // so we are manually forcing those components to re-render by emitting this event.
  PVEventEmitter.emit(PV.Events.PLAYER_HISTORY_INDEX_SHOULD_UPDATE)
}

export const addOrUpdateHistoryItemConditionalAsync = async (
  shouldAwait: boolean,
  item: NowPlayingItem,
  playbackPosition: number,
  mediaFileDuration?: number | null,
  forceUpdateOrderDate?: boolean,
  skipSetNowPlaying?: boolean,
  completed?: boolean
) => {
  if (shouldAwait) {
    await addOrUpdateHistoryItem(
      item,
      playbackPosition,
      mediaFileDuration,
      forceUpdateOrderDate,
      skipSetNowPlaying,
      completed
    )
  } else {
    addOrUpdateHistoryItem(
      item,
      playbackPosition,
      mediaFileDuration,
      forceUpdateOrderDate,
      skipSetNowPlaying,
      completed
    )
  }
}

export const saveOrResetCurrentlyPlayingItemInHistory = async (
  shouldAwait: boolean,
  nowPlayingItem: NowPlayingItem,
  skipSetNowPlaying: boolean
) => {
  const [lastPosition, duration] = await Promise.all([
    playerGetPosition(),
    playerGetDuration()
  ])

  const forceUpdateOrderDate = false

  if (duration > 0 && lastPosition >= duration - 10) {
    const startPlaybackPosition = 0
    const completed = true
    await addOrUpdateHistoryItemConditionalAsync(
      !!shouldAwait,
      nowPlayingItem,
      startPlaybackPosition,
      duration,
      forceUpdateOrderDate,
      skipSetNowPlaying,
      completed
    )
  } else if (lastPosition > 0) {
    await addOrUpdateHistoryItemConditionalAsync(
      !!shouldAwait,
      nowPlayingItem,
      lastPosition,
      duration,
      forceUpdateOrderDate,
      skipSetNowPlaying
    )
  }
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
  const episode = globalState.session?.userInfo?.historyItemsIndex?.episodes[episodeId]
  const completed = episode?.completed
  const mediaFileDuration = episode?.mediaFileDuration
  const userPlaybackPosition = episode?.userPlaybackPosition

  return {
    completed,
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
  mediaFileDuration = (mediaFileDuration && Math.floor(mediaFileDuration)) || 0
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
  const { clipId, episodeId, liveItem } = nowPlayingItem

  // Infinity happens in the case of live streams.
  const duration = mediaFileDuration && mediaFileDuration !== Infinity
    ? Math.floor(mediaFileDuration)
    : 0

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
      ...(liveItem ? { liveItem } : {}),
      forceUpdateOrderDate: forceUpdateOrderDate === false ? false : true,
      ...(duration ? { mediaFileDuration: duration } : {}),
      userPlaybackPosition: playbackPosition,
      ...(completed === true || completed === false ? { completed } : {})
    },
    opts: { credentials: 'include' }
  })
}

const clearHistoryItemsLocally = async () => {
  await setAllHistoryItemsLocally([])
  await setHistoryItemsIndexLocally(defaultHistoryItemsIndex)
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

  const results = await getHistoryItemsLocally()
  const { userHistoryItems: localUserHistoryItems } = results

  /* If user membership is expired, we don't want the 401 error to crash the app,
     so return an empty response body instead. */
  let response = {
    data: {
      userHistoryItems: [],
      userHistoryItemsCount: 0
    }
  }
  try {
    response = await request({
      endpoint: '/user-history-item',
      method: 'GET',
      headers: { Authorization: bearerToken },
      query: {
        page
      },
      opts: { credentials: 'include' }
    })
  } catch (error) {
    console.log('getHistoryItemsFromServer error', error)
  }

  const { userHistoryItems, userHistoryItemsCount } = response.data

  const combinedUserHistoryItems = unionBy(userHistoryItems, localUserHistoryItems, 'episodeId') as NowPlayingItem[]
  const countDifference = userHistoryItems.length + localUserHistoryItems.length - combinedUserHistoryItems.length
  const combinedUserHistoryItemsCount = userHistoryItemsCount + localUserHistoryItems.length - countDifference
  await setAllHistoryItemsLocally(combinedUserHistoryItems)

  return {
    userHistoryItems: combinedUserHistoryItems,
    userHistoryItemsCount: combinedUserHistoryItemsCount
  }
}

export const filterItemFromHistoryItemsIndex = (historyItemsIndex: any, item: any) => {
  if (historyItemsIndex && historyItemsIndex.mediaRefs && historyItemsIndex.episodes > 0 && item) {
    if (item.clipId && historyItemsIndex.mediaRefs) {
      delete historyItemsIndex.mediaRefs[item.clipId]
    } else if (historyItemsIndex.episodes) {
      delete historyItemsIndex.episodes[item.episodeId]
    }
  }
  return historyItemsIndex
}

export const generateHistoryItemsIndex = (historyItems: any[]) => {
  const historyItemsIndex = defaultHistoryItemsIndex

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
  return historyItemsIndex.episodes && historyItemsIndex.episodes[episodeId]
}

export const combineLocalHistoryItemsWithServerMetaHistoryItems =
  async (serverMetaHistoryItems: any) => {
  const results = await getHistoryItemsLocally()
  const { userHistoryItems: localUserHistoryItems } = results
  const combinedHistoryItems = Object.assign(localUserHistoryItems, serverMetaHistoryItems)
  const newHistoryItemsIndex = generateHistoryItemsIndex(combinedHistoryItems)
  await setHistoryItemsIndexLocally(newHistoryItemsIndex)
  return newHistoryItemsIndex
}

export const getHistoryItemsIndexLocally = async () => {
  try {
    const itemsString = await AsyncStorage.getItem(PV.Keys.HISTORY_ITEMS_INDEX)
    const historyItemsIndex = itemsString ? JSON.parse(itemsString) : defaultHistoryItemsIndex
    return historyItemsIndex
  } catch (error) {
    return defaultHistoryItemsIndex
  }
}

const getHistoryItemsIndexFromServer = async () => {
  /* If user membership is expired, we don't want the 401 error to crash the app,
     so return an empty response body instead. */
  let response = {
    data: {
      userHistoryItems: []
    }
  }

  try {
    const bearerToken = await getBearerToken()
    response = (await request({
      endpoint: '/user-history-item/metadata',
      method: 'GET',
      headers: {
        Authorization: bearerToken,
        'Content-Type': 'application/json'
      }
    })) as any
  } catch (error) {
    console.log('getHistoryItemsIndexFromServer error', error)
  }

  const { userHistoryItems: serverMetaHistoryItems } = response.data
  return combineLocalHistoryItemsWithServerMetaHistoryItems(serverMetaHistoryItems)
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
    const newHistoryItemsIndex = generateHistoryItemsIndex(items)
    await setHistoryItemsIndexLocally(newHistoryItemsIndex)
  }

  return items
}

export const setHistoryItemsIndexLocally = async (historyItemsIndex: any) => {
  historyItemsIndex = historyItemsIndex || defaultHistoryItemsIndex
  await AsyncStorage.setItem(PV.Keys.HISTORY_ITEMS_INDEX, JSON.stringify(historyItemsIndex))
}

export const defaultHistoryItemsIndex = { episodes: {}, mediaRefs: {} }