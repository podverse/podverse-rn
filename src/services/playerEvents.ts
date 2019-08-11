import AsyncStorage from '@react-native-community/async-storage'
import { deleteDownloadedEpisode } from '../lib/downloader'
import { convertNowPlayingItemToEpisode } from '../lib/NowPlayingItem'
import { PV } from '../resources'
import { addOrUpdateHistoryItem, getHistoryItemsLocally } from './history'
import { getClipHasEnded, getContinuousPlaybackMode, getNowPlayingItem, handleResumeAfterClipHasEnded,
  loadNextFromQueue, playerJumpBackward, playerJumpForward, PVTrackPlayer, setClipHasEnded, setNowPlayingItem,
  setPlaybackPositionWhenDurationIsAvailable } from './player'
import PlayerEventEmitter from './playerEventEmitter'
import { getQueueItemsLocally, removeQueueItem } from './queue'

let shouldPauseWhenReady = false
let isFirstTrackToLoad = true

module.exports = async () => {

  PVTrackPlayer.addEventListener('playback-error', (x) => console.log('playback error', x))

  PVTrackPlayer.addEventListener('playback-queue-ended', (x) => console.log('playback-queue-ended', x))

  PVTrackPlayer.addEventListener('playback-state', async (x) => {
    console.log('playback-state', x)

    if (shouldPauseWhenReady) {
      shouldPauseWhenReady = false
      PVTrackPlayer.pause()
      PlayerEventEmitter.emit(PV.Events.PLAYER_STATE_CHANGED)
      return
    }

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

      if (x.state === 'paused') {
        nowPlayingItem.userPlaybackPosition = currentPosition
        await setNowPlayingItem(nowPlayingItem)
        if (currentPosition > 0) await addOrUpdateHistoryItem(nowPlayingItem)
      } else if (x.state === 'ready' && nowPlayingItem.userPlaybackPosition && !nowPlayingItem.clipId) {
        await setNowPlayingItem(nowPlayingItem)
        await setPlaybackPositionWhenDurationIsAvailable(nowPlayingItem.userPlaybackPosition)
      }
    }
  })

  PVTrackPlayer.addEventListener('playback-track-changed', async (x: any) => {
    console.log('playback-track-changed', x)
    const { nextTrack, position, track } = x
    PVTrackPlayer.seekTo(0)

    if (isFirstTrackToLoad) {
      isFirstTrackToLoad = false
      shouldPauseWhenReady = true
    }

    const previousTrackDuration = await PVTrackPlayer.getDuration()
    const previousNowPlayingItem = await getNowPlayingItem()

    // If previous track was close to the end, reset playback position to 0 in history
    if (previousTrackDuration && track && position + 20 > previousTrackDuration) {
      previousNowPlayingItem.userPlaybackPosition = 0
      await addOrUpdateHistoryItem(previousNowPlayingItem)

      const shouldDeleteEpisode = await AsyncStorage.getItem(PV.Keys.AUTO_DELETE_EPISODE_ON_END)
      if (shouldDeleteEpisode === 'TRUE') {
        const episode = convertNowPlayingItemToEpisode(previousNowPlayingItem)
        await deleteDownloadedEpisode(episode)
      }
    }

    if (nextTrack) {
      const queueItems = await getQueueItemsLocally()
      const queueItemIndex = queueItems.findIndex((x: any) =>
        nextTrack === x.clipId || (!x.clipId && nextTrack === x.episodeId))
      let currentNowPlayingItem = queueItemIndex > -1 && queueItems[queueItemIndex]
      if (currentNowPlayingItem) await removeQueueItem(currentNowPlayingItem)

      if (!currentNowPlayingItem) {
        const historyItems = await getHistoryItemsLocally()
        currentNowPlayingItem = historyItems.find((x: any) =>
          nextTrack === x.clipId || (!x.clipId && nextTrack === x.episodeId))
      }

      await setNowPlayingItem(currentNowPlayingItem)
      if (currentNowPlayingItem && currentNowPlayingItem.clipId) PlayerEventEmitter.emit(PV.Events.PLAYER_CLIP_LOADED)
    }

    PlayerEventEmitter.emit(PV.Events.PLAYER_TRACK_CHANGED)
  })

  PVTrackPlayer.addEventListener('remote-jump-backward', () => playerJumpBackward(PV.Player.jumpSeconds))

  PVTrackPlayer.addEventListener('remote-jump-forward', () => playerJumpForward(PV.Player.jumpSeconds))

  PVTrackPlayer.addEventListener('remote-pause', () => {
    PVTrackPlayer.pause()
    PlayerEventEmitter.emit(PV.Events.PLAYER_REMOTE_PAUSE)
  })

  PVTrackPlayer.addEventListener('remote-play', () => {
    PVTrackPlayer.play()
    PlayerEventEmitter.emit(PV.Events.PLAYER_REMOTE_PLAY)
  })

  PVTrackPlayer.addEventListener('remote-seek', (data) => {
    if (data.position) PVTrackPlayer.seekTo(Math.floor(data.position))
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
