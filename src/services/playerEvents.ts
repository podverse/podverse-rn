import debounce from 'lodash/debounce'
import { NowPlayingItem } from 'podverse-shared'
import { Platform } from 'react-native'
import BackgroundTimer from 'react-native-background-timer'
import { PV } from '../resources'
import { hideMiniPlayer, updatePlaybackState } from '../state/actions/player'
import { clearChapterPlaybackInfo } from '../state/actions/playerChapters'
import PVEventEmitter from './eventEmitter'
import {
  getClipHasEnded,
  getNowPlayingItemFromQueueOrHistoryOrDownloadedByTrackId,
  getPlaybackSpeed,
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

const debouncedSetPlaybackPosition = debounce(setPlaybackPositionWhenDurationIsAvailable, 1000, {
  leading: true,
  trailing: false
})

const handleSyncNowPlayingItem = async (trackId: string, currentNowPlayingItem: NowPlayingItem) => {
  if (!currentNowPlayingItem) return

  await setNowPlayingItemLocally(currentNowPlayingItem, currentNowPlayingItem.userPlaybackPosition || 0)

  if (currentNowPlayingItem && currentNowPlayingItem.clipId && !currentNowPlayingItem.clipIsOfficialChapter) {
    PVEventEmitter.emit(PV.Events.PLAYER_CLIP_LOADED)
  }

  if (currentNowPlayingItem && currentNowPlayingItem.clipId) {
    debouncedSetPlaybackPosition(currentNowPlayingItem.clipStartTime || 0)
  } else if (!currentNowPlayingItem.clipId && currentNowPlayingItem.userPlaybackPosition) {
    debouncedSetPlaybackPosition(currentNowPlayingItem.userPlaybackPosition, trackId)
  }

  PVEventEmitter.emit(PV.Events.PLAYER_TRACK_CHANGED)

  // Call updateUserPlaybackPosition to make sure the current item is saved as the userNowPlayingItem
  updateUserPlaybackPosition()
}

const syncNowPlayingItemWithTrack = () => {
  // If the clipEndInterval is already running, stop it before the clip is
  // reloaded in the handleSyncNowPlayingItem function.
  stopHandleClipEndInterval()

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
      const currentTrackId = await PVTrackPlayer.getCurrentLoadedTrack()
      const currentNowPlayingItem = await getNowPlayingItemFromQueueOrHistoryOrDownloadedByTrackId(currentTrackId)
      if (currentNowPlayingItem) {
        await handleSyncNowPlayingItem(currentTrackId, currentNowPlayingItem)
      }
    })()
  }

  setTimeout(sync, 1000)
}

const resetHistoryItem = async (x: any) => {
  const { position, track } = x
  const metaEpisode = await getHistoryItemEpisodeFromIndexLocally(track)
  if (metaEpisode) {
    const { mediaFileDuration } = metaEpisode
    if (mediaFileDuration > 59 && mediaFileDuration - 59 < position) {
      const currentNowPlayingItem = await getNowPlayingItemFromQueueOrHistoryOrDownloadedByTrackId(x.track)
      if (currentNowPlayingItem) {
        const forceUpdateOrderDate = false
        await addOrUpdateHistoryItem(currentNowPlayingItem, 0, null, forceUpdateOrderDate)
      }
    }
  }
}

const handleQueueEnded = (x: any) => {
  setTimeout(() => {
    (async () => {
      hideMiniPlayer()
      await resetHistoryItem(x)

      // Don't call reset on Android because it triggers the playback-queue-ended event
      // and will cause an infinite loop
      if (Platform.OS === 'ios') {
        PVTrackPlayer.reset()
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
    clearChapterPlaybackInfo()
    syncNowPlayingItemWithTrack()
    handleTrackEnded(x)
  })

  // NOTE: TrackPlayer.reset will call the playback-queue-ended event on Android!!!
  PVTrackPlayer.addEventListener('playback-queue-ended', (x) => {
    console.log('playback-queue-ended', x)
    clearChapterPlaybackInfo()
    syncNowPlayingItemWithTrack()
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
        const isPlaying = currentState === PVTrackPlayer.STATE_PLAYING

        const shouldHandleAfterClip = clipHasEnded && clipEndTime && currentPosition >= clipEndTime && isPlaying
        if (shouldHandleAfterClip) {
          await handleResumeAfterClipHasEnded()
        } else {
          if (Platform.OS === 'ios') {
            if (x.state === PVTrackPlayer.STATE_PLAYING) {
              updateUserPlaybackPosition()
              await setRateWithLatestPlaybackSpeed()
            } else if (x.state === PVTrackPlayer.STATE_PAUSED || PVTrackPlayer.STATE_STOPPED) {
              updateUserPlaybackPosition()
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
              updateUserPlaybackPosition()
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
    playerJumpBackward(PV.Player.jumpSeconds)
  })

  PVTrackPlayer.addEventListener('remote-jump-forward', () => {
    playerJumpForward(PV.Player.jumpSeconds)
  })

  PVTrackPlayer.addEventListener('remote-pause', () => {
    (async () => {
      await setRateWithLatestPlaybackSpeed()
      PVTrackPlayer.pause()
      updateUserPlaybackPosition()
    })()
  })

  PVTrackPlayer.addEventListener('remote-play', () => {
    (async () => {
      await setRateWithLatestPlaybackSpeed()
      PVTrackPlayer.play()
      updateUserPlaybackPosition()
    })()
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
        const isPlaying = currentState === PVTrackPlayer.STATE_PLAYING
        if (permanent && isPlaying) {
          PVTrackPlayer.stop()
        } else if (paused) {
          PVTrackPlayer.pause()
        } else if (!permanent) {
          PVTrackPlayer.play()
        }
      }
    })()
  })
}

const stopHandleClipEndInterval = () => {
  if (Platform.OS === 'android') {
    BackgroundTimer.stopBackgroundTimer()
  }
  if (handleClipEndInterval) {
    BackgroundTimer.clearInterval(handleClipEndInterval)
  }
  BackgroundTimer.stop()
}

let handleClipEndInterval = null as any
// Background timer handling from
// https://github.com/ocetnik/react-native-background-timer/issues/122
const handlePlayerClipLoaded = () => {
  (async () => {
    console.log('PLAYER_CLIP_LOADED event')
    stopHandleClipEndInterval()

    const nowPlayingItem = await getNowPlayingItemLocally()

    if (nowPlayingItem) {
      const { clipEndTime, clipId } = nowPlayingItem

      const checkEndTime = () => {
        (async () => {
          const currentPosition = await PVTrackPlayer.getTrackPosition()
          if (currentPosition > clipEndTime) {
            PVTrackPlayer.pause()
            await setClipHasEnded(true)
            stopHandleClipEndInterval()
          }
        })()
      }

      if (clipId && clipEndTime) {
        if (Platform.OS === 'android') {
          BackgroundTimer.runBackgroundTimer(checkEndTime, 500)
        } else {
          await BackgroundTimer.start()
          handleClipEndInterval = BackgroundTimer.setInterval(checkEndTime, 500)
        }
      }
    }
  })()
}

const debouncedHandlePlayerClipLoaded = debounce(handlePlayerClipLoaded, 1000)

PVEventEmitter.on(PV.Events.PLAYER_CLIP_LOADED, debouncedHandlePlayerClipLoaded)
