import AsyncStorage from '@react-native-community/async-storage'
import debounce from 'lodash/debounce'
import { NowPlayingItem } from 'podverse-shared'
import { Platform } from 'react-native'
import { getGlobal, setGlobal } from 'reactn'
import BackgroundTimer from 'react-native-background-timer'
import { State as RNTPState } from 'react-native-track-player'
import { processValueTransactionQueue, saveStreamingValueTransactionsToTransactionQueue } from '../lib/valueTagHelpers'
import { translate } from '../lib/i18n'
import { getStartPodcastFromTime } from '../lib/startPodcastFromTime'
import { PV } from '../resources'
import { removeDownloadedPodcastEpisode } from '../state/actions/downloads'
import { handleEnrichingPlayerState, playNextChapterOrQueueItem,
  playPreviousChapterOrReturnToBeginningOfTrack, updatePlaybackState } from '../state/actions/player'
import { clearChapterPlaybackInfo } from '../state/actions/playerChapters'
import { updateHistoryItemsIndex } from '../state/actions/userHistoryItem'
import PVEventEmitter from './eventEmitter'
import {
  getClipHasEnded,
  getCurrentLoadedTrackId,
  getLoadedTrackIdByIndex,
  getNowPlayingItemFromQueueOrHistoryOrDownloadedByTrackId,
  getPlaybackSpeed,
  handlePlay,
  handleResumeAfterClipHasEnded,
  playerJumpBackward,
  playerJumpForward,
  PVTrackPlayer,
  setClipHasEnded,
  setPlaybackPositionWhenDurationIsAvailable,
  setRateWithLatestPlaybackSpeed,
  updateUserPlaybackPosition
} from './player'
import { addOrUpdateHistoryItem, getHistoryItemEpisodeFromIndexLocally } from './userHistoryItem'
import { getNowPlayingItemLocally, setNowPlayingItemLocally } from './userNowPlayingItem'
import { removeQueueItem } from './queue'

const debouncedSetPlaybackPosition = debounce(setPlaybackPositionWhenDurationIsAvailable, 1000, {
  leading: true,
  trailing: false
})

const handleSyncNowPlayingItem = async (trackId: string, currentNowPlayingItem: NowPlayingItem) => {
  if (!currentNowPlayingItem) return

  await clearChapterPlaybackInfo(currentNowPlayingItem)

  await setNowPlayingItemLocally(currentNowPlayingItem, currentNowPlayingItem.userPlaybackPosition || 0)

  if (currentNowPlayingItem && currentNowPlayingItem.clipId && !currentNowPlayingItem.clipIsOfficialChapter) {
    PVEventEmitter.emit(PV.Events.PLAYER_CLIP_LOADED)
  }

  if (currentNowPlayingItem && currentNowPlayingItem.clipId) {
    debouncedSetPlaybackPosition(currentNowPlayingItem.clipStartTime || 0)
  } else if (
    !currentNowPlayingItem.clipId
    && currentNowPlayingItem.userPlaybackPosition
    && currentNowPlayingItem.userPlaybackPosition >= 5
  ) {
    debouncedSetPlaybackPosition(currentNowPlayingItem.userPlaybackPosition, trackId)
  } else {
    const { podcastId } = currentNowPlayingItem
    const startPodcastFromTime = await getStartPodcastFromTime(podcastId)
    
    if (!currentNowPlayingItem.clipId && startPodcastFromTime) {
      debouncedSetPlaybackPosition(startPodcastFromTime, trackId)
    }
  }

  PVEventEmitter.emit(PV.Events.PLAYER_TRACK_CHANGED)

  // Call updateUserPlaybackPosition to make sure the current item is saved as the userNowPlayingItem
  await updateUserPlaybackPosition()

  handleEnrichingPlayerState(currentNowPlayingItem)
}

const syncNowPlayingItemWithTrack = () => {
  // If the clipEndInterval is already running, stop it before the clip is
  // reloaded in the handleSyncNowPlayingItem function.
  const checkClipEndTimeShouldStop = true
  const streamingValueShouldStop = false
  stopBackgroundTimerIfShouldBeStopped(checkClipEndTimeShouldStop, streamingValueShouldStop)

  // The first setTimeout is an attempt to prevent the following:
  // - Sometimes clips start playing from the beginning of the episode, instead of the start of the clip.
  // - Sometimes the debouncedSetPlaybackPosition seems to load with the previous track's playback position,
  // instead of the new track's playback position.
  // NOTE: This timeout will lead to a delay before every clip starts, where it starts playing from the episode start
  // before playing from the clip start. Hopefully we can iron this out sometime...
  // - The second timeout is called in case something was out of sync previously from getCurrentTrack
  // or getNowPlayingItemFromQueueOrHistoryOrDownloadedByTrackId...
  function sync() {
    (async () => {
      updatePlaybackState()
      await AsyncStorage.removeItem(PV.Keys.PLAYER_CLIP_IS_LOADED)

      const currentTrackId = await getCurrentLoadedTrackId()
      const setPlayerClipIsLoadedIfClip = true

      /*
        When a new item loads, sometimes that item is not available in the local history
        until a few seconds into the loadItemAndPlayTrack, so we're reattempting the
        getNowPlayingItemFromQueueOrHistoryOrDownloadedByTrackId up to 5 times.
      */
      let retryIntervalCount = 1
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const retryInterval = setInterval(async () => {
        retryIntervalCount += 1
        if (retryIntervalCount >= 5) {
          clearInterval(retryInterval)
        } else {
          const currentNowPlayingItem = await getNowPlayingItemFromQueueOrHistoryOrDownloadedByTrackId(
            currentTrackId, setPlayerClipIsLoadedIfClip)    
          if (currentNowPlayingItem && retryInterval) {
            clearInterval(retryInterval)
            await handleSyncNowPlayingItem(currentTrackId, currentNowPlayingItem)
            await removeQueueItem(currentNowPlayingItem)
            PVEventEmitter.emit(PV.Events.QUEUE_HAS_UPDATED)
          }
        }
      }, 1000)
    })()
  }

  setTimeout(sync, 1000)
}

const resetHistoryItem = async (x: any) => {
  const { position, track } = x
  const loadedTrackId = await getLoadedTrackIdByIndex(track)
  const metaEpisode = await getHistoryItemEpisodeFromIndexLocally(loadedTrackId)
  if (metaEpisode) {
    const { mediaFileDuration } = metaEpisode
    if (mediaFileDuration > 59 && mediaFileDuration - 59 < position) {
      const setPlayerClipIsLoadedIfClip = false
      const currentNowPlayingItem = await getNowPlayingItemFromQueueOrHistoryOrDownloadedByTrackId(
        loadedTrackId, setPlayerClipIsLoadedIfClip)
      if (currentNowPlayingItem) {
        const autoDeleteEpisodeOnEnd = await AsyncStorage.getItem(PV.Keys.AUTO_DELETE_EPISODE_ON_END)
        if (autoDeleteEpisodeOnEnd && currentNowPlayingItem?.episodeId) {
          removeDownloadedPodcastEpisode(currentNowPlayingItem.episodeId)
        }

        const forceUpdateOrderDate = false
        const skipSetNowPlaying = false
        const completed = true
        await addOrUpdateHistoryItem(currentNowPlayingItem, 0, null, forceUpdateOrderDate, skipSetNowPlaying, completed)
        await updateHistoryItemsIndex()
      }
    }
  }
}

const handleQueueEnded = (x: any) => {
  setTimeout(() => {
    (async () => {
      /*
        The app is calling TrackPlayer.reset() on iOS only in loadItemAndPlayTrack
        because .reset() is the only way to clear out the current item from the queue,
        but .reset() results in the playback-queue-ended event in firing.
        We don't want the playback-queue-ended event handling logic below to happen
        during loadItemAndPlayTrack, so to work around this, I am setting temporary
        AsyncStorage state so we can know when a queue has actually ended or
        when the event is the result of .reset() called within loadItemAndPlayTrack.
      */
     const preventHandleQueueEnded = await AsyncStorage.getItem(PV.Keys.PLAYER_PREVENT_HANDLE_QUEUE_ENDED)
     if (!preventHandleQueueEnded) {
       await resetHistoryItem(x)
     }
    })()
  }, 0)
}

const handleTrackEnded = (x: any) => {
  setTimeout(() => {
    (async () => {
      await resetHistoryItem(x)
    })()
  }, 0)
}

// eslint-disable-next-line @typescript-eslint/require-await
module.exports = async () => {
  PVTrackPlayer.addEventListener('playback-error', (x) => console.log('playback error', x))

  PVTrackPlayer.addEventListener('playback-track-changed', (x: any) => {
    console.log('playback-track-changed', x)
    syncNowPlayingItemWithTrack()
    handleTrackEnded(x)
  })

  // NOTE: TrackPlayer.reset will call the playback-queue-ended event on Android!!!
  PVTrackPlayer.addEventListener('playback-queue-ended', (x) => {
    console.log('playback-queue-ended', x)
    handleQueueEnded(x)
  })

  PVTrackPlayer.addEventListener('playback-state', (x) => {
    (async () => {
      console.log('playback-state', x)

      PVEventEmitter.emit(PV.Events.PLAYER_STATE_CHANGED)

      const clipHasEnded = await getClipHasEnded()
      const nowPlayingItem = await getNowPlayingItemLocally()

      if (nowPlayingItem) {
        const { clipEndTime } = nowPlayingItem
        const currentPosition = await PVTrackPlayer.getTrackPosition()
        const currentState = await PVTrackPlayer.getState()
        const isPlaying = currentState === RNTPState.Playing

        const shouldHandleAfterClip = clipHasEnded && clipEndTime && currentPosition >= clipEndTime && isPlaying
        if (shouldHandleAfterClip) {
          await handleResumeAfterClipHasEnded()
        } else {
          if (Platform.OS === 'ios') {
            if (x.state === RNTPState.Playing) {
              await setRateWithLatestPlaybackSpeed()
            } else if (x.state === RNTPState.Paused || RNTPState.Stopped) {
              await updateUserPlaybackPosition()
            }
          } else if (Platform.OS === 'android') {
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
            const stopped = 1
            const paused = 2
            const playing = 3
            if (x.state === playing) {
              const rate = await getPlaybackSpeed()
              PVTrackPlayer.setRate(rate)
            } else if (x.state === paused || x.state === stopped) {
              await updateUserPlaybackPosition()
            }
          }
        }
      }
    })()
  })

  PVTrackPlayer.addEventListener('playback-error', (x: any) => {
    console.log('playback-error', x)
    // TODO: post error to our logs!
    PVEventEmitter.emit(PV.Events.PLAYER_PLAYBACK_ERROR)
  })

  PVTrackPlayer.addEventListener('remote-jump-backward', () => {
    const { jumpBackwardsTime } = getGlobal()
    playerJumpBackward(jumpBackwardsTime)
  })

  PVTrackPlayer.addEventListener('remote-jump-forward', () => {
    const { jumpForwardsTime } = getGlobal()
    playerJumpForward(jumpForwardsTime)
  })

  PVTrackPlayer.addEventListener('remote-pause', () => {
    PVTrackPlayer.pause()
  })

  PVTrackPlayer.addEventListener('remote-play', () => {
    if (Platform.OS === 'ios') {
      /*
          "you must also use pause() then re-trigger the rate setRate()
          and then call play() again in order to get
          the Notification Player and UI Player to sync up, 
          otherwise the Notification Player resets its rate to 1x.
          It seems to me like pause MUST be called to trigger the
          "remote/notification" state when updating the rate in the UI."
          
          https://github.com/DoubleSymmetry/react-native-track-player/issues/1104
      */
      PVTrackPlayer.pause()
    }

    handlePlay()
  })

  PVTrackPlayer.addEventListener('remote-seek', (data) => {
    if (data.position || data.position >= 0) {
      PVTrackPlayer.seekTo(Math.floor(data.position))
    }
  })

  PVTrackPlayer.addEventListener('remote-stop', () => {
    PVTrackPlayer.pause()
    PVEventEmitter.emit(PV.Events.PLAYER_REMOTE_STOP)
  })

  PVTrackPlayer.addEventListener('remote-previous', () => {
    playPreviousChapterOrReturnToBeginningOfTrack()
  })

  PVTrackPlayer.addEventListener('remote-next', () => {
    playNextChapterOrQueueItem()
  })

  PVTrackPlayer.addEventListener('remote-duck', (x: any) => {
    (async () => {
      const { paused, permanent } = x

      // This remote-duck behavior for some Android users was causing playback to resume
      // after receiving any notification, even when the player was paused.
      if (Platform.OS === 'ios') {
        // iOS triggers remote-duck with permanent: true when the player app returns to foreground,
        // but only in case the track was paused before app going to background,
        // so we need to check if the track is playing before making it stop or pause
        // as a result of remote-duck.
        // Thanks to nesinervink and bakkerjoeri for help resolving this issue:
        // https://github.com/react-native-kit/react-native-track-player/issues/687#issuecomment-660149163
        const currentState = await PVTrackPlayer.getState()
        const isPlaying = currentState === RNTPState.Playing
        if (permanent && isPlaying) {
          PVTrackPlayer.stop()
        } else if (paused) {
          PVTrackPlayer.pause()
        } else if (!permanent) {
          handlePlay()
        }
      } 
      
      // else if (Platform.OS === 'android') {
      //   if (permanent) {
      //     PVTrackPlayer.stop()
      //   } else if (paused) {
      //     PVTrackPlayer.pause()
      //   } else if (!permanent) {
      //     PVTrackPlayer.play()
      //   }
      // }

      /* Always save the user playback position whenever the remote-duck event happens.
         I'm not sure if playback-state gets called whenever remote-duck gets called,
         so it's possible we are calling updateUserPlaybackPosition more times than necessary. */
      await updateUserPlaybackPosition()
    })()
  })
}

/*
  HANDLE CLIP END TIME INTERVAL
*/

const startCheckClipEndTime = async () => {
  const nowPlayingItem = await getNowPlayingItemLocally()

  if (nowPlayingItem) {
    const { clipEndTime, clipId } = nowPlayingItem
    if (clipId && clipEndTime) {
      await setClipHasEnded(false)
      startBackgroundTimer()
    }
  }
}

const stopBackgroundTimerIfShouldBeStopped = async (
  checkClipEndTimeShouldStop: boolean,
  streamingValueShouldStop: boolean
) => {
  const globalState = getGlobal()
  const nowPlayingItem = await getNowPlayingItemLocally()

  if (!checkClipEndTimeShouldStop && nowPlayingItem?.clipEndTime) {
    const clipHasEnded = await getClipHasEnded()
    if (clipHasEnded) {
      checkClipEndTimeShouldStop = true
    }
  }

  const { streamingEnabled } = globalState.session.valueTagSettings
  if (!streamingValueShouldStop && !streamingEnabled) {
    streamingValueShouldStop = true
  }

  if (checkClipEndTimeShouldStop && streamingValueShouldStop) {
    stopBackgroundTimer()
  }
}

const stopCheckClipIfEndTimeReached = () => {
  (async () => {
    const nowPlayingItem = await getNowPlayingItemLocally()
    if (nowPlayingItem) {
      const { clipEndTime } = nowPlayingItem
      const currentPosition = await PVTrackPlayer.getTrackPosition()
      if (currentPosition > clipEndTime) {
        PVTrackPlayer.pause()
        await setClipHasEnded(true)
      }
    }
    const checkClipEndTimeStopped = false
    const streamingValueStopped = false
    stopBackgroundTimerIfShouldBeStopped(checkClipEndTimeStopped, streamingValueStopped)
  })()
}

const debouncedHandlePlayerClipLoaded = debounce(startCheckClipEndTime, 1000)
// eslint-disable-next-line @typescript-eslint/no-misused-promises
PVEventEmitter.on(PV.Events.PLAYER_CLIP_LOADED, debouncedHandlePlayerClipLoaded)

/*
  HANDLE VALUE STREAMING TOGGLE
*/

const handleValueStreamingToggle = () => {
  const globalState = getGlobal()
  const { streamingEnabled } = globalState.session.valueTagSettings

  if (streamingEnabled) {
    startBackgroundTimer()
  } else {
    const checkClipEndTimeShouldStop = false
    const streamingValueShouldStop = true
    stopBackgroundTimerIfShouldBeStopped(checkClipEndTimeShouldStop, streamingValueShouldStop)
  }
}

const handleValueStreamingMinutePassed = async () => {
  const globalState = getGlobal()
  const { podcastValueFinal } = globalState
  const { nowPlayingItem } = globalState.player
  const { streamingAmount } = globalState.session?.valueTagSettings?.lightningNetwork?.lnpay?.globalSettings || {}
  const valueTag = podcastValueFinal || nowPlayingItem.episodeValue || nowPlayingItem.podcastValue

  if (valueTag) {
    await saveStreamingValueTransactionsToTransactionQueue(
      valueTag,
      nowPlayingItem,
      streamingAmount
    )
  }
}

PVEventEmitter.on(PV.Events.PLAYER_VALUE_STREAMING_TOGGLED, handleValueStreamingToggle)

/*
  BACKGROUND TIMER
*/

const startBackgroundTimer = () => {
  stopBackgroundTimer()
  BackgroundTimer.runBackgroundTimer(handleBackgroundTimerInterval, 1000)
}

const stopBackgroundTimer = () => {
  BackgroundTimer.stopBackgroundTimer()
}

let valueStreamingIntervalSecondCount = 1
const handleBackgroundTimerInterval = () => {
  stopCheckClipIfEndTimeReached()

  PVTrackPlayer.getState().then(async (playbackState) => {
    const globalState = getGlobal()
    const { streamingEnabled } = globalState.session.valueTagSettings

    if (streamingEnabled) {
      if (playbackStateIsPlaying(playbackState)) {
        valueStreamingIntervalSecondCount++

        if (
          valueStreamingIntervalSecondCount
          && valueStreamingIntervalSecondCount % 60 === 0) {        
          await handleValueStreamingMinutePassed()
        }
      }
      
      if (valueStreamingIntervalSecondCount === 600) {
        valueStreamingIntervalSecondCount = 1;
        (async () => {
          const { errors, transactions, totalAmount } = await processValueTransactionQueue()
          if (transactions.length > 0 && totalAmount > 0) {
            setGlobal({
              bannerInfo: {
                show: true,
                description: translate('Streaming Value Sent'),
                errors,
                transactions,
                totalAmount
              }
            })
          }
        })()
      }
    }
  })
}

const playbackStateIsPlaying = (playbackState: string | number) => {
  let isPlaying = false

  if (Platform.OS === 'ios') {
    if (playbackState === RNTPState.Playing) {
      isPlaying = true
    }
  } else if (Platform.OS === 'android') {
    const playing = 3
    if (playbackState === playing) {
      isPlaying = true
    }
  }

  return isPlaying
}
