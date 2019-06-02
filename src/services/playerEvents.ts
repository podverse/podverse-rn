import { hasValidNetworkConnection } from '../lib/network'
import { PV } from '../resources'
import { getBearerToken } from './auth'
import { addOrUpdateHistoryItem, getHistoryItems, popLastFromHistoryItems } from './history'
import { getClipHasEnded, getContinuousPlaybackMode, getNowPlayingItem, handleResumeAfterClipHasEnded,
  playerJumpBackward, playerJumpForward, playNextFromQueue, PVTrackPlayer, setClipHasEnded,
  setPlaybackPosition } from './player'
import PlayerEventEmitter from './playerEventEmitter'
import { getQueueItems, popNextFromQueue } from './queue'

let clipEndTimeInterval: any = null

PlayerEventEmitter.on(PV.Events.PLAYER_CLIP_LOADED, async () => {
  const nowPlayingItem = await getNowPlayingItem()
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
})

module.exports = async () => {

  PVTrackPlayer.addEventListener('playback-error', (x) => console.log('playback error', x))

  PVTrackPlayer.addEventListener('playback-queue-ended', async (x) => {
    const bearerToken = await getBearerToken()
    const isLoggedIn = !!bearerToken
    const isConnected = await hasValidNetworkConnection()
    const useServerData = isLoggedIn && isConnected

    const nowPlayingItem = await getNowPlayingItem()
    nowPlayingItem.userPlaybackPosition = 0
    await addOrUpdateHistoryItem(nowPlayingItem, useServerData)

    const queueItems = await getQueueItems(useServerData)
    const shouldContinuouslyPlay = await getContinuousPlaybackMode()

    if (shouldContinuouslyPlay && queueItems.length > 0) {
      await playNextFromQueue(useServerData)
    }

    PlayerEventEmitter.emit(PV.Events.PLAYER_QUEUE_ENDED)
  })

  PVTrackPlayer.addEventListener('playback-state', async (x) => {
    const clipHasEnded = await getClipHasEnded()
    const nowPlayingItem = await getNowPlayingItem()
    const { clipEndTime } = nowPlayingItem
    const currentPosition = await PVTrackPlayer.getPosition()
    const currentState = await PVTrackPlayer.getState()
    const isPlaying = currentState === PVTrackPlayer.STATE_PLAYING

    if (clipHasEnded && clipEndTime && currentPosition >= clipEndTime && isPlaying) {
      await handleResumeAfterClipHasEnded()
    }

    PlayerEventEmitter.emit(PV.Events.PLAYER_STATE_CHANGED)

    // handle updating history item after event emit, because it is less urgent than the UI update
    const bearerToken = await getBearerToken()
    const isLoggedIn = !!bearerToken
    const isConnected = await hasValidNetworkConnection()
    const useServerData = isLoggedIn && isConnected

    nowPlayingItem.userPlaybackPosition = currentPosition

    await addOrUpdateHistoryItem(nowPlayingItem, useServerData)
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
    await popNextFromQueue(!!bearerToken)
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
    await popLastFromHistoryItems(!!bearerToken)
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

  // PVTrackPlayer.addEventListener('remote-skip', (x) => console.log('remote skip to track in queue'))
  // PVTrackPlayer.addEventListener('remote-duck', (x) => console.log('remote duck'))
}
