import AsyncStorage from '@react-native-community/async-storage'
import TrackPlayer from 'react-native-track-player'
import { hasValidNetworkConnection, hasValidStreamingConnection } from '../lib/network'
import { convertNowPlayingItemClipToNowPlayingItemEpisode, convertNowPlayingItemToEpisode,
  convertNowPlayingItemToMediaRef, NowPlayingItem } from '../lib/NowPlayingItem'
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

let playerPreviewEndTimeInterval: any = null

export const playerPreviewEndTime = async (endTime: number) => {
  if (playerPreviewEndTimeInterval) {
    clearInterval(playerPreviewEndTimeInterval)
  }

  const previewEndTime = endTime - 3
  await PVTrackPlayer.seekTo(previewEndTime)
  PVTrackPlayer.play()

  playerPreviewEndTimeInterval = setInterval(async () => {
    const currentPosition = await PVTrackPlayer.getPosition()
    if (currentPosition >= endTime) {
      clearInterval(playerPreviewEndTimeInterval)
      PVTrackPlayer.pause()
    }
  }, 250)
}

export const playerPreviewStartTime = async (startTime: number, endTime?: number | null) => {
  if (playerPreviewEndTimeInterval) {
    clearInterval(playerPreviewEndTimeInterval)
  }

  TrackPlayer.seekTo(startTime)
  TrackPlayer.play()

  if (endTime) {
    playerPreviewEndTimeInterval = setInterval(async () => {
      const currentPosition = await PVTrackPlayer.getPosition()
      if (currentPosition >= endTime) {
        clearInterval(playerPreviewEndTimeInterval)
        PVTrackPlayer.pause()
      }
    }, 250)
  }
}

export const setClipHasEnded = async (clipHasEnded: boolean) => {
  await AsyncStorage.setItem(PV.Keys.CLIP_HAS_ENDED, JSON.stringify(clipHasEnded))
}

export const setContinuousPlaybackMode = async (shouldContinuouslyPlay: boolean) => {
  await AsyncStorage.setItem(PV.Keys.SHOULD_CONTINUOUSLY_PLAY, JSON.stringify(shouldContinuouslyPlay))
}

export const setNowPlayingItem = async (item: NowPlayingItem, isInitialLoad?: boolean) => {
  try {
    const bearerToken = await getBearerToken()
    const isLoggedIn = !!bearerToken
    const { clipId, episodeId, episodeMediaUrl, episodeTitle = 'untitled episode', podcastImageUrl,
      podcastTitle = 'untitled podcast' } = item

    const lastNowPlayingItem = await getNowPlayingItem()
    const isNewEpisode = (isInitialLoad || !lastNowPlayingItem) || item.episodeId !== lastNowPlayingItem.episodeId
    const isNewMediaRef = item.clipId && ((isInitialLoad || !lastNowPlayingItem) || item.clipId !== lastNowPlayingItem.clipId)

    await AsyncStorage.setItem(PV.Keys.NOW_PLAYING_ITEM, JSON.stringify(item))

    await setClipHasEnded(false)

    const isTrackLoaded = await TrackPlayer.getCurrentTrack()
    const id = clipId || episodeId

    const isDownloadedFile = false
    const hasStreamingConnection = await hasValidStreamingConnection()

    const shouldNotLoadFile = !isDownloadedFile && !hasStreamingConnection

    if (id && (!isTrackLoaded || isNewEpisode)) {
      if (!shouldNotLoadFile) {
        if (isTrackLoaded) {
          await TrackPlayer.reset()
        }

        await TrackPlayer.add({
          id,
          url: episodeMediaUrl,
          title: episodeTitle,
          artist: podcastTitle,
          ...(podcastImageUrl ? { artwork: podcastImageUrl } : {})
        })
      }
    }

    if (!isNewEpisode && isNewMediaRef && item.clipStartTime && !shouldNotLoadFile) {
      await setPlaybackPosition(item.clipStartTime)
    }

    const isConnected = await hasValidNetworkConnection()
    const useServerData = isLoggedIn && isConnected

    const items = await getQueueItems(useServerData)

    let filteredItems = [] as any[]
    filteredItems = filterItemFromQueueItems(items, item)
    await setAllQueueItems(filteredItems, useServerData)
    await addOrUpdateHistoryItem(item, useServerData)

    if (isNewEpisode && episodeId) {
      await updateNowPlayingItemEpisode(episodeId, item, useServerData)
    }

    if (isNewMediaRef && clipId) {
      await updateNowPlayingItemMediaRef(clipId, item, useServerData)
    }

    PlayerEventEmitter.emit(PV.Events.PLAYER_STATE_CHANGED)

    if (shouldNotLoadFile) {
      PlayerEventEmitter.emit(PV.Events.PLAYER_CANNOT_STREAM_WITHOUT_WIFI)
    }

    if (isTrackLoaded) {
      const shouldContinuouslyPlay = await getContinuousPlaybackMode()
      // Give the player a second to load the file before playing.
      // Without this, the player will play a split second of the beginning of an episode
      // before adjusting to the clip's start time position.
      setTimeout(() => {
        if (shouldContinuouslyPlay) {
          TrackPlayer.play()
        }
      }, 1000)
    }

    return {
      nowPlayingItem: item,
      queueItems: filteredItems
    }
  } catch (error) {
    throw error
  }
}

export const setPlaybackPosition = async (position: number) => {
  await TrackPlayer.seekTo(position)
}

export const setPlaybackSpeed = async (rate: number) => {
  await TrackPlayer.setRate(rate)
}

export const togglePlay = async (playbackRate: number) => {
  const state = await TrackPlayer.getState()

  if (state === TrackPlayer.STATE_NONE) {
    const nowPlayingItem = await getNowPlayingItem()
    await setNowPlayingItem(nowPlayingItem, true)
    TrackPlayer.play()
    TrackPlayer.setRate(playbackRate)
    return
  }

  if (state === TrackPlayer.STATE_PLAYING) {
    TrackPlayer.pause()
  } else {
    TrackPlayer.play()
    TrackPlayer.setRate(playbackRate)
  }
}

export const updateNowPlayingItemEpisode = async (id: string, item: NowPlayingItem, useServerData: boolean) => {
  let episode = {} as any

  if (useServerData) {
    episode = await getEpisode(id)
  } else {
    episode = convertNowPlayingItemToEpisode(item)
  }
  episode.description = (episode.description && episode.description.linkifyHtml()) || 'No summary available.'

  await AsyncStorage.setItem(PV.Keys.NOW_PLAYING_ITEM_EPISODE, JSON.stringify(episode))
}

export const updateNowPlayingItemMediaRef = async (id: string, item: NowPlayingItem, useServerData: boolean) => {
  let mediaRef = {} as any

  if (useServerData) {
    mediaRef = await getMediaRef(id)
  } else {
    mediaRef = convertNowPlayingItemToMediaRef(item)
  }
  mediaRef.episode.description = (mediaRef.episode.description && mediaRef.episode.description.linkifyHtml()) || 'No summary available.'

  await AsyncStorage.setItem(PV.Keys.NOW_PLAYING_ITEM_MEDIA_REF, JSON.stringify(mediaRef))
}
