import AsyncStorage from '@react-native-community/async-storage'
import {
  convertNowPlayingItemClipToNowPlayingItemEpisode,
  convertNowPlayingItemToEpisode,
  convertNowPlayingItemToMediaRef,
  NowPlayingItem
} from 'podverse-shared'
import { getGlobal, setGlobal } from 'reactn'
import { PV } from '../../resources'
import {
  initializePlayerQueue as initializePlayerQueueService,
  loadItemAndPlayTrack as loadItemAndPlayTrackService,
  playNextFromQueue as playNextFromQueueService,
  PVTrackPlayer,
  setPlaybackPosition,
  setPlaybackSpeed as setPlaybackSpeedService,
  togglePlay as togglePlayService
} from '../../services/player'
import { initSleepTimerDefaultTimeRemaining } from '../../services/sleepTimer'
import { trackPlayerScreenPageView } from '../../services/tracking'
import {
  clearNowPlayingItem as clearNowPlayingItemService,
  setNowPlayingItem as setNowPlayingItemService
} from '../../services/userNowPlayingItem'
import { getQueueItems } from '../../state/actions/queue'
import {
  clearChapterPlaybackInfo,
  loadChapterPlaybackInfo,
  retriveNowPlayingItemChapters,
  setChaptersOnGlobalState
} from './playerChapters'

export const updatePlayerState = async (item: NowPlayingItem) => {
  if (!item) return

  const episode = convertNowPlayingItemToEpisode(item)
  episode.description = episode.description || 'No show notes available'
  const mediaRef = convertNowPlayingItemToMediaRef(item)
  const globalState = getGlobal()

  const newState = {
    player: {
      ...globalState.player,
      episode,
      ...(!item.clipId ? { mediaRef } : { mediaRef: null }),
      nowPlayingItem: item
    }
  } as any

  if (!item.clipId) {
    newState.screenPlayer = {
      ...globalState.screenPlayer,
      showFullClipInfo: false
    }
  }

  setGlobal(newState)
}

export const initializePlayerQueue = async () => {
  const nowPlayingItem = await initializePlayerQueueService()

  if (nowPlayingItem) {
    const shouldPlay = false
    await loadItemAndPlayTrack(nowPlayingItem, shouldPlay)
    showMiniPlayer()
  }

  const globalState = getGlobal()
  setGlobal({
    screenPlayer: {
      ...globalState.screenPlayer,
      isLoading: false
    }
  })
}

export const clearNowPlayingItem = async () => {
  await clearNowPlayingItemService()

  const globalState = getGlobal()
  setGlobal({
    player: {
      ...globalState.player,
      nowPlayingItem: null,
      playbackState: PVTrackPlayer.STATE_STOPPED,
      showMiniPlayer: false
    },
    screenPlayer: {
      ...globalState.screenPlayer,
      showFullClipInfo: false
    }
  })
}

export const hideMiniPlayer = async () => {
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

export const playNextFromQueue = async () => {
  const item = await playNextFromQueueService()
  await getQueueItems()

  if (item) {
    const globalState = getGlobal()
    trackPlayerScreenPageView(item, globalState)
  }
}

const handleLoadChapterForNowPlayingEpisode = async (item: NowPlayingItem) => {
  setPlaybackPosition(item.clipStartTime)
  const nowPlayingItemEpisode = convertNowPlayingItemClipToNowPlayingItemEpisode(item)
  await setNowPlayingItem(nowPlayingItemEpisode, item.clipStartTime || 0)
  await PVTrackPlayer.play()
  loadChapterPlaybackInfo()
}

export const loadItemAndPlayTrack = async (
  item: NowPlayingItem,
  shouldPlay: boolean,
  forceUpdateOrderDate?: boolean
) => {
  const globalState = getGlobal()

  if (item) {
    const { nowPlayingItem: lastNowPlayingItem } = globalState.player

    const shouldClearPreviousPlaybackInfo = lastNowPlayingItem && lastNowPlayingItem.episodeId !== item.episodeId
    if (shouldClearPreviousPlaybackInfo) {
      await clearChapterPlaybackInfo()
    }

    if (item.clipIsOfficialChapter) {
      if (lastNowPlayingItem && item.episodeId === lastNowPlayingItem.episodeId) {
        await handleLoadChapterForNowPlayingEpisode(item)
        return
      } else {
        await loadChapterPlaybackInfo()
      }
    }

    await updatePlayerState(item)
    await loadItemAndPlayTrackService(item, shouldPlay, forceUpdateOrderDate)
    showMiniPlayer()
  }

  setGlobal(
    {
      screenPlayer: {
        ...globalState.screenPlayer,
        isLoading: false
      }
    },
    async () => {
      const globalState = getGlobal()
      trackPlayerScreenPageView(item, globalState)
      if (item && item.episodeId) {
        const currentChapters = await retriveNowPlayingItemChapters(item.episodeId)
        setChaptersOnGlobalState(currentChapters)
      }
    }
  )
}

export const setPlaybackSpeed = async (rate: number) => {
  await setPlaybackSpeedService(rate)

  const globalState = getGlobal()
  setGlobal({
    player: {
      ...globalState.player,
      playbackRate: rate
    }
  })
}

export const togglePlay = async () => {
  // If somewhere a play button is pressed, but nothing is currently loaded in the player,
  // then load the last time from memory by re-initializing the player.
  const trackId = await PVTrackPlayer.getCurrentTrack()
  if (!trackId) {
    await initializePlayerQueue()
  }
  await togglePlayService()

  showMiniPlayer()
}

export const updatePlaybackState = async (state?: any) => {
  let playbackState = state

  if (!playbackState) playbackState = await PVTrackPlayer.getState()

  const backupDuration = await PVTrackPlayer.getDuration()

  const globalState = getGlobal()
  setGlobal({
    player: {
      ...globalState.player,
      playbackState,
      ...(backupDuration ? { backupDuration } : {})
    }
  })
}

export const setNowPlayingItem = async (item: NowPlayingItem | null, playbackPosition: number) => {
  if (item) {
    await setNowPlayingItemService(item, playbackPosition)
    await updatePlayerState(item)
  }
}

export const initializePlaybackSpeed = async () => {
  const playbackSpeedString = await AsyncStorage.getItem(PV.Keys.PLAYER_PLAYBACK_SPEED)
  let playbackSpeed = 1
  if (playbackSpeedString) {
    playbackSpeed = JSON.parse(playbackSpeedString)
  }

  const globalState = getGlobal()
  setGlobal({
    player: {
      ...globalState.player,
      playbackRate: playbackSpeed
    }
  })
}
