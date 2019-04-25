import RNSecureKeyStore, { ACCESSIBLE } from 'react-native-secure-key-store'
import { NowPlayingItem } from '../lib/NowPlayingItem'
import { PV } from '../resources'
import { getAuthUserInfo } from '../state/actions/auth'
import { updateUserQueueItems } from './auth'

export const getQueueItems = async (isLoggedIn: boolean) => {
  return isLoggedIn ? getQueueItemsFromServer() : getQueueItemsLocally()
}

export const setAllQueueItems = async (items: NowPlayingItem[], isLoggedIn: boolean) => {
  return isLoggedIn ? setAllQueueItemsOnServer(items) : setAllQueueItemsLocally(items)
}

export const addQueueItemNext = async (item: NowPlayingItem, isLoggedIn: boolean) => {
  return isLoggedIn ? addQueueItemNextOnServer(item) : addQueueItemNextLocally(item)
}

export const addQueueItemLast = async (item: NowPlayingItem, isLoggedIn: boolean) => {
  return isLoggedIn ? addQueueItemLastOnServer(item) : addQueueItemLastLocally(item)
}

export const removeQueueItem = async (item: NowPlayingItem, isLoggedIn: boolean) => {
  return isLoggedIn ? removeQueueItemOnServer(item) : removeQueueItemLocally(item)
}

const getQueueItemsLocally = async () => {
  try {
    const itemsString = await RNSecureKeyStore.get(PV.Keys.QUEUE_ITEMS)
    return JSON.parse(itemsString)
  } catch (error) {
    setAllQueueItemsLocally([])
    return []
  }
}

const setAllQueueItemsLocally = (items: NowPlayingItem[]) => {
  RNSecureKeyStore.set(
    PV.Keys.QUEUE_ITEMS,
    JSON.stringify(items),
    { accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY }
  )
  return items
}

const addQueueItemNextLocally = async (item: NowPlayingItem) => {
  const items = await getQueueItemsLocally()
  const filteredItems = filterItemFromQueueItems(items, item)
  filteredItems.unshift(item)
  return setAllQueueItemsLocally(filteredItems)
}

const addQueueItemLastLocally = async (item: NowPlayingItem) => {
  const items = await getQueueItemsLocally()
  const filteredItems = filterItemFromQueueItems(items, item)
  filteredItems.push(item)
  return setAllQueueItemsLocally(filteredItems)
}

const removeQueueItemLocally = async (item: NowPlayingItem) => {
  const items = await getQueueItemsLocally()
  const filteredItems = filterItemFromQueueItems(items, item)
  return setAllQueueItemsLocally(filteredItems)
}

const getQueueItemsFromServer = async () => {
  const user = await getAuthUserInfo()
  const { queueItems } = user
  return queueItems
}

const setAllQueueItemsOnServer = async (items: NowPlayingItem[]) => {
  return updateUserQueueItems(items)
}

const addQueueItemNextOnServer = async (item: NowPlayingItem) => {
  const items = await getQueueItemsFromServer()
  const filteredItems = filterItemFromQueueItems(items, item)
  filteredItems.unshift(item)
  return setAllQueueItemsOnServer(filteredItems)
}

const addQueueItemLastOnServer = async (item: NowPlayingItem) => {
  const items = await getQueueItemsFromServer()
  const filteredItems = filterItemFromQueueItems(items, item)
  filteredItems.push(item)
  return setAllQueueItemsOnServer(filteredItems)
}

const removeQueueItemOnServer = async (item: NowPlayingItem) => {
  const items = await getQueueItemsFromServer()
  console.log(items)
  const filteredItems = filterItemFromQueueItems(items, item)
  console.log(item)
  console.log(filteredItems)
  return setAllQueueItemsOnServer(filteredItems)
}

const filterItemFromQueueItems = (items: NowPlayingItem[], item: NowPlayingItem) => items.filter(x =>
  (item.clipId && x.clipId !== item.clipId) || (!item.clipId && x.episodeId !== item.episodeId)
)
