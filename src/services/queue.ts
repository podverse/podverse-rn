import RNSecureKeyStore, { ACCESSIBLE } from 'react-native-secure-key-store'
import { NowPlayingItem } from '../lib/NowPlayingItem'
import { PV } from '../resources'
import { getAuthUserInfo } from '../state/actions/auth'
import { updateUserQueueItems } from './user'

export const addQueueItemLast = async (item: NowPlayingItem, isLoggedIn: boolean) => {
  return isLoggedIn ? addQueueItemLastOnServer(item) : addQueueItemLastLocally(item)
}

export const addQueueItemNext = async (item: NowPlayingItem, isLoggedIn: boolean) => {
  return isLoggedIn ? addQueueItemNextOnServer(item) : addQueueItemNextLocally(item)
}

export const getQueueItems = async (isLoggedIn: boolean) => {
  return isLoggedIn ? getQueueItemsFromServer() : getQueueItemsLocally()
}

export const popNextFromQueue = async (isLoggedIn: boolean) => {
  return isLoggedIn ? popNextFromQueueFromServer() : popNextFromQueueLocally()
}

export const removeQueueItem = async (item: NowPlayingItem, isLoggedIn: boolean) => {
  return isLoggedIn ? removeQueueItemOnServer(item) : removeQueueItemLocally(item)
}

export const setAllQueueItems = async (items: NowPlayingItem[], isLoggedIn: boolean) => {
  return isLoggedIn ? setAllQueueItemsOnServer(items) : setAllQueueItemsLocally(items)
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
  return setAllQueueItemsOnServer(filteredItems)
}

export const filterItemFromQueueItems = (items: NowPlayingItem[], item: NowPlayingItem) => items.filter((x) =>
  (item.clipId && x.clipId !== item.clipId) || (!item.clipId && x.episodeId !== item.episodeId)
)

const getQueueItemsLocally = async () => {
  try {
    const itemsString = await RNSecureKeyStore.get(PV.Keys.QUEUE_ITEMS)
    return JSON.parse(itemsString)
  } catch (error) {
    return []
  }
}

const getQueueItemsFromServer = async () => {
  const user = await getAuthUserInfo()
  const { queueItems } = user
  return queueItems
}

const popNextFromQueueLocally = async () => {
  const items = await getQueueItemsLocally()
  const item = items.shift()
  if (item) removeQueueItemLocally(item)
  return item
}

const popNextFromQueueFromServer = async () => {
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
  const items = await getQueueItemsFromServer()
  const filteredItems = filterItemFromQueueItems(items, item)
  return setAllQueueItemsOnServer(filteredItems)
}

const setAllQueueItemsLocally = (items: NowPlayingItem[]) => {
  RNSecureKeyStore.set(
    PV.Keys.QUEUE_ITEMS,
    JSON.stringify(items),
    { accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY }
  )
  return items
}

const setAllQueueItemsOnServer = async (items: NowPlayingItem[]) => {
  return updateUserQueueItems(items)
}
