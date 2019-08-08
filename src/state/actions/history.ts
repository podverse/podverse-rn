import { getGlobal, setGlobal } from 'reactn'
import { NowPlayingItem } from '../../lib/NowPlayingItem'
import { addOrUpdateHistoryItem as addOrUpdateHistoryItemService, clearHistoryItems as clearHistoryItemsService,
  filterItemFromHistoryItems, getHistoryItems as getHistoryItemsService, removeHistoryItem as removeHistoryItemService
  } from '../../services/history'

export const addOrUpdateHistoryItem = async (item: NowPlayingItem) => {
  const globalState = getGlobal()
  const results = await addOrUpdateHistoryItemService(item)
  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        historyItems: results
      }
    }
  })
  return results
}

export const clearHistoryItems = async () => {
  const globalState = getGlobal()
  await clearHistoryItemsService()
  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        historyItems: []
      }
    }
  })
  return []
}

export const getHistoryItems = async () => {
  const globalState = getGlobal()
  const historyItems = await getHistoryItemsService()
  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        historyItems
      }
    }
  })
  return historyItems
}

export const removeHistoryItem = async (item: NowPlayingItem) => {
  const globalState = getGlobal()
  await removeHistoryItemService(item)
  const results = filterItemFromHistoryItems(globalState.session.userInfo.historyItems, item)
  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        historyItems: results
      }
    }
  })
  return results
}
