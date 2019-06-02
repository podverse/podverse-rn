import AsyncStorage from '@react-native-community/async-storage'
import RNSecureKeyStore from 'react-native-secure-key-store'
import { NowPlayingItem } from '../lib/NowPlayingItem'
import { PV } from '../resources'
import { getAuthUserInfo } from '../state/actions/auth'
import { request } from './request'

export const addOrUpdateHistoryItem = async (item: NowPlayingItem, useServerData: boolean) => {
  return useServerData ? addOrUpdateHistoryItemOnServer(item) : addOrUpdateHistoryItemLocally(item)
}

export const clearHistoryItems = async (useServerData: boolean) => {
  return useServerData ? clearHistoryItemsOnServer() : clearHistoryItemsLocally()
}

export const getHistoryItems = async (useServerData: boolean) => {
  return useServerData ? getHistoryItemsFromServer() : getHistoryItemsLocally()
}

export const popLastFromHistoryItems = async (useServerData: boolean) => {
  return useServerData ? popLastFromHistoryItemsFromServer() : popLastFromHistoryItemsLocally()
}

export const removeHistoryItem = async (item: NowPlayingItem, useServerData: boolean) => {
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
  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
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
  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
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

export const filterItemFromHistoryItems = (items: NowPlayingItem[], item: NowPlayingItem) => items.filter((x) =>
  (item.clipId && x.clipId !== item.clipId) || (!item.clipId && x.episodeId !== item.episodeId)
)

const getHistoryItemsLocally = async () => {
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
  await setAllHistoryItemsLocally(historyItems)
  return historyItems
}

const popLastFromHistoryItemsLocally = async () => {
  const items = await getHistoryItemsLocally()
  const currentlyPlayingItem = items.shift()
  const lastItem = items.shift()
  if (lastItem) {
    await removeHistoryItemLocally(currentlyPlayingItem)
    await removeHistoryItemLocally(lastItem)
    return {
      currentlyPlayingItem,
      lastItem
    }
  }

  return {}
}

const popLastFromHistoryItemsFromServer = async () => {
  await popLastFromHistoryItemsLocally()
  const items = await getHistoryItemsFromServer()
  const currentlyPlayingItem = items.shift()
  const lastItem = items.shift()
  if (lastItem) {
    await removeHistoryItemOnServer(currentlyPlayingItem.episodeId, currentlyPlayingItem.clipId)
    await removeHistoryItemOnServer(lastItem.episodeId, lastItem.clipId)
    return {
      currentlyPlayingItem,
      lastItem
    }
  }

  return {}
}

const removeHistoryItemLocally = async (item: NowPlayingItem) => {
  const items = await getHistoryItemsLocally()
  const filteredItems = filterItemFromHistoryItems(items, item)
  return setAllHistoryItemsLocally(filteredItems)
}

const removeHistoryItemOnServer = async (episodeId?: string, mediaRefId?: string) => {
  const bearerToken = await RNSecureKeyStore.get(PV.Keys.BEARER_TOKEN)
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

const setAllHistoryItemsLocally = (items: NowPlayingItem[]) => {
  AsyncStorage.setItem(PV.Keys.HISTORY_ITEMS, JSON.stringify(items))
  return items
}
