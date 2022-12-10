import AsyncStorage from '@react-native-community/async-storage'
import {
  checkIfVideoFileOrVideoLiveType,
  convertNowPlayingItemClipToNowPlayingItemEpisode,
  convertNowPlayingItemToEpisode,
  convertNowPlayingItemToMediaRef,
  NowPlayingItem
} from 'podverse-shared'
import { getGlobal, setGlobal } from 'reactn'
import { errorLogger } from '../../lib/logger'
import { getParsedTranscript } from '../../lib/transcriptHelpers'
import { PV } from '../../resources'
import PVEventEmitter from '../../services/eventEmitter'
import {
  playerHandlePlayWithUpdate,
  playerLoadNowPlayingItem as playerLoadNowPlayingItemService,
  playerHandleSeekTo,
  playerSetPlaybackSpeed as playerSetPlaybackSpeedService,
  playerTogglePlay as playerTogglePlayService,
  playerGetState,
  playerGetDuration,
  getRemoteSkipButtonsTimeJumpOverride
} from '../../services/player'
import { initSleepTimerDefaultTimeRemaining } from '../../services/sleepTimer'
import { trackPlayerScreenPageView } from '../../services/tracking'
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

export const initializePlayer = async () => {
  const item = await getNowPlayingItemLocally()
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

export const playerPlayPreviousChapterOrReturnToBeginningOfTrack = async () => {
  const globalState = getGlobal()
  const { currentChapters } = globalState

  if (currentChapters && currentChapters.length > 1) {
    const previousChapter = await getChapterPrevious()
    if (previousChapter) {
      await playerHandleSeekTo(previousChapter.startTime)
      setChapterOnGlobalState(previousChapter)
      return
    }
  }

  await playerHandleSeekTo(0)
}

export const playerPlayNextChapterOrQueueItem = async () => {
  const globalState = getGlobal()
  const { currentChapters } = globalState

  if (currentChapters && currentChapters.length > 1) {
    const nextChapter = await getChapterNext()
    if (nextChapter) {
      await playerHandleSeekTo(nextChapter.startTime)
      setChapterOnGlobalState(nextChapter)
      return
    }
  }
  
  await audioPlayNextFromQueue()
}

const playerHandleLoadChapterForNowPlayingEpisode = async (item: NowPlayingItem) => {
  if (item.clipStartTime || item.clipStartTime === 0) {
    playerHandleSeekTo(item.clipStartTime)
    const nowPlayingItemEpisode = convertNowPlayingItemClipToNowPlayingItemEpisode(item)
    await playerSetNowPlayingItem(nowPlayingItemEpisode, item.clipStartTime)
    playerHandlePlayWithUpdate()
    loadChapterPlaybackInfo()
  }
}

export const playerLoadNowPlayingItem = async (
  item: NowPlayingItem,
  shouldPlay: boolean,
  forceUpdateOrderDate: boolean,
  setCurrentItemNextInQueue: boolean
) => {
  const globalState = getGlobal()
  const { nowPlayingItem: previousNowPlayingItem } = globalState.player

  if (item) {
    await clearEnrichedPodcastDataIfNewEpisode(previousNowPlayingItem, item)

    item.clipId
      ? await AsyncStorage.setItem(PV.Keys.PLAYER_CLIP_IS_LOADED, 'TRUE')
      : await AsyncStorage.removeItem(PV.Keys.PLAYER_CLIP_IS_LOADED)

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
      shouldPlay,
      !!forceUpdateOrderDate,
      itemToSetNextInQueue,
      previousNowPlayingItem
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
    const shouldPlay = true
    const forceUpdateOrderDate = true
    const setCurrentItemNextInQueue = false
    playerLoadNowPlayingItem(nowPlayingItem, shouldPlay, forceUpdateOrderDate, setCurrentItemNextInQueue)
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
  trackPlayerScreenPageView(item)
  loadChaptersForNowPlayingItem(item)
  enrichParsedTranscript(item)
}

const enrichParsedTranscript = (item: NowPlayingItem) => {
  if (item?.episodeTranscript && item.episodeTranscript[0] && item.episodeTranscript[0].url) {
    setGlobal({ parsedTranscript: [] }, async () => {
      try {
        const parsedTranscript =
          await getParsedTranscript(item.episodeTranscript[0].url, item.episodeTranscript[0].type)
        setGlobal({ parsedTranscript })
      } catch (error) {
        errorLogger('playerLoadNowPlayingItem transcript parsing error', error)
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
  if (!playbackState) playbackState = await playerGetState()
  const backupDuration = await playerGetDuration()

  const globalState = getGlobal()
  setGlobal({
    player: {
      ...globalState.player,
      playbackState,
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
    remoteSkipButtonsAreTimeJumps
  ] = await Promise.all([
    AsyncStorage.getItem(PV.Keys.PLAYER_PLAYBACK_SPEED),
    AsyncStorage.getItem(PV.Keys.PLAYER_HIDE_PLAYBACK_SPEED_BUTTON),
    getRemoteSkipButtonsTimeJumpOverride()
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
      remoteSkipButtonsAreTimeJumps: !!remoteSkipButtonsAreTimeJumps
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
