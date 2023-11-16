import AsyncStorage from '@react-native-community/async-storage'
import debounce from 'lodash/debounce'
import {
  checkIfVideoFileOrVideoLiveType,
  convertNowPlayingItemClipToNowPlayingItemEpisode,
  convertNowPlayingItemToEpisode,
  convertNowPlayingItemToMediaRef,
  NowPlayingItem
} from 'podverse-shared'
import TrackPlayer, { State } from 'react-native-track-player'
import { getGlobal, setGlobal } from 'reactn'
import { errorLogger } from '../../lib/logger'
import { getEpisodeProxyTranscript, getParsedTranscript } from '../../lib/transcriptHelpers'
import { PV } from '../../resources'
import PVEventEmitter from '../../services/eventEmitter'
import { checkIfLiveItemIsLive } from '../../services/liveItem'
import {
  playerHandlePlayWithUpdate as playerHandlePlayWithUpdateService,
  playerLoadNowPlayingItem as playerLoadNowPlayingItemService,
  playerHandleSeekTo,
  playerSetPlaybackSpeed as playerSetPlaybackSpeedService,
  playerTogglePlay as playerTogglePlayService,
  playerGetState,
  playerGetDuration,
  getRemoteSkipButtonsTimeJumpOverride,
  playerGetPosition
} from '../../services/player'
import { getNextFromQueue, getQueueRepeatModeMusic } from '../../services/queue'
import { initSleepTimerDefaultTimeRemaining } from '../../services/sleepTimer'
import { trackPlayerScreenPageView } from '../../services/tracking'
import { addOrUpdateHistoryItem } from '../../services/userHistoryItem'
import {
  clearNowPlayingItem as clearNowPlayingItemService,
  getNowPlayingItemLocally,
  setNowPlayingItem as setNowPlayingItemService
} from '../../services/userNowPlayingItem'
import { clearEpisodesCountForPodcastEpisode } from './newEpisodesCount'
import { audioInitializePlayerQueue, audioPlayNextFromQueue } from './playerAudio'
import { clearChapterPlaybackInfo, getChapterNext, getChapterPrevious, loadChapterPlaybackInfo,
  loadChaptersForNowPlayingItem, 
  setChapterOnGlobalState} from './playerChapters'
import { videoInitializePlayer, videoStateClearVideoInfo,
  videoStateSetVideoInfo } from './playerVideo'
import { v4vEnrichValueTagDataIfNeeded } from './v4v/v4v'

const _fileName = 'src/state/actions/player.ts'

export const initializePlayer = async () => {
  let item = await getNowPlayingItemLocally()
  const isLiveItem = !!item?.liveItem

  if (isLiveItem && item?.episodeId) {
    const isLive = await checkIfLiveItemIsLive(item.episodeId)
    if (!isLive) {
      item = null
      await playerClearNowPlayingItem()
    }

    if (!item) {
      const nextItem = await getNextFromQueue()
      if (nextItem) {
        item = nextItem
      } else {
        return
      }
    }
  }

  if (checkIfVideoFileOrVideoLiveType(item?.episodeMediaType)) {
    videoInitializePlayer(item)
  } else if (!checkIfVideoFileOrVideoLiveType(item?.episodeMediaType)) {
    audioInitializePlayerQueue(item)
  }

  handleEnrichingPlayerState(item)
}

const clearEnrichedPodcastDataIfNewEpisode =
 async (previousNowPlayingItem: NowPlayingItem, nowPlayingItem: NowPlayingItem) => {
  const shouldClearPreviousPlaybackInfo =
    previousNowPlayingItem && previousNowPlayingItem.episodeId !== nowPlayingItem.episodeId
  if (shouldClearPreviousPlaybackInfo) {
    await clearChapterPlaybackInfo(nowPlayingItem)
  }
}

export const playerUpdatePlayerState = (item: NowPlayingItem, callback?: any) => {
  if (!item) return

  const globalState = getGlobal()
  const { videoDuration } = globalState.player.videoInfo

  const episode = convertNowPlayingItemToEpisode(item)
  episode.description = episode.description
  const mediaRef = convertNowPlayingItemToMediaRef(item)

  // For video only, don't let the duration in state be overwritten
  // by asynchronous state updates to the nowPlayingItem.
  if (checkIfVideoFileOrVideoLiveType(item?.episodeMediaType) && videoDuration) {
    item.episodeDuration = videoDuration
  }

  const videoInfo = videoStateSetVideoInfo(item)

  const newState = {
    player: {
      ...globalState.player,
      episode,
      ...(!item.clipId ? { mediaRef } : { mediaRef: null }),
      nowPlayingItem: item,
      videoInfo
    }
  } as any

  if (!item.clipId) {
    newState.screenPlayer = {
      ...globalState.screenPlayer,
      showFullClipInfo: false
    }
  }

  setGlobal(newState, callback)
}

export const playerClearNowPlayingItem = async () => {
  await clearNowPlayingItemService()

  const globalState = getGlobal()
  setGlobal({
    player: {
      ...globalState.player,
      nowPlayingItem: null,
      playbackState: null,
      showMiniPlayer: false,
      videoInfo: videoStateClearVideoInfo()
    },
    screenPlayer: {
      ...globalState.screenPlayer,
      showFullClipInfo: false
    }
  })
}

export const hideMiniPlayer = () => {
  const globalState = getGlobal()
  setGlobal({
    player: {
      ...globalState.player,
      showMiniPlayer: false
    }
  })
}

export const showMiniPlayer = () => {
  const globalState = getGlobal()
  setGlobal({
    player: {
      ...globalState.player,
      showMiniPlayer: true
    }
  })
}

export const initPlayerState = async (globalState: any) => {
  const sleepTimerDefaultTimeRemaining = await initSleepTimerDefaultTimeRemaining()

  setGlobal({
    player: {
      ...globalState.player,
      sleepTimer: {
        defaultTimeRemaining: sleepTimerDefaultTimeRemaining,
        isActive: false,
        timeRemaining: sleepTimerDefaultTimeRemaining
      }
    }
  })
}

const handleSlidingPositionOverride = (startTime: number) => {
  setGlobal({ slidingPositionOverride: startTime })
  setTimeout(() => {
    setGlobal({ slidingPositionOverride: null })
  }, 4333)
}

let skipChapterInterval = false
export function setSkipChapterInterval() {
  skipChapterInterval = true
}

export function getSkipChapterInterval() {
  return skipChapterInterval
}

function clearSkipChapterInterval() {
  skipChapterInterval = false
}

export const debouncedClearSkipChapterInterval = debounce(clearSkipChapterInterval, 2000, {
  leading: false,
  trailing: true
})

export const playerPlayPreviousChapterOrReturnToBeginningOfTrack = async () => {
  const globalState = getGlobal()
  const { currentTocChapters } = globalState

  if (currentTocChapters && currentTocChapters.length > 1) {
    const previousChapter = await getChapterPrevious()
    if (previousChapter) {
      setSkipChapterInterval()
      await playerHandleSeekTo(previousChapter.startTime)
      setChapterOnGlobalState(previousChapter)
      handleSlidingPositionOverride(previousChapter.startTime)
      debouncedClearSkipChapterInterval()
      return
    }
  }

  debouncedClearSkipChapterInterval()
  await playerHandleSeekTo(0)
}

export const playerPlayNextChapterOrQueueItem = async () => {
  const globalState = getGlobal()
  const { currentTocChapters } = globalState

  if (currentTocChapters && currentTocChapters.length > 1) {
    const nextChapter = await getChapterNext()
    if (nextChapter) {
      setSkipChapterInterval()
      await playerHandleSeekTo(nextChapter.startTime)
      setChapterOnGlobalState(nextChapter)
      handleSlidingPositionOverride(nextChapter.startTime)
      debouncedClearSkipChapterInterval()
      return
    }
  }
  
  debouncedClearSkipChapterInterval()
  await audioPlayNextFromQueue()
}

const playerHandleLoadChapterForNowPlayingEpisode = async (item: NowPlayingItem) => {
  if (item.clipStartTime || item.clipStartTime === 0) {
    playerHandleSeekTo(item.clipStartTime)
    const nowPlayingItemEpisode = convertNowPlayingItemClipToNowPlayingItemEpisode(item)
    await playerSetNowPlayingItem(nowPlayingItemEpisode, item.clipStartTime)
    playerHandlePlayWithUpdateService()
    loadChapterPlaybackInfo()
  }
}

export const playerHandlePlayWithUpdate = () => {
  playerHandlePlayWithUpdateService()
  showMiniPlayer()
}

export const playerHandlePauseWithUpdate = () => {
  playerHandlePlayWithUpdateService()
  showMiniPlayer()
}

export const playerHandleResumeAfterClipHasEnded = async () => {
  const [nowPlayingItem, playbackPosition, mediaFileDuration] = await Promise.all([
    getNowPlayingItemLocally(),
    playerGetPosition(),
    playerGetDuration()
  ])
  const nowPlayingItemEpisode = convertNowPlayingItemClipToNowPlayingItemEpisode(nowPlayingItem)
  await addOrUpdateHistoryItem(nowPlayingItemEpisode, playbackPosition, mediaFileDuration)
  playerSetNowPlayingItem(nowPlayingItemEpisode, playbackPosition)
}

type PlayerLoadNowPlayingItemOptions = {
  forceUpdateOrderDate: boolean
  setCurrentItemNextInQueue: boolean
  shouldPlay: boolean
}

export const playerLoadNowPlayingItem = async (
  item: NowPlayingItem,
  options: PlayerLoadNowPlayingItemOptions
) => {
  const { forceUpdateOrderDate, setCurrentItemNextInQueue, shouldPlay } = options
  const globalState = getGlobal()
  const { nowPlayingItem: previousNowPlayingItem } = globalState.player

  if (item) {
    await clearEnrichedPodcastDataIfNewEpisode(previousNowPlayingItem, item)

    if (item.clipIsOfficialChapter) {
      if (previousNowPlayingItem && item.episodeId === previousNowPlayingItem.episodeId) {
        await playerHandleLoadChapterForNowPlayingEpisode(item)
        return
      } else {
        loadChapterPlaybackInfo()
      }
    }

    if (!checkIfVideoFileOrVideoLiveType(item?.episodeMediaType)) {
      playerUpdatePlayerState(item)
    }

    if ((item?.podcastId || item?.addByRSSPodcastFeedUrl) && item?.episodeId) {
      await clearEpisodesCountForPodcastEpisode(item?.podcastId || item?.addByRSSPodcastFeedUrl, item.episodeId)
    }

    const itemToSetNextInQueue = setCurrentItemNextInQueue ? previousNowPlayingItem : null

    await playerLoadNowPlayingItemService(
      item,
      {
        shouldPlay,
        forceUpdateOrderDate: !!forceUpdateOrderDate,
        itemToSetNextInQueue,
        previousNowPlayingItem
      }
    )

    showMiniPlayer()
  }

  setGlobal(
    {
      screenPlayer: {
        ...globalState.screenPlayer,
        isLoading: false,
        liveStreamWasPaused: false
      }
    },
    () => {
      handleEnrichingPlayerState(item)
    }
  )
}

export const goToCurrentLiveTime = () => {
  const { player } = getGlobal()
  let { nowPlayingItem } = player
  nowPlayingItem = nowPlayingItem || {}
  if (checkIfVideoFileOrVideoLiveType(nowPlayingItem?.episodeMediaType)) {
    PVEventEmitter.emit(PV.Events.PLAYER_VIDEO_LIVE_GO_TO_CURRENT_TIME)
  } else {
    playerLoadNowPlayingItem(nowPlayingItem, {
      forceUpdateOrderDate: true,
      setCurrentItemNextInQueue: false,
      shouldPlay: true
    })
  }
}

export const setLiveStreamWasPausedState = (bool: boolean) => {
  const globalState = getGlobal()
  setGlobal({
    screenPlayer: {
      ...globalState.screenPlayer,
      liveStreamWasPaused: bool
    }
  })
}

export const handleEnrichingPlayerState = (item: NowPlayingItem) => {
  if (item) {
    // Be careful not to cause async issues when updating global state with these function calls.
    trackPlayerScreenPageView(item)
    loadChaptersForNowPlayingItem(item)
    enrichParsedTranscript(item)
    v4vEnrichValueTagDataIfNeeded(item)
  }
}

const enrichParsedTranscript = (item: NowPlayingItem) => {
  if (item?.episodeTranscript && item.episodeTranscript[0] && item.episodeTranscript[0].url) {
    setGlobal({ parsedTranscript: [] }, async () => {
      try {
        if (item?.episodeTranscript && item.episodeTranscript[0] && item.episodeTranscript[0].url) {
          let parsedTranscript = null
          if (item?.episodeId) {
            parsedTranscript = await getEpisodeProxyTranscript(item.episodeId)
          } else {
            parsedTranscript = await getParsedTranscript(item.episodeTranscript[0].url)
          }
          setGlobal({ parsedTranscript })
        }
      } catch (error) {
        errorLogger(_fileName, 'playerLoadNowPlayingItem transcript parsing', error)
      }
    })
  } else {
    setGlobal({ parsedTranscript: null })
  }
}

export const playerSetPlaybackSpeed = async (rate: number) => {
  await playerSetPlaybackSpeedService(rate)

  const globalState = getGlobal()
  setGlobal({
    player: {
      ...globalState.player,
      playbackRate: rate
    }
  })

  PVEventEmitter.emit(PV.Events.PLAYER_SPEED_UPDATED)
}

export const playerTogglePlay = async () => {
  // If somewhere a play button is pressed, but nothing is currently loaded in the player,
  // then load the last time from memory by re-initializing the player.
  // TODO VIDEO: check if this is needed
  // const trackId = await audioGetCurrentLoadedTrackId()
  // if (!trackId) {
  //   await audioInitializePlayerQueue()
  // }
  await playerTogglePlayService()

  showMiniPlayer()
}

export const playerUpdatePlaybackState = async (state?: any) => {
  let playbackState = state
  if (!playbackState) {
    playbackState = await playerGetState()
  }

  /*
    Ready is getting returned at errorneous times...so I'm ignoring the ready state.
  */
  if (playbackState === State.Ready) {
    playbackState = getGlobal().player?.playbackState || null
  }

  const backupDuration = await playerGetDuration()
  const globalState = getGlobal()
  setGlobal({
    player: {
      ...globalState.player,
      ...(playbackState ? { playbackState } : {}),
      ...(backupDuration ? { backupDuration } : {})
    }
  })
}

export const playerSetNowPlayingItem = async (item: NowPlayingItem | null, playbackPosition: number) => {
  if (item) {
    await setNowPlayingItemService(item, playbackPosition)
    playerUpdatePlayerState(item)
  }
}

export const initializePlayerSettings = async () => {
  const [
    playbackSpeedString,
    hidePlaybackSpeedButton,
    remoteSkipButtonsAreTimeJumps,
    queueRepeatModeMusic
  ] = await Promise.all([
    AsyncStorage.getItem(PV.Keys.PLAYER_PLAYBACK_SPEED),
    AsyncStorage.getItem(PV.Keys.PLAYER_HIDE_PLAYBACK_SPEED_BUTTON),
    getRemoteSkipButtonsTimeJumpOverride(),
    getQueueRepeatModeMusic()
  ])

  let playbackSpeed = 1
  if (playbackSpeedString) {
    playbackSpeed = JSON.parse(playbackSpeedString)
  }

  const globalState = getGlobal()
  setGlobal({
    player: {
      ...globalState.player,
      playbackRate: playbackSpeed,
      hidePlaybackSpeedButton: !!hidePlaybackSpeedButton,
      remoteSkipButtonsAreTimeJumps: !!remoteSkipButtonsAreTimeJumps,
      queueRepeatModeMusic
    }
  })
}

/*
  Always send the event to destroy the previous video players
  before navigating to the player screen.
*/
export const handleNavigateToPlayerScreen = (
  navigation: any,
  nowPlayingItem?: NowPlayingItem,
  addByRSSPodcastFeedUrl?: string,
  isDarkMode?: boolean
) => {
  PVEventEmitter.emit(PV.Events.PLAYER_VIDEO_DESTROY_PRIOR_PLAYERS)
  setTimeout(() => {
    navigation.navigate(PV.RouteNames.PlayerScreen, {
      ...(nowPlayingItem ? { nowPlayingItem } : {}),
      ...(addByRSSPodcastFeedUrl ? { addByRSSPodcastFeedUrl } : {}),
      ...(isDarkMode ? { isDarkMode } : {})
    })
  }, 0)
}
