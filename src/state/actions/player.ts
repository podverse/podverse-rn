import { setGlobal } from 'reactn'
import { NowPlayingItem } from '../../lib/NowPlayingItem'
import { setNowPlayingItem as setNowPlayingItemService } from '../../services/player'

export const setNowPlayingItem = async (item: NowPlayingItem, isLoggedIn: boolean) => {
  try {
    await setNowPlayingItemService(item, isLoggedIn)
    setGlobal({
      player: {
        isPlaying: false,
        nowPlayingItem: item,
        showPlayer: true
      }
    })
  } catch (error) {
    setGlobal({
      player: {
        isPlaying: false,
        nowPlayingItem: null,
        showPlayer: false
      }
    })
  }
}
