import { NowPlayingItem } from 'podverse-shared'
import { getGlobal, setGlobal } from 'reactn'
import { PV } from '../../resources'
import PVEventEmitter from '../../services/eventEmitter'
import {
  addQueueItemLast as addQueueItemLastService,
  addQueueItemNext as addQueueItemNextService,
  addQueueItemToServer as addQueueItemToServerService,
  getQueueItems as getQueueItemsService,
  getQueueItemsLocally,
  removeQueueItem as removeQueueItemService,
  setAllQueueItems as setAllQueueItemsService,
  setQueueRepeatModeMusic as setQueueRepeatModeMusicService,
  QueueRepeatModeMusic,
  setQueueEnabledWhileMusicIsPlaying as setQueueEnabledWhileMusicIsPlayingService
} from '../../services/queue'

export const addQueueItemLast = async (queueItem: NowPlayingItem) => {
  const globalState = getGlobal()
  const results = await addQueueItemLastService(queueItem)

  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        queueItems: results
      }
    }
  })

  PVEventEmitter.emit(PV.Events.QUEUE_HAS_UPDATED)

  return results
}

export const addQueueItemNext = async (queueItem: NowPlayingItem) => {
  const globalState = getGlobal()
  const results = await addQueueItemNextService(queueItem)

  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        queueItems: results
      }
    }
  })

  PVEventEmitter.emit(PV.Events.QUEUE_HAS_UPDATED)

  return results
}

export const getQueueItems = async () => {
  const globalState = getGlobal()
  const results = await getQueueItemsService()

  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        queueItems: results
      }
    }
  })

  return results
}

export const removeQueueItem = async (queueItem: NowPlayingItem) => {
  const globalState = getGlobal()
  await removeQueueItemService(queueItem)
  const results = await getQueueItemsLocally()

  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        queueItems: results
      }
    }
  })

  PVEventEmitter.emit(PV.Events.QUEUE_HAS_UPDATED)

  return results
}

export const addQueueItemToServer = async (item: NowPlayingItem, newPosition: number) => {
  const globalState = getGlobal()
  const results = await addQueueItemToServerService(item, newPosition)

  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        queueItems: results
      }
    }
  })

  return results
}

export const setAllQueueItemsLocally = async (queueItems: NowPlayingItem[]) => {
  const globalState = getGlobal()
  const results = await setAllQueueItemsService(queueItems)

  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        queueItems: results
      }
    }
  })

  return results
}

export const setQueueRepeatModeMusic = async (repeatMode: QueueRepeatModeMusic) => {
  const globalState = getGlobal()
  await setQueueRepeatModeMusicService(repeatMode)

  setGlobal({
    player: {
      ...globalState.player,
      queueRepeatModeMusic: repeatMode
    }
  })
}

export const setQueueEnabledWhileMusicIsPlaying = async (val: boolean) => {
  const globalState = getGlobal()
  await setQueueEnabledWhileMusicIsPlayingService(val)

  setGlobal({
    player: {
      ...globalState.player,
      queueEnabledWhileMusicIsPlaying: val
    }
  })
}
