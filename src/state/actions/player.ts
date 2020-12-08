import AsyncStorage from '@react-native-community/async-storage'
import { convertNowPlayingItemToEpisode, convertNowPlayingItemToMediaRef, NowPlayingItem } from 'podverse-shared'
import { getGlobal, setGlobal } from 'reactn'
import { PV } from '../../resources'
import {
  clearNowPlayingItem as clearNowPlayingItemService,
  getContinuousPlaybackMode,
  initializePlayerQueue as initializePlayerQueueService,
  loadItemAndPlayTrack as loadItemAndPlayTrackService,
  playNextFromQueue as playNextFromQueueService,
  PVTrackPlayer,
  setNowPlayingItem as setNowPlayingItemService,
  setPlaybackSpeed as setPlaybackSpeedService,
  togglePlay as togglePlayService
} from '../../services/player'
import { initSleepTimerDefaultTimeRemaining } from '../../services/sleepTimer'
import { trackPlayerScreenPageView } from '../../services/tracking'
import { getQueueItems } from '../../state/actions/queue'

export const updatePlayerState = async (item: NowPlayingItem) => {
  if (!item) return

  const globalState = getGlobal()
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

  setGlobal(newState)
}

export const initializePlayerQueue = async () => {
  const globalState = getGlobal()
  const nowPlayingItem = await initializePlayerQueueService()
  if (nowPlayingItem) {
    await showMiniPlayer()
    await updatePlayerState(nowPlayingItem)
  }

  setGlobal({
    screenPlayer: {
      ...globalState.screenPlayer,
      isLoading: false
    }
  })
}

export const clearNowPlayingItem = async () => {
  const globalState = getGlobal()
  await clearNowPlayingItemService()
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

  // NOTE: I'm not sure why this setTimeout is needed but hideMiniPlayer
  // was not working when called in handleQueueEnded without it.
  setTimeout(() => {
    setGlobal({
      player: {
        ...globalState.player,
        showMiniPlayer: false
      }
    })
  }, 0)
}

const showMiniPlayer = async () => {
  const globalState = getGlobal()

  setGlobal({
    player: {
      ...globalState.player,
      showMiniPlayer: true
    }
  })
}

export const initPlayerState = async (globalState: any) => {
  const shouldContinuouslyPlay = await getContinuousPlaybackMode()
  const sleepTimerDefaultTimeRemaining = await initSleepTimerDefaultTimeRemaining()

  setGlobal({
    player: {
      ...globalState.player,
      shouldContinuouslyPlay,
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

export const loadItemAndPlayTrack = async (
  item: NowPlayingItem,
  shouldPlay: boolean,
  skipAddOrUpdateHistory?: boolean
) => {
  if (item) {
    await showMiniPlayer()
    await updatePlayerState(item)
    await loadItemAndPlayTrackService(item, shouldPlay, skipAddOrUpdateHistory)
  }

  const globalState = getGlobal()
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
    }
  )
}

export const setPlaybackSpeed = async (rate: number) => {
  const globalState = getGlobal()
  await setPlaybackSpeedService(rate)

  setGlobal({
    player: {
      ...globalState.player,
      playbackRate: rate
    }
  })
}

export const togglePlay = async () => {
  await showMiniPlayer()
  // If somewhere a play button is pressed, but nothing is currently loaded in the player,
  // then load the last time from memory by re-initializing the player.
  const trackId = await PVTrackPlayer.getCurrentTrack()
  if (!trackId) {
    await initializePlayerQueue()
    return
  }

  await togglePlayService()
}

export const updatePlaybackState = async (state?: any) => {
  const globalState = getGlobal()
  let playbackState = state

  if (!playbackState) playbackState = await PVTrackPlayer.getState()

  setGlobal({
    player: {
      ...globalState.player,
      playbackState
    }
  })
}

export const setNowPlayingItem = async (item: NowPlayingItem | null) => {
  if (item) {
    await setNowPlayingItemService(item)
    await updatePlayerState(item)
  } else {
    await clearNowPlayingItem()
  }
}

export const initializePlaybackSpeed = async () => {
  const globalState = getGlobal()
  const playbackSpeedString = await AsyncStorage.getItem(PV.Keys.PLAYER_PLAYBACK_SPEED)
  let playbackSpeed = 1
  if (playbackSpeedString) {
    playbackSpeed = JSON.parse(playbackSpeedString)
  }

  setGlobal({
    player: {
      ...globalState.player,
      playbackRate: playbackSpeed
    }
  })
}
