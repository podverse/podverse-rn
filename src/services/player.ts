import AsyncStorage from '@react-native-community/async-storage'
import RNFS from 'react-native-fs'
import TrackPlayer from 'react-native-track-player'
import { hasValidStreamingConnection } from '../lib/network'
import { convertNowPlayingItemClipToNowPlayingItemEpisode, convertNowPlayingItemToEpisode,
  convertNowPlayingItemToMediaRef, NowPlayingItem } from '../lib/NowPlayingItem'
import { getExtensionFromUrl } from '../lib/utility'
import { PV } from '../resources'
import PlayerEventEmitter from '../services/playerEventEmitter'
import { checkIfShouldUseServerData } from './auth'
import { getEpisode } from './episode'
import { addOrUpdateHistoryItem } from './history'
import { getMediaRef } from './mediaRef'
import { filterItemFromQueueItems, getQueueItems, popNextFromQueue, removeQueueItem } from './queue'

// TODO: setupPlayer is a promise, could this cause an async issue?
TrackPlayer.setupPlayer().then(() => {
  TrackPlayer.updateOptions({
    capabilities: [
      TrackPlayer.CAPABILITY_JUMP_BACKWARD,
      TrackPlayer.CAPABILITY_JUMP_FORWARD,
      TrackPlayer.CAPABILITY_PAUSE,
      TrackPlayer.CAPABILITY_PLAY,
      TrackPlayer.CAPABILITY_SEEK_TO
    ],
    stopWithApp: true,
    alwaysPauseOnInterruption: true
  })
})

export const PVTrackPlayer = TrackPlayer

export const clearNowPlayingItem = async () => {
  try {
    await AsyncStorage.setItem(PV.Keys.NOW_PLAYING_ITEM, '')
  } catch (error) {
    throw error
  }
}

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
    return itemString ? JSON.parse(itemString) : null
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
  await AsyncStorage.setItem(PV.Keys.NOW_PLAYING_ITEM, JSON.stringify(nowPlayingItemEpisode))
  PlayerEventEmitter.emit(PV.Events.PLAYER_RESUME_AFTER_CLIP_HAS_ENDED)
}

export const loadNextFromQueue = async () => {
  const item = await popNextFromQueue()
  if (item) await loadTrackFromQueue(item)
  return item
}

export const loadTrackFromQueue = async (item: NowPlayingItem) => {
  const { clipId, episodeId } = item
  const id = clipId || episodeId
  try {
    if (id) await TrackPlayer.skip(id)
  } catch (error) {
    // If track is not found, catch the error, then add it
    await addItemsToPlayerQueueNext([item])
  }
  await addOrUpdateHistoryItem(item)
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

const checkIfFileIsDownloaded = async (id: string, episodeMediaUrl: string) => {
  const ext = getExtensionFromUrl(episodeMediaUrl)
  const filePath = `${RNFS.DocumentDirectoryPath}/${id}${ext}`
  let isDownloadedFile = true
  try {
    await RNFS.stat(filePath)
  } catch (innerErr) {
    isDownloadedFile = false
  }
  return isDownloadedFile
}

export const initializePlayerQueue = async () => {
  const queueItems = await getQueueItems()
  let filteredItems = [] as any
  const nowPlayingItemString = await AsyncStorage.getItem(PV.Keys.NOW_PLAYING_ITEM)
  let nowPlayingItem = null
  if (nowPlayingItemString) {
    nowPlayingItem = JSON.parse(nowPlayingItemString)
    filteredItems = filterItemFromQueueItems(queueItems, nowPlayingItem)
    filteredItems.unshift(nowPlayingItem)
  }

  await addItemsToPlayerQueueNext(filteredItems)

  return nowPlayingItem
}

export const addItemsToPlayerQueueNext = async (items: NowPlayingItem[], shouldPlay?: boolean, shouldRemoveFromPVQueue?: boolean) => {
  const queuedTracks = await TrackPlayer.getQueue()
  const currentTrackId = await TrackPlayer.getCurrentTrack()
  let indexOfCurrentTrack = -1
  for (let i = 0; queuedTracks.length > i; i++) {
    if (queuedTracks[i].id === currentTrackId) indexOfCurrentTrack = i
  }
  const nextTrackId = queuedTracks.length > indexOfCurrentTrack + 1 ? queuedTracks[indexOfCurrentTrack + 1].id : null
  await addItemsToPlayerQueue(items, nextTrackId)
  if (currentTrackId) await TrackPlayer.skipToNext()
  if (shouldPlay) TrackPlayer.play()

  const newCurrentTrackId = await TrackPlayer.getCurrentTrack()
  const nextItem = items.find((x: NowPlayingItem) => {
    if (x.clipId) return x.clipId === newCurrentTrackId
    if (x.episodeId) return x.episodeId === newCurrentTrackId
    return false
  })
  if (nextItem) {
    await AsyncStorage.setItem(PV.Keys.NOW_PLAYING_ITEM, JSON.stringify(nextItem))
    // NOTE: the PLAYER_CLIP_LOADED event listener uses the NOW_PLAYING_ITEM to get clip info
    PlayerEventEmitter.emit(PV.Events.PLAYER_CLIP_LOADED)
    await addOrUpdateHistoryItem(nextItem)
    if (shouldRemoveFromPVQueue) await removeQueueItem(nextItem)
  }
}

export const addItemsToPlayerQueue = async (items: NowPlayingItem[], insertBeforeId: any = null) => {
  try {
    const tracks = [] as any
    const hasStreamingConnection = await hasValidStreamingConnection()

    for (const item of items) {
      const { clipId, episodeId, episodeMediaUrl = '', episodeTitle = 'Untitled episode', podcastImageUrl,
        podcastTitle = 'Untitled podcast' } = item
      const id = clipId || episodeId
      if (!id) return

      let track = null
      const isDownloadedFile = await checkIfFileIsDownloaded(id, episodeMediaUrl)

      if (isDownloadedFile) {
        track = {
          id,
          url: `file://${filePath}`,
          title: episodeTitle,
          artist: podcastTitle,
          ...(podcastImageUrl ? { artwork: podcastImageUrl } : {})
        }
      } else if (!isDownloadedFile && hasStreamingConnection) {
        track = {
          id,
          url: episodeMediaUrl,
          title: episodeTitle,
          artist: podcastTitle,
          ...(podcastImageUrl ? { artwork: podcastImageUrl } : {})
        }
      } else {
        PlayerEventEmitter.emit(PV.Events.PLAYER_CANNOT_STREAM_WITHOUT_WIFI)
        throw new Error('Player cannot stream without wifi')
      }

      try {
        const existingTrack = await TrackPlayer.getTrack(id)
        if (existingTrack) await TrackPlayer.remove(id)
      } catch (error) {
        // do nothing
      }

      tracks.push(track)
    }

    await TrackPlayer.add(tracks, insertBeforeId)
  } catch (error) {
    console.log(error)
  }
}

export const setPlaybackPosition = async (position: number) => {
  await TrackPlayer.seekTo(position)
}

// Sometimes the duration is not immediately available for certain episodes.
// For those cases, use a setInterval before adjusting playback position.
export const setPlaybackPositionWhenDurationIsAvailable = async (position: number) => {
  const interval = setInterval(async () => {
    const duration = await TrackPlayer.getDuration()
    if (duration && duration > 0) {
      clearInterval(interval)
      await TrackPlayer.seekTo(position)
    }
  }, 250)
}

export const setPlaybackSpeed = async (rate: number) => {
  await TrackPlayer.setRate(rate)
}

export const togglePlay = async (playbackRate: number) => {
  const state = await TrackPlayer.getState()

  if (state === TrackPlayer.STATE_NONE) {
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

export const updateNowPlayingItemEpisode = async (id: string, item: NowPlayingItem) => {
  let episode = {} as any
  const useServerData = await checkIfShouldUseServerData()

  if (useServerData) {
    episode = await getEpisode(id)
  } else {
    episode = convertNowPlayingItemToEpisode(item)
  }
  episode.description = (episode.description && episode.description.linkifyHtml()) || 'No summary available.'

  await AsyncStorage.setItem(PV.Keys.NOW_PLAYING_ITEM_EPISODE, JSON.stringify(episode))
}

export const updateNowPlayingItemMediaRef = async (id: string, item: NowPlayingItem) => {
  let mediaRef = {} as any
  const useServerData = await checkIfShouldUseServerData()

  if (useServerData) {
    mediaRef = await getMediaRef(id)
  } else {
    mediaRef = convertNowPlayingItemToMediaRef(item)
  }
  mediaRef.episode.description = (mediaRef.episode.description && mediaRef.episode.description.linkifyHtml()) || 'No summary available.'

  await AsyncStorage.setItem(PV.Keys.NOW_PLAYING_ITEM_MEDIA_REF, JSON.stringify(mediaRef))
}
