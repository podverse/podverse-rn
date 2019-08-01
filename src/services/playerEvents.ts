import AsyncStorage from '@react-native-community/async-storage'
import { hasValidNetworkConnection } from '../lib/network'
import { PV } from '../resources'
import { getBearerToken } from './auth'
import { addOrUpdateHistoryItem } from './history'
import { clearNowPlayingItem ,getClipHasEnded, getContinuousPlaybackMode, getNowPlayingItem,
  handleResumeAfterClipHasEnded, playerJumpBackward, playerJumpForward, playLastFromHistory,
  playNextFromQueue, PVTrackPlayer, setClipHasEnded, setPlaybackPosition } from './player'
import PlayerEventEmitter from './playerEventEmitter'
import { getQueueItems } from './queue'

let clipEndTimeInterval: any = null

PlayerEventEmitter.on(PV.Events.PLAYER_CLIP_LOADED, async () => {
  const nowPlayingItem = await getNowPlayingItem()
  if (nowPlayingItem) {
    const { clipEndTime, clipId } = nowPlayingItem

    if (clipEndTimeInterval) {
      clearInterval(clipEndTimeInterval)
    }

    if (clipId) {
      if (clipEndTime) {
        clipEndTimeInterval = setInterval(async () => {
          const currentPosition = await PVTrackPlayer.getPosition()
          if (currentPosition > clipEndTime) {
            clearInterval(clipEndTimeInterval)
            PVTrackPlayer.pause()

            const shouldContinuouslyPlay = await getContinuousPlaybackMode()

            if (shouldContinuouslyPlay) {
              PlayerEventEmitter.emit(PV.Events.PLAYER_QUEUE_ENDED)
            } else {
              await setClipHasEnded(true)
            }
          }
        }, 500)
      }
    }

    await setPlaybackPosition(nowPlayingItem.clipStartTime)
  }
})

module.exports = async () => {

  PVTrackPlayer.addEventListener('playback-error', (x) => console.log('playback error', x))

  PVTrackPlayer.addEventListener('playback-queue-ended', async (x) => {
    const bearerToken = await getBearerToken()
    const isLoggedIn = !!bearerToken
    const isConnected = await hasValidNetworkConnection()
    const useServerData = isLoggedIn && isConnected

    const nowPlayingItem = await getNowPlayingItem() || {}
    nowPlayingItem.userPlaybackPosition = 0
    await addOrUpdateHistoryItem(nowPlayingItem, useServerData)
    await setPlaybackPosition(0)

    const queueItems = await getQueueItems(useServerData)
    const shouldContinuouslyPlay = await getContinuousPlaybackMode()

    if (shouldContinuouslyPlay && queueItems.length > 0) {
      await playNextFromQueue(useServerData, true)
    } else if (queueItems.length === 0) {
      await clearNowPlayingItem()
    }

    PlayerEventEmitter.emit(PV.Events.PLAYER_QUEUE_ENDED)
  })

  PVTrackPlayer.addEventListener('playback-state', async (x) => {
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

      if (x.state === 'playing' || x.state === 'paused') {
        // handle updating history item after event emit, because it is less of a priority than the UI update
        const bearerToken = await getBearerToken()
        const isLoggedIn = !!bearerToken
        const isConnected = await hasValidNetworkConnection()
        const useServerData = isLoggedIn && isConnected
        nowPlayingItem.userPlaybackPosition = currentPosition
        await AsyncStorage.setItem(PV.Keys.NOW_PLAYING_ITEM, JSON.stringify(nowPlayingItem))
        await addOrUpdateHistoryItem(nowPlayingItem, useServerData)
      }
    }
  })

  PVTrackPlayer.addEventListener('playback-track-changed', () => console.log('playback track changed'))

  PVTrackPlayer.addEventListener('remote-jump-backward', async () => {
    await playerJumpBackward(PV.Player.jumpSeconds)
  })

  PVTrackPlayer.addEventListener('remote-jump-forward', async () => {
    await playerJumpForward(PV.Player.jumpSeconds)
  })

  PVTrackPlayer.addEventListener('remote-next', async () => {
    const bearerToken = await getBearerToken()
    const playerState = await PVTrackPlayer.getState()
    const shouldPlay = playerState === PVTrackPlayer.STATE_PLAYING
    await playNextFromQueue(!!bearerToken, shouldPlay)
    PlayerEventEmitter.emit(PV.Events.PLAYER_REMOTE_NEXT)
  })

  PVTrackPlayer.addEventListener('remote-pause', () => {
    PVTrackPlayer.pause()
    PlayerEventEmitter.emit(PV.Events.PLAYER_REMOTE_PAUSE)
  })

  PVTrackPlayer.addEventListener('remote-play', () => {
    PVTrackPlayer.play()
    PlayerEventEmitter.emit(PV.Events.PLAYER_REMOTE_PLAY)
  })

  PVTrackPlayer.addEventListener('remote-previous', async () => {
    const bearerToken = await getBearerToken()
    const playerState = await PVTrackPlayer.getState()
    const shouldPlay = playerState === PVTrackPlayer.STATE_PLAYING
    await playLastFromHistory(!!bearerToken, shouldPlay)
    PlayerEventEmitter.emit(PV.Events.PLAYER_REMOTE_PREVIOUS)
  })

  PVTrackPlayer.addEventListener('remote-stop', () => {
    PVTrackPlayer.pause()
    PlayerEventEmitter.emit(PV.Events.PLAYER_REMOTE_STOP)
  })

  PVTrackPlayer.addEventListener('remote-seek', (data) => {
    if (data.position) {
      PVTrackPlayer.seekTo(Math.floor(data.position))
    }
  })

  PVTrackPlayer.addEventListener('remote-duck', (x: any) => {
    const { paused, permanent } = x
    if (permanent) {
      PVTrackPlayer.stop()
    } else if (paused) {
      PVTrackPlayer.pause()
    } else {
      PVTrackPlayer.play()
    }
    PlayerEventEmitter.emit(PV.Events.PLAYER_REMOTE_DUCK)
  })

  // PVTrackPlayer.addEventListener('remote-skip', (x) => console.log('remote skip to track in queue'))
}
