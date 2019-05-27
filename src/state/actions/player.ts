import { setGlobal } from 'reactn'
import { NowPlayingItem } from '../../lib/NowPlayingItem'
import { PV } from '../../resources'
import { popLastFromHistoryItems } from '../../services/history'
import { getContinuousPlaybackMode, getNowPlayingItem, getNowPlayingItemEpisode, getNowPlayingItemMediaRef, PVTrackPlayer,
  setContinuousPlaybackMode as setContinuousPlaybackModeService, setNowPlayingItem as setNowPlayingItemService,
  setPlaybackSpeed as setPlaybackSpeedService, togglePlay as togglePlayService } from '../../services/player'
import PlayerEventEmitter from '../../services/playerEventEmitter'
import { addQueueItemNext, popNextFromQueue } from '../../services/queue'

export const initPlayerState = async (globalState: any) => {
  const shouldContinuouslyPlay = await getContinuousPlaybackMode()
  setGlobal({
    player: {
      ...globalState.player,
      shouldContinuouslyPlay
    }
  })
}

export const playLastFromHistory = async (isLoggedIn: boolean, globalState: any) => {
  const { currentlyPlayingItem, lastItem } = await popLastFromHistoryItems(isLoggedIn)
  if (currentlyPlayingItem && lastItem) {
    await addQueueItemNext(currentlyPlayingItem, isLoggedIn)
    await setNowPlayingItem(lastItem, globalState)
  }
}

export const playNextFromQueue = async (isLoggedIn: boolean, globalState: any) => {
  const item = await popNextFromQueue(isLoggedIn)
  if (item) {
    await setNowPlayingItem(item, globalState)
  }
}

export const setContinousPlaybackMode = async (shouldContinuouslyPlay: boolean, globalState: any) => {
  await setContinuousPlaybackModeService(shouldContinuouslyPlay)

  setGlobal({
    player: {
      ...globalState.player,
      shouldContinuouslyPlay
    }
  })

  return shouldContinuouslyPlay
}

export const setNowPlayingItem = async (item: NowPlayingItem, globalState: any, isInitialLoad?: boolean) => {
  return new Promise(async (resolve, reject) => {
    try {
      const lastNowPlayingItem = await getNowPlayingItem()
      const isNewEpisode = true
      const isNewMediaRef = true

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
        const result = await setNowPlayingItemService(item)

        let episode = null
        let mediaRef = null
        if (isNewEpisode) {
          episode = await getNowPlayingItemEpisode()
        }

        if (isNewMediaRef) {
          PlayerEventEmitter.emit(PV.Events.PLAYER_CLIP_LOADED)
          mediaRef = await getNowPlayingItemMediaRef()
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
      })
    } catch (error) {
      console.log(error)
      setGlobal({
        player: {
          ...globalState.player,
          nowPlayingItem: null,
          playbackState: PVTrackPlayer.getState(),
          showMiniPlayer: false
        }
      })

      reject({})
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

export const updatePlaybackState = async (globalState: any) => {
  const playbackState = await PVTrackPlayer.getState()
  const playbackRate = await PVTrackPlayer.getRate()

  setGlobal({
    player: {
      ...globalState.player,
      playbackState: playbackRate > 0 ? PVTrackPlayer.STATE_PLAYING : playbackState
    }
  })
}
