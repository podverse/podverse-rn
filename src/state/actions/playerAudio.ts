import { checkIfVideoFileOrVideoLiveType, NowPlayingItem } from 'podverse-shared'
import { getGlobal, setGlobal } from 'reactn'
import {
  audioInitializePlayerQueue as audioInitializePlayerQueueService,
  audioLoadNowPlayingItem,
  audioPlayNextFromQueue as audioPlayNextFromQueueService
} from '../../services/playerAudio'
import { trackPlayerScreenPageView } from '../../services/tracking'
import { showMiniPlayer } from './player'
import { getQueueItems } from './queue'

export const audioInitializePlayerQueue = async (item: NowPlayingItem) => {
  await audioInitializePlayerQueueService(item)

  if (item && !checkIfVideoFileOrVideoLiveType(item?.episodeMediaType)) {
    const shouldPlay = false
    const forceUpdateOrderDate = false
    await audioLoadNowPlayingItem(item, shouldPlay, forceUpdateOrderDate)
    showMiniPlayer()
  }

  const globalState = getGlobal()
  setGlobal({
    screenPlayer: {
      ...globalState.screenPlayer,
      isLoading: false,
      liveStreamWasPaused: false
    }
  })
}

export const audioPlayNextFromQueue = async () => {
  const item = await audioPlayNextFromQueueService()
  await getQueueItems()

  if (item) trackPlayerScreenPageView(item)
}
