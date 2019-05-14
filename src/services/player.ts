import AsyncStorage from '@react-native-community/async-storage'
import linkifyHtml from 'linkifyjs/html'
import TrackPlayer from 'react-native-track-player'
import { convertNowPlayingItemClipToNowPlayingItemEpisode, NowPlayingItem } from '../lib/NowPlayingItem'
import { PV } from '../resources'
import PlayerEventEmitter from '../services/playerEventEmitter'
import { getBearerToken } from './auth'
import { getEpisode } from './episode'
import { addOrUpdateHistoryItem } from './history'
import { getMediaRef } from './mediaRef'
import { filterItemFromQueueItems, getQueueItems, setAllQueueItems } from './queue'

// TODO: setupPlayer is a promise, could this cause an async issue?
TrackPlayer.setupPlayer().then(() => {
  TrackPlayer.registerPlaybackService(() => require('./playerEvents'))
})

export const PVTrackPlayer = TrackPlayer

export const getClipHasEnded = async () => {
  return AsyncStorage.getItem(PV.Keys.CLIP_HAS_ENDED)
}

export const getContinuousPlaybackMode = async () => {
  const itemString = await AsyncStorage.getItem(PV.Keys.SHOULD_CONTINUOUSLY_PLAY)
  if (itemString) {
    return JSON.parse(itemString)
  }
}

export const getNowPlayingItem = async () => {
  try {
    const itemString = await AsyncStorage.getItem(PV.Keys.NOW_PLAYING_ITEM)
    return itemString ? JSON.parse(itemString) : {}
  } catch (error) {
    return null
  }
}

export const getNowPlayingItemEpisode = async () => {
  const itemString = await AsyncStorage.getItem(PV.Keys.NOW_PLAYING_ITEM_EPISODE)
  return itemString ? JSON.parse(itemString) : {}
}

export const getNowPlayingItemMediaRef = async () => {
  const itemString = await AsyncStorage.getItem(PV.Keys.NOW_PLAYING_ITEM_MEDIA_REF)
  return itemString ? JSON.parse(itemString) : {}
}

export const handleResumeAfterClipHasEnded = async () => {
  const nowPlayingItem = await getNowPlayingItem()
  const nowPlayingItemEpisode = convertNowPlayingItemClipToNowPlayingItemEpisode(nowPlayingItem)
  await setNowPlayingItem(nowPlayingItemEpisode)
  PlayerEventEmitter.emit(PV.Events.PLAYER_RESUME_AFTER_CLIP_HAS_ENDED)
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

export const setClipHasEnded = async (clipHasEnded: boolean) => {
  await AsyncStorage.setItem(PV.Keys.CLIP_HAS_ENDED, JSON.stringify(clipHasEnded))
}

export const setContinuousPlaybackMode = async (shouldContinuouslyPlay: boolean) => {
  await AsyncStorage.setItem(PV.Keys.SHOULD_CONTINUOUSLY_PLAY, JSON.stringify(shouldContinuouslyPlay))
}

export const setNowPlayingItem = async (item: NowPlayingItem) => {
  const bearerToken = await getBearerToken()
  const isLoggedIn = !!bearerToken
  const { clipId, episodeId, episodeMediaUrl, episodeTitle = 'untitled episode', podcastImageUrl,
    podcastTitle = 'untitled podcast' } = item

  const lastNowPlayingItem = await getNowPlayingItem()
  const isNewEpisode = !lastNowPlayingItem || episodeId !== lastNowPlayingItem.episodeId
  const isNewMediaRef = clipId && (!lastNowPlayingItem || clipId !== lastNowPlayingItem.clipId)

  await AsyncStorage.setItem(PV.Keys.NOW_PLAYING_ITEM, JSON.stringify(item))

  await setClipHasEnded(false)

  const isTrackLoaded = await TrackPlayer.getCurrentTrack()
  const id = clipId || episodeId

  if (id && (!isTrackLoaded || isNewEpisode)) {
    await TrackPlayer.add({
      id,
      url: episodeMediaUrl,
      title: episodeTitle,
      artist: podcastTitle,
      ...(podcastImageUrl ? { artwork: podcastImageUrl } : {})
    })

    if (isTrackLoaded) {
      await TrackPlayer.skipToNext()
    }
  }

  if (!isNewEpisode && isNewMediaRef && item.clipStartTime) {
    await setPlaybackPosition(item.clipStartTime)
  }

  const items = await getQueueItems(isLoggedIn)

  let filteredItems = [] as any[]
  filteredItems = filterItemFromQueueItems(items, item)
  await setAllQueueItems(filteredItems, isLoggedIn)
  await addOrUpdateHistoryItem(item, isLoggedIn)

  if (isNewEpisode && episodeId) {
    await setNowPlayingItemEpisode(episodeId)
  }

  if (isNewMediaRef && clipId) {
    await setNowPlayingItemMediaRef(clipId)
  }

  PlayerEventEmitter.emit(PV.Events.PLAYER_STATE_CHANGED)

  return {
    nowPlayingItem: item,
    queueItems: filteredItems
  }
}

export const setNowPlayingItemEpisode = async (id: string) => {
  const episode = await getEpisode(id)
  episode.description = episode.description || 'No summary available.'
  episode.description = linkifyHtml(episode.description)

  await AsyncStorage.setItem(PV.Keys.NOW_PLAYING_ITEM_EPISODE, JSON.stringify(episode))
}

export const setNowPlayingItemMediaRef = async (id: string) => {
  const mediaRef = await getMediaRef(id)

  await AsyncStorage.setItem(PV.Keys.NOW_PLAYING_ITEM_MEDIA_REF, JSON.stringify(mediaRef))
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
