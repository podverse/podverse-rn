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
        showPlayerBar: true
      }
    })
    const result = await setNowPlayingItemService(item, isLoggedIn)
    setGlobal({
      player: {
        isLoading: false,
        isPlaying: false,
        nowPlayingItem: item,
        showPlayerBar: true
      }
    })

    return result
  } catch (error) {
    setGlobal({
      player: {
        isPlaying: false,
        nowPlayingItem: null,
        showPlayerBar: false
      }
    })

    return {}
  }
}
