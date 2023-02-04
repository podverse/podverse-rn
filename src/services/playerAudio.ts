import AsyncStorage from '@react-native-community/async-storage'
import { checkIfVideoFileOrVideoLiveType, getExtensionFromUrl, NowPlayingItem } from 'podverse-shared'
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  IOSCategoryMode,
  PitchAlgorithm,
  RepeatMode,
  State,
  Track
} from 'react-native-track-player'
import { Platform } from 'react-native'
import { getGlobal } from 'reactn'
import { errorLogger } from '../lib/logger'
import { checkIfFileIsDownloaded, getDownloadedFilePath } from '../lib/downloader'
import { getAppUserAgent } from '../lib/utility'
import { PV } from '../resources'
import { setLiveStreamWasPausedState } from '../state/actions/player'
import { updateHistoryItemsIndex } from '../state/actions/userHistoryItem'
import PVEventEmitter from './eventEmitter'
import { getPodcastCredentialsHeader } from './parser'
import { playerSetRateWithLatestPlaybackSpeed, playerUpdateUserPlaybackPosition } from './player'
import { getPodcastFeedUrlAuthority } from './podcast'
import { addQueueItemNext, filterItemFromQueueItems, getQueueItems, getQueueItemsLocally } from './queue'
import { addOrUpdateHistoryItem, getHistoryItemsIndexLocally } from './userHistoryItem'
import { getNowPlayingItemFromLocalStorage, getNowPlayingItemLocally } from './userNowPlayingItem'

declare module 'react-native-track-player' {
  export function getCurrentLoadedTrack(): Promise<string>
  export function getTrackDuration(): Promise<number>
  export function getTrackPosition(): Promise<number>
}

const _fileName = 'src/services/playerAudio.ts'

export const PVAudioPlayer = TrackPlayer

// const checkServiceRunning = async (defaultReturn: any = '') => {
//   try {
//     const serviceRunning = await PVAudioPlayer.isServiceRunning()
//     if (!serviceRunning) {
//       throw new Error('PVAudioPlayer Service not running')
//     }
//   } catch (err) {
//     errorLogger(err.message)
//     return defaultReturn
//   }

//   return true
// }

PVAudioPlayer.getTrackPosition = async () => {
  // const serviceRunningResult = await checkServiceRunning(0)

  // if (serviceRunningResult !== true) {
  //   return serviceRunningResult
  // }

  return PVAudioPlayer.getPosition()
}

PVAudioPlayer.getCurrentLoadedTrack = async () => {
  // const serviceRunningResult = await checkServiceRunning()

  // if (serviceRunningResult !== true) {
  //   return serviceRunningResult
  // }

  return PVAudioPlayer.getActiveTrackIndex()
}

PVAudioPlayer.getTrackDuration = async () => {
  // const serviceRunningResult = await checkServiceRunning(0)
  // if (serviceRunningResult !== true) {
  //   return serviceRunningResult
  // }

  return PVAudioPlayer.getDuration()
}

PVAudioPlayer.setupPlayer({
  waitForBuffer: true,
  maxCacheSize: 1000000, // 1 GB from KB, this affects Android only I think.
  iosCategoryMode: IOSCategoryMode.SpokenAudio
}).then(() => {
  audioUpdateTrackPlayerCapabilities()
})

PVAudioPlayer.setRepeatMode(RepeatMode.Off)

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
    backwardJumpInterval: parseInt(jumpBackwardsTime, 10),
    forwardJumpInterval: parseInt(jumpForwardsTime, 10),
    progressUpdateEventInterval: 1,
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification
    }
  })
}

export const audioIsLoaded = async () => {
  const trackIndex = await PVAudioPlayer.getActiveTrackIndex()
  return Number.isInteger(trackIndex) && (trackIndex || trackIndex === 0)
}

export const audioCheckIfIsPlaying = (playbackState: any) => {
  return playbackState === State.Playing
}

export const audioGetCurrentLoadedTrackId = async () => {
  let currentTrackId = ''
  try {
    const trackIndex = await PVAudioPlayer.getActiveTrackIndex()
    if (trackIndex || trackIndex === 0) {
      currentTrackId = await audioGetLoadedTrackIdByIndex(trackIndex)
    }
  } catch (error) {
    errorLogger(_fileName, 'audioGetCurrentLoadedTrackId', error)
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

/*
  I was running into a bug where removeUpcomingTracks was sometimes removing
  the *current* track from the queue on Android. To work around this, I'm manually
  removing the upcoming tracks (starting from the end of the queue).
*/
const audioRemoveUpcomingTracks = async () => {
  if (Platform.OS === 'ios') {
    await PVAudioPlayer.removeUpcomingTracks()
  } else if (Platform.OS === 'android') {
    const currentIndex = await PVAudioPlayer.getActiveTrackIndex()
    if (currentIndex === 0 || (currentIndex && currentIndex >= 1)) {
      const queueItems = await PVAudioPlayer.getQueue()
      if (queueItems && queueItems.length > 1) {
        const queueItemsCount = queueItems.length
        const upcomingQueueItemsCount = queueItemsCount - currentIndex - 1
        for (let i = 0; i < upcomingQueueItemsCount; i++) {
          const adjustedIndex = queueItemsCount - i - 1
          await PVAudioPlayer.remove(adjustedIndex)
        }
      }
    }
  }
}

export const audioLoadNowPlayingItem = async (
  item: NowPlayingItem,
  shouldPlay: boolean,
  forceUpdateOrderDate: boolean
) => {
  // TODO VIDEO: discard/reset video player???

  const [lastPlayingItem, historyItemsIndex] = await Promise.all([
    getNowPlayingItemLocally(),
    getHistoryItemsIndexLocally()
  ])

  const { clipId, episodeId } = item
  if (!clipId && episodeId) {
    item.episodeDuration = historyItemsIndex?.episodes?.[episodeId]?.mediaFileDuration || 0
  }

  addOrUpdateHistoryItem(item, item.userPlaybackPosition || 0, item.episodeDuration || 0, forceUpdateOrderDate)

  const currentId = await audioGetCurrentLoadedTrackId()
  if (currentId) {
    await audioRemoveUpcomingTracks()
    const track = (await audioCreateTrack(item)) as Track
    PVAudioPlayer.add([track])
    await PVAudioPlayer.skipToNext()
    audioSyncPlayerWithQueue()
  } else {
    const track = (await audioCreateTrack(item)) as Track
    PVAudioPlayer.add([track])
  }

  if (shouldPlay) {
    if (item && !item.clipId) {
      audioHandlePlayWhenReady()
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
    await audioRemoveUpcomingTracks()
    const tracks = await audioCreateTracks(pvQueueItems)
    PVAudioPlayer.add(tracks)
  } catch (error) {
    errorLogger(_fileName, 'audioSyncPlayerWithQueue', error)
  }
}

export const audioUpdateCurrentTrack = async (trackTitle?: string, artworkUrl?: string) => {
  try {
    const currentIndex = await PVAudioPlayer.getActiveTrackIndex()
    if (currentIndex || currentIndex === 0) {
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
    errorLogger(_fileName, 'audioUpdateCurrentTrack', error)
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
    liveItem,
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
  const isAddByRSSPodcast = !!addByRSSPodcastFeedUrl
  /*
    If credentials are required but it is a podcast stored in our database,
    then get the authority feedUrl for the podcast before proceeding.
  */
  if (podcastCredentialsRequired && !addByRSSPodcastFeedUrl && podcastId) {
    finalFeedUrl = await getPodcastFeedUrlAuthority(podcastId)
  }

  if (episodeId) {
    const [isDownloadedFile, filePath] = await Promise.all([
      checkIfFileIsDownloaded(episodeId, episodeMediaUrl, isAddByRSSPodcast),
      getDownloadedFilePath(episodeId, episodeMediaUrl, isAddByRSSPodcast)
    ])

    const fileExtension = getExtensionFromUrl(episodeMediaUrl)?.substring(1)
    const isHLS = fileExtension === 'm3u8'
    const type = isHLS ? 'hls' : 'default'

    if (isDownloadedFile) {
      track = {
        id,
        url: `file://${filePath}`,
        title: episodeTitle,
        artist: podcastTitle,
        ...(imageUrl ? { artwork: imageUrl } : {}),
        userAgent: getAppUserAgent(),
        pitchAlgorithm: PitchAlgorithm.Voice,
        type
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
        isLiveStream: Platform.OS === 'ios' && liveItem ? true : false,
        headers: {
          ...(Authorization ? { Authorization } : {}),
          'User-Agent': getAppUserAgent()
        },
        type
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
        const track = (await audioCreateTrack(itemToMove)) as any
        PVAudioPlayer.add([track], newIndex)
      }
    } catch (error) {
      errorLogger(_fileName, 'movePlayerItemToNewPosition', error)
    }
  }
}

export const audioSetPosition = async (position?: number) => {
  const currentId = await audioGetCurrentLoadedTrackId()
  if (currentId && (position || position === 0 || (position && position > 0))) {
    await audioHandleSeekTo(position)
  }
}

export const audioTogglePlay = async () => {
  const state = await audioGetState()

  if (state === State.None) {
    audioHandlePlayWithUpdate()
    return
  }

  if (state === State.Playing) {
    audioHandlePauseWithUpdate()
  } else {
    audioHandlePlayWithUpdate()
  }
}

const audioHandlePlayWhenReady = () => {
  PVAudioPlayer.setPlayWhenReady(true)
}

export const audioHandlePlay = () => {
  PVAudioPlayer.play()

  /*
    Adding setTimeout because it seems calling .play() then immediately setting the rate
    seems to be causing the user to have to trigger the remote-play event twice to resume playback.
  */
  setTimeout(() => {
    playerSetRateWithLatestPlaybackSpeed()
  }, 1000)
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
  setLiveStreamWasPausedState(true)
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
  const state = await audioGetState()
  return state === State.None
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
    const currentId = await audioGetCurrentLoadedTrackId()
    const setPlayerClipIsLoadedIfClip = true
    const item = await getNowPlayingItemFromLocalStorage(currentId, setPlayerClipIsLoadedIfClip)
    if (item) {
      await addOrUpdateHistoryItem(item, item.userPlaybackPosition || 0, item.episodeDuration || 0)
      return item
    }
  }
}

export const audioAddNowPlayingItemNextInQueue = (
  item: NowPlayingItem,
  itemToSetNextInQueue: NowPlayingItem | null
) => {
  const { addCurrentItemNextInQueue } = getGlobal()

  if (
    addCurrentItemNextInQueue &&
    itemToSetNextInQueue &&
    item.episodeId !== itemToSetNextInQueue.episodeId &&
    !checkIfVideoFileOrVideoLiveType(item?.episodeMediaType)
  ) {
    addQueueItemNext(itemToSetNextInQueue)
  }
}

export const audioInitializePlayerQueue = async (item?: NowPlayingItem) => {
  try {
    const queueItems = await getQueueItems()
    let filteredItems = [] as any

    if (item && !checkIfVideoFileOrVideoLiveType(item?.episodeMediaType)) {
      /* TODO: fix this
         Use the item from history to make sure we have the same
         userPlaybackPosition that was last saved from other devices. */
      if (!item.clipId && item.episodeId) {
        /* 
          updateHistoryItemsIndex will also update the result of
          getNowPlayingItemFromLocalStorage
        */
        await updateHistoryItemsIndex()

        /*
          Get the localStorageItem with the new userPlaybackPosition from updateHistoryItemsIndex
        */
        const localStorageItem = await getNowPlayingItemFromLocalStorage(item.episodeId)
        if (!!localStorageItem) {
          item = localStorageItem
        }
      }
      filteredItems = filterItemFromQueueItems(queueItems, item)

      if (filteredItems.length > 0) {
        const tracks = await audioCreateTracks(filteredItems)
        PVAudioPlayer.add(tracks)
      }
    }
  } catch (error) {
    errorLogger(_fileName, 'Initializing player', error)
  }

  return item
}

export const audioGetTrackPosition = () => {
  return PVAudioPlayer.getProgress().then((progress) => progress.position)
}

export const audioReset = async () => {
  if (Platform.OS === 'ios') {
    await PVAudioPlayer.reset()
  } else if (Platform.OS === 'android') {
    const queueItems = await PVAudioPlayer.getQueue()
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < queueItems.length; i++) {
      await PVAudioPlayer.remove(0)
    }
  }
}

export const audioGetTrackDuration = () => {
  return TrackPlayer.getDuration()
}

export const audioGetState = async () => {
  const result = await PVAudioPlayer.getPlaybackState()

  /*
    There is bugginess with getting State.Ready from audioGetState
    on at least iOS. As a work around, I am falling back to whatever is
    already in global state whenever ready is returned.
  */
  let state = result?.state
  const globalPlaybackState = getGlobal()?.player?.playbackState
  if (state === State.Ready && globalPlaybackState && globalPlaybackState !== State.Buffering) {
    state = globalPlaybackState
  } else if (state === State.Ready) {
    state = State.Paused
  }

  return state
}

export const audioGetRate = () => {
  return PVAudioPlayer.getRate()
}

export const audioJumpBackward = async (seconds: string) => {
  const position = await audioGetTrackPosition()
  const newPosition = position - parseInt(seconds, 10)
  await audioHandleSeekTo(newPosition)
  return newPosition
}

export const audioJumpForward = async (seconds: string) => {
  const position = await audioGetTrackPosition()
  const newPosition = position + parseInt(seconds, 10)
  await audioHandleSeekTo(newPosition)
  return newPosition
}
