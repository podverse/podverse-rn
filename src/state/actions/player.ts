import { getGlobal, setGlobal } from 'reactn'
import { convertNowPlayingItemToEpisode, convertNowPlayingItemToMediaRef, NowPlayingItem } from '../../lib/NowPlayingItem'
import { PV } from '../../resources'
import { getAdjacentItemFromHistoryLocally } from '../../services/history'
import { clearNowPlayingItem as clearNowPlayingItemService, getContinuousPlaybackMode,
  initializePlayerQueue as initializePlayerQueueService, loadItemAndPlayTrack as loadItemAndPlayTrackService,
  playNextFromQueue as playNextFromQueueService, PVTrackPlayer, setNowPlayingItem as setNowPlayingItemService,
  setPlaybackSpeed as setPlaybackSpeedService, togglePlay as togglePlayService } from '../../services/player'

export const updatePlayerState = async (item: NowPlayingItem) => {
  const globalState = getGlobal()
  const episode = convertNowPlayingItemToEpisode(item)
  episode.description = episode.description || 'No show notes available'
  const mediaRef = convertNowPlayingItemToMediaRef(item)

  const newState = {
    player: {
      ...globalState.player,
      episode,
      ...(!item.clipId ? { mediaRef } : { mediaRef: null }),
      nowPlayingItem: item,
      showMiniPlayer: true
    }
  } as any

  if (!item.clipId) {
    newState.screenPlayer = {
      ...globalState.screenPlayer,
      showFullClipInfo: false,
      viewType: PV.Keys.VIEW_TYPE_SHOW_NOTES
    }
  }

  setGlobal(newState)
}

export const initializePlayerQueue = async () => {
  const globalState = getGlobal()
  const nowPlayingItem = await initializePlayerQueueService()
  if (nowPlayingItem) {
    await updatePlayerState(nowPlayingItem)
  }
  setGlobal({
    screenPlayer: {
      ...globalState.screenPlayer,
      isLoading: false
    }
  })
}

export const addItemsToPlayerQueueNext = async (items: NowPlayingItem[], shouldPlay?: boolean, shouldRemoveFromPVQueue?: boolean) => {
  if (items.length < 1) return
  const item = items[0]

  try {
    await addItemsToPlayerQueueNextService(items, shouldPlay, shouldRemoveFromPVQueue)
    const episode = convertNowPlayingItemToEpisode(item)
    const mediaRef = convertNowPlayingItemToMediaRef(item)

    try {
      await updatePlayerState(item)
    } catch (error) {
      const globalState = getGlobal()
      setGlobal({
        player: {
          ...globalState.player,
          nowPlayingItem: null,
          playbackState: PVTrackPlayer.getState(),
          showMiniPlayer: false
        }
      })
    }

    const globalState = getGlobal()
    setGlobal({
      player: {
        ...globalState.player,
        ...(episode && episode.id ? { episode } : {}),
        ...(mediaRef && mediaRef.id ? { mediaRef } : {})
      },
      screenPlayer: {
        ...globalState.screenPlayer,
        isLoading: false
      }
    })
  } catch (error) {
    const globalState = getGlobal()
    setGlobal({
      screenPlayer: {
        ...globalState.screenPlayer,
        isLoading: false
      }
    })
  }
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

export const initPlayerState = async (globalState: any) => {
  const shouldContinuouslyPlay = await getContinuousPlaybackMode()
  setGlobal({
    player: {
      ...globalState.player,
      shouldContinuouslyPlay
    }
  })
}

export const loadAdjacentItemFromHistory = async (shouldStartPlayback: boolean, playNext?: boolean) => {
  const newItemFromHistory = await getAdjacentItemFromHistoryLocally(playNext)

  if (newItemFromHistory) {
    await updatePlayerState(newItemFromHistory)
    const shouldStartClip = !!newItemFromHistory.clipId
    const shouldUpdateHistoryItem = false
    await loadItemAndPlayTrackService(newItemFromHistory, shouldStartPlayback,
      shouldStartClip, shouldUpdateHistoryItem)
  }

  const globalState = getGlobal()
  setGlobal({
    screenPlayer: {
      ...globalState.screenPlayer,
      isLoading: false
    }
  })
}

export const playNextFromQueue = async () => {
  await playNextFromQueueService()
}

export const loadItemAndPlayTrack = async (
  item: NowPlayingItem, shouldPlay: boolean, shouldStartClip: boolean) => {

  if (item) {
    await updatePlayerState(item)
    await loadItemAndPlayTrackService(item, shouldPlay, shouldStartClip)
  }

  const globalState = getGlobal()
  setGlobal({
    screenPlayer: {
      ...globalState.screenPlayer,
      isLoading: false
    }
  })
}

export const setPlaybackSpeed = async (rate: number, globalState: any) => {
  await setPlaybackSpeedService(rate)

  setGlobal({
    player: {
      ...globalState.player,
      playbackRate: rate
    }
  })
}

export const togglePlay = async () => {
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
