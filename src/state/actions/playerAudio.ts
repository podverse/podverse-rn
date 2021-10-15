import { getGlobal, setGlobal } from 'reactn'
import {
  audioInitializePlayerQueue as audioInitializePlayerQueueService,
  audioLoadNowPlayingItem,
  audioPlayNextFromQueue as audioPlayNextFromQueueService
} from '../../services/playerAudio'
import { trackPlayerScreenPageView } from '../../services/tracking'
import { showMiniPlayer } from './player'
import { getQueueItems } from './queue'

export const audioInitializePlayerQueue = async () => {
  const nowPlayingItem = await audioInitializePlayerQueueService()

  if (nowPlayingItem) {
    const shouldPlay = false
    const forceUpdateOrderDate = false
    await audioLoadNowPlayingItem(nowPlayingItem, shouldPlay, forceUpdateOrderDate)
    showMiniPlayer()
  }

  const globalState = getGlobal()
  setGlobal({
    screenPlayer: {
      ...globalState.screenPlayer,
      isLoading: false
    }
  })
}

export const audioPlayNextFromQueue = async () => {
  const item = await audioPlayNextFromQueueService()
  await getQueueItems()

  if (item) trackPlayerScreenPageView(item)
}
