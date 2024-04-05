import AsyncStorage from '@react-native-community/async-storage'
import { unionBy } from 'lodash'
import { NowPlayingItem } from 'podverse-shared'
import { getGlobal } from 'reactn'
import { errorLogger } from '../lib/logger'
import { PV } from '../resources'
import PVEventEmitter from '../services/eventEmitter'
import { checkIfShouldUseServerData, getBearerToken } from './auth'
import { playerGetDuration, playerGetPosition } from './player'
import { request } from './request'
import { setNowPlayingItem } from './userNowPlayingItem'

const _fileName = 'src/services/userHistoryItem.ts'

export const addOrUpdateHistoryItem = async (
  item: NowPlayingItem,
  playbackPosition: number,
  mediaFileDuration?: number | null,
  forceUpdateOrderDate?: boolean,
  skipSetNowPlaying?: boolean,
  completed?: boolean
) => {
  /*
    In the case of a livestream playing, the playbackPosition should always be 0,
    or the player will attempt to jump ahead to a time that does not exist
    within the livestream on resume.
  */
  if (item?.liveItem) {
    playbackPosition = 0
  }

  if (!skipSetNowPlaying) {
    try {
      await setNowPlayingItem(item, playbackPosition)
    } catch (error) {
      // do nothing
    }
  }

  const useServerData = await checkIfShouldUseServerData()
  const func = useServerData
    ? () => addOrUpdateHistoryItemOnServer(item, playbackPosition, mediaFileDuration, forceUpdateOrderDate, completed)
    : () => addOrUpdateHistoryItemLocally(item, playbackPosition, mediaFileDuration, completed)
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
  const [lastPosition, duration] = await Promise.all([playerGetPosition(), playerGetDuration()])

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
  mediaFileDuration?: number | null,
  completed?: boolean
) => {
  playbackPosition = Math.floor(playbackPosition) || 0
  mediaFileDuration = (mediaFileDuration && Math.floor(mediaFileDuration)) || 0
  const results = await getHistoryItemsLocally()
  const { userHistoryItems } = results
  const filteredItems = filterItemFromHistoryItems(userHistoryItems, item)
  item.episodeDuration = mediaFileDuration ? mediaFileDuration : item.episodeDuration
  item.userPlaybackPosition = playbackPosition

  
  const [historyItemsIndex] = await Promise.all([getHistoryItemsIndexLocally()])
  const { clipId, episodeId } = item
  if (!clipId && episodeId && !completed) {
    completed = historyItemsIndex?.episodes?.[episodeId]?.completed || false
  }
  item.completed = !!completed
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
  const duration = mediaFileDuration && mediaFileDuration !== Infinity ? Math.floor(mediaFileDuration) : 0

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
  await setHistoryItemsIndexLocally(getDefaultHistoryItemsIndex())
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
    errorLogger(_fileName, 'getHistoryItemsFromServer', error)
  }

  const { userHistoryItems: nextUserHistoryItems } = response.data
  const combinedUserHistoryItems = unionBy(localUserHistoryItems, nextUserHistoryItems, 'episodeId') as NowPlayingItem[]
  
  await setAllHistoryItemsLocally(combinedUserHistoryItems)

  return {
    userHistoryItems: combinedUserHistoryItems,
    userHistoryItemsCount: combinedUserHistoryItems?.length || 0
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
  const historyItemsIndex = getDefaultHistoryItemsIndex()

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

export const combineLocalHistoryItemsWithServerMetaHistoryItems = async (serverMetaHistoryItems: any) => {
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
    const historyItemsIndex = itemsString ? JSON.parse(itemsString) : getDefaultHistoryItemsIndex()
    return historyItemsIndex
  } catch (error) {
    return getDefaultHistoryItemsIndex()
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
    errorLogger(_fileName, 'getHistoryItemsIndexFromServer', error)
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
  // NOTE: there is a bug somewhere that is resulting in empty objects
  // sometimes making their way into the local historyItems storage.
  // An object with some of the fields of NowPlayingItem gets saved,
  // but all of the fields it has are empty strings or arrays.
  // To workaround this bug, I am always filtering the historyItems before
  // saving them to history, to make sure invalid objects do not get saved.
  items = items.filter((item: NowPlayingItem) => !!item?.episodeId)

  if (Array.isArray(items)) {
    await AsyncStorage.setItem(PV.Keys.HISTORY_ITEMS, JSON.stringify(items))
    const newHistoryItemsIndex = generateHistoryItemsIndex(items)
    await setHistoryItemsIndexLocally(newHistoryItemsIndex)
  }

  return items
}

export const setHistoryItemsIndexLocally = async (historyItemsIndex: any) => {
  historyItemsIndex = historyItemsIndex || getDefaultHistoryItemsIndex()
  await AsyncStorage.setItem(PV.Keys.HISTORY_ITEMS_INDEX, JSON.stringify(historyItemsIndex))
}

// Using a get helper since I was running into issues with the const object getting modified.
export const getDefaultHistoryItemsIndex = () => {
  return { episodes: {}, mediaRefs: {} }
}

export const markAsPlayedEpisodesMultipleOnServer = async (episodeIds: string[]) => {
  const bearerToken = await getBearerToken()
  const endpoint = `/user-history-item/multiple`

  const response = await request({
    endpoint,
    method: 'PATCH',
    headers: {
      Authorization: bearerToken,
      'Content-Type': 'application/json'
    },
    opts: { credentials: 'include' },
    body: {
      episodeIds
    },
    timeoutLongest: true
  })

  return response && response.data
}

export const markAsPlayedEpisodesAllOnServer = async (podcastId: string) => {
  const bearerToken = await getBearerToken()
  const endpoint = `/user-history-item/podcast/${podcastId}`

  const response = await request({
    endpoint,
    method: 'PATCH',
    headers: {
      Authorization: bearerToken,
      'Content-Type': 'application/json'
    },
    opts: { credentials: 'include' },
    timeoutLongest: true
  })

  return response && response.data
}
