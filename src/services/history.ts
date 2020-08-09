import AsyncStorage from '@react-native-community/async-storage'
import { NowPlayingItem } from 'podverse-shared'
import { checkIfIdMatchesClipIdOrEpisodeId } from '../lib/utility'
import { PV } from '../resources'
import { getAuthUserInfo } from '../state/actions/auth'
import { checkIfShouldUseServerData, getBearerToken } from './auth'
import { getNowPlayingItem } from './player'
import { request } from './request'

export const addOrUpdateHistoryItem = async (item: NowPlayingItem) => {
  const useServerData = await checkIfShouldUseServerData()
  return useServerData ? addOrUpdateHistoryItemOnServer(item) : addOrUpdateHistoryItemLocally(item)
}

export const updateHistoryItemPlaybackPosition = async (item: NowPlayingItem) => {
  const useServerData = await checkIfShouldUseServerData()
  return useServerData
    ? updateHistoryItemPlaybackPositionOnServer(item)
    : updateHistoryItemPlaybackPositionLocally(item)
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

export const removeHistoryItem = async (item: NowPlayingItem) => {
  const useServerData = await checkIfShouldUseServerData()
  return useServerData ? removeHistoryItemOnServer(item.episodeId, item.clipId) : removeHistoryItemLocally(item)
}

// NOTE: userPlaybackPosition should only ever be updated in the updateUserPlaybackPosition function!
// Keep the userPlaybackPosition before adding to the filteredItems array.
export const addOrUpdateHistoryItemLocally = async (item: NowPlayingItem) => {
  const items = await getHistoryItemsLocally()
  const savedItem = items.find((x: NowPlayingItem) =>
    checkIfIdMatchesClipIdOrEpisodeId(x.clipId || x.episodeId, item.clipId, item.episodeId)
  )
  const userPlaybackPosition = (savedItem && savedItem.userPlaybackPosition) || 0
  const filteredItems = filterItemFromHistoryItems(items, item)
  item.userPlaybackPosition = userPlaybackPosition
  filteredItems.unshift(item)
  return setAllHistoryItemsLocally(filteredItems)
}

const addOrUpdateHistoryItemOnServer = async (nowPlayingItem: NowPlayingItem) => {
  await addOrUpdateHistoryItemLocally(nowPlayingItem)
  const bearerToken = await getBearerToken()
  return request({
    endpoint: '/user/add-or-update-history-item',
    method: 'PATCH',
    headers: {
      Authorization: bearerToken,
      'Content-Type': 'application/json'
    },
    body: { historyItem: nowPlayingItem },
    opts: { credentials: 'include' }
  })
}

const updateHistoryItemPlaybackPositionLocally = async (item: NowPlayingItem) => {
  const items = await getHistoryItemsLocally()
  const index = items.findIndex((x: any) => !x.clipId && x.episodeId === item.episodeId)
  if (index > -1) {
    items[index].userPlaybackPosition = item.userPlaybackPosition
    return setAllHistoryItemsLocally(items)
  } else {
    return items
  }
}

const updateHistoryItemPlaybackPositionOnServer = async (nowPlayingItem: NowPlayingItem) => {
  const origNowPlayingItem = nowPlayingItem
  nowPlayingItem = {
    clipId: nowPlayingItem.clipId,
    episodeId: nowPlayingItem.episodeId,
    userPlaybackPosition: nowPlayingItem.userPlaybackPosition
  }

  await updateHistoryItemPlaybackPositionLocally(nowPlayingItem)

  const bearerToken = await getBearerToken()
  try {
    const response = await request({
      endpoint: '/user/update-history-item-playback-position',
      method: 'PATCH',
      headers: {
        Authorization: bearerToken,
        'Content-Type': 'application/json'
      },
      body: { historyItem: nowPlayingItem },
      opts: { credentials: 'include' }
    })

    return response && response.data
  } catch (error) {
    // If 406 NotAcceptable error, then the historyItem may be missing from the history, so try to add it.
    if (error.response && error.response.status === 406) {
      await addOrUpdateHistoryItem(origNowPlayingItem)
    }

    return
  }
}

const clearHistoryItemsLocally = async () => {
  return setAllHistoryItemsLocally([])
}

const clearHistoryItemsOnServer = async () => {
  await clearHistoryItemsLocally()
  const bearerToken = await getBearerToken()
  const response = await request({
    endpoint: '/user/history-item/clear-all',
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
  const user = await getAuthUserInfo()
  const { historyItems } = user
  setAllHistoryItemsLocally(historyItems)
  return historyItems
}

const removeHistoryItemLocally = async (item: NowPlayingItem) => {
  const items = await getHistoryItemsLocally()
  const filteredItems = filterItemFromHistoryItems(items, item)
  return setAllHistoryItemsLocally(filteredItems)
}

const removeHistoryItemOnServer = async (episodeId?: string, mediaRefId?: string) => {
  const bearerToken = await getBearerToken()
  const query = { ...(!mediaRefId ? { episodeId } : { mediaRefId }) }
  const response = await request({
    endpoint: '/user/history-item',
    query,
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

// If the currently playing item is not the most recent item in historyItems,
// then assume the user is playing from their history.
export const checkIfPlayingFromHistory = async () => {
  try {
    const nowPlayingItem = await getNowPlayingItem()
    const historyItems = await getHistoryItemsLocally()
    const id = nowPlayingItem.clipId || nowPlayingItem.episodeId

    if (
      !Array.isArray(historyItems) ||
      !historyItems.some((x: any) => checkIfIdMatchesClipIdOrEpisodeId(id, x.clipId, x.episodeId))
    ) {
      return false
    }

    const mostRecentHistoryItem = historyItems[0]
    return (
      mostRecentHistoryItem &&
      !checkIfIdMatchesClipIdOrEpisodeId(id, mostRecentHistoryItem.clipId, mostRecentHistoryItem.episodeId)
    )
  } catch (error) {
    console.log('Check if playing from history error: ', error)
    return false
  }
}
