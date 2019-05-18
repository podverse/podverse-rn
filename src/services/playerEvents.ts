import { PV } from '../resources'
import { getClipHasEnded, getContinuousPlaybackMode, getNowPlayingItem, handleResumeAfterClipHasEnded,
  PVTrackPlayer, setClipHasEnded, setPlaybackPosition  } from './player'
import PlayerEventEmitter from './playerEventEmitter'

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

    await setPlaybackPosition(nowPlayingItem.clipStartTime)
  }
})

module.exports = async () => {

  PVTrackPlayer.addEventListener('playback-track-changed', () => console.log('playback track changed'))

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
  })

  PVTrackPlayer.addEventListener('playback-queue-ended', (x) => {
    PlayerEventEmitter.emit(PV.Events.PLAYER_QUEUE_ENDED)
  })

  PVTrackPlayer.addEventListener('playback-error', (x) => console.log('playback error', x))

  PVTrackPlayer.addEventListener('remote-play', (x) => console.log('remote play'))

  PVTrackPlayer.addEventListener('remote-pause', (x) => console.log('remote pause'))

  PVTrackPlayer.addEventListener('remote-stop', (x) => console.log('remote stop'))

  PVTrackPlayer.addEventListener('remote-next', (x) => console.log('remote next'))

  PVTrackPlayer.addEventListener('remote-previous', (x) => console.log('remote previous'))

  PVTrackPlayer.addEventListener('remote-seek', (x) => console.log('remote seek'))

  PVTrackPlayer.addEventListener('remote-jump-forward', (x) => console.log('remote jump forward'))

  PVTrackPlayer.addEventListener('remote-jump-backward', (x) => console.log('remote jump backward'))

  // PVTrackPlayer.addEventListener('remote-skip', (x) => console.log('remote skip to track in queue'))

  // PVTrackPlayer.addEventListener('remote-duck', (x) => console.log('remote duck'))

}
