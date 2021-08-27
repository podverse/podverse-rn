import AsyncStorage from '@react-native-community/async-storage'
import {
  convertNowPlayingItemClipToNowPlayingItemEpisode,
  convertToNowPlayingItem,
  NowPlayingItem
} from 'podverse-shared'
import { Platform } from 'react-native'
import RNFS from 'react-native-fs'
import TrackPlayer, { Capability, PitchAlgorithm, State, Track } from 'react-native-track-player'
import { getDownloadedEpisode } from '../lib/downloadedPodcast'
import { BackgroundDownloader } from '../lib/downloader'
import { checkIfIdMatchesClipIdOrEpisodeIdOrAddByUrl,
  getAppUserAgent, getExtensionFromUrl } from '../lib/utility'
import { PV } from '../resources'
import PVEventEmitter from './eventEmitter'
import {
  addQueueItemLast,
  addQueueItemNext,
  filterItemFromQueueItems,
  getQueueItems,
  getQueueItemsLocally,
  removeQueueItem
} from './queue'
import { addOrUpdateHistoryItem, getHistoryItemsIndexLocally, getHistoryItemsLocally } from './userHistoryItem'
import { getNowPlayingItem, getNowPlayingItemLocally } from './userNowPlayingItem'

declare module "react-native-track-player" {
  export function getCurrentLoadedTrack(): Promise<string>;
  export function getTrackDuration(): Promise<number>;
  export function getTrackPosition(): Promise<number>;
}

export const PVTrackPlayer = TrackPlayer

const checkServiceRunning = async (defaultReturn: any = '') => {
  try {
    const serviceRunning = await TrackPlayer.isServiceRunning()
    if (!serviceRunning) {
      throw new Error('TrackPlayer Service not running')
    }
  } catch (err) {
    console.log(err.message)
    return defaultReturn
  }

  return true
}

PVTrackPlayer.getTrackPosition = async () => {
  const serviceRunningResult = await checkServiceRunning(0)

  if (serviceRunningResult !== true) {
    return serviceRunningResult
  }

  return TrackPlayer.getPosition()
}

PVTrackPlayer.getCurrentLoadedTrack = async () => {
  const serviceRunningResult = await checkServiceRunning()

  if (serviceRunningResult !== true) {
    return serviceRunningResult
  }

  return TrackPlayer.getCurrentTrack()
}

PVTrackPlayer.getTrackDuration = async () => {
  const serviceRunningResult = await checkServiceRunning(0)
  if (serviceRunningResult !== true) {
    return serviceRunningResult
  }

  return TrackPlayer.getDuration()
}

// TODO: setupPlayer is a promise, could this cause an async issue?
TrackPlayer.setupPlayer({
  waitForBuffer: false
}).then(() => {
  updateTrackPlayerCapabilities()
})

export const updateTrackPlayerCapabilities = () => {
  TrackPlayer.updateOptions({
    capabilities: [
      Capability.JumpBackward,
      Capability.JumpForward,
      Capability.Pause,
      Capability.Play,
      Capability.SeekTo
    ],
    compactCapabilities: [
      Capability.JumpBackward,
      Capability.JumpForward,
      Capability.Pause,
      Capability.Play,
      Capability.SeekTo
    ],
    notificationCapabilities: [
      Capability.JumpBackward,
      Capability.JumpForward,
      Capability.Pause,
      Capability.Play,
      Capability.SeekTo
    ],
    // alwaysPauseOnInterruption caused serious problems with the player unpausing
    // every time the user receives a notification.
    alwaysPauseOnInterruption: Platform.OS === 'ios',
    stopWithApp: true,
    // Better to skip 10 both ways than to skip 30 both ways. No current way to set them separately
    jumpInterval: PV.Player.jumpBackSeconds
  })
}

/*
  state key for android
  NOTE: ready and pause use the same number, so there is no true ready state for Android :[
  none      0
  stopped   1
  paused    2
  playing   3
  ready     2
  buffering 6
  ???       8
*/
export const checkIfStateIsBuffering = (playbackState: any) =>
  // for iOS
  playbackState === State.Buffering ||
  // for Android
  playbackState === 6 ||
  playbackState === 8

export const getClipHasEnded = async () => {
  const clipHasEnded = await AsyncStorage.getItem(PV.Keys.CLIP_HAS_ENDED)
  return clipHasEnded === 'true'
}

export const handleResumeAfterClipHasEnded = async () => {
  await AsyncStorage.removeItem(PV.Keys.PLAYER_CLIP_IS_LOADED)
  const nowPlayingItem = await getNowPlayingItemLocally()
  const nowPlayingItemEpisode = convertNowPlayingItemClipToNowPlayingItemEpisode(nowPlayingItem)
  const playbackPosition = await PVTrackPlayer.getTrackPosition()
  const mediaFileDuration = await PVTrackPlayer.getTrackDuration()
  await addOrUpdateHistoryItem(nowPlayingItemEpisode, playbackPosition, mediaFileDuration)
  PVEventEmitter.emit(PV.Events.PLAYER_RESUME_AFTER_CLIP_HAS_ENDED)
}

export const playerJumpBackward = async (seconds: number) => {
  const position = await PVTrackPlayer.getTrackPosition()
  const newPosition = position - seconds
  await TrackPlayer.seekTo(newPosition)
  return newPosition
}

export const playerJumpForward = async (seconds: number) => {
  const position = await PVTrackPlayer.getTrackPosition()
  const newPosition = position + seconds
  await TrackPlayer.seekTo(newPosition)
  return newPosition
}

let playerPreviewEndTimeInterval: any = null

export const playerPreviewEndTime = async (endTime: number) => {
  if (playerPreviewEndTimeInterval) {
    clearInterval(playerPreviewEndTimeInterval)
  }

  const previewEndTime = endTime - 3
  await PVTrackPlayer.seekTo(previewEndTime)
  handlePlay()

  playerPreviewEndTimeInterval = setInterval(() => {
    (async () => {
      const currentPosition = await PVTrackPlayer.getTrackPosition()
      if (currentPosition >= endTime) {
        clearInterval(playerPreviewEndTimeInterval)
        PVTrackPlayer.pause()
      }
    })()
  }, 500)
}

export const setRateWithLatestPlaybackSpeed = async () => {
  const rate = await getPlaybackSpeed()

  // https://github.com/DoubleSymmetry/react-native-track-player/issues/766
  if (Platform.OS === 'ios') {
    PVTrackPlayer.setRate(rate)
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setTimeout( () => PVTrackPlayer.setRate(rate), 200)
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setTimeout( () => PVTrackPlayer.setRate(rate), 500)
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setTimeout( () => PVTrackPlayer.setRate(rate), 800)
  } else {
    PVTrackPlayer.setRate(rate)
  }
}

export const playerPreviewStartTime = async (startTime: number, endTime?: number | null) => {
  if (playerPreviewEndTimeInterval) {
    clearInterval(playerPreviewEndTimeInterval)
  }

  await TrackPlayer.seekTo(startTime)
  handlePlay()

  if (endTime) {
    playerPreviewEndTimeInterval = setInterval(() => {
      (async () => {
        const currentPosition = await PVTrackPlayer.getTrackPosition()
        if (currentPosition >= endTime) {
          clearInterval(playerPreviewEndTimeInterval)
          PVTrackPlayer.pause()
        }
      })()
    }, 500)
  }
}

export const setClipHasEnded = async (clipHasEnded: boolean) => {
  await AsyncStorage.setItem(PV.Keys.CLIP_HAS_ENDED, JSON.stringify(clipHasEnded))
}

const getDownloadedFilePath = async (id: string, episodeMediaUrl: string) => {
  const ext = getExtensionFromUrl(episodeMediaUrl)
  const downloader = await BackgroundDownloader()

  
  /* If downloaded episode is for an addByRSSPodcast, then the episodeMediaUrl
     will be the id, so remove the URL params from the URL, and don't append
     an extension to the file path.
  */
  if (id && id.indexOf('http') > -1) {
    const idWithoutUrlParams = id.split('?')[0]
    return `${downloader.directories.documents}/${idWithoutUrlParams}`
  } else {
    return `${downloader.directories.documents}/${id}${ext}`
  }
}

const checkIfFileIsDownloaded = async (id: string, episodeMediaUrl: string) => {
  let isDownloadedFile = true
  const filePath = await getDownloadedFilePath(id, episodeMediaUrl)

  try {
    await RNFS.stat(filePath)
  } catch (innerErr) {
    isDownloadedFile = false
  }
  return isDownloadedFile
}

export const getCurrentLoadedTrackId = async () => {
  const trackIndex = await PVTrackPlayer.getCurrentTrack()

  let trackId = ''
  if (trackIndex > 0 || trackIndex === 0) {
    const track = await PVTrackPlayer.getTrack(trackIndex)
    if (track?.id) {
      trackId = track.id
    }
  }

  return trackId
}

export const updateUserPlaybackPosition = async (skipSetNowPlaying?: boolean) => {
  try {
    const currentTrackId = await getCurrentLoadedTrackId()
    const setPlayerClipIsLoadedIfClip = false

    const currentNowPlayingItem = await getNowPlayingItemFromQueueOrHistoryOrDownloadedByTrackId(
      currentTrackId,
      setPlayerClipIsLoadedIfClip
    )

    if (currentNowPlayingItem) {
      const lastPosition = await PVTrackPlayer.getTrackPosition()
      const duration = await PVTrackPlayer.getTrackDuration()
      const forceUpdateOrderDate = false

      if (duration > 0 && lastPosition >= duration - 10) {
        await addOrUpdateHistoryItem(currentNowPlayingItem, 0, duration, forceUpdateOrderDate, skipSetNowPlaying)
      } else if (lastPosition > 0) {
        await addOrUpdateHistoryItem(
          currentNowPlayingItem,
          lastPosition,
          duration,
          forceUpdateOrderDate,
          skipSetNowPlaying
        )
      }
    }
  } catch (error) {
    console.log('updateUserPlaybackPosition error', error)
  }
}

export const initializePlayerQueue = async () => {
  try {
    const queueItems = await getQueueItems()
    let filteredItems = [] as any

    const item = await getNowPlayingItemLocally()
    if (item) {
      filteredItems = filterItemFromQueueItems(queueItems, item)
      filteredItems.unshift(item)
    }

    if (filteredItems.length > 0) {
      const tracks = await createTracks(filteredItems)
      PVTrackPlayer.add(tracks)
    }

    return item
  } catch (error) {
    console.log('Initializing player error: ', error)
  }
}

export const loadItemAndPlayTrack = async (
  item: NowPlayingItem,
  shouldPlay: boolean,
  forceUpdateOrderDate?: boolean
) => {
  if (!item) return

  const newItem = item

  const skipSetNowPlaying = true
  updateUserPlaybackPosition(skipSetNowPlaying)

  // check if loading a chapter, and if the now playing item is the same episode.
  // if it is, then call setPlaybackposition, and play if shouldPlay, then return.
  // else, if a chapter, play like a normal episode, starting at the time stamp

  TrackPlayer.pause()

  const lastPlayingItem = await getNowPlayingItemLocally()
  const historyItemsIndex = await getHistoryItemsIndexLocally()

  const { clipId, episodeId } = item
  if (!clipId && episodeId) {
    item.episodeDuration = historyItemsIndex?.episodes[episodeId]?.mediaFileDuration || 0
  }

  addOrUpdateHistoryItem(item, item.userPlaybackPosition || 0, item.episodeDuration || 0, forceUpdateOrderDate)

  if (Platform.OS === 'ios') {
    TrackPlayer.reset()
    const track = (await createTrack(item)) as Track
    await TrackPlayer.add(track)
    await syncPlayerWithQueue()
  } else {
    const currentId = await getCurrentLoadedTrackId()
    if (currentId) {
      await TrackPlayer.removeUpcomingTracks()
      const track = (await createTrack(item)) as Track
      await TrackPlayer.add(track)
      await TrackPlayer.skipToNext()
      await syncPlayerWithQueue()
    } else {
      const track = (await createTrack(item)) as Track
      await TrackPlayer.add(track)
      await syncPlayerWithQueue()
    }
  }

  if (shouldPlay) {
    if (item && !item.clipId) {
      setTimeout(() => {
        handlePlay()
      }, 1500)
    } else if (item && item.clipId) {
      AsyncStorage.setItem(PV.Keys.PLAYER_SHOULD_PLAY_WHEN_CLIP_IS_LOADED, 'true')
    }
  }

  if (lastPlayingItem && lastPlayingItem.episodeId && lastPlayingItem.episodeId !== item.episodeId) {
    PVEventEmitter.emit(PV.Events.PLAYER_NEW_EPISODE_LOADED)
  }

  return newItem
}

export const playNextFromQueue = async () => {
  const queueItems = await PVTrackPlayer.getQueue()
  if (queueItems && queueItems.length > 1) {
    await PVTrackPlayer.skipToNext()
    const currentId = await getCurrentLoadedTrackId()
    const setPlayerClipIsLoadedIfClip = true
    const item = await getNowPlayingItemFromQueueOrHistoryOrDownloadedByTrackId(
      currentId, setPlayerClipIsLoadedIfClip)
    if (item) {
      await addOrUpdateHistoryItem(item, item.userPlaybackPosition || 0, item.episodeDuration || 0)
      await removeQueueItem(item)
      return item
    }
  }
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

export const updateCurrentTrack = async (trackTitle?: string, artworkUrl?: string) => {
  try {
    const currentIndex = await PVTrackPlayer.getCurrentTrack()
    if (currentIndex > 0 || currentIndex === 0) {
      const track = await PVTrackPlayer.getTrack(currentIndex)
      
      if (track) {
        const newTrack = {
          ...track,
          ...(trackTitle ? { title: trackTitle } : {}),
          ...(artworkUrl ? { artwork: artworkUrl } : {})
        } as Track
      
        await PVTrackPlayer.updateMetadataForTrack(currentIndex, newTrack)
      }
    }
  } catch (error) {
    console.log('updateCurrentTrack error:', error)
  }
}

export const createTrack = async (item: NowPlayingItem) => {
  if (!item) return

  const {
    clipId,
    episodeId,
    episodeMediaUrl = '',
    episodeTitle = 'Untitled Episode',
    podcastImageUrl,
    podcastShrunkImageUrl,
    podcastTitle = 'Untitled Podcast'
  } = item
  let track = null
  const imageUrl = podcastShrunkImageUrl ? podcastShrunkImageUrl : podcastImageUrl

  const id = clipId || episodeId

  if (episodeId) {
    const isDownloadedFile = await checkIfFileIsDownloaded(episodeId, episodeMediaUrl)
    const filePath = await getDownloadedFilePath(episodeId, episodeMediaUrl)

    if (isDownloadedFile) {
      track = {
        id,
        url: `file://${filePath}`,
        title: episodeTitle,
        artist: podcastTitle,
        ...(imageUrl ? { artwork: imageUrl } : {}),
        headers: {
          'User-Agent': getAppUserAgent()
        },
        pitchAlgorithm: PitchAlgorithm.Voice
      }
    } else {
      track = {
        id,
        url: episodeMediaUrl,
        title: episodeTitle,
        artist: podcastTitle,
        ...(imageUrl ? { artwork: imageUrl } : {}),
        headers: {
          'User-Agent': getAppUserAgent()
        },
        pitchAlgorithm: PitchAlgorithm.Voice
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

export const movePlayerItemToNewPosition = async (id: string, newIndex: number) => {
  const playerQueueItems = await TrackPlayer.getQueue()

  const previousIndex = playerQueueItems.findIndex((x: any) => x.id === id)

  if (previousIndex > 0 || previousIndex === 0) {
    try {
      await TrackPlayer.remove(previousIndex)
      const pvQueueItems = await getQueueItemsLocally()
      const itemToMove = pvQueueItems.find(
        (x: any) => (x.clipId && x.clipId === id) || (!x.clipId && x.episodeId === id)
      )
      if (itemToMove) {
        const track = await createTrack(itemToMove) as any
        await TrackPlayer.add([track], newIndex)
      }
    } catch (error) {
      console.log('movePlayerItemToNewPosition error:', error)
    }
  }
}

export const setPlaybackPosition = async (position?: number) => {
  const currentId = await getCurrentLoadedTrackId()
  if (currentId && (position || position === 0 || (position && position > 0))) {
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
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      (async () => {
        const duration = await PVTrackPlayer.getTrackDuration()
        const currentTrackId = await getCurrentLoadedTrackId()

        setTimeout(() => {
          if (interval) clearInterval(interval)
        }, 20000)

        if (duration && duration > 0 && (!trackId || trackId === currentTrackId) && position >= 0) {
          clearInterval(interval)
          await TrackPlayer.seekTo(position)
          // Sometimes seekTo does not work right away for all episodes...
          // to work around this bug, we set another interval to confirm the track
          // position has been advanced into the clip time.
          const confirmClipLoadedInterval = setInterval(() => {
            (async () => {
              const currentPosition = await PVTrackPlayer.getTrackPosition()
              if (currentPosition >= position - 1) {
                clearInterval(confirmClipLoadedInterval)
              } else {
                await TrackPlayer.seekTo(position)
              }
            })()
          }, 500)

          const shouldPlayWhenClipIsLoaded = await AsyncStorage.getItem(PV.Keys.PLAYER_SHOULD_PLAY_WHEN_CLIP_IS_LOADED)

          if (shouldPlay) {
            handlePlay()
          } else if (shouldPlayWhenClipIsLoaded === 'true') {
            AsyncStorage.removeItem(PV.Keys.PLAYER_SHOULD_PLAY_WHEN_CLIP_IS_LOADED)
            handlePlay()
          }

          resolve(null)
        }
        if (resolveImmediately) resolve(null)
      })()
    }, 500)
  })
}

export const restartNowPlayingItemClip = async () => {
  const nowPlayingItem = await getNowPlayingItem()
  if (nowPlayingItem && nowPlayingItem.clipStartTime) {
    setPlaybackPosition(nowPlayingItem.clipStartTime)
    handlePlay()
  }
}

export const setPlaybackSpeed = async (rate: number) => {
  await AsyncStorage.setItem(PV.Keys.PLAYER_PLAYBACK_SPEED, JSON.stringify(rate))

  const currentState = await PVTrackPlayer.getState()
  const isPlaying = currentState === State.Playing

  if (isPlaying) {
    await TrackPlayer.setRate(rate)
  }
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

/*
  WARNING! THIS UGLY FUNCTION DOES A LOT MORE THAN JUST "GETTING" THE ITEM.
  IT ALSO REMOVES AN ITEM FROM THE QUEUE, AND HANDLES CONVERTING
  A CLIP TO AN EPISODE OBJECT. THIS FUNCTION REALLY SHOULD BE REWRITTEN.
*/
export const getNowPlayingItemFromQueueOrHistoryOrDownloadedByTrackId = async (
  trackId: string,
  setPlayerClipIsLoadedIfClip?: boolean
) => {
  if (!trackId) return null

  const queueItems = await getQueueItemsLocally()

  const queueItemIndex = queueItems.findIndex((x: any) =>
    checkIfIdMatchesClipIdOrEpisodeIdOrAddByUrl(trackId, x.clipId, x.episodeId)
  )
  let currentNowPlayingItem = queueItemIndex > -1 && queueItems[queueItemIndex]

  if (!currentNowPlayingItem) {
    const results = await getHistoryItemsLocally()
    const { userHistoryItems } = results

    currentNowPlayingItem = userHistoryItems.find((x: any) =>
      checkIfIdMatchesClipIdOrEpisodeIdOrAddByUrl(trackId, x.clipId, x.episodeId)
    )
  }

  if (!currentNowPlayingItem) {
    currentNowPlayingItem = await getDownloadedEpisode(trackId)
    if (currentNowPlayingItem) {
      currentNowPlayingItem = convertToNowPlayingItem(
        currentNowPlayingItem, null, null, currentNowPlayingItem.userPlaybackPosition
      )
    }
  }

  if (setPlayerClipIsLoadedIfClip && currentNowPlayingItem?.clipId) {
    await AsyncStorage.setItem(PV.Keys.PLAYER_CLIP_IS_LOADED, 'TRUE')
  }

  const playerClipIsLoaded = await AsyncStorage.getItem(PV.Keys.PLAYER_CLIP_IS_LOADED)
  if (!playerClipIsLoaded && currentNowPlayingItem?.clipId) {
    currentNowPlayingItem = convertNowPlayingItemClipToNowPlayingItemEpisode(currentNowPlayingItem)
  }

  return currentNowPlayingItem
}

export const togglePlay = async () => {
  const state = await TrackPlayer.getState()

  if (state === State.None) {
    handlePlay()
    return
  }

  if (state === State.Playing) {
    TrackPlayer.pause()
  } else {
    handlePlay()
  }
}

export const handlePlay = () => {
  TrackPlayer.play()
  setRateWithLatestPlaybackSpeed()
}

export const checkIdlePlayerState = async () => {
  const state = await TrackPlayer.getState()
  return state === 0 || state === State.None
}
