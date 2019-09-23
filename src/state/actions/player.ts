import { getGlobal, setGlobal } from 'reactn'
import { convertNowPlayingItemToEpisode, convertNowPlayingItemToMediaRef, NowPlayingItem } from '../../lib/NowPlayingItem'
import { PV } from '../../resources'
import { addOrUpdateHistoryItem, getAdjacentItemFromHistoryLocally, getHistoryItemsLocally, addOrUpdateHistoryItemLocally } from '../../services/history'
import { addItemsToPlayerQueueNext as addItemsToPlayerQueueNextService, clearNowPlayingItem as clearNowPlayingItemService,
  getContinuousPlaybackMode, initializePlayerQueue as initializePlayerQueueService,
  loadTrackFromQueue as loadTrackFromQueueService, PVTrackPlayer, setNowPlayingItem as setNowPlayingItemService,
  setPlaybackSpeed as setPlaybackSpeedService, togglePlay as togglePlayService, updateUserPlaybackPosition} from '../../services/player'
import { getNextFromQueue } from '../../services/queue'

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

export const safelyHandleLoadTrack = async (item: NowPlayingItem, shouldPlay: boolean, shouldRemoveFromPVQueue?: boolean) => {
  const id = item.clipId || item.episodeId
  const queueItems = await PVTrackPlayer.getQueue()
  const historyItems = await getHistoryItemsLocally()
  const oldItem = historyItems.find((x: any) => x.clipId === id || (!item.clipId && x.episodeId === id))

  if (oldItem) {
    item.userPlaybackPosition = oldItem.userPlaybackPosition
  }

  // In playerEvents, handleSyncNowPlayingItem uses checkIfPlayingFromHistory to determine
  // if it should addOrUpdate an item to the history or not. Therefore, we need to make sure
  // the track to be played is already in the local history before checkIfPlayingFromHistory is called.
  await addOrUpdateHistoryItemLocally(item)
  updateUserPlaybackPosition()

  if (queueItems.some((x: any) => (x.id === item.clipId) || (!item.clipId && x.id === item.episodeId))) {
    const shouldRemoveFromPVQueue = false
    const shouldStartClip = true
    await loadTrackFromQueue(item, shouldPlay, shouldRemoveFromPVQueue, shouldStartClip)
  } else {
    await addItemsToPlayerQueueNext([item], shouldPlay, shouldRemoveFromPVQueue)
  }
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
    const skipUpdatePlaybackPosition = true
    const shouldStartClip = true
    await loadTrackFromQueueService(newItemFromHistory, shouldStartPlayback, skipUpdatePlaybackPosition, shouldStartClip)
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
  const item = await getNextFromQueue()
  const skipUpdatePlaybackPosition = false
  const shouldStartClip = true
  if (item) {
    await loadTrackFromQueue(item, shouldPlay, skipUpdatePlaybackPosition, shouldStartClip)
    await addOrUpdateHistoryItem(item)
  }
}

export const loadTrackFromQueue = async (
  item: NowPlayingItem, shouldPlay: boolean, skipUpdatePlaybackPosition: boolean, shouldStartClip: boolean) => {

  if (item) {
    await updatePlayerState(item)
    await loadTrackFromQueueService(item, shouldPlay, skipUpdatePlaybackPosition, shouldStartClip)
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
