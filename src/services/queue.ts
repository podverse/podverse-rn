import AsyncStorage from '@react-native-community/async-storage'
import { NowPlayingItem } from 'podverse-shared'
import { PV } from '../resources'
import { checkIfShouldUseServerData, getBearerToken } from './auth'
import { syncPlayerWithQueue } from './player'
import { request } from './request'

export const addQueueItemLast = async (item: NowPlayingItem) => {
  const useServerData = await checkIfShouldUseServerData()
  const results = useServerData ? await addQueueItemLastOnServer(item) : await addQueueItemLastLocally(item)
  await syncPlayerWithQueue()
  return results
}

export const addQueueItemNext = async (item: NowPlayingItem) => {
  const useServerData = await checkIfShouldUseServerData()
  const results = useServerData ? await addQueueItemNextOnServer(item) : await addQueueItemNextLocally(item)
  await syncPlayerWithQueue()
  return results
}

export const getQueueItems = async () => {
  const useServerData = await checkIfShouldUseServerData()
  return useServerData ? getQueueItemsFromServer() : getQueueItemsLocally()
}

export const getNextFromQueue = async () => {
  const useServerData = await checkIfShouldUseServerData()
  let item = await getNextFromQueueLocally()

  if (useServerData) {
    const data = await getNextFromQueueFromServer()
    if (data) {
      const { nextItem, userQueueItems } = data
      item = nextItem
      await setAllQueueItemsLocally(userQueueItems)
    }
  } else if (item) {
    removeQueueItem(item)
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
  await setAllQueueItemsLocally(items)
  await syncPlayerWithQueue()
  return items
}

const addQueueItemLastLocally = async (item: NowPlayingItem) => {
  const items = await getQueueItemsLocally()
  const filteredItems = filterItemFromQueueItems(items, item)
  filteredItems.push(item)
  return setAllQueueItemsLocally(filteredItems)
}

const addQueueItemLastOnServer = async (item: NowPlayingItem) => {
  const maxQueuePosition = 100000
  return addQueueItemToServer(item, maxQueuePosition)
}

const addQueueItemNextLocally = async (item: NowPlayingItem) => {
  const items = await getQueueItemsLocally()
  const filteredItems = filterItemFromQueueItems(items, item)
  filteredItems.unshift(item)
  return setAllQueueItemsLocally(filteredItems)
}

const addQueueItemNextOnServer = async (item: NowPlayingItem) => {
  return addQueueItemToServer(item, 0)
}

export const addQueueItemToServer = async (item: NowPlayingItem, newPosition: number) => {
  const { clipId, episodeId } = item

  if (!clipId && !episodeId) {
    throw new Error('A clipId or episodeId must be provided.')
  }

  const bearerToken = await getBearerToken()
  const body = {
    episodeId: (!clipId && episodeId) || null,
    mediaRefId: clipId || null,
    queuePosition: newPosition
  }

  const response = await request({
    endpoint: '/user-queue-item',
    method: 'PATCH',
    headers: {
      Authorization: bearerToken,
      'Content-Type': 'application/json'
    },
    body,
    opts: { credentials: 'include' }
  })

  const { userQueueItems } = response.data
  if (userQueueItems) {
    await setAllQueueItemsLocally(userQueueItems)
  }

  await syncPlayerWithQueue()

  return userQueueItems
}

export const filterItemFromQueueItems = (items: NowPlayingItem[] = [], item: NowPlayingItem) => {
  let itemsArray = Array.isArray(items) ? items : []
  if (item) {
    itemsArray = itemsArray.filter((x) => {
      if (!item) {
        return false
      } else if (item.clipId && x.clipId === item.clipId) {
        return false
      } else if (!item.clipId && !x.clipId && x.episodeId === item.episodeId) {
        return false
      }
      return true
    })
  }

  return itemsArray
}

const getNextFromQueueLocally = async () => {
  const items = await getQueueItemsLocally()
  const item = items.shift()
  return item
}

const getNextFromQueueFromServer = async () => {
  const bearerToken = await getBearerToken()
  const response = await request({
    endpoint: '/user-queue-item/pop-next',
    method: 'GET',
    headers: { Authorization: bearerToken },
    opts: { credentials: 'include' }
  })

  return response && response.data
}

export const getQueueItemsLocally = async () => {
  try {
    const itemsString = await AsyncStorage.getItem(PV.Keys.QUEUE_ITEMS)
    return itemsString ? JSON.parse(itemsString) : []
  } catch (error) {
    return []
  }
}

const getQueueItemsFromServer = async () => {
  const bearerToken = await getBearerToken()
  const response = await request({
    endpoint: '/user-queue-item',
    method: 'GET',
    headers: { Authorization: bearerToken },
    opts: { credentials: 'include' }
  })

  const userQueueItems = response && response.data && response.data.userQueueItems
  await setAllQueueItemsLocally(userQueueItems)
  return userQueueItems
}

const removeQueueItemLocally = async (item: NowPlayingItem) => {
  const items = await getQueueItemsLocally()
  const filteredItems = filterItemFromQueueItems(items, item)
  return setAllQueueItemsLocally(filteredItems)
}

const removeQueueItemOnServer = async (item: NowPlayingItem) => {
  const { clipId, episodeId } = item
  await removeQueueItemLocally(item)
  const bearerToken = await getBearerToken()

  if (clipId) {
    const response = await request({
      endpoint: `/user-queue-item/mediaRef/${clipId}`,
      method: 'DELETE',
      headers: { Authorization: bearerToken },
      opts: { credentials: 'include' }
    })
    return response && response.data && response.data.userQueueItems
  } else if (episodeId) {
    const response = await request({
      endpoint: `/user-queue-item/episode/${episodeId}`,
      method: 'DELETE',
      headers: { Authorization: bearerToken },
      opts: { credentials: 'include' }
    })
    return response && response.data && response.data.userQueueItems
  }

  throw new Error('Must provide a clipId or episodeId.')
}

export const setAllQueueItemsLocally = async (items: NowPlayingItem[]) => {
  if (Array.isArray(items)) {
    await AsyncStorage.setItem(PV.Keys.QUEUE_ITEMS, JSON.stringify(items))
  }
  return items
}
