import AsyncStorage from '@react-native-community/async-storage'
import { deleteDownloadedEpisode } from '../lib/downloader'
import { convertNowPlayingItemToEpisode } from '../lib/NowPlayingItem'
import { PV } from '../resources'
import { addOrUpdateHistoryItem } from './history'
import { clearNowPlayingItem ,getClipHasEnded, getContinuousPlaybackMode, getNowPlayingItem,
  handleResumeAfterClipHasEnded, playerJumpBackward, playerJumpForward, playNextFromQueue,
  PVTrackPlayer, setClipHasEnded, setPlaybackPosition, setPlaybackPositionWhenDurationIsAvailable
} from './player'
import PlayerEventEmitter from './playerEventEmitter'
import { getQueueItems } from './queue'

module.exports = async () => {

  PVTrackPlayer.addEventListener('playback-error', (x) => console.log('playback error', x))

  PVTrackPlayer.addEventListener('playback-queue-ended', (x) => console.log('playback-queue-ended', x))

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
        nowPlayingItem.userPlaybackPosition = currentPosition
        await AsyncStorage.setItem(PV.Keys.NOW_PLAYING_ITEM, JSON.stringify(nowPlayingItem))
        await addOrUpdateHistoryItem(nowPlayingItem)
      }
    }
  })

  PVTrackPlayer.addEventListener('playback-track-changed', async () => {
    const nowPlayingItem = await getNowPlayingItem()
    nowPlayingItem.userPlaybackPosition = 0
    await addOrUpdateHistoryItem(nowPlayingItem)
    await setPlaybackPosition(0)

    const queueItems = await getQueueItems()
    const shouldContinuouslyPlay = await getContinuousPlaybackMode()

    const shouldDeleteEpisode = await AsyncStorage.getItem(PV.Keys.AUTO_DELETE_EPISODE_ON_END)
    if (shouldDeleteEpisode === 'TRUE') {
      const episode = convertNowPlayingItemToEpisode(nowPlayingItem)
      await deleteDownloadedEpisode(episode)
    }

    if (shouldContinuouslyPlay && queueItems.length > 0) {
      await playNextFromQueue(true)
    } else if (queueItems.length === 0) {
      await clearNowPlayingItem()
    }

    PlayerEventEmitter.emit(PV.Events.PLAYER_TRACK_CHANGED)
  })

  PVTrackPlayer.addEventListener('remote-jump-backward', () => playerJumpBackward(PV.Player.jumpSeconds))

  PVTrackPlayer.addEventListener('remote-jump-forward', () => playerJumpForward(PV.Player.jumpSeconds))

  PVTrackPlayer.addEventListener('remote-next', () => console.log('remote-next'))

  PVTrackPlayer.addEventListener('remote-pause', () => {
    PVTrackPlayer.pause()
    PlayerEventEmitter.emit(PV.Events.PLAYER_REMOTE_PAUSE)
  })

  PVTrackPlayer.addEventListener('remote-play', () => {
    PVTrackPlayer.play()
    PlayerEventEmitter.emit(PV.Events.PLAYER_REMOTE_PLAY)
  })

  PVTrackPlayer.addEventListener('remote-previous', () => console.log('remote-previous'))

  PVTrackPlayer.addEventListener('remote-seek', (data) => {
    if (data.position) PVTrackPlayer.seekTo(Math.floor(data.position))
  })

  PVTrackPlayer.addEventListener('remote-stop', () => {
    PVTrackPlayer.pause()
    PlayerEventEmitter.emit(PV.Events.PLAYER_REMOTE_STOP)
  })

  // PVTrackPlayer.addEventListener('remote-duck', (x: any) => {
  //   if (permanent) {
  //     PVTrackPlayer.stop()
  //   } else if (paused) {
  //     PVTrackPlayer.pause()
  //   } else {
  //     PVTrackPlayer.play()
  //   }
  //   PlayerEventEmitter.emit(PV.Events.PLAYER_REMOTE_DUCK)
  // })

  // PVTrackPlayer.addEventListener('remote-skip', (x) => console.log('remote-skip'))
}

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

    await setPlaybackPositionWhenDurationIsAvailable(nowPlayingItem.clipStartTime)
  }
})
