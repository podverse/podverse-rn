import AsyncStorage from '@react-native-community/async-storage'
import { NowPlayingItem } from '../lib/NowPlayingItem'
import { checkIfIdMatchesClipIdOrEpisodeId } from '../lib/utility'
import { PV } from '../resources'
import { getAuthUserInfo } from '../state/actions/auth'
import { checkIfShouldUseServerData, getBearerToken } from './auth'
import { getNowPlayingItem, PVTrackPlayer } from './player'
import { popNextFromQueue } from './queue'
import { request } from './request'

export const addOrUpdateHistoryItem = async (item: NowPlayingItem) => {
  const useServerData = await checkIfShouldUseServerData()
  return useServerData ? addOrUpdateHistoryItemOnServer(item) : addOrUpdateHistoryItemLocally(item)
}

export const updateHistoryItemPlaybackPosition = async (item: NowPlayingItem) => {
  const useServerData = await checkIfShouldUseServerData()
  return useServerData ? updateHistoryItemPlaybackPositionOnServer(item)
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

// Find the currently playing item in historyItems, then load the track
// previous to it in the history, OR play the track in front of it if playNext === true.
// If should playNext but there are no items in front of it, then try to play next from the queue,
// else do nothing.
export const getAdjacentItemFromHistoryLocally = async (playNext?: boolean) => {
  const playingItem = await getNowPlayingItem()

  if (playingItem) {
    const playbackPosition = await PVTrackPlayer.getPosition()
    const duration = await PVTrackPlayer.getDuration()
    if (duration > 0 && playbackPosition >= duration - 10) {
      playingItem.userPlaybackPosition = 0
    } else if (playbackPosition > 0) {
      playingItem.userPlaybackPosition = playbackPosition
    }
    updateHistoryItemPlaybackPosition(playingItem)
  }

  const historyItems = await getHistoryItemsLocally()
  const index = historyItems.findIndex((x: any) =>
    checkIfIdMatchesClipIdOrEpisodeId(x.clipId || x.episodeId, playingItem.clipId, playingItem.episodeId))

  if (index > -1) {
    if (playNext && ((index - 1) > -1)) {
      return historyItems[index - 1]
    } else if (!playNext && ((index + 1) <= historyItems.length - 1)) {
      return historyItems[index + 1]
    } else if (playNext) {
      const nextItem = await popNextFromQueue()
      return nextItem
    }
  }
}

export const removeHistoryItem = async (item: NowPlayingItem) => {
  const useServerData = await checkIfShouldUseServerData()
  return useServerData ? removeHistoryItemOnServer(item.episodeId, item.clipId) : removeHistoryItemLocally(item)
}

export const addOrUpdateHistoryItemLocally = async (item: NowPlayingItem) => {
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
  await updateHistoryItemPlaybackPositionLocally(nowPlayingItem)

  const bearerToken = await getBearerToken()
  const response = await request({
    endpoint: '/user/update-history-item-playback-position',
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

// If the currently playing item is not the most recent item in historyItems,
// then assume the user is playing from their history.
export const checkIfPlayingFromHistory = async () => {
  const nowPlayingItem = await getNowPlayingItem()
  const historyItems = await getHistoryItemsLocally()
  const id = nowPlayingItem.clipId || nowPlayingItem.episodeId

  if (!historyItems.some((x: any) => checkIfIdMatchesClipIdOrEpisodeId(id, x.clipId, x.episodeId))) {
    return false
  }

  const mostRecentHistoryItem = historyItems[0]
  return mostRecentHistoryItem && !checkIfIdMatchesClipIdOrEpisodeId(
    id, mostRecentHistoryItem.clipId, mostRecentHistoryItem.episodeId
  )
}
