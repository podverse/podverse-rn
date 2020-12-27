import AsyncStorage from '@react-native-community/async-storage'
import { NowPlayingItem } from 'podverse-shared'
import { checkIfIdMatchesClipIdOrEpisodeId } from '../lib/utility'
import { PV } from '../resources'
import { checkIfShouldUseServerData, getBearerToken } from './auth'
import { request } from './request'
import { setNowPlayingItem } from './userNowPlayingItem'

export const addOrUpdateHistoryItem = async (item: NowPlayingItem, playbackPosition: number) => {
  // Always set the userNowPlayingItem when a userHistoryItem is added or updated
  await setNowPlayingItem(item, playbackPosition)

  const useServerData = await checkIfShouldUseServerData()
  return useServerData
    ? addOrUpdateHistoryItemOnServer(item, playbackPosition)
    : addOrUpdateHistoryItemLocally(item, playbackPosition)
}

export const clearHistoryItems = async () => {
  const useServerData = await checkIfShouldUseServerData()
  return useServerData ? clearHistoryItemsOnServer() : clearHistoryItemsLocally()
}

export const getHistoryItem = async (id: string) => {
  const historyItems = await getHistoryItems()
  const historyItem = historyItems.find((x: NowPlayingItem) => {
    return checkIfIdMatchesClipIdOrEpisodeId(id, x.clipId, x.episodeId)
  })

  return historyItem
}

export const getHistoryItems = async () => {
  const useServerData = await checkIfShouldUseServerData()
  return useServerData ? getHistoryItemsFromServer() : getHistoryItemsLocally()
}

export const getHistoryItemsIndex = async () => {
  const useServerData = await checkIfShouldUseServerData()
  return useServerData ? getHistoryItemsIndexFromServer() : getHistoryItemsIndexLocally()
}

export const removeHistoryItem = async (item: NowPlayingItem) => {
  const useServerData = await checkIfShouldUseServerData()
  return useServerData ? removeHistoryItemOnServer(item.episodeId, item.clipId) : removeHistoryItemLocally(item)
}

export const addOrUpdateHistoryItemLocally = async (item: NowPlayingItem, playbackPosition: number) => {
  playbackPosition = Math.floor(playbackPosition) || 0
  const items = await getHistoryItemsLocally()
  const filteredItems = filterItemFromHistoryItems(items, item)
  item.userPlaybackPosition = playbackPosition
  filteredItems.unshift(item)
  await setAllHistoryItemsLocally(filteredItems)
}

const addOrUpdateHistoryItemOnServer = async (nowPlayingItem: NowPlayingItem, playbackPosition: number) => {
  playbackPosition = Math.floor(playbackPosition) || 0
  await addOrUpdateHistoryItemLocally(nowPlayingItem, playbackPosition)

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
      userPlaybackPosition: playbackPosition
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
    return itemsString ? JSON.parse(itemsString) : []
  } catch (error) {
    return []
  }
}

const getHistoryItemsFromServer = async () => {
  const bearerToken = await getBearerToken()

  const response = await request({
    endpoint: '/user-history-item',
    method: 'GET',
    headers: {
      Authorization: bearerToken,
      'Content-Type': 'application/json'
    },
    opts: { credentials: 'include' }
  })

  const { userHistoryItems } = response.data
  await setAllHistoryItemsLocally(userHistoryItems)

  return userHistoryItems
}

const generateHistoryItemsIndex = (historyItems: any[]) => {
  const historyItemsIndex = {
    episodes: {},
    mediaRefs: {}
  }

  for (const historyItem of historyItems) {
    if (historyItem.mediaRefId) {
      historyItemsIndex.mediaRefs[historyItem.mediaRefId] = historyItem.userPlaybackPosition
    } else if (historyItem.episodeId) {
      historyItemsIndex.episodes[historyItem.episodeId] = historyItem.userPlaybackPosition
    }
  }

  return historyItemsIndex
}

export const getHistoryItemsIndexLocally = async () => {
  const historyItems = await getHistoryItemsLocally()
  return generateHistoryItemsIndex(historyItems)
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
  const items = await getHistoryItemsLocally()
  const filteredItems = filterItemFromHistoryItems(items, item)
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
