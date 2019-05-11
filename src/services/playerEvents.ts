import { getClipHasEnded, getNowPlayingItem, handleResumeAfterClipHasEnded, PVTrackPlayer, setClipHasEnded,
  setPlaybackPosition } from './player'

let clipEndTimeInterval: any = null

module.exports = async () => {

  PVTrackPlayer.addEventListener('playback-track-changed', async (x) => {
    // const nowPlayingItem = await getNowPlayingItem()
    // const { clipEndTime, clipId } = nowPlayingItem

    // if (clipEndTimeInterval) {
    //   clearInterval(clipEndTimeInterval)
    // }

    // if (clipId) {
    //   if (clipEndTime) {
    //     clipEndTimeInterval = setInterval(async () => {
    //       const currentPosition = await PVTrackPlayer.getPosition()
    //       if (currentPosition > clipEndTime) {
    //         clearInterval(clipEndTimeInterval)
    //         PVTrackPlayer.pause()
    //         await setClipHasEnded(true)
    //       }
    //     }, 500)
    //   }

    //   await setPlaybackPosition(nowPlayingItem.clipStartTime)
    // }
  })

  PVTrackPlayer.addEventListener('playback-state', async (x) => {
    // const clipHasEnded = await getClipHasEnded()
    // const nowPlayingItem = await getNowPlayingItem()
    // const { clipEndTime } = nowPlayingItem
    // const currentPosition = await PVTrackPlayer.getPosition()
    // const currentState = await PVTrackPlayer.getState()
    // const isPlaying = currentState === PVTrackPlayer.STATE_PLAYING

    // if (clipHasEnded && clipEndTime && currentPosition >= clipEndTime && isPlaying) {
    //   await handleResumeAfterClipHasEnded()
    // }

    // await setPlaybackState(data.state, this.global)
  })

  PVTrackPlayer.addEventListener('playback-queue-ended', (x) => console.log('playback queue ended'))

  PVTrackPlayer.addEventListener('playback-error', (x) => console.log('playback error'))

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
