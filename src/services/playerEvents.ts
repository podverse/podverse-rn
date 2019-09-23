import debounce from 'lodash/debounce'
import { Platform } from 'react-native'
import { NowPlayingItem } from '../lib/NowPlayingItem'
import { PV } from '../resources'
import { addOrUpdateHistoryItem, checkIfPlayingFromHistory } from './history'
import { getClipHasEnded, getNowPlayingItem, getNowPlayingItemFromQueueOrHistoryByTrackId, handleResumeAfterClipHasEnded,
  playerJumpBackward, playerJumpForward, PVTrackPlayer, setClipHasEnded, setNowPlayingItem,
  setPlaybackPositionWhenDurationIsAvailable, updateUserPlaybackPosition } from './player'
import PlayerEventEmitter from './playerEventEmitter'

const debouncedSetPlaybackPosition = debounce(setPlaybackPositionWhenDurationIsAvailable, 1000)

const handleSyncNowPlayingItem = async (trackId: string, currentNowPlayingItem: NowPlayingItem) => {
  if (!currentNowPlayingItem) return
  await setNowPlayingItem(currentNowPlayingItem)
  const isPlayingFromHistory = await checkIfPlayingFromHistory()
  if (!currentNowPlayingItem) return
  if (!isPlayingFromHistory && currentNowPlayingItem) addOrUpdateHistoryItem(currentNowPlayingItem)
  if (currentNowPlayingItem && currentNowPlayingItem.clipId) PlayerEventEmitter.emit(PV.Events.PLAYER_CLIP_LOADED)
  PlayerEventEmitter.emit(PV.Events.PLAYER_TRACK_CHANGED)
  if (Platform.OS === 'android' && !currentNowPlayingItem.clipId && currentNowPlayingItem.userPlaybackPosition) {
    debouncedSetPlaybackPosition(currentNowPlayingItem.userPlaybackPosition, trackId)
  }
}

const syncNowPlayingItemWithTrack = async () => {
  const currentTrackId = await PVTrackPlayer.getCurrentTrack()
  const currentNowPlayingItem = await getNowPlayingItemFromQueueOrHistoryByTrackId(currentTrackId)
  if (currentNowPlayingItem) await handleSyncNowPlayingItem(currentTrackId, currentNowPlayingItem)
}

module.exports = async () => {

  PVTrackPlayer.addEventListener('playback-error', (x) => console.log('playback error', x))

  PVTrackPlayer.addEventListener('playback-queue-ended', async (x) => {
    console.log('playback-queue-ended', x)
    await syncNowPlayingItemWithTrack()
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
        if (x.state === 'paused' || x.state === 'playing') {
          updateUserPlaybackPosition()
        } else if (x.state === 'ready' && nowPlayingItem.userPlaybackPosition && !nowPlayingItem.clipId) {
          await setPlaybackPositionWhenDurationIsAvailable(nowPlayingItem.userPlaybackPosition)
        }
      } else if (Platform.OS === 'android') {
        // TODO add android playback-state logic
      }
    }
  })

  PVTrackPlayer.addEventListener('playback-track-changed', async (x: any) => {
    console.log('playback-track-changed', x)
    await syncNowPlayingItemWithTrack()
  })

  PVTrackPlayer.addEventListener('remote-jump-backward', () => playerJumpBackward(PV.Player.jumpSeconds))

  PVTrackPlayer.addEventListener('remote-jump-forward', () => playerJumpForward(PV.Player.jumpSeconds))

  PVTrackPlayer.addEventListener('remote-pause', async () => {
    PVTrackPlayer.pause()
    PlayerEventEmitter.emit(PV.Events.PLAYER_REMOTE_PAUSE)
    updateUserPlaybackPosition()
  })

  PVTrackPlayer.addEventListener('remote-play', async () => {
    PVTrackPlayer.play()
    PlayerEventEmitter.emit(PV.Events.PLAYER_REMOTE_PLAY)
    updateUserPlaybackPosition()
  })

  PVTrackPlayer.addEventListener('remote-seek', async (data) => {
    if (data.position || data.position >= 0) PVTrackPlayer.seekTo(Math.floor(data.position))
    updateUserPlaybackPosition()
  })

  PVTrackPlayer.addEventListener('remote-stop', () => {
    PVTrackPlayer.pause()
    PlayerEventEmitter.emit(PV.Events.PLAYER_REMOTE_STOP)
  })
}

let clipEndTimeInterval: any = null

const handlePlayerClipLoaded = async () => {
  console.log('PLAYER_CLIP_LOADED event')
  const nowPlayingItem = await getNowPlayingItem()
  if (nowPlayingItem) {
    const { clipEndTime, clipId } = nowPlayingItem

    if (clipEndTimeInterval) clearInterval(clipEndTimeInterval)

    if (clipId && clipEndTime) {
      clipEndTimeInterval = setInterval(async () => {
        const currentPosition = await PVTrackPlayer.getPosition()
        if (currentPosition > clipEndTime) {
          clearInterval(clipEndTimeInterval)
          PVTrackPlayer.pause()
          await setClipHasEnded(true)
        }
      }, 250)
    }
    const resolveImmediately = false
    await debouncedSetPlaybackPosition(
      nowPlayingItem.clipStartTime, nowPlayingItem.clipId, resolveImmediately)
  }
}

const debouncedHandlePlayerClipLoaded = debounce(handlePlayerClipLoaded, 1000)

PlayerEventEmitter.on(PV.Events.PLAYER_CLIP_LOADED, debouncedHandlePlayerClipLoaded)
