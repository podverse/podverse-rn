import { NowPlayingItem } from 'podverse-shared'
import { getGlobal, setGlobal } from 'reactn'
import {
  audioInitializePlayerQueue as audioInitializePlayerQueueService,
  audioPlayNextFromQueue as audioPlayNextFromQueueService
} from '../../services/playerAudio'
import { trackPlayerScreenPageView } from '../../services/tracking'
import { getQueueItems } from './queue'

export const audioInitializePlayerQueue = async (item: NowPlayingItem) => {
  await audioInitializePlayerQueueService(item)

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
