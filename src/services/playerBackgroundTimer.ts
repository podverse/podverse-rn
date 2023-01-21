import AsyncStorage from '@react-native-community/async-storage'
import debounce from 'lodash/debounce'
import { NowPlayingItem } from 'podverse-shared'
import { getGlobal } from 'reactn'
import { errorLogger } from '../lib/logger'
import { getStartPodcastFromTime } from '../lib/startPodcastFromTime'
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
  playerSetPositionWhenDurationIsAvailable,
  setClipHasEnded
} from './player'
import { getNowPlayingItemFromLocalStorage, setNowPlayingItemLocally } from './userNowPlayingItem'
import { removeQueueItem } from './queue'
import { handleValueStreamingTimerIncrement } from './v4v/v4vStreaming'
import { addOrUpdateHistoryItem } from './userHistoryItem'

const _fileName = 'src/services/playerBackgroundTimer.ts'

const debouncedSetPlaybackPosition = debounce(playerSetPositionWhenDurationIsAvailable, 1000, {
  leading: true,
  trailing: false
})

const handleSyncNowPlayingItem = async (trackId: string, currentNowPlayingItem: NowPlayingItem, callback?: any) => {
  if (!currentNowPlayingItem) return

  await clearChapterPlaybackInfo(currentNowPlayingItem)

  await setNowPlayingItemLocally(currentNowPlayingItem, currentNowPlayingItem.userPlaybackPosition || 0)
  if (currentNowPlayingItem && currentNowPlayingItem.clipId && !currentNowPlayingItem.clipIsOfficialChapter) {
    PVEventEmitter.emit(PV.Events.PLAYER_START_CLIP_TIMER)
  }

  if (!currentNowPlayingItem.liveItem) {
    if (currentNowPlayingItem && currentNowPlayingItem.clipId) {
      debouncedSetPlaybackPosition(currentNowPlayingItem.clipStartTime || 0)
    } else if (
      !currentNowPlayingItem.clipId &&
      currentNowPlayingItem.userPlaybackPosition &&
      currentNowPlayingItem.userPlaybackPosition >= 5
    ) {
      debouncedSetPlaybackPosition(currentNowPlayingItem.userPlaybackPosition, trackId)
    } else {
      const { podcastId } = currentNowPlayingItem
      const startPodcastFromTime = await getStartPodcastFromTime(podcastId)

      if (!currentNowPlayingItem.clipId && startPodcastFromTime) {
        debouncedSetPlaybackPosition(startPodcastFromTime, trackId)
      }
    }
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

export const syncNowPlayingItemWithTrack = (callback?: any) => {
  stopClipInterval()

  // The first setTimeout is an attempt to prevent the following:
  // - Sometimes clips start playing from the beginning of the episode, instead of the start of the clip.
  // - Sometimes the debouncedSetPlaybackPosition seems to load with the previous track's playback position,
  // instead of the new track's playback position.
  // TODO: This timeout will lead to a delay before every clip starts, where it starts playing from the episode start
  // before playing from the clip start. Hopefully we can iron this out sometime...
  // - The second timeout is called in case something was out of sync previously from getCurrentTrack
  // or getNowPlayingItemFromLocalStorage...
  function sync(callback?: any) {
    (async () => {
      playerUpdatePlaybackState()
      await AsyncStorage.removeItem(PV.Keys.PLAYER_CLIP_IS_LOADED)

      const currentTrackId = await playerGetCurrentLoadedTrackId()
      const setPlayerClipIsLoadedIfClip = true

      /*
        When a new item loads, sometimes that item is not available in the local history
        until a few seconds into the playerLoadNowPlayingItem, so we're reattempting the
        getNowPlayingItemFromLocalStorage up to 5 times.
      */
      let retryIntervalCount = 1
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const retryInterval = setInterval(async () => {
        retryIntervalCount += 1
        if (retryIntervalCount >= 5) {
          clearInterval(retryInterval)
        } else {
          const currentNowPlayingItem = await getNowPlayingItemFromLocalStorage(
            currentTrackId,
            setPlayerClipIsLoadedIfClip
          )
          if (currentNowPlayingItem && retryInterval) {
            clearInterval(retryInterval)
            await handleSyncNowPlayingItem(currentTrackId, currentNowPlayingItem, callback)
            await removeQueueItem(currentNowPlayingItem)
            PVEventEmitter.emit(PV.Events.QUEUE_HAS_UPDATED)
          }
        }
      }, 1000)
    })()
  }

  setTimeout(() => sync(callback), 1000)
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
export const handleBackgroundTimerInterval = () => {
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
    if (chapterIntervalSecondCount >= 3) {
      chapterIntervalSecondCount = 0
      if (chapterIntervalActive) {
        loadChapterPlaybackInfo()
      }
    }
  } catch (error) {
    errorLogger(_fileName, 'handleBackgroundTimerInterval loadChapterPlaybackInfo', error?.message)
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
      handleValueStreamingTimerIncrement()
    }
  } catch (error) {
    errorLogger(_fileName, 'handleBackgroundTimerInterval handleValueStreamingTimerIncrement', error?.message)
  }
}
