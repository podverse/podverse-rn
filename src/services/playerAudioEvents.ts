import AsyncStorage from '@react-native-community/async-storage'
import { Platform } from 'react-native'
import { Event, State } from 'react-native-track-player'
import { getGlobal } from 'reactn'
import { cleanVoiceCommandQuery, voicePlayNextQueuedItem, voicePlayNextSubscribedPodcast,
  voicePlayNowPlayingItem, voicePlayPodcastFromSearchAPI } from '../lib/voiceCommandHelpers'
import { debugLogger, errorLogger } from '../lib/logger'
import { PV } from '../resources'
import { downloadedEpisodeMarkForDeletion } from '../state/actions/downloads'
import {
  playerClearNowPlayingItem,
  playerHandlePlayWithUpdate,
  playerHandleResumeAfterClipHasEnded,
  playerPlayNextChapterOrQueueItem,
  playerPlayPreviousChapterOrReturnToBeginningOfTrack
} from '../state/actions/player'
import { handleAABrowseMediaId, handlePlayRemoteMediaId } from '../lib/carplay/PVCarPlay.android'
import PVEventEmitter from './eventEmitter'
import {
  getClipHasEnded,
  getPlaybackSpeed,
  getRemoteSkipButtonsTimeJumpOverride,
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
  audioGetTrackDuration,
  audioRemovePreviousPrimaryQueueItemTracks
} from './playerAudio'
import { debouncedHandleBackgroundTimerInterval, syncAudioNowPlayingItemWithTrack } from './playerBackgroundTimer'
import { addOrUpdateHistoryItem, getHistoryItemEpisodeFromIndexLocally } from './userHistoryItem'
import { getEnrichedNowPlayingItemFromLocalStorage, getNowPlayingItemLocally } from './userNowPlayingItem'

const _fileName = 'src/services/playerAudioEvents.ts'

const audioResetHistoryItemByTrack = async (x: any, position: number) => {
  if (x?.lastTrack?.id) {
    const metaEpisode = await getHistoryItemEpisodeFromIndexLocally(x.lastTrack.id)
    if (metaEpisode) {
      const { mediaFileDuration } = metaEpisode
      const isWithin2MinutesOfEnd = mediaFileDuration && mediaFileDuration - 120 < position
      const isLessThanOneMinute = mediaFileDuration <= 60
      if (isWithin2MinutesOfEnd || isLessThanOneMinute) {
        const currentNowPlayingItem = await getEnrichedNowPlayingItemFromLocalStorage(x.lastTrack.id)
        if (currentNowPlayingItem) {
          const autoDeleteEpisodeOnEnd = await AsyncStorage.getItem(PV.Keys.AUTO_DELETE_EPISODE_ON_END)
          if (autoDeleteEpisodeOnEnd && currentNowPlayingItem?.episodeId) {
            downloadedEpisodeMarkForDeletion(currentNowPlayingItem.episodeId)
          }
  
          const retriesLimit = 5
          for (let i = 0; i < retriesLimit; i++) {
            try {
              const forceUpdateOrderDate = false
              const skipSetNowPlaying = true
              const completed = true
              await addOrUpdateHistoryItem(
                currentNowPlayingItem,
                0,
                null,
                forceUpdateOrderDate,
                skipSetNowPlaying,
                completed
              )
              break
            } catch (error) {
              // Maybe the network request failed due to poor internet.
              // continue to try again.
              continue
            }
          }
        }
      }
    }
  }

}

export const audioResetHistoryItemActiveTrackChanged = async (x: any) => {
  const { lastPosition, lastTrack } = x
  if (lastTrack?.id) {
    await audioResetHistoryItemByTrack(x, lastPosition)
  }
}

export const audioResetHistoryItemQueueEnded = async (x: any) => {
  const { position, track } = x
  if (track?.id) {
    await audioResetHistoryItemByTrack(x, position)
  }
}

const syncDurationWithMetaData = async () => {
  /*
    We need to set the duration to the native player after it is available
    in order for the lock screen / notification to render a progress bar on Android.
    Not sure if it makes a difference for iOS.
  */
  const trackIndex = await PVAudioPlayer.getActiveTrackIndex()
  if (trackIndex || trackIndex === 0) {
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
  setTimeout(() => {
    ;(async () => {
      PVEventEmitter.emit(PV.Events.PLAYER_DISMISS)
      await audioResetHistoryItemQueueEnded(x)
      await playerClearNowPlayingItem()

      // Clear the queue completely after queue ended
      await PVAudioPlayer.reset()
    })()
  }, 0)
}

export const audioHandleActiveTrackChanged = (x: any) => {
  setTimeout(() => {
    ;(async () => {
      await audioResetHistoryItemActiveTrackChanged(x)
      await audioRemovePreviousPrimaryQueueItemTracks()
    })()
  }, 0)
}

let preventQueueEnded = false

// eslint-disable-next-line @typescript-eslint/require-await
module.exports = async () => {
  PVAudioPlayer.addEventListener(Event.PlaybackMetadataReceived, (x) => {
    debugLogger('playback-metadata-received', x)
  })

  /*
    playback-active-track-changed always gets called when playback-queue-ended.
    As a result, if we use both events, there will be a race-condition with our
    playback-track-changed and playback-queue-ended handling. To work around this,
    I am determining if the "queue ended" event that we care about has happened
    from within the playback-active-track-changed event listener.
    Also: there is a bug on iOS where playback-queue-ended will fire even when
    there is a next item in the queue...but playback-queue-ended will also fire
    correctly (without PlaybackActiveTrackChanged) when end of queue is reached.
    Handling this with setTimeouts.
  */
  PVAudioPlayer.addEventListener(Event.PlaybackQueueEnded, (x) => {
    debugLogger('playback-queue-ended', x)
    if (Platform.OS === 'ios') {
      setTimeout(() => {
        if (!preventQueueEnded) {
          audioHandleQueueEnded(x)
        }
      }, 3000)
    }
  })

  PVAudioPlayer.addEventListener(Event.PlaybackActiveTrackChanged, (x: any) => {
    debugLogger('playback-active-track-changed', x)

    const callback = () => {
      audioHandleActiveTrackChanged(x)
    }

    const track = x?.track

    if (Platform.OS === 'ios') {
      preventQueueEnded = true
      setTimeout(() => {
        preventQueueEnded = false
      }, 6000)
      // If the first item loaded in queue for the app session, then don't call the track changed callback.
      if ((x.index || x.index === 0) && !x?.lastIndex && x?.lastIndex !== 0) {
        syncAudioNowPlayingItemWithTrack(track)
      } else {
        syncAudioNowPlayingItemWithTrack(track, callback)
      }
    } else if (Platform.OS === 'android') {
      if ((x.index || x.index === 0) && x.index === x?.lastIndex) {
        audioHandleQueueEnded(x)
      }
      // If the first item loaded in queue for the app session, then don't call the track changed callback.
      else if ((x.index || x.index === 0) && !x?.lastIndex && x?.lastIndex !== 0) {
        syncAudioNowPlayingItemWithTrack(track)
      } else {
        syncAudioNowPlayingItemWithTrack(track, callback)
      }
    }

    PVEventEmitter.emit(PV.Events.PLAYER_NEW_EPISODE_LOADED)
  })

  PVAudioPlayer.addEventListener(Event.PlaybackState, (x) => {
    ;(async () => {
      debugLogger('playback-state', x)

      // // Force global state to appear as playing since we expect it to play quickly,
      // // then update state 1 second to render buffering state if still buffering.
      // if (x.state === State.Buffering) {
      //   PVEventEmitter.emit(PV.Events.PLAYER_STATE_BUFFERING)
      // } else {
      PVEventEmitter.emit(PV.Events.PLAYER_STATE_CHANGED)
      // }

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
            /* Do not listen for State.Stopped. See audioLoadNowPlayingItem for more. */
            if (x.state === State.Paused) {
              const skipSetNowPlaying = true
              playerUpdateUserPlaybackPosition(skipSetNowPlaying)
            } else if (audioCheckIfIsPlaying(x.state)) {
              await playerSetRateWithLatestPlaybackSpeed()
            } else if (x.state === State.Ready) {
              syncDurationWithMetaData()
            }
          } else if (Platform.OS === 'android') {
            /* Do not listen for State.Stopped. See audioLoadNowPlayingItem for more. */
            if (x.state === State.Paused) {
              const skipSetNowPlaying = true
              playerUpdateUserPlaybackPosition(skipSetNowPlaying)
            } else if (x.state === State.Playing) {
              const rate = await getPlaybackSpeed()
              PVAudioPlayer.setRate(rate)
            } else if (x.state === State.Ready) {
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
    ;(async () => {
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

  PVAudioPlayer.addEventListener(Event.PlaybackProgressUpdated, () => {
    // debugLogger('playback-progress-updated', x)
    const isVideo = false
    debouncedHandleBackgroundTimerInterval(isVideo)
  })

  // Android Auto Handlers
  if (Platform.OS === 'android') {
    PVAudioPlayer.addEventListener(Event.RemotePlayId, (e) => {
      handlePlayRemoteMediaId(e.id)
    })
    PVAudioPlayer.addEventListener(Event.RemoteSkip, (e) => {
      PVAudioPlayer.skip(e.index).then(() => PVAudioPlayer.play())
    })
    PVAudioPlayer.addEventListener(Event.RemoteBrowse, (e) => {
      handleAABrowseMediaId(e.mediaId)
    })
    PVAudioPlayer.addEventListener(Event.RemotePlaySearch, (e) => {
      /*
        Sample event
        {
          "android.intent.extra.focus": "vnd.android.cursor.item/*",
          "com.google.android.projection.gearhead.ignore_original_pkg": false,
          "android.intent.extra.REFERRER_NAME":
            "android-app://com.google.android.googlequicksearchbox/https/www.google.com",
          "query": "Linux Unplugged in podverse",
          "android.intent.extra.START_PLAYBACK": true,
          "INTENT_EXTRA_INTENT_PKG_SENDER": "aap/com.google.android.googlequicksearchbox",
          "opa_allow_launch_intent_on_lockscreen": true
        }
      */

      /*
        the remote search command basically works like this:
        1) no query, just play
        2) query, check if the nowPlayingItem.podcastTitle matches the query, and if found, play it
        3) query, search queue for a podcast title in the queue that includes that query, and if found, play the first match
        4) query, search subscribed podcasts for a podcast title that includes that query, and if found, play the first match
        5) query, search Podverse API for a podcast title that includes that query, and if found, play the first match
      */

      console.log('Event.RemotePlaySearch', e)

      ;(async () => {
        const shouldPlay = e?.['android.intent.extra.START_PLAYBACK']
  
        if (!shouldPlay) {
          return
        }
  
        const cleanedQuery = cleanVoiceCommandQuery(e?.query)
  
        if (!cleanedQuery) {
          playerHandlePlayWithUpdate()
          return
        }
  
        let shouldContinue = true

        shouldContinue = voicePlayNowPlayingItem(cleanedQuery)

        if (shouldContinue) {
          shouldContinue = await voicePlayNextQueuedItem(cleanedQuery)
        }

        if (shouldContinue) {
          shouldContinue = await voicePlayNextSubscribedPodcast(cleanedQuery)
        }

        if (shouldContinue) {
          shouldContinue = await voicePlayPodcastFromSearchAPI(cleanedQuery)
        }
      })()
    })

    // TODO: handle skip next/previous via customActions in android auto
    PVAudioPlayer.addEventListener(Event.RemoteCustomAction, (e) => {
      console.log('Event.RemoteCustomAction', e)
      switch (e.customAction) {
        case 'customSkipPrev':
          playerPlayPreviousChapterOrReturnToBeginningOfTrack()
          break
        case 'customSkipNext':
          playerPlayNextChapterOrQueueItem()
          break
        case 'customJumpForward':
          const { jumpBackwardsTime } = getGlobal()
          audioJumpBackward(jumpBackwardsTime)
          break
        case 'customJumpBackward':
          const { jumpForwardsTime } = getGlobal()
          audioJumpForward(jumpForwardsTime)
          break
        default:
          break
      }
    })
  }
}
