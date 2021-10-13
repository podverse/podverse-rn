import AsyncStorage from '@react-native-community/async-storage'
import { NowPlayingItem } from 'podverse-shared'
import TrackPlayer, { Capability, PitchAlgorithm, State, Track } from 'react-native-track-player'
import { Platform } from 'react-native'
import { getGlobal } from 'reactn'
import { checkIfFileIsDownloaded, getDownloadedFilePath } from '../lib/downloader'
import { checkIfVideoFileType, getAppUserAgent } from '../lib/utility'
import { PV } from '../resources'
import { updateHistoryItemsIndex } from '../state/actions/userHistoryItem'
import PVEventEmitter from './eventEmitter'
import { getPodcastCredentialsHeader } from './parser'
import { playerGetCurrentLoadedTrackId, playerSetRateWithLatestPlaybackSpeed,
  playerUpdateUserPlaybackPosition } from './player'
import { getPodcastFeedUrlAuthority } from './podcast'
import { addQueueItemNext, filterItemFromQueueItems, getQueueItems, getQueueItemsLocally } from './queue'
import { addOrUpdateHistoryItem, getHistoryItemsIndexLocally } from './userHistoryItem'
import { getNowPlayingItemFromLocalStorage, getNowPlayingItemLocally } from './userNowPlayingItem'

declare module "react-native-track-player" {
  export function getCurrentLoadedTrack(): Promise<string>;
  export function getTrackDuration(): Promise<number>;
  export function getTrackPosition(): Promise<number>;
}

export const PVAudioPlayer = TrackPlayer

const checkServiceRunning = async (defaultReturn: any = '') => {
  try {
    const serviceRunning = await PVAudioPlayer.isServiceRunning()
    if (!serviceRunning) {
      throw new Error('PVAudioPlayer Service not running')
    }
  } catch (err) {
    console.log(err.message)
    return defaultReturn
  }

  return true
}

PVAudioPlayer.getTrackPosition = async () => {
  const serviceRunningResult = await checkServiceRunning(0)

  if (serviceRunningResult !== true) {
    return serviceRunningResult
  }

  return PVAudioPlayer.getPosition()
}

PVAudioPlayer.getCurrentLoadedTrack = async () => {
  const serviceRunningResult = await checkServiceRunning()

  if (serviceRunningResult !== true) {
    return serviceRunningResult
  }

  return PVAudioPlayer.getCurrentTrack()
}

PVAudioPlayer.getTrackDuration = async () => {
  const serviceRunningResult = await checkServiceRunning(0)
  if (serviceRunningResult !== true) {
    return serviceRunningResult
  }

  return PVAudioPlayer.getDuration()
}

// TODO: setupPlayer is a promise, could this cause an async issue?
PVAudioPlayer.setupPlayer({
  waitForBuffer: false
}).then(() => {
  audioUpdateTrackPlayerCapabilities()
})

export const audioUpdateTrackPlayerCapabilities = () => {
  const { jumpBackwardsTime, jumpForwardsTime } = getGlobal()

  PVAudioPlayer.updateOptions({
    capabilities: [
      Capability.JumpBackward,
      Capability.JumpForward,
      Capability.Pause,
      Capability.Play,
      Capability.SeekTo,
      Capability.SkipToNext,
      Capability.SkipToPrevious
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
    backwardJumpInterval: parseInt(jumpBackwardsTime, 10),
    forwardJumpInterval: parseInt(jumpForwardsTime, 10)
  })
}

export const audioIsLoaded = async () => {
  const trackIndex = await PVAudioPlayer.getCurrentTrack()
  return trackIndex >= 0
}

export const audioCheckIfIsPlaying = async () => {
  const currentState = await PVAudioPlayer.getState()
  return currentState === State.Playing
}

export const audioGetCurrentLoadedTrackId = async () => {
  let currentTrackId = ''
  try {
    const trackIndex = await PVAudioPlayer.getCurrentTrack()
    currentTrackId = await audioGetLoadedTrackIdByIndex(trackIndex)
  } catch (error) {
    console.log('audioGetCurrentLoadedTrackId error', error)
  }
  return currentTrackId
}

export const audioGetLoadedTrackIdByIndex = async (trackIndex: number) => {
  let trackId = ''
  if (trackIndex > 0 || trackIndex === 0) {
    const track = await PVAudioPlayer.getTrack(trackIndex)
    if (track?.id) {
      trackId = track.id
    }
  }

  return trackId
}

export const audioLoadNowPlayingItem = async (
  item: NowPlayingItem,
  shouldPlay: boolean,
  forceUpdateOrderDate: boolean
) => {
  // TODO: discard video player

  PVAudioPlayer.pause()

  const lastPlayingItem = await getNowPlayingItemLocally()
  const historyItemsIndex = await getHistoryItemsIndexLocally()

  const { clipId, episodeId } = item
  if (!clipId && episodeId) {
    item.episodeDuration = historyItemsIndex?.episodes[episodeId]?.mediaFileDuration || 0
  }

  addOrUpdateHistoryItem(item, item.userPlaybackPosition || 0, item.episodeDuration || 0, forceUpdateOrderDate)

  if (Platform.OS === 'ios') {
    await AsyncStorage.setItem(PV.Keys.PLAYER_PREVENT_HANDLE_QUEUE_ENDED, 'true')
    PVAudioPlayer.reset()
    const track = (await audioCreateTrack(item)) as Track
    await PVAudioPlayer.add(track)
    await AsyncStorage.removeItem(PV.Keys.PLAYER_PREVENT_HANDLE_QUEUE_ENDED)
    await audioSyncPlayerWithQueue()
  } else {
    const currentId = await playerGetCurrentLoadedTrackId()
    if (currentId) {
      PVAudioPlayer.removeUpcomingTracks()
      const track = (await audioCreateTrack(item)) as Track
      await PVAudioPlayer.add(track)
      await PVAudioPlayer.skipToNext()
      await audioSyncPlayerWithQueue()
    } else {
      const track = (await audioCreateTrack(item)) as Track
      await PVAudioPlayer.add(track)
      await audioSyncPlayerWithQueue()
    }
  }

  if (shouldPlay) {
    if (item && !item.clipId) {
      setTimeout(() => {
        audioHandlePlay()
      }, 1500)
    } else if (item && item.clipId) {
      AsyncStorage.setItem(PV.Keys.PLAYER_SHOULD_PLAY_WHEN_CLIP_IS_LOADED, 'true')
    }
  }

  if (lastPlayingItem && lastPlayingItem.episodeId && lastPlayingItem.episodeId !== item.episodeId) {
    PVEventEmitter.emit(PV.Events.PLAYER_NEW_EPISODE_LOADED)
  }

  return item
}

export const audioSyncPlayerWithQueue = async () => {
  try {
    const pvQueueItems = await getQueueItemsLocally()
    PVAudioPlayer.removeUpcomingTracks()
    const tracks = await audioCreateTracks(pvQueueItems)
    await PVAudioPlayer.add(tracks)
  } catch (error) {
    console.log('audioSyncPlayerWithQueue error:', error)
  }
}

export const audioUpdateCurrentTrack = async (trackTitle?: string, artworkUrl?: string) => {
  try {
    const currentIndex = await PVAudioPlayer.getCurrentTrack()
    if (currentIndex > 0 || currentIndex === 0) {
      const track = await PVAudioPlayer.getTrack(currentIndex)
      
      if (track) {
        const newTrack = {
          ...track,
          ...(trackTitle ? { title: trackTitle } : {}),
          ...(artworkUrl ? { artwork: artworkUrl } : {})
        } as Track
      
        await PVAudioPlayer.updateMetadataForTrack(currentIndex, newTrack)
      }
    }
  } catch (error) {
    console.log('audioUpdateCurrentTrack error:', error)
  }
}

export const audioCreateTrack = async (item: NowPlayingItem) => {
  if (!item) return

  const {
    addByRSSPodcastFeedUrl,
    clipId,
    episodeId,
    episodeMediaUrl = '',
    episodeTitle = 'Untitled Episode',
    podcastCredentialsRequired,
    podcastId,
    podcastImageUrl,
    podcastShrunkImageUrl,
    podcastTitle = 'Untitled Podcast'
  } = item
  let track = null
  const imageUrl = podcastShrunkImageUrl ? podcastShrunkImageUrl : podcastImageUrl

  const id = clipId || episodeId
  let finalFeedUrl = addByRSSPodcastFeedUrl

  /*
    If credentials are required but it is a podcast stored in our database,
    then get the authority feedUrl for the podcast before proceeding.
  */
  if (podcastCredentialsRequired && !addByRSSPodcastFeedUrl && podcastId) {
    finalFeedUrl = await getPodcastFeedUrlAuthority(podcastId)
  }

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
        userAgent: getAppUserAgent(),
        pitchAlgorithm: PitchAlgorithm.Voice
      }
    } else {
      const Authorization = await getPodcastCredentialsHeader(finalFeedUrl)

      track = {
        id,
        url: episodeMediaUrl,
        title: episodeTitle,
        artist: podcastTitle,
        ...(imageUrl ? { artwork: imageUrl } : {}),
        userAgent: getAppUserAgent(),
        pitchAlgorithm: PitchAlgorithm.Voice,
        headers: {
          ...(Authorization ? { Authorization } : {})
        }
      }
    }
  }

  return track
}

export const audioMovePlayerItemToNewPosition = async (id: string, newIndex: number) => {
  const playerQueueItems = await PVAudioPlayer.getQueue()

  const previousIndex = playerQueueItems.findIndex((x: any) => x.id === id)

  if (previousIndex > 0 || previousIndex === 0) {
    try {
      await PVAudioPlayer.remove(previousIndex)
      const pvQueueItems = await getQueueItemsLocally()
      const itemToMove = pvQueueItems.find(
        (x: any) => (x.clipId && x.clipId === id) || (!x.clipId && x.episodeId === id)
      )
      if (itemToMove) {
        const track = await audioCreateTrack(itemToMove) as any
        await PVAudioPlayer.add([track], newIndex)
      }
    } catch (error) {
      console.log('movePlayerItemToNewPosition error:', error)
    }
  }
}

export const audioSetPlaybackPosition = async (position?: number) => {
  const currentId = await playerGetCurrentLoadedTrackId()
  if (currentId && (position || position === 0 || (position && position > 0))) {
    await PVAudioPlayer.seekTo(position)
  }
}

export const audioTogglePlay = async () => {
  const state = await PVAudioPlayer.getState()

  if (state === State.None) {
    audioHandlePlay()
    return
  }

  if (state === State.Playing) {
    audioHandlePause()
  } else {
    audioHandlePlay()
  }
}

export const audioHandleStop = () => {
  PVAudioPlayer.stop()
}

export const audioHandlePlay = () => {
  PVAudioPlayer.play()
  playerSetRateWithLatestPlaybackSpeed()
}

export const audioHandlePlayWithUpdate = () => {
  audioHandlePlay()
  playerUpdateUserPlaybackPosition()
}

export const audioHandlePause = () => {
  PVAudioPlayer.pause()
}

export const audioHandlePauseWithUpdate = () => {
  audioHandlePause()
  playerUpdateUserPlaybackPosition()
}

export const audioHandleSeekTo = async (position: number) => {
  await PVAudioPlayer.seekTo(Math.floor(position))
}

export const audioHandleSeekToWithUpdate = async (position: number) => {
  await audioHandleSeekTo(position)
  playerUpdateUserPlaybackPosition()
}

export const audioSetRate = async (rate = 1) => {
  await PVAudioPlayer.setRate(rate)
}

export const audioCheckIdlePlayerState = async () => {
  const state = await PVAudioPlayer.getState()
  return state === 0 || state === State.None
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
export const audioCheckIfStateIsBuffering = (playbackState: any) =>
  // for iOS
  playbackState === State.Buffering ||
  // for Android
  playbackState === 6 ||
  playbackState === 8

export const audioCreateTracks = async (items: NowPlayingItem[]) => {
  const tracks = [] as Track[]
  for (const item of items) {
    const track = (await audioCreateTrack(item)) as Track
    tracks.push(track)
  }

  return tracks
}

export const audioPlayNextFromQueue = async () => {
  const queueItems = await PVAudioPlayer.getQueue()
  if (queueItems && queueItems.length > 1) {
    await PVAudioPlayer.skipToNext()
    const currentId = await playerGetCurrentLoadedTrackId()
    const setPlayerClipIsLoadedIfClip = true
    const item = await getNowPlayingItemFromLocalStorage(
      currentId, setPlayerClipIsLoadedIfClip)
    if (item) {
      await addOrUpdateHistoryItem(item, item.userPlaybackPosition || 0, item.episodeDuration || 0)
      return item
    }
  }
}

export const audioAddNowPlayingItemNextInQueue = (
  item: NowPlayingItem, itemToSetNextInQueue: NowPlayingItem | null) => {
  const { addCurrentItemNextInQueue } = getGlobal()

  if (
    addCurrentItemNextInQueue
    && itemToSetNextInQueue
    && item.episodeId !== itemToSetNextInQueue.episodeId
    && !checkIfVideoFileType(item)
  ) {  
    addQueueItemNext(itemToSetNextInQueue)
  }
}

export const audioInitializePlayerQueue = async () => {
  try {
    const queueItems = await getQueueItems()
    let filteredItems = [] as any
    
    let item = await getNowPlayingItemLocally()
    if (item) {
      /* Use the item from history to make sure we have the same
         userPlaybackPosition that was last saved from other devices. */
      if (!item.clipId && item.episodeId) {
        await updateHistoryItemsIndex()
        item = await getNowPlayingItemFromLocalStorage(item.episodeId)
      }

      filteredItems = filterItemFromQueueItems(queueItems, item)
      filteredItems.unshift(item)
    }

    if (filteredItems.length > 0) {
      const tracks = await audioCreateTracks(filteredItems)
      PVAudioPlayer.add(tracks)
    }

    return item
  } catch (error) {
    console.log('Initializing player error: ', error)
  }
}

export const audioGetTrackPosition = () => {
  return PVAudioPlayer.getTrackPosition()
}

export const audioGetTrackDuration = () => {
  return PVAudioPlayer.getTrackDuration()
}

export const audioPlayerGetState = () => {
  return PVAudioPlayer.getState()
}

export const audioGetRate = () => {
  return PVAudioPlayer.getRate()
}
