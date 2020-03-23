import AsyncStorage from '@react-native-community/async-storage'
import { Platform } from 'react-native'
import RNBackgroundDownloader from 'react-native-background-downloader'
import RNFS from 'react-native-fs'
import TrackPlayer, { Track } from 'react-native-track-player'
import { convertNowPlayingItemClipToNowPlayingItemEpisode, NowPlayingItem } from '../lib/NowPlayingItem'
import { checkIfIdMatchesClipIdOrEpisodeId, convertURLToSecureProtocol, getExtensionFromUrl } from '../lib/utility'
import { PV } from '../resources'
import { gaTrackPageView } from './googleAnalytics'
import {
  addOrUpdateHistoryItem,
  getHistoryItem,
  getHistoryItems,
  getHistoryItemsLocally,
  updateHistoryItemPlaybackPosition
} from './history'
import PlayerEventEmitter from './playerEventEmitter'
import {
  addQueueItemLast,
  addQueueItemNext,
  filterItemFromQueueItems,
  getQueueItems,
  getQueueItemsLocally,
  removeQueueItem
} from './queue'

// TODO: setupPlayer is a promise, could this cause an async issue?
TrackPlayer.setupPlayer({
  waitForBuffer: false
}).then(() => {
  TrackPlayer.updateOptions({
    capabilities: [
      TrackPlayer.CAPABILITY_JUMP_BACKWARD,
      TrackPlayer.CAPABILITY_JUMP_FORWARD,
      TrackPlayer.CAPABILITY_PAUSE,
      TrackPlayer.CAPABILITY_PLAY,
      TrackPlayer.CAPABILITY_SEEK_TO
    ],
    compactCapabilities: [
      TrackPlayer.CAPABILITY_JUMP_BACKWARD,
      TrackPlayer.CAPABILITY_JUMP_FORWARD,
      TrackPlayer.CAPABILITY_PAUSE,
      TrackPlayer.CAPABILITY_PLAY,
      TrackPlayer.CAPABILITY_SEEK_TO
    ],
    notificationCapabilities: [
      TrackPlayer.CAPABILITY_JUMP_BACKWARD,
      TrackPlayer.CAPABILITY_JUMP_FORWARD,
      TrackPlayer.CAPABILITY_PAUSE,
      TrackPlayer.CAPABILITY_PLAY,
      TrackPlayer.CAPABILITY_SEEK_TO
    ],
    // alwaysPauseOnInterruption caused serious problems with the player unpausing
    // every time the user receives a notification.
    alwaysPauseOnInterruption: Platform.OS === 'ios',
    stopWithApp: true,
    jumpInterval: PV.Player.jumpSeconds
  })
})

export const PVTrackPlayer = TrackPlayer

export const clearNowPlayingItem = async () => {
  try {
    AsyncStorage.removeItem(PV.Keys.NOW_PLAYING_ITEM)
  } catch (error) {
    console.log('clearNowPlayingItem', error)
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

export const handleResumeAfterClipHasEnded = async () => {
  const nowPlayingItem = await getNowPlayingItem()
  const nowPlayingItemEpisode = convertNowPlayingItemClipToNowPlayingItemEpisode(nowPlayingItem)
  await setNowPlayingItem(nowPlayingItemEpisode)
  addOrUpdateHistoryItem(nowPlayingItemEpisode)
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
  }, 500)
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
    }, 500)
  }
}

export const setClipHasEnded = async (clipHasEnded: boolean) => {
  if (typeof clipHasEnded === 'boolean') {
    await AsyncStorage.setItem(PV.Keys.CLIP_HAS_ENDED, JSON.stringify(clipHasEnded))
  }
}

export const setNowPlayingItem = async (item: NowPlayingItem | null) => {
  if (typeof item === 'object') {
    await AsyncStorage.setItem(PV.Keys.NOW_PLAYING_ITEM, JSON.stringify(item))
  }
}

const getDownloadedFilePath = (id: string, episodeMediaUrl: string) => {
  const ext = getExtensionFromUrl(episodeMediaUrl)
  return `${RNBackgroundDownloader.directories.documents}/${id}${ext}`
}

const checkIfFileIsDownloaded = async (id: string, episodeMediaUrl: string) => {
  let isDownloadedFile = true
  const filePath = getDownloadedFilePath(id, episodeMediaUrl)

  try {
    await RNFS.stat(filePath)
  } catch (innerErr) {
    isDownloadedFile = false
  }
  return isDownloadedFile
}

export const updateUserPlaybackPosition = async (itemOverride?: any) => {
  try {
    let item = itemOverride

    if (!item) {
      const currentTrackId = await PVTrackPlayer.getCurrentTrack()
      item = await getNowPlayingItemFromQueueOrHistoryByTrackId(currentTrackId)
    }

    if (item) {
      await setNowPlayingItem(item)
      const lastPosition = await TrackPlayer.getPosition()
      const duration = await TrackPlayer.getDuration()
      if (duration > 0 && lastPosition >= duration - 10) {
        item.userPlaybackPosition = 0
        updateHistoryItemPlaybackPosition(item)
      } else if (lastPosition > 0) {
        item.userPlaybackPosition = lastPosition
        updateHistoryItemPlaybackPosition(item)
      }
    }
  } catch (error) {
    console.log('updateUserPlaybackPosition', error)
  }
}

export const initializePlayerQueue = async () => {
  try {
    const queueItems = await getQueueItems()
    let filteredItems = [] as any

    // Use whatever the most recent item in the history is if one exists, else
    // fallback to the last NowPlayingItem.
    const historyItems = await getHistoryItems()
    let item = null
    let isNowPlayingItem = false
    if (historyItems[0]) {
      item = historyItems[0]
    } else {
      const nowPlayingItemString = await AsyncStorage.getItem(PV.Keys.NOW_PLAYING_ITEM)
      if (nowPlayingItemString) {
        item = JSON.parse(nowPlayingItemString)
      }
      isNowPlayingItem = true
    }

    if (item) {
      filteredItems = filterItemFromQueueItems(queueItems, item)
      const id = item.clipId ? item.clipId : item.episodeId
      if (isNowPlayingItem) {
        const historyItem = await getHistoryItem(id)
        if (historyItem) {
          item.userPlaybackPosition = historyItem.userPlaybackPosition
        }
      }
      filteredItems.unshift(item)
    }

    const tracks = await createTracks(filteredItems)
    PVTrackPlayer.add(tracks)

    return item
  } catch (error) {
    console.log('Initializing player error: ', error)
  }
}

const sendPlayerScreenGoogleAnalyticsPageView = (item: any) => {
  if (item.clipId) {
    gaTrackPageView(
      '/clip/' + item.clipId,
      'Player Screen - Clip - ' + item.podcastTitle + ' - ' + item.episodeTitle + ' - ' + item.clipTitle
    )
  } else if (item.episodeId) {
    gaTrackPageView(
      '/episode/' + item.episodeId,
      'Player Screen - Episode - ' + item.podcastTitle + ' - ' + item.episodeTitle
    )
  }
}

export const loadItemAndPlayTrack = async (item: NowPlayingItem, shouldPlay: boolean, skipUpdateHistory?: boolean) => {
  await updateUserPlaybackPosition()

  if (!item) return

  // Episodes and clips must be already loaded in history
  // in order to be handled in playerEvents > handleSyncNowPlayingItem.
  if (!skipUpdateHistory) await addOrUpdateHistoryItem(item)

  await TrackPlayer.reset()
  const track = (await createTrack(item)) as Track
  await TrackPlayer.add(track)
  await syncPlayerWithQueue()

  if (shouldPlay) {
    if (item && !item.clipId) {
      setTimeout(() => {
        TrackPlayer.play()
      }, 1500)
    } else if (item && item.clipId) {
      AsyncStorage.setItem(PV.Keys.PLAYER_SHOULD_PLAY_WHEN_CLIP_IS_LOADED, 'true')
    }
  }
  sendPlayerScreenGoogleAnalyticsPageView(item)
}

export const playNextFromQueue = async () => {
  await updateUserPlaybackPosition()
  await PVTrackPlayer.skipToNext()
  const currentId = await PVTrackPlayer.getCurrentTrack()
  const item = await getNowPlayingItemFromQueueOrHistoryByTrackId(currentId)
  if (item) {
    await addOrUpdateHistoryItem(item)
  }
  sendPlayerScreenGoogleAnalyticsPageView(item)
}

export const addItemToPlayerQueueNext = async (item: NowPlayingItem) => {
  await addQueueItemNext(item)
  await syncPlayerWithQueue()
}

export const addItemToPlayerQueueLast = async (item: NowPlayingItem) => {
  await addQueueItemLast(item)
  await syncPlayerWithQueue()
}

export const syncPlayerWithQueue = async () => {
  try {
    const pvQueueItems = await getQueueItemsLocally()
    await TrackPlayer.removeUpcomingTracks()
    const tracks = await createTracks(pvQueueItems)
    await TrackPlayer.add(tracks)
  } catch (error) {
    console.log('syncPlayerWithQueue error:', error)
  }
}

export const createTrack = async (item: NowPlayingItem) => {
  const {
    clipId,
    episodeId,
    episodeMediaUrl = '',
    episodeTitle = 'untitled episode',
    podcastImageUrl,
    podcastTitle = 'untitled podcast'
  } = item
  const id = clipId || episodeId
  let track = null
  if (id && episodeId) {
    const isDownloadedFile = await checkIfFileIsDownloaded(episodeId, episodeMediaUrl)
    const filePath = getDownloadedFilePath(episodeId, episodeMediaUrl)

    if (isDownloadedFile) {
      track = {
        id,
        url: `file://${filePath}`,
        title: episodeTitle,
        artist: podcastTitle,
        ...(podcastImageUrl ? { artwork: podcastImageUrl } : {})
      }
    } else {
      track = {
        id,
        url: convertURLToSecureProtocol(episodeMediaUrl),
        title: episodeTitle,
        artist: podcastTitle,
        ...(podcastImageUrl ? { artwork: podcastImageUrl } : {})
      }
    }
  }

  return track
}

export const createTracks = async (items: NowPlayingItem[]) => {
  const tracks = [] as Track[]
  for (const item of items) {
    const track = (await createTrack(item)) as Track
    tracks.push(track)
  }

  return tracks
}

export const movePlayerItemToNewPosition = async (id: string, insertBeforeId: string) => {
  const playerQueueItems = await TrackPlayer.getQueue()
  if (playerQueueItems.some((x: any) => x.id === id)) {
    try {
      await TrackPlayer.getTrack(id)
      await TrackPlayer.remove(id)
      const pvQueueItems = await getQueueItemsLocally()
      const itemToMove = pvQueueItems.find(
        (x: any) => (x.clipId && x.clipId === id) || (!x.clipId && x.episodeId === id)
      )
      if (itemToMove) {
        const track = await createTrack(itemToMove)
        await TrackPlayer.add([track], insertBeforeId)
      }
    } catch (error) {
      console.log('movePlayerItemToNewPosition error:', error)
    }
  }
}

export const setPlaybackPosition = async (position?: number) => {
  if (position || position === 0 || (position && position > 0)) {
    await TrackPlayer.seekTo(position)
  }
}

// Sometimes the duration is not immediately available for certain episodes.
// For those cases, use a setInterval before adjusting playback position.
export const setPlaybackPositionWhenDurationIsAvailable = async (
  position: number,
  trackId?: string,
  resolveImmediately?: boolean,
  shouldPlay?: boolean
) => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      const duration = await TrackPlayer.getDuration()
      const currentTrackId = await TrackPlayer.getCurrentTrack()

      setTimeout(() => {
        if (interval) clearInterval(interval)
      }, 20000)

      if (duration && duration > 0 && (!trackId || trackId === currentTrackId) && position >= 0) {
        clearInterval(interval)
        await TrackPlayer.seekTo(position)
        // Sometimes seekTo does not work right away for all episodes...
        // to work around this bug, we set another interval to confirm the track
        // position has been advanced into the clip time.
        const confirmClipLoadedInterval = setInterval(async () => {
          const currentPosition = await TrackPlayer.getPosition()
          if (currentPosition >= position - 1) {
            clearInterval(confirmClipLoadedInterval)
          } else {
            await TrackPlayer.seekTo(position)
          }
        }, 500)

        const shouldPlayWhenClipIsLoaded = await AsyncStorage.getItem(PV.Keys.PLAYER_SHOULD_PLAY_WHEN_CLIP_IS_LOADED)

        if (shouldPlay) {
          await TrackPlayer.play()
        } else if (shouldPlayWhenClipIsLoaded === 'true') {
          AsyncStorage.removeItem(PV.Keys.PLAYER_SHOULD_PLAY_WHEN_CLIP_IS_LOADED)
          await TrackPlayer.play()
        }

        resolve()
      }
      if (resolveImmediately) resolve()
    }, 500)
  })
}

export const setPlaybackSpeed = async (rate: number) => {
  await AsyncStorage.setItem(PV.Keys.PLAYER_PLAYBACK_SPEED, JSON.stringify(rate))
  await TrackPlayer.setRate(rate)
}

export const getPlaybackSpeed = async () => {
  try {
    const rate = await AsyncStorage.getItem(PV.Keys.PLAYER_PLAYBACK_SPEED)
    if (rate) {
      return parseFloat(rate)
    } else {
      return 1.0
    }
  } catch (error) {
    return 1.0
  }
}

export const getNowPlayingItemFromQueueOrHistoryByTrackId = async (trackId: string) => {
  const queueItems = await getQueueItemsLocally()
  const queueItemIndex = queueItems.findIndex((x: any) =>
    checkIfIdMatchesClipIdOrEpisodeId(trackId, x.clipId, x.episodeId, x.addByRSSPodcastFeedUrl)
  )
  let currentNowPlayingItem = queueItemIndex > -1 && queueItems[queueItemIndex]

  if (currentNowPlayingItem) removeQueueItem(currentNowPlayingItem, false)

  if (!currentNowPlayingItem) {
    const historyItems = await getHistoryItemsLocally()
    currentNowPlayingItem = historyItems.find((x: any) =>
      checkIfIdMatchesClipIdOrEpisodeId(trackId, x.clipId, x.episodeId, x.addByRSSPodcastFeedUrl)
    )
  }

  return currentNowPlayingItem
}

export const togglePlay = async () => {
  const state = await TrackPlayer.getState()

  if (state === TrackPlayer.STATE_NONE) {
    TrackPlayer.play()
    return
  }

  if (state === TrackPlayer.STATE_PLAYING) {
    TrackPlayer.pause()
  } else {
    TrackPlayer.play()
  }
}
