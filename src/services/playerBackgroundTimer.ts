import AsyncStorage from '@react-native-community/async-storage'
import debounce from 'lodash/debounce'
import { NowPlayingItem } from 'podverse-shared'
import { getGlobal, setGlobal } from 'reactn'
import BackgroundTimer from 'react-native-background-timer'
import { translate } from '../lib/i18n'
import { getStartPodcastFromTime } from '../lib/startPodcastFromTime'
import { PV } from '../resources'
import { processValueTransactionQueue, saveStreamingValueTransactionsToTransactionQueue } from '../services/v4v/v4v'
import { handleEnrichingPlayerState, playerUpdatePlaybackState } from '../state/actions/player'
import { clearChapterPlaybackInfo } from '../state/actions/playerChapters'
import { v4vGetCurrentlyActiveProviderInfo } from '../state/actions/v4v/v4v'
import PVEventEmitter from './eventEmitter'
import {
  getClipHasEnded,
  playerCheckIfStateIsPlaying,
  playerGetCurrentLoadedTrackId,
  playerGetPosition,
  playerGetState,
  playerHandlePauseWithUpdate,
  playerSetPositionWhenDurationIsAvailable,
  setClipHasEnded
} from './player'
import { getNowPlayingItemFromLocalStorage, setNowPlayingItemLocally } from './userNowPlayingItem'
import { removeQueueItem } from './queue'
import { addOrUpdateHistoryItem } from './userHistoryItem'

const debouncedSetPlaybackPosition = debounce(playerSetPositionWhenDurationIsAvailable, 1000, {
  leading: true,
  trailing: false
})

const handleSyncNowPlayingItem = async (trackId: string, currentNowPlayingItem: NowPlayingItem) => {
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

  // Call addOrUpdateHistoryItem to make sure the current item is saved as the userNowPlayingItem.
  // I think this is necessary when the next episode plays from the background queue
  // outside of the usual loadPlayerItem process.
  // Also, keep the currentNowPlayingItem.userPlaybackPosition if available,
  // because if we use the currentPosition, then it will be a time position
  // less than 00:01, because there is a delay before debouncedSetPlaybackPosition
  // adjusts the timestamp to the correct position.
  const currentPosition = await playerGetPosition()
  addOrUpdateHistoryItem(
    currentNowPlayingItem,
    currentNowPlayingItem.userPlaybackPosition || currentPosition,
    currentNowPlayingItem.episodeDuration
  )

  handleEnrichingPlayerState(currentNowPlayingItem)
}

export const syncNowPlayingItemWithTrack = () => {
  // If the clipEndInterval is already running, stop it before the clip is
  // reloaded in the handleSyncNowPlayingItem function.
  const checkClipEndTimeShouldStop = true
  const streamingValueShouldStop = false
  stopBackgroundTimerIfShouldBeStopped(checkClipEndTimeShouldStop, streamingValueShouldStop)

  // The first setTimeout is an attempt to prevent the following:
  // - Sometimes clips start playing from the beginning of the episode, instead of the start of the clip.
  // - Sometimes the debouncedSetPlaybackPosition seems to load with the previous track's playback position,
  // instead of the new track's playback position.
  // TODO: This timeout will lead to a delay before every clip starts, where it starts playing from the episode start
  // before playing from the clip start. Hopefully we can iron this out sometime...
  // - The second timeout is called in case something was out of sync previously from getCurrentTrack
  // or getNowPlayingItemFromLocalStorage...
  function sync() {
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
            await handleSyncNowPlayingItem(currentTrackId, currentNowPlayingItem)
            await removeQueueItem(currentNowPlayingItem)
            PVEventEmitter.emit(PV.Events.QUEUE_HAS_UPDATED)
          }
        }
      }, 1000)
    })()
  }

  setTimeout(sync, 1000)
}

/*
  HANDLE CLIP END TIME INTERVAL
*/

const startCheckClipEndTime = async () => {
  const globalState = getGlobal()
  const { nowPlayingItem } = globalState.player

  if (nowPlayingItem) {
    const { clipEndTime, clipId } = nowPlayingItem
    if (clipId && clipEndTime) {
      await setClipHasEnded(false)
      startBackgroundTimer()
    }
  }
}

export const stopBackgroundTimerIfShouldBeStopped = async (
  checkClipEndTimeShouldStop: boolean,
  streamingValueShouldStop: boolean
) => {
  const globalState = getGlobal()
  const { nowPlayingItem } = globalState.player

  if (!checkClipEndTimeShouldStop && nowPlayingItem?.clipEndTime) {
    const clipHasEnded = await getClipHasEnded()
    if (clipHasEnded) {
      checkClipEndTimeShouldStop = true
    }
  }

  const { streamingValueOn } = getGlobal().session.v4v

  if (!streamingValueShouldStop && !streamingValueOn) {
    streamingValueShouldStop = true
  }

  if (checkClipEndTimeShouldStop && streamingValueShouldStop) {
    stopBackgroundTimer()
  }
}

const stopCheckClipIfEndTimeReached = () => {
  (async () => {
    const globalState = getGlobal()
    const { nowPlayingItem } = globalState.player
    if (nowPlayingItem) {
      const { clipEndTime } = nowPlayingItem
      const currentPosition = await playerGetPosition()
      if (currentPosition > clipEndTime) {
        playerHandlePauseWithUpdate()
        await setClipHasEnded(true)
      }
    }
    const checkClipEndTimeStopped = false
    const streamingValueStopped = false
    stopBackgroundTimerIfShouldBeStopped(checkClipEndTimeStopped, streamingValueStopped)
  })()
}

const debouncedHandlePlayerClipLoaded = debounce(startCheckClipEndTime, 1000)
// eslint-disable-next-line @typescript-eslint/no-misused-promises
PVEventEmitter.on(PV.Events.PLAYER_START_CLIP_TIMER, debouncedHandlePlayerClipLoaded)

/*
  HANDLE VALUE STREAMING TOGGLE
*/

const handleValueStreamingToggle = () => {
  const globalState = getGlobal()
  const { streamingValueOn } = globalState.session.v4v

  if (streamingValueOn) {
    startBackgroundTimer()
  } else {
    const checkClipEndTimeShouldStop = false
    const streamingValueShouldStop = true
    stopBackgroundTimerIfShouldBeStopped(checkClipEndTimeShouldStop, streamingValueShouldStop)
  }
}

const handleValueStreamingMinutePassed = async () => {
  const globalState = getGlobal()
  const { nowPlayingItem } = globalState.player

  const { activeProviderSettings } = v4vGetCurrentlyActiveProviderInfo(globalState)
  const { streamingAmount } = activeProviderSettings || {}

  const valueTag = nowPlayingItem.episodeValue || nowPlayingItem.podcastValue

  if (valueTag && streamingAmount) {
    await saveStreamingValueTransactionsToTransactionQueue(valueTag, nowPlayingItem, streamingAmount)
  }
}

PVEventEmitter.on(PV.Events.PLAYER_VALUE_STREAMING_TOGGLED, handleValueStreamingToggle)

/*
  BACKGROUND TIMER
*/

const startBackgroundTimer = () => {
  stopBackgroundTimer()
  BackgroundTimer.runBackgroundTimer(handleBackgroundTimerInterval, 1000)
}

const stopBackgroundTimer = () => {
  BackgroundTimer.stopBackgroundTimer()
}

let valueStreamingIntervalSecondCount = 1
const handleBackgroundTimerInterval = () => {
  stopCheckClipIfEndTimeReached()

  playerGetState().then(async (playbackState) => {
    const globalState = getGlobal()
    const { streamingValueOn } = globalState.session.v4v

    if (streamingValueOn) {
      if (playerCheckIfStateIsPlaying(playbackState)) {
        valueStreamingIntervalSecondCount++

        if (valueStreamingIntervalSecondCount && valueStreamingIntervalSecondCount % 60 === 0) {
          await handleValueStreamingMinutePassed()
        }
      }

      if (valueStreamingIntervalSecondCount === 600) {
        valueStreamingIntervalSecondCount = 1

        const { errors, transactions, totalAmount } = await processValueTransactionQueue()
        if (transactions.length > 0 && totalAmount > 0) {
          setGlobal({
            bannerInfo: {
              show: true,
              description: translate('Streaming Value Sent'),
              errors,
              transactions,
              totalAmount
            }
          })
        }
      }
    }
  })
}
