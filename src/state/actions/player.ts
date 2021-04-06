import AsyncStorage from '@react-native-community/async-storage'
import {
  convertNowPlayingItemClipToNowPlayingItemEpisode,
  convertNowPlayingItemToEpisode,
  convertNowPlayingItemToMediaRef,
  NowPlayingItem
} from 'podverse-shared'
import { getGlobal, setGlobal } from 'reactn'
import { PV } from '../../resources'
import PVEventEmitter from '../../services/eventEmitter'
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
import { clearChapterPlaybackInfo, loadChapterPlaybackInfo, loadChaptersForNowPlayingItem } from './playerChapters'

const clearChaptersIfNewEpisode = async (previousNowPlayingItem: NowPlayingItem, nowPlayingItem: NowPlayingItem) => {
  const shouldClearPreviousPlaybackInfo =
    previousNowPlayingItem && previousNowPlayingItem.episodeId !== nowPlayingItem.episodeId
  if (shouldClearPreviousPlaybackInfo) {
    await clearChapterPlaybackInfo()
  }
}

export const updatePlayerState = async (item: NowPlayingItem) => {
  if (!item) return

  const globalState = getGlobal()

  const previousNowPlayingItem = globalState.player.nowPlayingItem || {}
  await clearChaptersIfNewEpisode(previousNowPlayingItem, item)
  loadChaptersForNowPlayingItem(item)

  const episode = convertNowPlayingItemToEpisode(item)
  episode.description = episode.description || 'No show notes available'
  const mediaRef = convertNowPlayingItemToMediaRef(item)

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

  setGlobal(newState, () => {
    PVEventEmitter.emit(PV.Events.UPDATE_PLAYER_STATE_FINISHED)
  })
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

export const playNextFromQueue = async () => {
  const item = await playNextFromQueueService()
  await getQueueItems()

  if (item) trackPlayerScreenPageView(item)
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
    const { nowPlayingItem: previousNowPlayingItem } = globalState.player

    await clearChaptersIfNewEpisode(previousNowPlayingItem, item)

    item.clipId
      ? await AsyncStorage.setItem(PV.Keys.PLAYER_CLIP_IS_LOADED, 'TRUE')
      : await AsyncStorage.removeItem(PV.Keys.PLAYER_CLIP_IS_LOADED)

    if (item.clipIsOfficialChapter) {
      if (previousNowPlayingItem && item.episodeId === previousNowPlayingItem.episodeId) {
        await handleLoadChapterForNowPlayingEpisode(item)
        return
      } else {
        loadChapterPlaybackInfo()
      }
    }

    await updatePlayerState(item)

    // If the value tag is unavailable, try to enrich it from Podcast Index API
    // then make sure the enrichedItem is on global state.
    const enrichedItem = await loadItemAndPlayTrackService(item, shouldPlay, forceUpdateOrderDate)
    if (enrichedItem) await updatePlayerState(enrichedItem)

    showMiniPlayer()
  }

  setGlobal(
    {
      screenPlayer: {
        ...globalState.screenPlayer,
        isLoading: false
      }
    },
    () => {
      trackPlayerScreenPageView(item)
      loadChaptersForNowPlayingItem(item)
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
  const trackId = await PVTrackPlayer.getCurrentLoadedTrack()
  if (!trackId) {
    await initializePlayerQueue()
  }
  await togglePlayService()

  showMiniPlayer()
}

export const updatePlaybackState = async (state?: any) => {
  let playbackState = state

  if (!playbackState) playbackState = await PVTrackPlayer.getState()

  const backupDuration = await PVTrackPlayer.getTrackDuration()

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
