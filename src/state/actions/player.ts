import { setGlobal } from 'reactn'
import { NowPlayingItem } from '../../lib/NowPlayingItem'
import { setNowPlayingItem as setNowPlayingItemService } from '../../services/player'

export const setNowPlayingItem = async (item: NowPlayingItem, isLoggedIn: boolean) => {
  try {
    setGlobal({
      player: {
        isLoading: true,
        isPlaying: false,
        nowPlayingItem: item,
        showMiniPlayer: true
      }
    })
    const result = await setNowPlayingItemService(item, isLoggedIn)
    setGlobal({
      player: {
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
        isPlaying: false,
        nowPlayingItem: null,
        showMiniPlayer: false
      }
    })

    return {}
  }
}
