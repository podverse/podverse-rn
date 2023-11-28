import { checkIfVideoFileOrVideoLiveType, NowPlayingItem } from 'podverse-shared'
import { getGlobal, setGlobal } from 'reactn'
import {
  audioInitializePlayerQueue as audioInitializePlayerQueueService,
  audioPlayNextFromQueue as audioPlayNextFromQueueService
} from '../../services/playerAudio'
import { getNextFromQueue } from '../../services/queue'
import { playerLoadNowPlayingItem } from './player'
import { getQueueItems } from './queue'

export const audioInitializePlayerQueue = async (item?: NowPlayingItem) => {
  if (!item) {
    const nextItem = await getNextFromQueue()
    item = nextItem
  }

  if (item && !checkIfVideoFileOrVideoLiveType(item?.episodeMediaType)) {
    await playerLoadNowPlayingItem(item, {
      forceUpdateOrderDate: false,
      setCurrentItemNextInQueue: true,
      shouldPlay: false
    })
  }

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
  await audioPlayNextFromQueueService()
  await getQueueItems()
}
