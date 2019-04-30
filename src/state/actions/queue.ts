import { setGlobal } from 'reactn'
import { NowPlayingItem } from '../../lib/NowPlayingItem'
import { addQueueItemLast as addQueueItemLastService, addQueueItemNext as addQueueItemNextService,
  removeQueueItem as removeQueueItemService, setAllQueueItems as setAllQueueItemsService
  } from '../../services/queue'

export const updateQueueItems = async (queueItems: NowPlayingItem[], isLoggedIn: boolean, globalState: any) => {
  const results = await setAllQueueItemsService(queueItems, isLoggedIn)
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

export const addQueueItemNext = async (queueItem: NowPlayingItem, isLoggedIn: boolean, globalState: any) => {
  const results = await addQueueItemNextService(queueItem, isLoggedIn)
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

export const addQueueItemLast = async (queueItem: NowPlayingItem, isLoggedIn: boolean, globalState: any) => {
  const results = await addQueueItemLastService(queueItem, isLoggedIn)
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

export const removeQueueItem = async (queueItem: NowPlayingItem, isLoggedIn: boolean, globalState: any) => {
  const results = await removeQueueItemService(queueItem, isLoggedIn)
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
