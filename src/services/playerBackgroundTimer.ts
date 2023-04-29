import debounce from 'lodash/debounce'
import { NowPlayingItem } from 'podverse-shared'
import { getGlobal } from 'reactn'
import { Platform } from 'react-native'
import { errorLogger } from '../lib/logger'
import { PV } from '../resources'
import { handleEnrichingPlayerState, playerUpdatePlaybackState } from '../state/actions/player'
import { clearChapterPlaybackInfo, loadChapterPlaybackInfo } from '../state/actions/playerChapters'
import { startCheckClipEndTime, stopClipInterval } from '../state/actions/playerClips'
import { handleSleepTimerCountEvent } from '../state/actions/sleepTimer'
import PVEventEmitter from './eventEmitter'
import {
  playerGetCurrentLoadedTrackId,
  playerGetPosition,
  playerHandlePauseWithUpdate,
  playerUpdateUserPlaybackPosition,
  setClipHasEnded
} from './player'
import { getEnrichedNowPlayingItemFromLocalStorage, setNowPlayingItemLocally } from './userNowPlayingItem'
import { removeQueueItem } from './queue'
import { handleValueStreamingTimerIncrement } from './v4v/v4vStreaming'
import { addOrUpdateHistoryItem } from './userHistoryItem'
import { PVAudioPlayer } from './playerAudio'

const _fileName = 'src/services/playerBackgroundTimer.ts'

const handleSyncNowPlayingItem = async (currentNowPlayingItem: NowPlayingItem, callback?: any) => {
  if (!currentNowPlayingItem) return

  await clearChapterPlaybackInfo(currentNowPlayingItem)

  await setNowPlayingItemLocally(currentNowPlayingItem, currentNowPlayingItem.userPlaybackPosition || 0)
  if (currentNowPlayingItem && currentNowPlayingItem.clipId && !currentNowPlayingItem.clipIsOfficialChapter) {
    PVEventEmitter.emit(PV.Events.PLAYER_START_CLIP_TIMER)
  }

  PVEventEmitter.emit(PV.Events.PLAYER_TRACK_CHANGED)

  handleEnrichingPlayerState(currentNowPlayingItem)

  // Call addOrUpdateHistoryItem to make sure the current item is saved as the userNowPlayingItem.
  // This is needed when the next episode plays from the background queue
  // outside of user-invoked loadPlayerItem functions.
  // Also, keep the currentNowPlayingItem.userPlaybackPosition if available,
  // because if we use the currentPosition, then it will be a time position
  // less than 00:01, because there is a delay before debouncedSetPlaybackPosition
  // adjusts the timestamp to the correct position.
  const currentPosition = await playerGetPosition()
  await addOrUpdateHistoryItem(
    currentNowPlayingItem,
    currentNowPlayingItem.userPlaybackPosition || currentPosition,
    currentNowPlayingItem.episodeDuration
  )

  callback?.()
}

export const syncAudioNowPlayingItemWithTrack = (track: any, callback?: any) => {
  stopClipInterval()

  /*
    Only call seekTo with initialTime here for Android!
    iOS needs to be handled using iosInitialTime.
    See the discussion here for more info:
    https://github.com/doublesymmetry/react-native-track-player/issues/1903
  */
  if (Platform.OS === 'android') {
    const initialTime = track?.initialTime || 0
    if (initialTime > 0) {
      PVAudioPlayer.seekTo(initialTime)
    }
  }

  // The first setTimeout is an attempt to prevent the following:
  // - Sometimes clips start playing from the beginning of the episode, instead of the start of the clip.
  // - Sometimes the debouncedSetPlaybackPosition seems to load with the previous track's playback position,
  // instead of the new track's playback position.
  // TODO: This timeout will lead to a delay before every clip starts, where it starts playing from the episode start
  // before playing from the clip start. Hopefully we can iron this out sometime...
  // - The second timeout is called in case something was out of sync previously from getCurrentTrack
  // or getEnrichedNowPlayingItemFromLocalStorage...
  function sync(callback?: any) {
    (async () => {
      playerUpdatePlaybackState()

      const currentTrackId = await playerGetCurrentLoadedTrackId()

      /*
        When a new item loads, sometimes that item is not available in the local history
        until a few seconds into the playerLoadNowPlayingItem, so we're reattempting the
        getEnrichedNowPlayingItemFromLocalStorage up to 5 times.
      */
      let retryIntervalCount = 1
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const retryInterval = setInterval(async () => {
        retryIntervalCount += 1
        if (retryIntervalCount >= 10) {
          clearInterval(retryInterval)
        } else {
          const currentNowPlayingItem = await getEnrichedNowPlayingItemFromLocalStorage(currentTrackId)
          if (currentNowPlayingItem && retryInterval) {
            clearInterval(retryInterval)
            await handleSyncNowPlayingItem(currentNowPlayingItem, callback)
            await removeQueueItem(currentNowPlayingItem)
            PVEventEmitter.emit(PV.Events.QUEUE_HAS_UPDATED)
          }
        }
      }, 500)
    })()
  }

  sync(callback)
}

const stopCheckClipIfEndTimeReached = () => {
  (async () => {
    const globalState = getGlobal()
    const { nowPlayingItem } = globalState.player
    if (nowPlayingItem) {
      const { clipEndTime } = nowPlayingItem
      const currentPosition = await playerGetPosition()
      if (clipEndTime && currentPosition > clipEndTime) {
        playerHandlePauseWithUpdate()
        await setClipHasEnded(true)
        stopClipInterval()
      }
    }
  })()
}

const debouncedHandlePlayerClipLoaded = debounce(startCheckClipEndTime, 1000)
// eslint-disable-next-line @typescript-eslint/no-misused-promises
PVEventEmitter.on(PV.Events.PLAYER_START_CLIP_TIMER, debouncedHandlePlayerClipLoaded)

let chapterIntervalSecondCount = 0
let updateUserPlaybackPositionSecondCount = 0
export const handleBackgroundTimerInterval = (isVideo: boolean) => {
  const { chapterIntervalActive, clipIntervalActive, player, session } = getGlobal()
  const { sleepTimer } = player
  const { v4v } = session

  try {
    if (clipIntervalActive) {
      stopCheckClipIfEndTimeReached()
    }
  } catch (error) {
    errorLogger(_fileName, 'handleBackgroundTimerInterval stopCheckClipIfEndTimeReached', error?.message)
  }

  chapterIntervalSecondCount++
  try {
    if (chapterIntervalSecondCount >= 4) {
      chapterIntervalSecondCount = 0
      if (chapterIntervalActive) {
        loadChapterPlaybackInfo()
      }
    }
  } catch (error) {
    errorLogger(_fileName, 'handleBackgroundTimerInterval loadChapterPlaybackInfo', error?.message)
  }

  updateUserPlaybackPositionSecondCount++
  try {
    if (updateUserPlaybackPositionSecondCount >= 59) {
      updateUserPlaybackPositionSecondCount = 0
      playerUpdateUserPlaybackPosition()
    }
  } catch (error) {
    errorLogger(_fileName, 'handleBackgroundTimerInterval playerUpdateUserPlaybackPosition', error?.message)
  }

  try {
    if (sleepTimer?.isActive) {
      handleSleepTimerCountEvent()
    }
  } catch (error) {
    errorLogger(_fileName, 'handleBackgroundTimerInterval handleSleepTimerCountEvent', error?.message)
  }

  try {
    if (v4v?.streamingValueOn) {
      handleValueStreamingTimerIncrement(isVideo)
    }
  } catch (error) {
    errorLogger(_fileName, 'handleBackgroundTimerInterval handleValueStreamingTimerIncrement', error?.message)
  }
}
