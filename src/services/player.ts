import AsyncStorage from '@react-native-community/async-storage'
import RNFS from 'react-native-fs'
import TrackPlayer from 'react-native-track-player'
import { hasValidStreamingConnection, hasValidNetworkConnection } from '../lib/network'
import { convertNowPlayingItemClipToNowPlayingItemEpisode, convertNowPlayingItemToEpisode,
  convertNowPlayingItemToMediaRef, NowPlayingItem } from '../lib/NowPlayingItem'
import { getExtensionFromUrl } from '../lib/utility'
import { PV } from '../resources'
import PlayerEventEmitter from '../services/playerEventEmitter'
import { checkIfShouldUseServerData, checkIfLoggedIn } from './auth'
import { getEpisode } from './episode'
import { addOrUpdateHistoryItem, getHistoryItems, popLastFromHistoryItems } from './history'
import { getMediaRef } from './mediaRef'
import { addQueueItemNext, filterItemFromQueueItems, getQueueItems, popNextFromQueue, setAllQueueItems } from './queue'

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
  await setNowPlayingItem(nowPlayingItemEpisode)
  PlayerEventEmitter.emit(PV.Events.PLAYER_RESUME_AFTER_CLIP_HAS_ENDED)
}

export const playLastFromHistory = async (shouldPlay: boolean) => {
  const { currentlyPlayingItem, lastItem } = await popLastFromHistoryItems()
  if (currentlyPlayingItem && lastItem) {
    await addQueueItemNext(currentlyPlayingItem)
    await setNowPlayingItem(lastItem, false, shouldPlay, lastItem.userPlaybackPosition)
  }
}

export const playNextFromQueue = async (shouldPlay: boolean) => {
  const item = await popNextFromQueue()
  if (item) {
    await setNowPlayingItem(item, false, shouldPlay, item.userPlaybackPosition)
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

// export const loadItemInPlayer = async (item: NowPlayingItem) => {
//   try {

//   } catch (error) {

//   }
// }

export const setNowPlayingItem = async (item: NowPlayingItem, isInitialLoad?: boolean, startPlayer?: boolean,
                                        userPlaybackPosition?: number, skipAddToHistory?: boolean) => {
  try {
    const { clipId, episodeId, episodeMediaUrl = '', episodeTitle = 'Untitled episode', podcastImageUrl,
      podcastTitle = 'Untitled podcast' } = item
    const lastNowPlayingItem = await getNowPlayingItem()
    if (!skipAddToHistory && lastNowPlayingItem) {
      const currentPosition = await PVTrackPlayer.getPosition()
      lastNowPlayingItem.userPlaybackPosition = currentPosition || 0
      await addOrUpdateHistoryItem(lastNowPlayingItem)
    }

    const isNewEpisode = (isInitialLoad || !lastNowPlayingItem) || item.episodeId !== lastNowPlayingItem.episodeId
    const isNewMediaRef = item.clipId && ((isInitialLoad || !lastNowPlayingItem) || item.clipId !== lastNowPlayingItem.clipId)

    await AsyncStorage.setItem(PV.Keys.NOW_PLAYING_ITEM, JSON.stringify(item))

    await setClipHasEnded(false)

    const isTrackLoaded = await TrackPlayer.getCurrentTrack()
    const id = clipId || episodeId

    const ext = getExtensionFromUrl(episodeMediaUrl)
    const filePath = `${RNFS.DocumentDirectoryPath}/${id}${ext}`
    let isDownloadedFile = true
    try {
      await RNFS.stat(filePath)
    } catch (innerErr) {
      isDownloadedFile = false
    }

    const hasStreamingConnection = await hasValidStreamingConnection()

    if (id && (!isTrackLoaded || isNewEpisode)) {
      if (isTrackLoaded) {
        await TrackPlayer.reset()
      }

      if (!isDownloadedFile) {
        if (hasStreamingConnection) {
          await TrackPlayer.add({
            id,
            url: episodeMediaUrl,
            title: episodeTitle,
            artist: podcastTitle,
            ...(podcastImageUrl ? { artwork: podcastImageUrl } : {})
          })
        }
      } else {
        await TrackPlayer.add({
          id,
          url: `file://${filePath}`,
          title: episodeTitle,
          artist: podcastTitle,
          ...(podcastImageUrl ? { artwork: podcastImageUrl } : {})
        }).catch((error) => {
          console.log('Error: ', error)
        })
      }
    }

    const hasValidPlayingFile = isDownloadedFile || hasStreamingConnection

    if (!isNewEpisode && isNewMediaRef && item.clipStartTime && hasValidPlayingFile) {
      await setPlaybackPositionWhenDurationIsAvailable(item.clipStartTime)
    }

    if (isNewEpisode && !isNewMediaRef) {
      const historyItems = await getHistoryItems()
      const oldItem = historyItems.find((x: any) => x.episodeId === item.episodeId)
      await setPlaybackPositionWhenDurationIsAvailable(userPlaybackPosition || (oldItem && oldItem.userPlaybackPosition) || 0)
    }

    if (!isNewEpisode && !isNewMediaRef && (userPlaybackPosition || userPlaybackPosition === 0)) {
      await setPlaybackPositionWhenDurationIsAvailable(userPlaybackPosition)
    }

    const items = await getQueueItems()

    let filteredItems = [] as any[]
    filteredItems = filterItemFromQueueItems(items, item)
    await setAllQueueItems(filteredItems)
    await addOrUpdateHistoryItem(item)

    if (isNewEpisode && episodeId) {
      await updateNowPlayingItemEpisode(episodeId, item)
    }

    if (isNewMediaRef && clipId) {
      await updateNowPlayingItemMediaRef(clipId, item)
    }

    PlayerEventEmitter.emit(PV.Events.PLAYER_STATE_CHANGED)

    if (!hasStreamingConnection && !isDownloadedFile) {
      PlayerEventEmitter.emit(PV.Events.PLAYER_CANNOT_STREAM_WITHOUT_WIFI)
      return
    }

    if (isTrackLoaded) {
      const shouldContinuouslyPlay = await getContinuousPlaybackMode()
      if (isNewMediaRef && (shouldContinuouslyPlay || startPlayer)) {
        // Give the player a second to load the file before playing.
        // Without this, the player will play a split second of the beginning of an episode
        // before adjusting to the clip's start time position.
        setTimeout(() => TrackPlayer.play(), 1000)
      } else if (shouldContinuouslyPlay || startPlayer) {
        TrackPlayer.play()
      }
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
