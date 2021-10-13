import AsyncStorage from '@react-native-community/async-storage'
import { convertNowPlayingItemClipToNowPlayingItemEpisode, NowPlayingItem } from 'podverse-shared'
import { Platform } from 'react-native'
import { checkIfVideoFileType } from '../lib/utility'
import { PV } from '../resources'
import PVEventEmitter from './eventEmitter'
import { audioIsLoaded,  audioCheckIfIsPlaying, audioSetRate, audioHandlePlayWithUpdate,
  audioHandleSeekTo, audioHandlePause, audioSetPlaybackPosition, audioAddNowPlayingItemNextInQueue,
  audioLoadNowPlayingItem, audioGetTrackDuration, audioGetTrackPosition,
  audioGetCurrentLoadedTrackId, 
  audioCheckIfStateIsBuffering,
  audioPlayerGetState,
  audioGetRate,
  audioHandlePauseWithUpdate,
  audioPlayNextFromQueue,
  audioCheckIdlePlayerState,
  audioHandleSeekToWithUpdate,
  audioSyncPlayerWithQueue,
  audioUpdateTrackPlayerCapabilities,
  audioUpdateCurrentTrack} from './playerAudio'
import { videoIsLoaded } from './playerVideo'
import { addOrUpdateHistoryItem, saveOrResetCurrentlyPlayingItemInHistory } from './userHistoryItem'
import { getNowPlayingItem, getNowPlayingItemFromLocalStorage, getNowPlayingItemLocally } from './userNowPlayingItem'

export const playerGetClipHasEnded = async () => {
  const clipHasEnded = await AsyncStorage.getItem(PV.Keys.CLIP_HAS_ENDED)
  return clipHasEnded === 'true'
}

export const playerCheckActiveType = async () => {
  let playerType = (await audioIsLoaded()) ? PV.Player.playerTypes.isAudio : null
  if (playerType !== PV.Player.playerTypes.isAudio) {
    playerType = videoIsLoaded() ? PV.Player.playerTypes.isVideo : null
  }
  return playerType
}

export const playerHandleResumeAfterClipHasEnded = async () => {
  await AsyncStorage.removeItem(PV.Keys.PLAYER_CLIP_IS_LOADED)
  const nowPlayingItem = await getNowPlayingItemLocally()
  const nowPlayingItemEpisode = convertNowPlayingItemClipToNowPlayingItemEpisode(nowPlayingItem)
  const playbackPosition = await playerGetPosition()
  const mediaFileDuration = await playerGetDuration()
  await addOrUpdateHistoryItem(nowPlayingItemEpisode, playbackPosition, mediaFileDuration)
  PVEventEmitter.emit(PV.Events.PLAYER_RESUME_AFTER_CLIP_HAS_ENDED)
}

export const playerJumpBackward = async (seconds: string) => {
  const position = await playerGetPosition()
  const newPosition = position - parseInt(seconds, 10)
  await playerHandleSeekTo(newPosition)
  return newPosition
}

export const playerJumpForward = async (seconds: string) => {
  const position = await playerGetPosition()
  const newPosition = position + parseInt(seconds, 10)
  await playerHandleSeekTo(newPosition)
  return newPosition
}

let playerPreviewEndTimeInterval: any = null
export const playerPreviewEndTime = async (endTime: number) => {
  if (playerPreviewEndTimeInterval) {
    clearInterval(playerPreviewEndTimeInterval)
  }

  const previewEndTime = endTime - 3
  await playerHandleSeekTo(previewEndTime)
  playerHandlePlayWithUpdate()

  playerPreviewEndTimeInterval = setInterval(() => {
    (async () => {
      const currentPosition = await playerGetPosition()
      if (currentPosition >= endTime) {
        clearInterval(playerPreviewEndTimeInterval)
        playerHandlePause()
      }
    })()
  }, 500)
}

export const playerSetRateWithLatestPlaybackSpeed = async () => {
  const rate = await playerGetPlaybackSpeed()

  /*
    Call playerSetRate multiple times for iOS as a workaround for a bug.
    https://github.com/DoubleSymmetry/react-native-track-player/issues/766
  */
  if (Platform.OS === 'ios') {
    playerSetRate(rate)
    setTimeout( () => playerSetRate(rate), 200)
    setTimeout( () => playerSetRate(rate), 500)
    setTimeout( () => playerSetRate(rate), 800)
  } else {
    playerSetRate(rate)
  }
}

export const playerPreviewStartTime = async (startTime: number, endTime?: number | null) => {
  if (playerPreviewEndTimeInterval) {
    clearInterval(playerPreviewEndTimeInterval)
  }

  await playerHandleSeekTo(startTime)
  playerHandlePlayWithUpdate()

  if (endTime) {
    playerPreviewEndTimeInterval = setInterval(() => {
      (async () => {
        const currentPosition = await playerGetPosition()
        if (currentPosition >= endTime) {
          clearInterval(playerPreviewEndTimeInterval)
          playerHandlePause()
        }
      })()
    }, 500)
  }
}

export const playerSetClipHasEnded = async (clipHasEnded: boolean) => {
  await AsyncStorage.setItem(PV.Keys.CLIP_HAS_ENDED, JSON.stringify(clipHasEnded))
}

export const playerGetCurrentLoadedTrackId = async () => {
  const playerType = await playerCheckActiveType()
  let currentTrackId = ''
  if (playerType === PV.Player.playerTypes.isAudio) {
    currentTrackId = await audioGetCurrentLoadedTrackId()
  } else if (playerType === PV.Player.playerTypes.isVideo) {
    // TODO: videoGetCurrentLoadedTrackId
  }
  return currentTrackId
}

export const playerGetPosition = async () => {
  let position = 0
  const playerType = await playerCheckActiveType()
  if (playerType === PV.Player.playerTypes.isAudio) {
    position = await audioGetTrackPosition()
  } else if (playerType === PV.Player.playerTypes.isVideo) {
    // TODO: videoGetTrackPosition
  }
  return position
}

export const playerGetDuration = async () => {
  let duration = 0
  const playerType = await playerCheckActiveType()
  if (playerType === PV.Player.playerTypes.isAudio) {
    duration = await audioGetTrackDuration()
  } else if (playerType === PV.Player.playerTypes.isVideo) {
    // TODO: videoGetTrackDuration
  }
  return duration
}

/*
  Always use await with playerUpdateUserPlaybackPosition to make sure that
  playerGetPosition and playerGetDuration are accurate for the currently playing item.
  addOrUpdateHistoryItem can be called without await.
*/
export const playerUpdateUserPlaybackPosition = async (skipSetNowPlaying?: boolean, shouldAwait?: boolean) => {
  try {
    const currentTrackId = await playerGetCurrentLoadedTrackId()
    const setPlayerClipIsLoadedIfClip = false
    const currentNowPlayingItem = await getNowPlayingItemFromLocalStorage(
      currentTrackId,
      setPlayerClipIsLoadedIfClip
    )

    if (currentNowPlayingItem) {
      await saveOrResetCurrentlyPlayingItemInHistory(!!shouldAwait, currentNowPlayingItem, !!skipSetNowPlaying)
    }
  } catch (error) {
    console.log('playerUpdateUserPlaybackPosition error', error)
  }
}

export const playerLoadNowPlayingItem = async (
  item: NowPlayingItem,
  shouldPlay: boolean,
  forceUpdateOrderDate: boolean,
  itemToSetNextInQueue: NowPlayingItem | null
) => {
  if (!checkIfVideoFileType(item)) {
    audioAddNowPlayingItemNextInQueue(item, itemToSetNextInQueue)
  }

  const skipSetNowPlaying = true
  await playerUpdateUserPlaybackPosition(skipSetNowPlaying)

  if (checkIfVideoFileType(item)) {
    // await videoLoadNowPlayingItem
  } else {
    await audioLoadNowPlayingItem(item, shouldPlay, forceUpdateOrderDate)
  }
}

export const playerSetPosition = async (position?: number) => {
  const playerType = await playerCheckActiveType()
  if (playerType === PV.Player.playerTypes.isAudio) {
    audioSetPlaybackPosition(position)
  } else if (playerType === PV.Player.playerTypes.isVideo) {
    // TODO: videoSetPlaybackPosition
  }
}

// Sometimes the duration is not immediately available for certain episodes.
// For those cases, use a setInterval before adjusting playback position.
export const playerSetPositionWhenDurationIsAvailable = async (
  position: number,
  trackId?: string,
  resolveImmediately?: boolean,
  shouldPlay?: boolean
) => {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      (async () => {
        const duration = await playerGetDuration()
        const currentTrackId = await playerGetCurrentLoadedTrackId()

        setTimeout(() => {
          if (interval) clearInterval(interval)
        }, 20000)

        if (
          duration && duration > 0
          && (!trackId || (currentTrackId && trackId === currentTrackId))
          && position >= 0) {
          clearInterval(interval)
          await playerHandleSeekTo(position)
          // Sometimes seekTo does not work right away for all episodes...
          // to work around this bug, we set another interval to confirm the track
          // position has been advanced into the clip time.
          const confirmClipLoadedInterval = setInterval(() => {
            (async () => {
              const currentPosition = await playerGetPosition()
              if (currentPosition >= position - 1) {
                clearInterval(confirmClipLoadedInterval)
              } else {
                await playerHandleSeekTo(position)
              }
            })()
          }, 500)

          const shouldPlayWhenClipIsLoaded = await AsyncStorage.getItem(PV.Keys.PLAYER_SHOULD_PLAY_WHEN_CLIP_IS_LOADED)

          if (shouldPlay) {
            playerHandlePlayWithUpdate()
          } else if (shouldPlayWhenClipIsLoaded === 'true') {
            AsyncStorage.removeItem(PV.Keys.PLAYER_SHOULD_PLAY_WHEN_CLIP_IS_LOADED)
            playerHandlePlayWithUpdate()
          }

          resolve(null)
        }
        if (resolveImmediately) resolve(null)
      })()
    }, 500)
  })
}

export const playerRestartNowPlayingItemClip = async () => {
  const nowPlayingItem = await getNowPlayingItem()
  if (nowPlayingItem && nowPlayingItem.clipStartTime) {
    playerSetPosition(nowPlayingItem.clipStartTime)
    playerHandlePlayWithUpdate()
  }
}

export const playerHandlePlayWithUpdate = async () => {
  const playerType = await playerCheckActiveType()
  if (playerType === PV.Player.playerTypes.isAudio) {
    audioHandlePlayWithUpdate()
  } else if (playerType === PV.Player.playerTypes.isVideo) {
    // TODO: videoHandlePlayWithUpdate
  }
}

export const playerHandlePause = async () => {
  const playerType = await playerCheckActiveType()
  if (playerType === PV.Player.playerTypes.isAudio) {
    audioHandlePause()
  } else if (playerType === PV.Player.playerTypes.isVideo) {
    // TODO: videoHandlePause
  }
}

export const playerHandlePauseWithUpdate = async () => {
  const playerType = await playerCheckActiveType()
  if (playerType === PV.Player.playerTypes.isAudio) {
    audioHandlePauseWithUpdate()
  } else if (playerType === PV.Player.playerTypes.isVideo) {
    // TODO: videoHandlePauseWithUpdate
  }
}

export const playerHandleSeekTo = async (position: number) => {
  const playerType = await playerCheckActiveType()
  if (playerType === PV.Player.playerTypes.isAudio) {
    audioHandleSeekTo(position)
  } else if (playerType === PV.Player.playerTypes.isVideo) {
    // TODO: videoHandleSeekTo
  }
}

export const playerHandleSeekToWithUpdate = async (position: number) => {
  const playerType = await playerCheckActiveType()
  if (playerType === PV.Player.playerTypes.isAudio) {
    audioHandleSeekToWithUpdate(position)
  } else if (playerType === PV.Player.playerTypes.isVideo) {
    // TODO: videoHandleSeekToWithUpdate
  }
}

export const playerGetPlaybackSpeed = async () => {
  try {
    const rate = await AsyncStorage.getItem(PV.Keys.PLAYER_PLAYBACK_SPEED)
    if (rate) {
      return parseFloat(rate)
    } else {
      return 1.0
    }
  } catch (error) {
    return 1.0
  }
}

export const playerSetPlaybackSpeed = async (rate: number) => {
  await AsyncStorage.setItem(PV.Keys.PLAYER_PLAYBACK_SPEED, JSON.stringify(rate))
  const isPlaying = await playerCheckIfStateIsPlaying()
  if (isPlaying) await playerSetRate(rate)
}

export const playerSetRate = async (rate = 1) => {
  const playerType = await playerCheckActiveType()
  if (playerType === PV.Player.playerTypes.isAudio) {
    audioSetRate(rate)
  } else if (playerType === PV.Player.playerTypes.isVideo) {
    // TODO: videoSetRate
  }
}

export const playerCheckIfStateIsPlaying = async () => {
  const playerType = await playerCheckActiveType()
  let isPlaying = false
  if (playerType === PV.Player.playerTypes.isAudio) {
    isPlaying = await audioCheckIfIsPlaying()
  } else if (playerType === PV.Player.playerTypes.isVideo) {
    // TODO: videoCheckIfIsPlaying
  }
  return isPlaying
}

export const playerCheckIfStateIsBuffering = async (playbackState: any) => {
  let isBuffering = false
  const playerType = await playerCheckActiveType()
  if (playerType === PV.Player.playerTypes.isAudio) {
    isBuffering = audioCheckIfStateIsBuffering(playbackState)
  } else if (playerType === PV.Player.playerTypes.isVideo) {
    // TODO: videoCheckIfStateIsBuffering
  }
  return isBuffering
}

export const playerGetState = async () => {
  let playerState = null
  const playerType = await playerCheckActiveType()
  if (playerType === PV.Player.playerTypes.isAudio) {
    playerState = await audioPlayerGetState()
  } else if (playerType === PV.Player.playerTypes.isVideo) {
    // TODO: videoPlayerGetState
  }
  return playerState
}

export const playerGetRate = async () => {
  let playerRate = 0
  const playerType = await playerCheckActiveType()
  if (playerType === PV.Player.playerTypes.isAudio) {
    playerRate = await audioGetRate()
  } else if (playerType === PV.Player.playerTypes.isVideo) {
    // TODO: videoGetRate
  }
  return playerRate
}

export const playerPlayNextFromQueue = async () => {
  const playerType = await playerCheckActiveType()
  if (playerType === PV.Player.playerTypes.isAudio) {
    await audioPlayNextFromQueue()
  } else if (playerType === PV.Player.playerTypes.isVideo) {
    // TODO: videoPlayNextFromQueue
  }
}

export const playerCheckIdlePlayerState = async () => {
  const playerType = await playerCheckActiveType()
  if (playerType === PV.Player.playerTypes.isAudio) {
    await audioCheckIdlePlayerState()
  } else if (playerType === PV.Player.playerTypes.isVideo) {
    // TODO: videoCheckIdlePlayerState
  }
}

export const playerSyncPlayerWithQueue = async () => {
  const playerType = await playerCheckActiveType()
  if (playerType === PV.Player.playerTypes.isAudio) {
    await audioSyncPlayerWithQueue()
  } else if (playerType === PV.Player.playerTypes.isVideo) {
    // TODO: videoSyncPlayerWithQueue
  }
}

export const playerUpdateTrackPlayerCapabilities = async () => {
  const playerType = await playerCheckActiveType()
  if (playerType === PV.Player.playerTypes.isAudio) {
    audioUpdateTrackPlayerCapabilities()
  } else if (playerType === PV.Player.playerTypes.isVideo) {
    // TODO: videoSyncPlayerWithQueue
  }
}

export const playerUpdateCurrentTrack = async (trackTitle?: string, artworkUrl?: string) => {
  const playerType = await playerCheckActiveType()
  if (playerType === PV.Player.playerTypes.isAudio) {
    audioUpdateCurrentTrack(trackTitle, artworkUrl)
  } else if (playerType === PV.Player.playerTypes.isVideo) {
    // TODO: videoUpdateCurrentTrack
  }
}

export const playerSetPlayerJumpBackwards = (val?: string) => {
  const newValue = val && parseInt(val, 10) > 0 || val === '' ? val : PV.Player.jumpBackSeconds.toString()
  if (newValue !== '') {
    AsyncStorage.setItem(PV.Keys.PLAYER_JUMP_BACKWARDS, newValue.toString())
  }
  return newValue
}

export const playerSetPlayerJumpForwards = (val?: string) => {
  const newValue = val && parseInt(val, 10) > 0 || val === '' ? val : PV.Player.jumpSeconds.toString()
  if (newValue !== '') {
    AsyncStorage.setItem(PV.Keys.PLAYER_JUMP_FORWARDS, newValue.toString())
  }
  return newValue
}
