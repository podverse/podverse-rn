import RNSecureKeyStore, { ACCESSIBLE } from 'react-native-secure-key-store'
import { NowPlayingItem } from '../lib/NowPlayingItem'
import { PV } from '../resources'
import { getAuthUserInfo } from '../state/actions/auth'
import { addOrUpdateUserHistoryItem, clearUserHistoryItems, removeUserHistoryItem } from './user'

export const getHistoryItems = async (isLoggedIn: boolean) => {
  return isLoggedIn ? getHistoryItemsFromServer() : getHistoryItemsLocally()
}

export const addOrUpdateHistoryItem = async (item: NowPlayingItem, isLoggedIn: boolean) => {
  return isLoggedIn ? addOrUpdateHistoryItemOnServer(item) : addOrUpdateHistoryItemLocally(item)
}

export const removeHistoryItem = async (item: NowPlayingItem, isLoggedIn: boolean) => {
  return isLoggedIn ? removeHistoryItemOnServer(item.episodeId, item.clipId) : removeHistoryItemLocally(item)
}

export const clearHistoryItems = async (items: NowPlayingItem[], isLoggedIn: boolean) => {
  return isLoggedIn ? clearHistoryItemsOnServer() : clearHistoryItemsLocally()
}

const getHistoryItemsLocally = async () => {
  try {
    const itemsString = await RNSecureKeyStore.get(PV.Keys.HISTORY_ITEMS)
    return JSON.parse(itemsString)
  } catch (error) {
    return []
  }
}

const setAllHistoryItemsLocally = (items: NowPlayingItem[]) => {
  RNSecureKeyStore.set(
    PV.Keys.HISTORY_ITEMS,
    JSON.stringify(items),
    { accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY }
  )
  return items
}

const addOrUpdateHistoryItemLocally = async (item: NowPlayingItem) => {
  const items = await getHistoryItemsLocally()
  const filteredItems = filterItemFromHistoryItems(items, item)
  filteredItems.unshift(item)
  return setAllHistoryItemsLocally(filteredItems)
}

const removeHistoryItemLocally = async (item: NowPlayingItem) => {
  const items = await getHistoryItemsLocally()
  const filteredItems = filterItemFromHistoryItems(items, item)
  return setAllHistoryItemsLocally(filteredItems)
}

const clearHistoryItemsLocally = async () => {
  return setAllHistoryItemsLocally([])
}

const getHistoryItemsFromServer = async () => {
  const user = await getAuthUserInfo()
  const { historyItems } = user
  return historyItems
}

const addOrUpdateHistoryItemOnServer = async (item: NowPlayingItem) => {
  return addOrUpdateUserHistoryItem(item)
}

const removeHistoryItemOnServer = async (episodeId?: string, mediaRefId?: string) => {
  return removeUserHistoryItem(episodeId, mediaRefId)
}

const clearHistoryItemsOnServer = async () => {
  return clearUserHistoryItems()
}

export const filterItemFromHistoryItems = (items: NowPlayingItem[], item: NowPlayingItem) => items.filter(x =>
  (item.clipId && x.clipId !== item.clipId) || (!item.clipId && x.episodeId !== item.episodeId)
)
