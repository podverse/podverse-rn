import debounce from 'lodash/debounce'
import { NowPlayingItem } from 'podverse-shared'
import { Platform } from 'react-native'
import BackgroundTimer from 'react-native-background-timer'
import { PV } from '../resources'
import { clearNowPlayingItem, hideMiniPlayer, setNowPlayingItem } from '../state/actions/player'
import { addOrUpdateHistoryItem, checkIfPlayingFromHistory, updateHistoryItemPlaybackPosition } from './history'
import {
  getClipHasEnded,
  getNowPlayingItem,
  getNowPlayingItemFromQueueOrHistoryByTrackId,
  getPlaybackSpeed,
  handleResumeAfterClipHasEnded,
  playerJumpBackward,
  playerJumpForward,
  PVTrackPlayer,
  setClipHasEnded,
  setPlaybackPosition,
  setPlaybackPositionWhenDurationIsAvailable,
  updateUserPlaybackPosition
} from './player'
import PlayerEventEmitter from './playerEventEmitter'
const debouncedSetPlaybackPosition = debounce(setPlaybackPositionWhenDurationIsAvailable, 1000, {
  leading: true,
  trailing: false
})

// NOTE: Disabled the interval handling below because it caused async loading problems...
// NOTE: Sometimes when there is poor internet connectivity, the addOrUpdateHistoryItem request will fail.
// This will result in the current item mising from the user's history, and the next time they open
// the app, it will load with an old history item instead of the last one they were listening to.
// To prevent this, we are repeatedly calling the addOrUpdateHistoryItem method on an interval until
// it succeeds. When a new item loads, it should clear out the previous interval.
// addOrUpdateHistoryItem is also called in handleNetworkChange in App.jsx on connection to wifi and cellular,
// since it is possible that this interval succeeds locally when their is no internet connection,
// and never calls to sync with the server.
// handleAddOrUpdateRequestInterval uses the BackgroundTimer so that the code will continue to be called
// while the app is in the background.

// NOTE: iOS does not run while the screen is locked and the display is off.
// This seems to be a limitation that cannot be worked around, aside from a geolocation API based work-around...
let addOrUpdateHistoryItemSucceeded = false
let addOrUpdateInterval = null as any
let intervalCount = 0
const handleAddOrUpdateRequestInterval = (nowPlayingItem: any) => {
  if (addOrUpdateInterval) clearInterval(addOrUpdateInterval)
  if (!nowPlayingItem) return

  const attemptAddOrUpdateHistoryItem = async () => {
    intervalCount = intervalCount + 1
    if (intervalCount >= 5) {
      clearInterval(addOrUpdateInterval)
      addOrUpdateHistoryItemSucceeded = false
      intervalCount = 0
    } else if (!addOrUpdateHistoryItemSucceeded) {
      try {
        addOrUpdateHistoryItemSucceeded = true
        await addOrUpdateHistoryItem(nowPlayingItem)
        await updateUserPlaybackPosition(nowPlayingItem)
        clearInterval(addOrUpdateInterval)
        intervalCount = 0
      } catch (error) {
        addOrUpdateHistoryItemSucceeded = false
        console.log(error)
      }
    }
  }

  addOrUpdateInterval = setInterval(() => {
    attemptAddOrUpdateHistoryItem()
  }, 30000)
}

const handleSyncNowPlayingItem = async (trackId: string, currentNowPlayingItem: NowPlayingItem) => {
  if (!currentNowPlayingItem) return

  await setNowPlayingItem(currentNowPlayingItem)

  if (currentNowPlayingItem && currentNowPlayingItem.clipId) {
    PlayerEventEmitter.emit(PV.Events.PLAYER_CLIP_LOADED)
  }
  if (!currentNowPlayingItem.clipId && currentNowPlayingItem.userPlaybackPosition) {
    debouncedSetPlaybackPosition(currentNowPlayingItem.userPlaybackPosition, trackId)
  }

  const isPlayingFromHistory = await checkIfPlayingFromHistory()
  if (!isPlayingFromHistory && currentNowPlayingItem) {
    handleAddOrUpdateRequestInterval(currentNowPlayingItem)
  }

  PlayerEventEmitter.emit(PV.Events.PLAYER_TRACK_CHANGED)
}

const syncNowPlayingItemWithTrack = async () => {
  // The first setTimeout is an attempt to prevent the following:
  // - Sometimes clips start playing from the beginning of the episode, instead of the start of the clip.
  // - Sometimes the debouncedSetPlaybackPosition seems to load with the previous track's playback position,
  // instead of the new track's playback position.
  // NOTE: This timeout will lead to a delay before every clip starts, where it starts playing from the episode start
  // before playing from the clip start. Hopefully we can iron this out sometime...
  // - The second timeout is called in case something was out of sync previously from getCurrentTrack
  // or getNowPlayingItemFromQueueOrHistoryByTrackId...
  async function sync() {
    const currentTrackId = await PVTrackPlayer.getCurrentTrack()
    const currentNowPlayingItem = await getNowPlayingItemFromQueueOrHistoryByTrackId(currentTrackId)
    if (currentNowPlayingItem) {
      await handleSyncNowPlayingItem(currentTrackId, currentNowPlayingItem)
    }
  }

  setTimeout(sync, 1000)
}

const handleQueueEnded = async (x) => {
  setTimeout(async () => {
    hideMiniPlayer()

    if (x && x.track) {
      const currentNowPlayingItem = await getNowPlayingItemFromQueueOrHistoryByTrackId(x.track)
      if (currentNowPlayingItem) {
        currentNowPlayingItem.userPlaybackPosition = 0
        await updateHistoryItemPlaybackPosition(currentNowPlayingItem)
      }
    }

    // Don't call reset on Android because it triggers the playback-queue-ended event
    // and will cause an infinite loop
    if (Platform.OS === 'ios') {
      PVTrackPlayer.reset()
    }
  }, 0)
}

module.exports = async () => {
  PVTrackPlayer.addEventListener('playback-error', (x) => console.log('playback error', x))

  // NOTE: TrackPlayer.reset will call the playback-queue-ended event on Android!!!
  PVTrackPlayer.addEventListener('playback-queue-ended', async (x) => {
    console.log('playback-queue-ended', x)
    await syncNowPlayingItemWithTrack()
    handleQueueEnded(x)
  })

  PVTrackPlayer.addEventListener('playback-state', async (x) => {
    console.log('playback-state', x)

    PlayerEventEmitter.emit(PV.Events.PLAYER_STATE_CHANGED)

    const clipHasEnded = await getClipHasEnded()
    const nowPlayingItem = await getNowPlayingItem()

    if (nowPlayingItem) {
      const { clipEndTime } = nowPlayingItem
      const currentPosition = await PVTrackPlayer.getPosition()
      const currentState = await PVTrackPlayer.getState()
      const isPlaying = currentState === PVTrackPlayer.STATE_PLAYING

      if (clipHasEnded && clipEndTime && currentPosition >= clipEndTime && isPlaying) {
        await handleResumeAfterClipHasEnded()
      }

      if (Platform.OS === 'ios') {
        if (x.state === 'paused') {
          await updateUserPlaybackPosition(nowPlayingItem)
        } else if (x.state === 'playing') {
          await updateUserPlaybackPosition(nowPlayingItem)
          const rate = await getPlaybackSpeed()
          PVTrackPlayer.setRate(rate)
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
        if ((x.state === 2 && currentPosition > 3) || x.state === 3) {
          await updateUserPlaybackPosition(nowPlayingItem)
        }

        if (x.state === 3) {
          const rate = await getPlaybackSpeed()
          PVTrackPlayer.setRate(rate)
        }
      }
    }
  })

  PVTrackPlayer.addEventListener('playback-track-changed', async (x: any) => {
    console.log('playback-track-changed', x)
    syncNowPlayingItemWithTrack()
  })

  PVTrackPlayer.addEventListener('playback-error', (x: any) => {
    console.log('playback-error', x)
    // TODO: post error to our logs!
    PlayerEventEmitter.emit(PV.Events.PLAYER_PLAYBACK_ERROR)
  })

  PVTrackPlayer.addEventListener('remote-jump-backward', () => playerJumpBackward(PV.Player.jumpSeconds))

  PVTrackPlayer.addEventListener('remote-jump-forward', () => playerJumpForward(PV.Player.jumpSeconds))

  PVTrackPlayer.addEventListener('remote-pause', async () => {
    PVTrackPlayer.pause()
    PlayerEventEmitter.emit(PV.Events.PLAYER_REMOTE_PAUSE)
    await updateUserPlaybackPosition()
  })

  PVTrackPlayer.addEventListener('remote-play', async () => {
    PVTrackPlayer.play()
    PlayerEventEmitter.emit(PV.Events.PLAYER_REMOTE_PLAY)
    await updateUserPlaybackPosition()
  })

  PVTrackPlayer.addEventListener('remote-seek', async (data) => {
    if (data.position || data.position >= 0) {
      PVTrackPlayer.seekTo(Math.floor(data.position))
    }
  })

  PVTrackPlayer.addEventListener('remote-stop', () => {
    PVTrackPlayer.pause()
    PlayerEventEmitter.emit(PV.Events.PLAYER_REMOTE_STOP)
  })

  PVTrackPlayer.addEventListener('remote-duck', async (x: any) => {
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
  })
}

let handleClipEndInterval = null as any
// Background timer handling from
// https://github.com/ocetnik/react-native-background-timer/issues/122
const handlePlayerClipLoaded = async () => {
  console.log('PLAYER_CLIP_LOADED event')

  const stopHandleClipEndInterval = async () => {
    if (Platform.OS === 'android') {
      BackgroundTimer.stopBackgroundTimer()
    }
    if (handleClipEndInterval) {
      BackgroundTimer.clearInterval(handleClipEndInterval)
    }
    BackgroundTimer.stop()
  }

  await stopHandleClipEndInterval()

  const nowPlayingItem = await getNowPlayingItem()
  if (nowPlayingItem) {
    const { clipEndTime, clipId } = nowPlayingItem

    const checkEndTime = async () => {
      const currentPosition = await PVTrackPlayer.getPosition()
      if (currentPosition > clipEndTime) {
        PVTrackPlayer.pause()
        await setClipHasEnded(true)
        stopHandleClipEndInterval()
      }
    }

    if (clipId && clipEndTime) {
      if (Platform.OS === 'android') {
        BackgroundTimer.runBackgroundTimer(checkEndTime, 500)
      } else {
        await BackgroundTimer.start()
        handleClipEndInterval = BackgroundTimer.setInterval(checkEndTime, 500)
      }
    }
    const resolveImmediately = true
    await debouncedSetPlaybackPosition(nowPlayingItem.clipStartTime, nowPlayingItem.clipId, resolveImmediately)
  }
}

const debouncedHandlePlayerClipLoaded = debounce(handlePlayerClipLoaded, 1000)

PlayerEventEmitter.on(PV.Events.PLAYER_CLIP_LOADED, debouncedHandlePlayerClipLoaded)
