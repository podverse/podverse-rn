import AsyncStorage from '@react-native-community/async-storage'
import { NowPlayingItem } from '../lib/NowPlayingItem'
import { PV } from '../resources'
import { checkIfShouldUseServerData, getAuthenticatedUserInfo } from './auth'
import { createTrack, PVTrackPlayer } from './player'
import { updateUserQueueItems } from './user'

export const addQueueItemLast = async (item: NowPlayingItem) => {
  let results = []
  const useServerData = await checkIfShouldUseServerData()

  if (useServerData) {
    results = await addQueueItemLastOnServer(item)
  } else {
    results = await addQueueItemLastLocally(item)
  }

  try {
    PVTrackPlayer.remove(item.clipId || item.episodeId)
  } catch (error) {
    //
  }

  const track = await createTrack(item)
  PVTrackPlayer.add([track])

  return results
}

export const addQueueItemNext = async (item: NowPlayingItem) => {
  let results = []

  const useServerData = await checkIfShouldUseServerData()

  if (useServerData) {
    results = await addQueueItemNextOnServer(item)
  } else {
    results = await addQueueItemNextLocally(item)
  }

  try {
    PVTrackPlayer.remove(item.clipId || item.episodeId)
  } catch (error) {
    console.log('addQueueItemNext', error)
    //
  }

  const playerQueueItems = await PVTrackPlayer.getQueue()
  const currentTrackId = await PVTrackPlayer.getCurrentTrack()
  const currentTrackIndex = playerQueueItems.findIndex((x: any) => currentTrackId === x.id)
  let insertBeforeId = null

  if (playerQueueItems.length >= currentTrackIndex + 1) {
    insertBeforeId = playerQueueItems[currentTrackIndex + 1].id
  }

  const track = await createTrack(item)
  PVTrackPlayer.add([track], insertBeforeId)

  return results
}

export const getQueueItems = async () => {
  const useServerData = await checkIfShouldUseServerData()
  return useServerData ? getQueueItemsFromServer() : getQueueItemsLocally()
}

export const popNextFromQueue = async () => {
  let item = null
  const useServerData = await checkIfShouldUseServerData()

  if (useServerData) {
    item = await popNextFromQueueFromServer()
  } else {
    item = await popNextFromQueueLocally()
  }

  return item
}

export const removeQueueItem = async (item: NowPlayingItem) => {
  let items = []
  const useServerData = await checkIfShouldUseServerData()

  if (useServerData) {
    items = await removeQueueItemOnServer(item)
  } else {
    items = await removeQueueItemLocally(item)
  }

  return items
}

export const setAllQueueItems = async (items: NowPlayingItem[]) => {
  const useServerData = await checkIfShouldUseServerData()

  if (useServerData) {
    await setAllQueueItemsOnServer(items)
  } else {
    await setAllQueueItemsLocally(items)
  }

  return items
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

export const getQueueItemsLocally = async () => {
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
