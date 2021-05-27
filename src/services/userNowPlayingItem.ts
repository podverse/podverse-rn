import AsyncStorage from '@react-native-community/async-storage'
import { convertToNowPlayingItem, NowPlayingItem } from 'podverse-shared'
import { PV } from '../resources'
import { checkIfShouldUseServerData, getBearerToken } from './auth'
import { request } from './request'

export const getNowPlayingItem = async () => {
  const useServerData = await checkIfShouldUseServerData()
  return useServerData ? getNowPlayingItemOnServer() : getNowPlayingItemLocally()
}

export const setNowPlayingItem = async (item: NowPlayingItem | null, playbackPosition: number) => {
  const useServerData = await checkIfShouldUseServerData()
  return useServerData && !item?.addByRSSPodcastFeedUrl
    ? setNowPlayingItemOnServer(item, playbackPosition)
    : setNowPlayingItemLocally(item, playbackPosition)
}

export const clearNowPlayingItem = async () => {
  const useServerData = await checkIfShouldUseServerData()
  return useServerData ? clearNowPlayingItemOnServer() : clearNowPlayingItemLocally()
}

export const getNowPlayingItemLocally = async () => {
  try {
    const itemString = await AsyncStorage.getItem(PV.Keys.NOW_PLAYING_ITEM)
    const parsedObject = itemString ? JSON.parse(itemString) : {}
    // confirm a valid object is found in storage before returning
    return parsedObject.clipId || parsedObject.episodeId ? parsedObject : null
  } catch (error) {
    console.log('getNowPlayingItemLocally', error)
    return null
  }
}

export const getNowPlayingItemOnServer = async () => {
  const bearerToken = await getBearerToken()
  let item = null
  try {
    const response = (await request({
      endpoint: '/user-now-playing-item',
      method: 'GET',
      headers: {
        Authorization: bearerToken,
        'Content-Type': 'application/json'
      },
      opts: { credentials: 'include' }
    })) as any

    const { episode, mediaRef, userPlaybackPosition } = response.data

    if (!episode && !mediaRef) {
      throw new Error('Response data missing both episode and mediaRef')
    }

    item = convertToNowPlayingItem(mediaRef || episode, null, null, userPlaybackPosition || 0) || {}
  } catch (error) {
    console.log('Error in getNowPlayingItemOnServer: ', error)
    item = null
  }

  return item
}

export const setNowPlayingItemLocally = async (item: NowPlayingItem | null, playbackPosition: number) => {
  if (item) {
    item.userPlaybackPosition = (playbackPosition && Math.floor(playbackPosition)) || 0
    await AsyncStorage.setItem(PV.Keys.NOW_PLAYING_ITEM, JSON.stringify(item))
  }
}

export const setNowPlayingItemOnServer = async (item: NowPlayingItem | null, playbackPosition: number) => {
  if (!item || (!item.clipId && !item.episodeId) || item.addByRSSPodcastFeedUrl) {
    return
  }

  playbackPosition = (playbackPosition && Math.floor(playbackPosition)) || 0

  await setNowPlayingItemLocally(item, playbackPosition)

  const bearerToken = await getBearerToken()
  const { clipId, episodeId } = item
  const body = {
    ...(clipId ? { clipId } : { clipId: null }),
    ...(!clipId ? { episodeId } : { episodeId: null }),
    userPlaybackPosition: playbackPosition
  }

  await request({
    endpoint: '/user-now-playing-item',
    method: 'PATCH',
    headers: {
      Authorization: bearerToken,
      'Content-Type': 'application/json'
    },
    body,
    opts: { credentials: 'include' }
  })
}

export const clearNowPlayingItemLocally = async () => {
  try {
    await AsyncStorage.removeItem(PV.Keys.NOW_PLAYING_ITEM)
  } catch (error) {
    console.log('clearNowPlayingItemLocally', error)
  }
}

export const clearNowPlayingItemOnServer = async () => {
  const bearerToken = await getBearerToken()

  await request({
    endpoint: '/user-now-playing-item',
    method: 'DELETE',
    headers: {
      Authorization: bearerToken,
      'Content-Type': 'application/json'
    },
    opts: { credentials: 'include' }
  })

  await clearNowPlayingItemLocally()
}
