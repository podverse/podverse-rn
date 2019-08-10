import { getGlobal, setGlobal } from 'reactn'
import { convertNowPlayingItemToEpisode, convertNowPlayingItemToMediaRef, NowPlayingItem } from '../../lib/NowPlayingItem'
import { PV } from '../../resources'
import { getHistoryItemsLocally, popLastFromHistoryItems } from '../../services/history'
import { addItemsToPlayerQueueNext as addItemsToPlayerQueueNextService, clearNowPlayingItem as clearNowPlayingItemService,
  getContinuousPlaybackMode, getNowPlayingItem, initializePlayerQueue as initializePlayerQueueService,
  loadTrackFromQueue as loadTrackFromQueueService, PVTrackPlayer, setContinuousPlaybackMode as setContinuousPlaybackModeService,
  setPlaybackSpeed as setPlaybackSpeedService, togglePlay as togglePlayService, setNowPlayingItem} from '../../services/player'
import { addQueueItemNext, popNextFromQueue } from '../../services/queue'

export const updatePlayerState = async (item: NowPlayingItem) => {
  return new Promise(async (resolve, reject) => {
    const globalState = getGlobal()
    const lastNowPlayingItem = await getNowPlayingItem()
    const isNewEpisode = !lastNowPlayingItem || (item.episodeId !== lastNowPlayingItem.episodeId)
    const isNewMediaRef = item.clipId && (!lastNowPlayingItem || item.clipId !== lastNowPlayingItem.clipId)
    const episode = convertNowPlayingItemToEpisode(item)
    episode.description = episode.description || 'No show notes available'
    const mediaRef = convertNowPlayingItemToMediaRef(item)

    const newState = {
      player: {
        ...globalState.player,
        episode,
        ...(isNewMediaRef || !item.clipId ? { mediaRef } : { mediaRef: null }),
        nowPlayingItem: item,
        showMiniPlayer: true
      },
      screenPlayer: {
        ...globalState.screenPlayer,
        showFullClipInfo: false
      }
    } as any

    if (isNewEpisode) {
      newState.screenPlayer = {
        ...globalState.screenPlayer,
        isLoading: true,
        showFullClipInfo: false,
        viewType: PV.Keys.VIEW_TYPE_SHOW_NOTES
      }
    }

    setGlobal(newState, () => resolve())
  })
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

export const safelyHandleLoadTrack = async (item: NowPlayingItem, shouldPlay: boolean, shouldRemoveFromPVQueue?: boolean) => {
  const id = item.clipId || item.episodeId
  const queueItems = await PVTrackPlayer.getQueue()
  const historyItems = await getHistoryItemsLocally()
  const oldItem = historyItems.find((x: any) => x.clipId === id || (!item.clipId && x.episodeId === id))

  if (oldItem) {
    item.userPlaybackPosition = oldItem.userPlaybackPosition
    await setNowPlayingItem(item)
  }

  if (!queueItems.some((x: any) => x.id === id)) {
    await loadTrackFromQueue(item, shouldPlay)
  } else {
    await addItemsToPlayerQueueNext([item], shouldPlay, shouldRemoveFromPVQueue)
  }
}

export const addItemsToPlayerQueueNext = async (items: NowPlayingItem[], shouldPlay?: boolean, shouldRemoveFromPVQueue?: boolean) => {
  if (items.length < 1) return
  const item = items[0]
  try {
    await updatePlayerState(item)
    try {
      await addItemsToPlayerQueueNextService(items, shouldPlay, shouldRemoveFromPVQueue)
      const episode = convertNowPlayingItemToEpisode(item)
      const mediaRef = convertNowPlayingItemToMediaRef(item)
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

export const loadLastFromHistory = async (shouldPlay: boolean) => {
  const { currentlyPlayingItem, lastItem } = await popLastFromHistoryItems()
  if (currentlyPlayingItem && lastItem) {
    await addQueueItemNext(currentlyPlayingItem)
    await updatePlayerState(lastItem)
    await loadTrackFromQueueService(lastItem, shouldPlay)
  }

  const globalState = getGlobal()
  setGlobal({
    screenPlayer: {
      ...globalState.screenPlayer,
      isLoading: false
    }
  })
}

export const loadNextFromQueue = async (shouldPlay: boolean) => {
  const item = await popNextFromQueue()
  await loadTrackFromQueue(item, shouldPlay)
}

export const loadTrackFromQueue = async (item: NowPlayingItem, shouldPlay: boolean) => {
  if (item) {
    await updatePlayerState(item)
    await loadTrackFromQueueService(item, shouldPlay)
  }

  const globalState = getGlobal()
  setGlobal({
    screenPlayer: {
      ...globalState.screenPlayer,
      isLoading: false
    }
  })
}

export const setContinousPlaybackMode = async (shouldContinuouslyPlay: boolean) => {
  const globalState = getGlobal()
  await setContinuousPlaybackModeService(shouldContinuouslyPlay)

  setGlobal({
    player: {
      ...globalState.player,
      shouldContinuouslyPlay
    }
  })

  return shouldContinuouslyPlay
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

export const togglePlay = async (globalState: any) => {
  const { playbackRate } = globalState.player
  await togglePlayService(playbackRate)
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
