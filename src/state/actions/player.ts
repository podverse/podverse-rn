import linkifyHtml from 'linkifyjs/html'
import { setGlobal } from 'reactn'
import { NowPlayingItem } from '../../lib/NowPlayingItem'
import { clone } from '../../lib/utility'
import { PV } from '../../resources'
import { getEpisode } from '../../services/episode'
import { popLastFromHistoryItems } from '../../services/history'
import { getMediaRef } from '../../services/mediaRef'
import { PVTrackPlayer, setNowPlayingItem as setNowPlayingItemService, setPlaybackSpeed as setPlaybackSpeedService
  } from '../../services/player'
import { addQueueItemNext, popNextFromQueue } from '../../services/queue'

export const getPlayingEpisode = async (id: string, globalState: any) => {
  const episode = await getEpisode(id)
  episode.description = episode.description || 'No summary available.'
  episode.description = linkifyHtml(episode.description)

  setGlobal({
    player: {
      ...globalState.player,
      episode
    }
  })
}

export const getPlayingMediaRef = async (mediaRefId: string, globalState: any) => {
  const mediaRef = await getMediaRef(mediaRefId)

  setGlobal({
    player: {
      ...globalState.player,
      mediaRef
    }
  })
}

export const playLastFromHistory = async (isLoggedIn: boolean, globalState: any) => {
  const { currentlyPlayingItem, lastItem } = await popLastFromHistoryItems(isLoggedIn)
  if (currentlyPlayingItem && lastItem) {
    await addQueueItemNext(currentlyPlayingItem, isLoggedIn)
    await setNowPlayingItem(lastItem, isLoggedIn, globalState)
  }
}

export const playNextFromQueue = async (isLoggedIn: boolean, globalState: any) => {
  const item = await popNextFromQueue(isLoggedIn)
  if (item) {
    await setNowPlayingItem(item, isLoggedIn, globalState)
  }
}

export const setNowPlayingItem = async (item: NowPlayingItem, isLoggedIn: boolean, globalState: any) => {
  try {
    const lastNowPlayingItem = clone(globalState.player.nowPlayingItem)
    const isNewEpisode = !lastNowPlayingItem || item.episodeId !== lastNowPlayingItem.episodeId
    const isNewMediaRef = item.clipId && (!lastNowPlayingItem || item.clipId !== lastNowPlayingItem.clipId)
    const newState = {
      player: {
        ...globalState.player,
        ...(isNewEpisode ? { episode: null } : {}),
        ...(isNewMediaRef ? { mediaRef: null } : {}),
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
        viewType: PV.Keys.VIEW_TYPE_SHOW_NOTES,
        showFullClipInfo: false
      }
    }

    setGlobal(newState)

    const result = await setNowPlayingItemService(item, isLoggedIn)

    if (isNewEpisode && item.episodeId) {
      await getPlayingEpisode(item.episodeId, globalState)
    }

    if (isNewMediaRef && item.clipId) {
      await getPlayingMediaRef(item.clipId, globalState)
    }

    setGlobal({
      screenPlayer: {
        ...globalState.screenPlayer,
        isLoading: false
      }
    })

    return result
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

    return {}
  }
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

export const setPlaybackState = async (playbackState: string, globalState: any) => {
  setGlobal({
    player: {
      ...globalState.player,
      playbackState
    }
  })
}
