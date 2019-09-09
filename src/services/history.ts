import AsyncStorage from '@react-native-community/async-storage'
import { NowPlayingItem } from '../lib/NowPlayingItem'
import { checkIfIdMatchesClipIdOrEpisodeId } from '../lib/utility'
import { PV } from '../resources'
import { getAuthUserInfo } from '../state/actions/auth'
import { checkIfShouldUseServerData, getBearerToken } from './auth'
import { request } from './request'

export const addOrUpdateHistoryItem = async (item: NowPlayingItem) => {
  const useServerData = await checkIfShouldUseServerData()
  return useServerData ? addOrUpdateHistoryItemOnServer(item) : addOrUpdateHistoryItemLocally(item)
}

export const clearHistoryItems = async () => {
  const useServerData = await checkIfShouldUseServerData()
  return useServerData ? clearHistoryItemsOnServer() : clearHistoryItemsLocally()
}

export const getHistoryItem = async (id: string) => {
  const historyItems = await getHistoryItems()
  const historyItem = historyItems.find((x: NowPlayingItem) => {
    const id = x.clipId || x.episodeId
    return checkIfIdMatchesClipIdOrEpisodeId(id, x.clipId, x.episodeId)
  })

  return historyItem
}

export const getHistoryItems = async () => {
  const useServerData = await checkIfShouldUseServerData()
  return useServerData ? getHistoryItemsFromServer() : getHistoryItemsLocally()
}

export const popLastFromHistoryItems = async () => {
  const useServerData = await checkIfShouldUseServerData()

  let item = null
  if (useServerData) {
    item = await popLastFromHistoryItemsFromServer()
  } else {
    item = await popLastFromHistoryItemsLocally()
  }

  return item
}

export const removeHistoryItem = async (item: NowPlayingItem) => {
  const useServerData = await checkIfShouldUseServerData()
  return useServerData ? removeHistoryItemOnServer(item.episodeId, item.clipId) : removeHistoryItemLocally(item)
}

const addOrUpdateHistoryItemLocally = async (item: NowPlayingItem) => {
  const items = await getHistoryItemsLocally()
  const filteredItems = filterItemFromHistoryItems(items, item)
  filteredItems.unshift(item)
  return setAllHistoryItemsLocally(filteredItems)
}

const addOrUpdateHistoryItemOnServer = async (nowPlayingItem: NowPlayingItem) => {
  await addOrUpdateHistoryItemLocally(nowPlayingItem)
  const bearerToken = await getBearerToken()
  const response = await request({
    endpoint: '/user/add-or-update-history-item',
    method: 'PATCH',
    headers: {
      'Authorization': bearerToken,
      'Content-Type': 'application/json'
    },
    body: { historyItem: nowPlayingItem },
    opts: { credentials: 'include' }
  })

  return response && response.data
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
      'Authorization': bearerToken,
      'Content-Type': 'application/json'
    },
    opts: { credentials: 'include' }
  })

  return response && response.data
}

export const filterItemFromHistoryItems = (items: NowPlayingItem[], item: NowPlayingItem) => items.filter((x) => {
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

const popLastFromHistoryItemsLocally = async () => {
  const items = await getHistoryItemsLocally()
  const currentItem = items.shift()
  const itemToPop = items.shift()
  if (itemToPop) {
    await removeHistoryItemLocally(currentItem)
    return itemToPop
  }

  return {}
}

const popLastFromHistoryItemsFromServer = async () => {
  await popLastFromHistoryItemsLocally()
  const items = await getHistoryItemsFromServer()
  const currentItem = items.shift()
  const itemToPop = items.shift()

  if (itemToPop) {
    await removeHistoryItemOnServer(currentItem.episodeId, currentItem.clipId)
    return itemToPop
  }

  return {}
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
      'Authorization': bearerToken,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    opts: { credentials: 'include' }
  })

  return response && response.data
}

const setAllHistoryItemsLocally = async (items: NowPlayingItem[]) => {
  if (Array.isArray(items)) await AsyncStorage.setItem(PV.Keys.HISTORY_ITEMS, JSON.stringify(items))
  return items
}
