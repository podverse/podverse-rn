import debounce from 'lodash/debounce'
import { checkIfVideoFileOrVideoLiveType, convertToNowPlayingItem, Episode, generateAuthorsText, getExtensionFromUrl,
  MediaRef,
  NowPlayingItem } from 'podverse-shared'
import TrackPlayer, { PitchAlgorithm, State, Track } from 'react-native-track-player'
import { Platform } from 'react-native'
import { getGlobal } from 'reactn'
import { errorLogger } from '../lib/logger'
import { checkIfFileIsDownloaded, getDownloadedFilePath } from '../lib/downloader'
import { getStartPodcastFromTime } from '../lib/startPodcastFromTime'
import { getAppUserAgent } from '../lib/utility'
import { PV } from '../resources'
import { setLiveStreamWasPausedState } from '../state/actions/player'
import { updateHistoryItemsIndex } from '../state/actions/userHistoryItem'
import PVEventEmitter from './eventEmitter'
import { getPodcastCredentialsHeader } from './parser'
import { playerSetRateWithLatestPlaybackSpeed, playerUpdateUserPlaybackPosition } from './player'
import { getPodcastFeedUrlAuthority } from './podcast'
import { addQueueItemNext, getQueueItemsLocally, setRNTPRepeatMode } from './queue'
import { addOrUpdateHistoryItem, getHistoryItemIndexInfoForEpisode,
  getHistoryItemsIndexLocally } from './userHistoryItem'
import { getEnrichedNowPlayingItemFromLocalStorage } from './userNowPlayingItem'
import { getSecondaryQueueEpisodesForPlaylist, getSecondaryQueueEpisodesForPodcastId } from './secondaryQueue'
import { audioUpdateTrackPlayerCapabilities } from './playerAudioSetup'

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

const audioRemovePreviousTracks = async () => {
  const currentIndex = await PVAudioPlayer.getActiveTrackIndex()
  if (currentIndex === 0 || (currentIndex && currentIndex >= 1)) {
    const queueItems = await PVAudioPlayer.getQueue()
    if (queueItems && queueItems.length > 1) {
      const previousQueueItemsCount = currentIndex
      for (let i = 0; i < previousQueueItemsCount; i++) {
        await audioRemoveTrack(0)
      }
    }
  }
}

export const audioRemovePreviousPrimaryQueueItemTracks = async () => {
  const currentIndex = await PVAudioPlayer.getActiveTrackIndex()
  if (currentIndex >= 1) {
    const queueItems = await PVAudioPlayer.getQueue()
    const previousQueueItems = queueItems.slice(0, currentIndex)
    if (previousQueueItems && previousQueueItems.length > 1) {
      for (let i = 0; i < currentIndex; i++) {
        const previousQueueItem = previousQueueItems[i]
        if (previousQueueItem?.isPrimaryQueueItem) {
          await audioRemoveTrack(i)
        }
      }
    }
  }
}

const audioRemoveUpcomingTracks = async () => {
  await PVAudioPlayer.removeUpcomingTracks()
  // if (Platform.OS === 'ios') {
  //   await PVAudioPlayer.removeUpcomingTracks()
  // } else if (Platform.OS === 'android') {
  //   const currentIndex = await PVAudioPlayer.getActiveTrackIndex()
  //   if (currentIndex === 0 || (currentIndex && currentIndex >= 1)) {
  //     const queueItems = await PVAudioPlayer.getQueue()
  //     if (queueItems && queueItems.length > 1) {
  //       const queueItemsCount = queueItems.length
  //       const upcomingQueueItemsCount = queueItemsCount - currentIndex - 1
  //       for (let i = 0; i < upcomingQueueItemsCount; i++) {
  //         const adjustedIndex = queueItemsCount - i - 1
  //         if (adjustedIndex >= 0) {
  //           await audioRemoveTrack(adjustedIndex)
  //         }
  //       }
  //     }
  //   }
  // }
}

export const audioLoadNowPlayingItem = async (
  item: NowPlayingItem,
  shouldPlay: boolean,
  forceUpdateOrderDate: boolean,
  // assign this to the track so that we can use the playlistId later
  // in audioSyncPlayerWithQueue.
  secondaryQueuePlaylistId?: string
) => {
  /*
    Call .stop() instead of .pause() to avoid a race-condition in the Event.PlaybackState listener
    with the playerUpdateUserPlaybackPosition call.
    If we call .pause here, then playerUpdateUserPlaybackPosition gets invoked in multiple
    places, leading to the incorrect nowPlayingItem info saved to history (such as an incorrect duration).
  */
  await PVAudioPlayer.stop()

  const [historyItemsIndex] = await Promise.all([getHistoryItemsIndexLocally()])

  const { clipId, episodeId } = item
  if (!clipId && episodeId) {
    item.episodeDuration = historyItemsIndex?.episodes?.[episodeId]?.mediaFileDuration || 0
  }

  addOrUpdateHistoryItem(item, item.userPlaybackPosition || 0, item.episodeDuration || 0, forceUpdateOrderDate)

  const currentId = await audioGetCurrentLoadedTrackId()
  if (currentId) {
    await audioRemoveUpcomingTracks()
    await audioRemovePreviousTracks()
    
    // do we want to pass in isPrimaryQueueItem true sometimes?
    const track = (await audioCreateTrack(item, {
      isPrimaryQueueItem: false, secondaryQueuePlaylistId })) as Track 
    await PVAudioPlayer.add([track])
    await PVAudioPlayer.skipToNext()
  } else {
    const track = (await audioCreateTrack(item, {
      isPrimaryQueueItem: false, secondaryQueuePlaylistId })) as Track
    await PVAudioPlayer.add([track])
  }

  await debouncedAudioSyncPlayerWithQueue()
  
  if (item && !item.clipId && shouldPlay) {
    if (Platform.OS === 'android') {
      PVAudioPlayer.setPlayWhenReady(true)
    } else {
      PVAudioPlayer.play()
    }
  } else if (item && !!item.clipId) {
    await audioHandleLoadClip(item, shouldPlay)
  }

  return item
}

export const updatePlayerSettingsForTrack = async (isMusic: boolean) => {
  await setRNTPRepeatMode(isMusic)

    /*
      NOTE: I'm updating the player settings every time audioSyncPlayerWithQueue.
      This may not be the best place to be doing this, but audioSyncPlayerWithQueue
      generally happens every time *after* an item changes in the player. So
      audioSyncPlayerWithQueue seems to be a reliable place to put things that are
      important for playing a new item, but can happen after the other player loading steps complete.
    */
    // TODO: can remote commands be passed in on the track, rather than updating them in this function?
    if (Platform.OS === 'ios') {
      await audioUpdateTrackPlayerCapabilities()
    }
}

const audioSyncPlayerWithQueue = async () => {
  try {
    /*
      1. get the nowPlayingItem from global player state.
      2. get the adjacent episodes from Podverse API for that episodeId and (podcastId OR playlistId).
          a. If it's a liveItem, return empty data.
          b. If it's a music medium or playlistId, then get all (+/-50) of the episodes around that episode.
          c. If it's any other medium, then get +/-10 of the episodes around that episode.
          *. response body for all cases in format { previousEpisodes, nextEpisodes })
      3. convert the previousEpisodes and nextEpisodes into nowPlayingItems.
      4. get queue items locally (they're already nowPlayingItems).
      5. confirm the nowPlayingItem you began with is still the nowPlayingItem
         in the player before continuing!
      6. remove all RNTP tracks before the current track index.
      7. remove all RNTP tracks after the current track index.
      8. add the userQueueItems after the current track index.
      9. add the nextEpisodes nowPlayingItems after the current track index + userQueueItems.length - 1.
      10. add the previousEpisodes nowPlayingItems before the current track index.
    */

    const globalState = getGlobal()

    const nowPlayingItem = globalState?.player?.nowPlayingItem
    const isMusic = nowPlayingItem?.podcastMedium === PV.Medium.music
    const autoPlayEpisodesFromPodcast = globalState?.player?.autoPlayEpisodesFromPodcast

    await updatePlayerSettingsForTrack(isMusic)

    // todo: handle retry in case not on global state yet?
    if (nowPlayingItem) {
      const { clipId, episodeId, podcastId } = nowPlayingItem

      const activeTrack = await TrackPlayer.getActiveTrack()
      const secondaryQueuePlaylistId = activeTrack?.secondaryQueuePlaylistId

      let previousNowPlayingItems = []
      let nextNowPlayingItems = []

      if (episodeId) {
        if (secondaryQueuePlaylistId) {
          const secondaryQueueData = await getSecondaryQueueEpisodesForPlaylist(
            secondaryQueuePlaylistId, clipId || episodeId)
          const { previousEpisodesAndMediaRefs, nextEpisodesAndMediaRefs } = secondaryQueueData
          previousNowPlayingItems = previousEpisodesAndMediaRefs.map((
            previousEpisodeOrMediaRef: Episode | MediaRef) => {
            const isMediaRef = previousEpisodeOrMediaRef?.startTime === 0 || previousEpisodeOrMediaRef?.startTime > 0
            const previousEpisode = previousEpisodeOrMediaRef?.episode || previousEpisodeOrMediaRef
            const podcast = previousEpisode?.podcast
            
            const userPlaybackPosition = isMediaRef
              ? previousEpisodeOrMediaRef.startTime
              : podcast?.medium === PV.Medium.music
                ? 0
                : getHistoryItemIndexInfoForEpisode(previousEpisode?.id)?.userPlaybackPosition || 0
            return convertToNowPlayingItem(previousEpisodeOrMediaRef, null, null, userPlaybackPosition)
          }) 
    
          nextNowPlayingItems = nextEpisodesAndMediaRefs.map((
            nextEpisodeOrMediaRef: Episode | MediaRef) => {
            const isMediaRef = nextEpisodeOrMediaRef?.startTime === 0 || nextEpisodeOrMediaRef?.startTime > 0
            const previousEpisode = nextEpisodeOrMediaRef?.episode || nextEpisodeOrMediaRef
            const podcast = previousEpisode?.podcast
            
            const userPlaybackPosition = isMediaRef
              ? nextEpisodeOrMediaRef.startTime
              : podcast?.medium === PV.Medium.music
                ? 0
                : getHistoryItemIndexInfoForEpisode(previousEpisode?.id)?.userPlaybackPosition || 0
            return convertToNowPlayingItem(nextEpisodeOrMediaRef, null, null, userPlaybackPosition)
          }) 
        } else {
          if (!isMusic && autoPlayEpisodesFromPodcast === 'off') {
            // don't add secondaryQueue items
          } else {
            const secondaryQueueData = await getSecondaryQueueEpisodesForPodcastId(episodeId, podcastId)
            const { previousEpisodes, nextEpisodes, inheritedPodcast } = secondaryQueueData

            const sortedPreviousEpisodes = !isMusic && autoPlayEpisodesFromPodcast === 'newer'
              ? nextEpisodes?.reverse()
              : previousEpisodes

            const sortedNextEpisodes = !isMusic && autoPlayEpisodesFromPodcast === 'newer'
              ? previousEpisodes?.reverse()
              : nextEpisodes
    
            previousNowPlayingItems = sortedPreviousEpisodes.map((previousEpisode: Episode) => {
              const userPlaybackPosition = inheritedPodcast?.medium === PV.Medium.music
                  ? 0
                  : getHistoryItemIndexInfoForEpisode(previousEpisode?.id)?.userPlaybackPosition || 0
              return convertToNowPlayingItem(previousEpisode, null, inheritedPodcast, userPlaybackPosition)
            }) 
      
            nextNowPlayingItems = sortedNextEpisodes.map((nextEpisode: Episode) => {
              const userPlaybackPosition = inheritedPodcast?.medium === PV.Medium.music
              ? 0
              : getHistoryItemIndexInfoForEpisode(nextEpisode?.id)?.userPlaybackPosition || 0
              return convertToNowPlayingItem(nextEpisode, null, inheritedPodcast, userPlaybackPosition)
            })
          }
        }
      }

      const pvQueueItems = await getQueueItemsLocally()

      const nowPlayingItemIsStillTheSame = nowPlayingItem.episodeId === getGlobal()?.player?.nowPlayingItem?.episodeId

      if (nowPlayingItemIsStillTheSame) {
        await audioRemovePreviousTracks()
        await audioRemoveUpcomingTracks()

        let queueItemTracks = []
        if (!isMusic || (isMusic && getGlobal()?.player?.queueEnabledWhileMusicIsPlaying)) {
          queueItemTracks = await audioCreateTracks(pvQueueItems, { isPrimaryQueueItem: true })        
          await PVAudioPlayer.add(queueItemTracks)
        }

        const nextSecondaryQueueTracks = await audioCreateTracks(nextNowPlayingItems, {
          isPrimaryQueueItem: false, secondaryQueuePlaylistId })
        await PVAudioPlayer.add(nextSecondaryQueueTracks)

        // NOTE: There is an extremely weird bug on iOS with RNTP where if you insert tracks
        // before the 0 position of the queue, while the active track has no queue items ahead of it,
        // then the activeIndex gets stuck at 0, and does not change to 0 + X the previous inserted tracks
        // This causes a myriad of problems across the app anywhere the activeIndex must be accurate. 
        // To workaround this bug, if a track has previous secondary queue tracks, but has no 
        // next secondary queue tracks, I am adding a placeholder track in front of the active track,
        // then inserting the previous tracks, then removing the placeholder track :-(
        const endOfQueueBugWorkaround =
          Platform.OS === 'ios'
          && queueItemTracks.length === 0
          && nextSecondaryQueueTracks.length === 0
          && previousNowPlayingItems.length > 0

        const previousSecondaryQueueTracks = await audioCreateTracks(
          previousNowPlayingItems, { isPrimaryQueueItem: false, secondaryQueuePlaylistId })

        if (endOfQueueBugWorkaround) {
          const bugWorkaroundTrack = previousSecondaryQueueTracks[0]
          await PVAudioPlayer.add(bugWorkaroundTrack)
        }

        const previousInsertBeforeIndex = 0
        await PVAudioPlayer.add(previousSecondaryQueueTracks, previousInsertBeforeIndex)

        if (endOfQueueBugWorkaround) {
          const removeBugWorkaroundIndex = await TrackPlayer.getActiveTrackIndex()
          await PVAudioPlayer.remove(removeBugWorkaroundIndex + 1)
        }
      }
    }
  } catch (error) {
    errorLogger(_fileName, 'audioSyncPlayerWithQueue', error)
  }
}

// Prevent audioSyncPlayerWithQueue from being called many times rapidly
export const debouncedAudioSyncPlayerWithQueue = debounce(audioSyncPlayerWithQueue, 3000, {
  leading: true,
  trailing: false
})

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

type AudioCreateTrackOptions = {
  isPrimaryQueueItem: boolean
  secondaryQueuePlaylistId?: string
}

export const audioCreateTrack = async (item: NowPlayingItem, options: AudioCreateTrackOptions) => {
  if (!item) return

  const {
    addByRSSPodcastFeedUrl,
    clipId,
    episodeId,
    episodeMediaUrl = '',
    episodeTitle = 'Untitled Episode',
    liveItem,
    podcastAuthors,
    podcastCredentialsRequired,
    podcastId,
    podcastImageUrl,
    podcastMedium,
    podcastShrunkImageUrl,
    podcastTitle = 'Untitled Podcast'
  } = item

  const { isPrimaryQueueItem, secondaryQueuePlaylistId } = options

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
    const [isDownloadedFile, filePath, enrichedNowPlayingItem, startPodcastFromTime] = await Promise.all([
      checkIfFileIsDownloaded(episodeId, episodeMediaUrl, isAddByRSSPodcast),
      getDownloadedFilePath(episodeId, episodeMediaUrl, isAddByRSSPodcast),
      getEnrichedNowPlayingItemFromLocalStorage(episodeId),
      getStartPodcastFromTime(podcastId)
    ])

    const fileExtension = getExtensionFromUrl(episodeMediaUrl)?.substring(1)
    const isHLS = fileExtension === 'm3u8'
    const type = isHLS ? 'hls' : 'default'

    const isMusic = podcastMedium === PV.Medium.music
    const isClip = !!item?.clipId

    let initialTime = enrichedNowPlayingItem?.userPlaybackPosition
    if (isMusic) {
      initialTime = 0
    } else if (isClip) {
      initialTime = item.clipStartTime || 0
    } else if (startPodcastFromTime && !initialTime) {
      initialTime = startPodcastFromTime
    }

    const pitchAlgorithm = isMusic ? PitchAlgorithm.Linear : PitchAlgorithm.Voice
    const finalPodcastTitle = isMusic ? generateAuthorsText(podcastAuthors) : podcastTitle

    if (isDownloadedFile) {
      track = {
        id,
        url: `file://${filePath}`,
        title: episodeTitle,
        artist: finalPodcastTitle,
        ...(imageUrl ? { artwork: imageUrl } : {}),
        userAgent: getAppUserAgent(),
        pitchAlgorithm,
        type,
        initialTime,
        ...(initialTime ? { iosInitialTime: initialTime } : {}),
        isClip,
        isPrimaryQueueItem,
        secondaryQueuePlaylistId
      }
    } else {
      const Authorization = await getPodcastCredentialsHeader(finalFeedUrl)

      track = {
        id,
        url: episodeMediaUrl,
        title: episodeTitle,
        artist: finalPodcastTitle,
        ...(imageUrl ? { artwork: imageUrl } : {}),
        userAgent: getAppUserAgent(),
        pitchAlgorithm,
        isLiveStream: Platform.OS === 'ios' && liveItem ? true : false,
        headers: {
          ...(Authorization ? { Authorization } : {}),
          'User-Agent': getAppUserAgent()
        },
        type,
        initialTime,
        ...(initialTime ? { iosInitialTime: initialTime } : {}),
        isClip,
        isPrimaryQueueItem,
        secondaryQueuePlaylistId
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
      await audioRemoveTrack(previousIndex)
      const pvQueueItems = await getQueueItemsLocally()
      const itemToMove = pvQueueItems.find(
        (x: any) => (x.clipId && x.clipId === id) || (!x.clipId && x.episodeId === id)
      )
      if (itemToMove) {
        const track = (await audioCreateTrack(itemToMove, { isPrimaryQueueItem: true })) as any
        await PVAudioPlayer.add([track], newIndex)
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

const audioHandleLoadClip = async (item: NowPlayingItem, shouldPlay: boolean) => {
  PVEventEmitter.emit(PV.Events.PLAYER_START_CLIP_TIMER)
  await PVAudioPlayer.seekTo(item.clipStartTime || 0)
  if (shouldPlay) {
    audioHandlePlayWithUpdate()
  }
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

const audioHandleStop = async () => {
  await PVAudioPlayer.stop()
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

export const audioCreateTracks = async (items: NowPlayingItem[], options: AudioCreateTrackOptions) => {
  const tracks = [] as Track[]
  for (const item of items) {
    const track = (await audioCreateTrack(item, options)) as Track
    tracks.push(track)
  }

  return tracks
}

export const audioPlayPreviousFromQueue = async () => {
  const currentPosition = await PVAudioPlayer.getPosition()
  if (currentPosition > 4) {
    await PVAudioPlayer.seekTo(0)
  } else {
    await PVAudioPlayer.skipToPrevious()
  }
}

export const audioPlayNextFromQueue = async () => {
  const queueItems = await PVAudioPlayer.getQueue()
  if (queueItems && queueItems.length > 1) {
    await PVAudioPlayer.skipToNext()
    const currentId = await audioGetCurrentLoadedTrackId()
    const item = await getEnrichedNowPlayingItemFromLocalStorage(currentId)
    if (item) {
      await addOrUpdateHistoryItem(item, item.userPlaybackPosition || 0, item.episodeDuration || 0)
      return item
    }
  }
}

export const audioAddNowPlayingItemNextInQueue = async (
  item: NowPlayingItem,
  itemToSetNextInQueue: NowPlayingItem | null
) => {
  const { addCurrentItemNextInQueue } = getGlobal()

  if (
    addCurrentItemNextInQueue
    && itemToSetNextInQueue
    && item.episodeId !== itemToSetNextInQueue.episodeId
    && itemToSetNextInQueue.podcastMedium !== PV.Medium.music
    && !itemToSetNextInQueue.podcastHasVideo
    ) {
    await addQueueItemNext(itemToSetNextInQueue)
  }
}

export const audioInitializePlayerQueue = async (item?: NowPlayingItem) => {
  try {
    if (item && !checkIfVideoFileOrVideoLiveType(item?.episodeMediaType)) {
      /* TODO: fix this
         Use the item from history to make sure we have the same
         userPlaybackPosition that was last saved from other devices. */
      if (!item.clipId && item.episodeId) {
        /* 
          updateHistoryItemsIndex will also update the result of
          getEnrichedNowPlayingItemFromLocalStorage
        */
        await updateHistoryItemsIndex()

        /*
          Get the localStorageItem with the new userPlaybackPosition from updateHistoryItemsIndex
        */
        const localStorageItem = await getEnrichedNowPlayingItemFromLocalStorage(item.episodeId)
        if (!!localStorageItem) {
          item = localStorageItem
        }
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
  await audioRemovePreviousTracks()
  await audioRemoveUpcomingTracks()
  await audioHandleStop()
  await PVAudioPlayer.reset()
}

/*
  There is a bug with PVAudioPlayer.removeUpcomingTracks() which can in some cases
  remove the currently playing item on Android at unintended times.
  To work around this, I wrote a custom removeUpcomingTracks helper...
  BUT if PVAudioPlayer.remove() is called with a number higher than the tracks available,
  the app will crash with an java.lang.IllegalArgumentException error.
  To attempt to work around this bug, I am checking that a track exists
  at that queue item position every time before calling .remove().
*/
export const audioRemoveTrack = async (position: number) => {
  if (Platform.OS === 'ios') {
    await PVAudioPlayer.remove(position)
  } else {
    if (position === 0 || position > 0) {
      const queueItems = await PVAudioPlayer.getQueue()
      const itemExists = queueItems.length - 1 >= position
      if (itemExists) {
        await PVAudioPlayer.remove(position)
      }
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
