import { PV } from '../resources'
import { addOrUpdateHistoryItem } from './history'
import { getClipHasEnded, getNowPlayingItem, handleResumeAfterClipHasEnded,
  playerJumpBackward, playerJumpForward, PVTrackPlayer, setClipHasEnded,
  setPlaybackPositionWhenDurationIsAvailable, 
  updateUserPlaybackPosition,
  getNowPlayingItemFromQueueOrHistoryByTrackId,
  setNowPlayingItem} from './player'
import PlayerEventEmitter from './playerEventEmitter'

const syncNowPlayingItenWithTrack = async (trackId: string) => {
  const previousNowPlayingItem = await getNowPlayingItem()
  const previousTrackId = previousNowPlayingItem.clipId || previousNowPlayingItem.episodeId
  const newTrackShouldPlay = previousTrackId !== trackId
  if (newTrackShouldPlay) {
    const currentNowPlayingItem = await getNowPlayingItemFromQueueOrHistoryByTrackId(trackId)
    await setNowPlayingItem(currentNowPlayingItem)
    if (currentNowPlayingItem && currentNowPlayingItem.clipId) PlayerEventEmitter.emit(PV.Events.PLAYER_CLIP_LOADED)
  } else {
    setTimeout(async () => {
      const trackId = await PVTrackPlayer.getCurrentTrack()
      const currentNowPlayingItem = await getNowPlayingItemFromQueueOrHistoryByTrackId(trackId)
      await setNowPlayingItem(currentNowPlayingItem)
    }, 1500)
  }
}

module.exports = async () => {

  PVTrackPlayer.addEventListener('playback-error', (x) => console.log('playback error', x))

  PVTrackPlayer.addEventListener('playback-queue-ended', async (x) => {
    const { track: trackId } = x
    await syncNowPlayingItenWithTrack(trackId)
    PlayerEventEmitter.emit(PV.Events.PLAYER_TRACK_CHANGED)
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

      if (x.state === 'paused' || x.state === 'playing') {
        updateUserPlaybackPosition()
      } else if (x.state === 'ready' && nowPlayingItem.userPlaybackPosition && !nowPlayingItem.clipId) {
        await setPlaybackPositionWhenDurationIsAvailable(nowPlayingItem.userPlaybackPosition)
        await addOrUpdateHistoryItem(nowPlayingItem)
      } else if (x.state === 'ready') {
        await addOrUpdateHistoryItem(nowPlayingItem)
      }
    }
  })

  PVTrackPlayer.addEventListener('playback-track-changed', async (x: any) => {
    console.log('playback-track-changed', x)
    const { nextTrack, position, track: trackId } = x

    PVTrackPlayer.seekTo(0)

    await syncNowPlayingItenWithTrack(trackId)

    // const previousTrackDuration = await PVTrackPlayer.getDuration()
    //
    // If previous track was close to the end, reset playback position to 0 in history
    // console.log('yoooo', previousTrackDuration, track, position, previousNowPlayingItem)
    // if (previousTrackDuration && track && position + 20 > previousTrackDuration) {
    //   console.log('inside!')
    //   previousNowPlayingItem.userPlaybackPosition = 0
    //   await addOrUpdateHistoryItem(previousNowPlayingItem)

    //   const shouldDeleteEpisode = await AsyncStorage.getItem(PV.Keys.AUTO_DELETE_EPISODE_ON_END)
    //   if (shouldDeleteEpisode === 'TRUE') {
    //     const episode = convertNowPlayingItemToEpisode(previousNowPlayingItem)
    //     await deleteDownloadedEpisode(episode)
    //   }
    // }

    PlayerEventEmitter.emit(PV.Events.PLAYER_TRACK_CHANGED)
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

PlayerEventEmitter.on(PV.Events.PLAYER_CLIP_LOADED, async () => {
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
          // PlayerEventEmitter.emit(PV.Events.PLAYER_CLIP_ENDED)
        }
      }, 500)
    }

    await setPlaybackPositionWhenDurationIsAvailable(nowPlayingItem.clipStartTime, nowPlayingItem.clipId)
  }
})

