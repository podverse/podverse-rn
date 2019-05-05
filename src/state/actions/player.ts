import linkifyHtml from 'linkifyjs/html'
import { setGlobal } from 'reactn'
import { NowPlayingItem } from '../../lib/NowPlayingItem'
import { getEpisode } from '../../services/episode'
import { getMediaRef } from '../../services/mediaRef'
import { setNowPlayingItem as setNowPlayingItemService } from '../../services/player'

export const setNowPlayingItem = async (item: NowPlayingItem, isLoggedIn: boolean, globalState: any) => {
  try {
    setGlobal({
      player: {
        episode: null,
        isLoading: true,
        isPlaying: false,
        mediaRef: null,
        nowPlayingItem: item,
        showMiniPlayer: true
      }
    })
    const result = await setNowPlayingItemService(item, isLoggedIn)
    setGlobal({
      player: {
        ...globalState.player,
        isLoading: false,
        isPlaying: false,
        nowPlayingItem: item,
        showMiniPlayer: true
      }
    })

    return result
  } catch (error) {
    setGlobal({
      player: {
        ...globalState.player,
        isPlaying: false,
        nowPlayingItem: null,
        showMiniPlayer: false
      }
    })

    return {}
  }
}

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

export const getPlayingEpisodeAndMediaRef = async (episodeId: string, mediaRefId: string, globalState: any) => {
  const episode = await getEpisode(episodeId)
  episode.description = episode.description || 'No summary available.'
  episode.description = linkifyHtml(episode.description)
  const mediaRef = await getMediaRef(mediaRefId)

  setGlobal({
    player: {
      ...globalState.player,
      episode,
      mediaRef
    }
  })
}
