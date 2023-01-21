import AsyncStorage from '@react-native-community/async-storage'
import { Platform } from 'react-native'
import { Event, State } from 'react-native-track-player'
import { getGlobal } from 'reactn'
import { debugLogger, errorLogger } from '../lib/logger'
import { PV } from '../resources'
import { downloadedEpisodeMarkForDeletion } from '../state/actions/downloads'
import {
  playerClearNowPlayingItem,
  playerPlayNextChapterOrQueueItem,
  playerPlayPreviousChapterOrReturnToBeginningOfTrack
} from '../state/actions/player'
import PVEventEmitter from './eventEmitter'
import {
  getClipHasEnded,
  getPlaybackSpeed,
  getRemoteSkipButtonsTimeJumpOverride,
  playerHandleResumeAfterClipHasEnded,
  playerSetRateWithLatestPlaybackSpeed,
  playerUpdateUserPlaybackPosition
} from './player'
import {
  PVAudioPlayer,
  audioJumpBackward,
  audioJumpForward,
  audioGetTrackPosition,
  audioHandlePauseWithUpdate,
  audioHandlePlayWithUpdate,
  audioHandleSeekToWithUpdate,
  audioGetState,
  audioCheckIfIsPlaying,
  audioGetLoadedTrackIdByIndex,
  audioGetTrackDuration
} from './playerAudio'
import { handleBackgroundTimerInterval, syncNowPlayingItemWithTrack } from './playerBackgroundTimer'
import { addOrUpdateHistoryItem, getHistoryItemEpisodeFromIndexLocally } from './userHistoryItem'
import { getNowPlayingItemFromLocalStorage, getNowPlayingItemLocally } from './userNowPlayingItem'

const _fileName = 'src/services/playerAudioEvents.ts'

export const audioResetHistoryItem = async (x: any) => {
  const { position, track } = x
  const loadedTrackId = await audioGetLoadedTrackIdByIndex(track)
  const metaEpisode = await getHistoryItemEpisodeFromIndexLocally(loadedTrackId)
  if (metaEpisode) {
    const { mediaFileDuration } = metaEpisode
    if ((mediaFileDuration > 59 && mediaFileDuration - 59 < position) || !mediaFileDuration) {
      const setPlayerClipIsLoadedIfClip = false
      const currentNowPlayingItem = await getNowPlayingItemFromLocalStorage(loadedTrackId, setPlayerClipIsLoadedIfClip)
      if (currentNowPlayingItem) {
        const autoDeleteEpisodeOnEnd = await AsyncStorage.getItem(PV.Keys.AUTO_DELETE_EPISODE_ON_END)
        if (autoDeleteEpisodeOnEnd && currentNowPlayingItem?.episodeId) {
          downloadedEpisodeMarkForDeletion(currentNowPlayingItem.episodeId)
        }

        const forceUpdateOrderDate = false
        const skipSetNowPlaying = true
        const completed = true
        await addOrUpdateHistoryItem(currentNowPlayingItem, 0, null, forceUpdateOrderDate, skipSetNowPlaying, completed)
      }
    }
  }
}

const syncDurationWithMetaData = async () => {
  /*
    We need to set the duration to the native player after it is available
    in order for the lock screen / notification to render a progress bar on Android.
    Not sure if it makes a difference for iOS.
  */
  const trackIndex = await PVAudioPlayer.getCurrentTrack()
  if (trackIndex >= 1 || trackIndex === 0) {
    const currentTrackMetaData = await PVAudioPlayer.getTrack(trackIndex)
    const metadataDuration = currentTrackMetaData?.duration
    if (!metadataDuration) {
      const newDuration = await audioGetTrackDuration()
      await PVAudioPlayer.updateMetadataForTrack(trackIndex, {
        ...currentTrackMetaData,
        duration: newDuration
      })
    }
  }
}

export const audioHandleQueueEnded = (x: any) => {
  /* TODO:
    There is a race condition between our logic with playback-track-changed
    and playback-queue-ended. Both events are called when the last item from the queue
    reaches the end...and playback-track-changed will cause the nowPlayingItem be assigned
    to state and storage during syncNowPlayingItemWithTrack.
    I'm working around this right now by using a setTimeout before handling the queue ended logic.
  */
  setTimeout(() => {
    (async () => {
      PVEventEmitter.emit(PV.Events.PLAYER_DISMISS)
      await playerClearNowPlayingItem()
    })()
  }, 0)
}

export const audioHandleTrackEnded = (x: any) => {
  setTimeout(() => {
    (async () => {
      await audioResetHistoryItem(x)
    })()
  }, 0)
}

// eslint-disable-next-line @typescript-eslint/require-await
module.exports = async () => {
  PVAudioPlayer.addEventListener(Event.PlaybackMetadataReceived, (x) => {
    debugLogger('playback-metadata-received', x)
  })

  /*
    playback-track-changed always gets called when playback-queue-ended.
    As a result, if we use both events, there will be a race-condition with our
    playback-track-changed and playback-queue-ended handling. To work around this,
    I am determining if the "queue ended" event that we care about has happened
    from within the playback-track-changed event listener.
  */

  PVAudioPlayer.addEventListener(Event.PlaybackQueueEnded, (x) => {
    debugLogger('playback-queue-ended', x)
    AsyncStorage.setItem(PV.Events.PLAYER_AUDIO_QUEUE_ENDED, 'TRUE')
  })

  PVAudioPlayer.addEventListener(Event.PlaybackTrackChanged, (x: any) => {
    (async () => {
      debugLogger('playback-track-changed', x)
      const prevent = await AsyncStorage.getItem(PV.Keys.PLAYER_PREVENT_END_OF_TRACK_HANDLING)
      if (!prevent) {
        const callback = async () => {
          const queueEnded = await AsyncStorage.getItem(PV.Events.PLAYER_AUDIO_QUEUE_ENDED)
          /* audioHandleQueueEnded will handle removing the nowPlayingItem */
          if (!!queueEnded) {
            await AsyncStorage.removeItem(PV.Events.PLAYER_AUDIO_QUEUE_ENDED)
            audioHandleQueueEnded(x)
          }
          /* audioHandleTrackEnded will reset the completed episode playbackPosition to 0 */
          audioHandleTrackEnded(x)
        }
        syncNowPlayingItemWithTrack(callback)
      }
    })()
  })

  PVAudioPlayer.addEventListener(Event.PlaybackState, (x) => {
    (async () => {
      debugLogger('playback-state', x)

      PVEventEmitter.emit(PV.Events.PLAYER_STATE_CHANGED)

      const [clipHasEnded, nowPlayingItem] = await Promise.all([getClipHasEnded(), getNowPlayingItemLocally()])

      if (nowPlayingItem) {
        const { clipEndTime } = nowPlayingItem
        const [currentPosition, currentState] = await Promise.all([audioGetTrackPosition(), audioGetState()])

        const isPlaying = audioCheckIfIsPlaying(currentState)

        const shouldHandleAfterClip = clipHasEnded && clipEndTime && currentPosition >= clipEndTime && isPlaying
        if (shouldHandleAfterClip) {
          await playerHandleResumeAfterClipHasEnded()
        } else {
          if (Platform.OS === 'ios') {
            if (x.state === State.Paused || x.state === State.Stopped) {
              playerUpdateUserPlaybackPosition()
            }

            if (audioCheckIfIsPlaying(x.state)) {
              await playerSetRateWithLatestPlaybackSpeed()
            }
            if (x.state === State.Ready) {
              syncDurationWithMetaData()
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
            const ready = 2
            const playing = 3
            if (x.state === playing) {
              const rate = await getPlaybackSpeed()
              PVAudioPlayer.setRate(rate)
            } else if (x.state === ready) {
              syncDurationWithMetaData()
            }
          }
        }
      }
    })()
  })

  PVAudioPlayer.addEventListener(Event.PlaybackError, (x: any) => {
    errorLogger(_fileName, 'playback-error', x)
    // TODO: post error to our logs!
    PVEventEmitter.emit(PV.Events.PLAYER_PLAYBACK_ERROR)
  })

  PVAudioPlayer.addEventListener(Event.RemoteJumpBackward, () => {
    const { jumpBackwardsTime } = getGlobal()
    audioJumpBackward(jumpBackwardsTime)
  })

  PVAudioPlayer.addEventListener(Event.RemoteJumpForward, () => {
    const { jumpForwardsTime } = getGlobal()
    audioJumpForward(jumpForwardsTime)
  })

  PVAudioPlayer.addEventListener(Event.RemotePause, () => {
    audioHandlePauseWithUpdate()
  })

  PVAudioPlayer.addEventListener(Event.RemotePlay, () => {
    audioHandlePlayWithUpdate()
  })

  PVAudioPlayer.addEventListener(Event.RemoteSeek, (data) => {
    if (data.position || data.position >= 0) {
      audioHandleSeekToWithUpdate(data.position)
    }
  })

  PVAudioPlayer.addEventListener(Event.RemoteStop, () => {
    audioHandlePauseWithUpdate()
  })

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  PVAudioPlayer.addEventListener(Event.RemotePrevious, async () => {
    const remoteSkipButtonsAreTimeJumps = await getRemoteSkipButtonsTimeJumpOverride()
    if (remoteSkipButtonsAreTimeJumps) {
      const { jumpBackwardsTime } = getGlobal()
      audioJumpBackward(jumpBackwardsTime)
    } else {
      playerPlayPreviousChapterOrReturnToBeginningOfTrack()
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  PVAudioPlayer.addEventListener(Event.RemoteNext, async () => {
    const remoteSkipButtonsAreTimeJumps = await getRemoteSkipButtonsTimeJumpOverride()
    if (remoteSkipButtonsAreTimeJumps) {
      const { jumpForwardsTime } = getGlobal()
      audioJumpForward(jumpForwardsTime)
    } else {
      playerPlayNextChapterOrQueueItem()
    }
  })

  /*
    iOS triggers remote-duck with permanent: true when the player app returns to foreground,
    but only in case where the track was paused before app going to background,
    so we need to check if the track is playing before making it stop or pause
    as a result of remote-duck.
    Thanks to nesinervink and bakkerjoeri for help resolving this issue:
    https://github.com/react-native-kit/react-native-track-player/issues/687#issuecomment-660149163

    See #1263 for wasPausedByDuck explanation:
    https://github.com/DoubleSymmetry/react-native-track-player/issues/1263

    alwaysPauseOnInterruption issues on Android:
    https://github.com/DoubleSymmetry/react-native-track-player/issues/1009
  */
  let wasPausedByDuck = false
  PVAudioPlayer.addEventListener(Event.RemoteDuck, (x: any) => {
    (async () => {
      debugLogger('remote-duck', x)
      const { paused, permanent } = x
      const currentState = await audioGetState()
      const isPlaying = audioCheckIfIsPlaying(currentState)

      if (Platform.OS === 'ios') {
        if (permanent && isPlaying) {
          audioHandlePauseWithUpdate()
        } else if (isPlaying && paused) {
          wasPausedByDuck = true
          audioHandlePauseWithUpdate()
        } else if ((!permanent && wasPausedByDuck) || !paused) {
          wasPausedByDuck = false
          audioHandlePlayWithUpdate()
        }
      } else {
        if (permanent && isPlaying) {
          audioHandlePauseWithUpdate()
        } else if (isPlaying && paused) {
          wasPausedByDuck = true
          audioHandlePauseWithUpdate()
        } else if (!permanent && wasPausedByDuck) {
          wasPausedByDuck = false
          audioHandlePlayWithUpdate()
        }
      }
    })()
  })

  PVAudioPlayer.addEventListener(Event.PlaybackProgressUpdated, (x: any) => {
    // debugLogger('playback-progress-updated', x)
    handleBackgroundTimerInterval()
  })
}
