import { getGlobal, setGlobal } from 'reactn'
import { NowPlayingItem } from '../../lib/NowPlayingItem'
import { PV } from '../../resources'
import { popLastFromHistoryItems } from '../../services/history'
import { getMediaRef } from '../../services/mediaRef'
import { clearNowPlayingItem as clearNowPlayingItemService, getContinuousPlaybackMode, getNowPlayingItem,
  getNowPlayingItemEpisode, getNowPlayingItemMediaRef, PVTrackPlayer,
  setContinuousPlaybackMode as setContinuousPlaybackModeService, setNowPlayingItem as setNowPlayingItemService,
  setPlaybackSpeed as setPlaybackSpeedService, togglePlay as togglePlayService } from '../../services/player'
import PlayerEventEmitter from '../../services/playerEventEmitter'
import { addQueueItemNext, popNextFromQueue } from '../../services/queue'

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

export const playLastFromHistory = async (shouldPlay: boolean) => {
  const { currentlyPlayingItem, lastItem } = await popLastFromHistoryItems()
  if (currentlyPlayingItem && lastItem) {
    await addQueueItemNext(currentlyPlayingItem)
    await setNowPlayingItem(lastItem, false, shouldPlay, lastItem.userPlaybackPosition, true)
  }
}

export const playNextFromQueue = async (shouldPlay: boolean) => {
  const item = await popNextFromQueue()
  if (item) {
    await setNowPlayingItem(item, false, shouldPlay, item.userPlaybackPosition)
  }
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

export const setNowPlayingItem = async (
  item: NowPlayingItem, isInitialLoad?: boolean, startPlayer?: boolean, userPlaybackPosition?: number | null,
  skipAddToHistory?: boolean) => {
  return new Promise(async (resolve, reject) => {
    const globalState = getGlobal()
    try {
      const lastNowPlayingItem = await getNowPlayingItem()
      const isNewEpisode = (isInitialLoad || !lastNowPlayingItem)
        || (item.episodeId !== lastNowPlayingItem.episodeId)
        || (globalState.player && globalState.player.episode && item.episodeId !== globalState.player.episode.id)
      const isNewMediaRef = item.clipId && ((isInitialLoad || !lastNowPlayingItem) || item.clipId !== lastNowPlayingItem.clipId)

      const newState = {
        player: {
          ...globalState.player,
          ...(isNewEpisode ? { episode: null } : {}),
          ...(isNewMediaRef || !item.clipId ? { mediaRef: null } : {}),
          nowPlayingItem: item,
          playbackState: PVTrackPlayer.STATE_BUFFERING,
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

      setGlobal(newState, async () => {

        try {
          let episode = null
          let mediaRef = null

          const result = await setNowPlayingItemService(item, isInitialLoad, startPlayer, userPlaybackPosition, skipAddToHistory)

          if (isNewMediaRef) {
            if (isInitialLoad && item.clipId) {
              mediaRef = await getMediaRef(item.clipId)
            } else {
              mediaRef = await getNowPlayingItemMediaRef()
            }
            PlayerEventEmitter.emit(PV.Events.PLAYER_CLIP_LOADED)
          }

          if (isNewEpisode) {
            episode = await getNowPlayingItemEpisode()
          }

          setGlobal({
            player: {
              ...globalState.player,
              ...(episode ? { episode } : {}),
              ...(mediaRef ? { mediaRef } : {})
            },
            screenPlayer: {
              ...globalState.screenPlayer,
              isLoading: false
            }
          })

          resolve(result)
        } catch (error) {
          setGlobal({
            screenPlayer: {
              ...globalState.screenPlayer,
              isLoading: false
            }
          })

          reject(error)
        }
      })
    } catch (error) {
      setGlobal({
        player: {
          ...globalState.player,
          nowPlayingItem: null,
          playbackState: PVTrackPlayer.getState(),
          showMiniPlayer: false
        }
      })

      reject(error)
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

export const togglePlay = async (globalState: any) => {
  const { playbackRate } = globalState.player
  await togglePlayService(playbackRate)
}

export const updatePlaybackState = async (globalState: any, state?: any) => {
  let playbackState = state

  if (!playbackState) {
    playbackState = await PVTrackPlayer.getState()
  }

  setGlobal({
    player: {
      ...globalState.player,
      playbackState
    }
  })
}
