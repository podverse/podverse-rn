import AsyncStorage from '@react-native-community/async-storage'
import { NowPlayingItem } from '../lib/NowPlayingItem'
import { PV } from '../resources'
import { getAuthenticatedUserInfo } from './auth'
import { updateUserQueueItems } from './user'

export const addQueueItemLast = async (item: NowPlayingItem, useServerData: boolean) => {
  return useServerData ? addQueueItemLastOnServer(item) : addQueueItemLastLocally(item)
}

export const addQueueItemNext = async (item: NowPlayingItem, useServerData: boolean) => {
  return useServerData ? addQueueItemNextOnServer(item) : addQueueItemNextLocally(item)
}

export const getQueueItems = async (useServerData: boolean) => {
  return useServerData ? getQueueItemsFromServer() : getQueueItemsLocally()
}

export const popNextFromQueue = async (useServerData: boolean) => {
  return useServerData ? popNextFromQueueFromServer() : popNextFromQueueLocally()
}

export const removeQueueItem = async (item: NowPlayingItem, useServerData: boolean) => {
  return useServerData ? removeQueueItemOnServer(item) : removeQueueItemLocally(item)
}

export const setAllQueueItems = async (items: NowPlayingItem[], useServerData: boolean) => {
  return useServerData ? setAllQueueItemsOnServer(items) : setAllQueueItemsLocally(items)
}

const addQueueItemLastLocally = async (item: NowPlayingItem) => {
  const items = await getQueueItemsLocally()
  const filteredItems = filterItemFromQueueItems(items, item)
  filteredItems.push(item)
  return setAllQueueItemsLocally(filteredItems)
}

const addQueueItemLastOnServer = async (item: NowPlayingItem) => {
  const items = await getQueueItemsFromServer()
  const filteredItems = filterItemFromQueueItems(items, item)
  filteredItems.push(item)
  await setAllQueueItemsLocally(filteredItems)
  return setAllQueueItemsOnServer(filteredItems)
}

const addQueueItemNextLocally = async (item: NowPlayingItem) => {
  const items = await getQueueItemsLocally()
  const filteredItems = filterItemFromQueueItems(items, item)
  filteredItems.unshift(item)
  return setAllQueueItemsLocally(filteredItems)
}

const addQueueItemNextOnServer = async (item: NowPlayingItem) => {
  const items = await getQueueItemsFromServer()
  const filteredItems = filterItemFromQueueItems(items, item)
  filteredItems.unshift(item)
  await setAllQueueItemsLocally(filteredItems)
  return setAllQueueItemsOnServer(filteredItems)
}

export const filterItemFromQueueItems = (items: NowPlayingItem[], item: NowPlayingItem) => items.filter((x) =>
  (item.clipId && x.clipId !== item.clipId) || (!item.clipId && x.episodeId !== item.episodeId)
)

const getQueueItemsLocally = async () => {
  try {
    const itemsString = await AsyncStorage.getItem(PV.Keys.QUEUE_ITEMS)
    return itemsString ? JSON.parse(itemsString) : []
  } catch (error) {
    return []
  }
}

const getQueueItemsFromServer = async () => {
  const response = await getAuthenticatedUserInfo()
  const user = response[0]
  const { queueItems = [] } = user
  await setAllQueueItemsLocally(queueItems)
  return queueItems
}

const popNextFromQueueLocally = async () => {
  const items = await getQueueItemsLocally()
  const item = items.shift()
  if (item) removeQueueItemLocally(item)
  return item
}

const popNextFromQueueFromServer = async () => {
  await popNextFromQueueLocally()
  const items = await getQueueItemsFromServer()
  const item = items.shift()
  if (item) removeQueueItemOnServer(item)
  return item
}

const removeQueueItemLocally = async (item: NowPlayingItem) => {
  const items = await getQueueItemsLocally()
  const filteredItems = filterItemFromQueueItems(items, item)
  return setAllQueueItemsLocally(filteredItems)
}

const removeQueueItemOnServer = async (item: NowPlayingItem) => {
  await removeQueueItemLocally(item)
  const items = await getQueueItemsFromServer()
  const filteredItems = filterItemFromQueueItems(items, item)
  return setAllQueueItemsOnServer(filteredItems)
}

const setAllQueueItemsLocally = async (items: NowPlayingItem[]) => {
  await AsyncStorage.setItem(PV.Keys.QUEUE_ITEMS, JSON.stringify(items))
  return items
}

const setAllQueueItemsOnServer = async (items: NowPlayingItem[]) => {
  await setAllQueueItemsLocally(items)
  return updateUserQueueItems(items)
}
