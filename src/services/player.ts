import AsyncStorage from '@react-native-community/async-storage'
import TrackPlayer from 'react-native-track-player'
import { NowPlayingItem } from '../lib/NowPlayingItem'
import { PV } from '../resources'
import { addOrUpdateHistoryItem } from './history'
import { filterItemFromQueueItems, getQueueItems, setAllQueueItems } from './queue'

// TODO: setupPlayer is a promise, could this cause an async issue?
TrackPlayer.setupPlayer().then(() => {
  TrackPlayer.registerPlaybackService(() => require('./playerEvents'))
})

export const PVTrackPlayer = TrackPlayer

export const getContinuousPlaybackMode = async () => {
  const itemString = await AsyncStorage.getItem(PV.Keys.SHOULD_CONTINUOUSLY_PLAY)
  if (itemString) {
    return JSON.parse(itemString)
  }
}

export const getNowPlayingItem = async () => {
  try {
    const itemString = await AsyncStorage.getItem(PV.Keys.NOW_PLAYING_ITEM)
    if (itemString) {
      return JSON.parse(itemString)
    }
  } catch (error) {
    return null
  }
}

export const playerJumpBackward = async (seconds: number) => {
  const position = await TrackPlayer.getPosition()
  const newPosition = position - seconds
  TrackPlayer.seekTo(newPosition)
  return newPosition
}

export const playerJumpForward = async (seconds: number) => {
  const position = await TrackPlayer.getPosition()
  const newPosition = position + seconds
  TrackPlayer.seekTo(newPosition)
  return newPosition
}

export const setNowPlayingItem = async (item: NowPlayingItem, isNewEpisode: boolean, playbackRate: number = 1, isLoggedIn: boolean) => {
  const { clipId, episodeId, episodeMediaUrl, episodeTitle = 'untitled episode', podcastImageUrl,
    podcastTitle = 'untitled podcast' } = item

  const id = clipId || episodeId
  if (id && isNewEpisode) {
    const shouldSkipToNext = await TrackPlayer.getCurrentTrack()

    await TrackPlayer.add({
      id,
      url: episodeMediaUrl,
      title: episodeTitle,
      artist: podcastTitle,
      ...(podcastImageUrl ? { artwork: podcastImageUrl } : {})
    })

    if (shouldSkipToNext) {
      await TrackPlayer.skipToNext()
    }
  }

  const items = await getQueueItems(isLoggedIn)

  let filteredItems = [] as any[]
  filteredItems = filterItemFromQueueItems(items, item)
  await setAllQueueItems(filteredItems, isLoggedIn)
  await addOrUpdateHistoryItem(item, isLoggedIn)

  AsyncStorage.setItem(PV.Keys.NOW_PLAYING_ITEM, JSON.stringify(item))

  return {
    nowPlayingItem: item,
    queueItems: filteredItems
  }
}

export const setContinuousPlaybackMode = async (shouldContinuouslyPlay: boolean) => {
  await AsyncStorage.setItem(
    PV.Keys.SHOULD_CONTINUOUSLY_PLAY,
    JSON.stringify(shouldContinuouslyPlay)
  )
}

export const setPlaybackSpeed = async (rate: number) => {
  await TrackPlayer.setRate(rate)
}

export const setPlaybackPosition = async (position: number) => {
  await TrackPlayer.seekTo(position)
}

export const togglePlay = async (playbackRate: number) => {
  const state = await TrackPlayer.getState()
  if (state === TrackPlayer.STATE_PLAYING) {
    TrackPlayer.pause()
  } else {
    TrackPlayer.play()
    TrackPlayer.setRate(playbackRate)
  }
}
