import { getGlobal, setGlobal } from 'reactn'
import { NowPlayingItem } from '../../lib/NowPlayingItem'
import {
  addQueueItemLast as addQueueItemLastService,
  addQueueItemNext as addQueueItemNextService,
  getQueueItems as getQueueItemsService,
  removeQueueItem as removeQueueItemService,
  setAllQueueItems as setAllQueueItemsService
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
  const results = await removeQueueItemService(queueItem)

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

export const updateQueueItems = async (queueItems: NowPlayingItem[]) => {
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
