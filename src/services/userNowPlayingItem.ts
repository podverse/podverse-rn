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
  return useServerData
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
    return itemString ? JSON.parse(itemString) : null
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

    const { episode, mediaRef } = response.data

    if (!episode && !mediaRef) {
      throw new Error('Response data missing both episode and mediaRef')
    }

    item = convertToNowPlayingItem(mediaRef || episode) || {}

    if (item.clipId || item.episodeId) {
      await setNowPlayingItemLocally(response, item.userPlaybackPosition || 0)
    } else {
      throw new Error('Now Playing Item missing both clipId and episodeId.')
    }
  } catch (error) {
    console.log('Error in getNowPlayingItemOnServer: ', error)
    item = null
  }

  return item
}

export const setNowPlayingItemLocally = async (item: NowPlayingItem | null, playbackPosition: number) => {
  if (item && typeof item === 'object') {
    item.userPlaybackPosition = (playbackPosition && Math.floor(playbackPosition)) || 0
    await AsyncStorage.setItem(PV.Keys.NOW_PLAYING_ITEM, JSON.stringify(item))
  }
}

export const setNowPlayingItemOnServer = async (item: NowPlayingItem | null, playbackPosition: number) => {
  if (!item || (!item.clipId && !item.episodeId)) {
    return
  }

  playbackPosition = (playbackPosition && Math.floor(playbackPosition)) || 0

  await setNowPlayingItemLocally(item, playbackPosition)

  const bearerToken = await getBearerToken()
  const { clipId, episodeId } = item
  const body = {
    ...(clipId ? { clipId } : {}),
    ...(!clipId ? { episodeId } : {}),
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
