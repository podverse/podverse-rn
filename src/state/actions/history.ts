import { setGlobal } from 'reactn'
import { NowPlayingItem } from '../../lib/NowPlayingItem'
import { addOrUpdateHistoryItem as addOrUpdateHistoryItemService, clearHistoryItems as clearHistoryItemsService,
  filterItemFromHistoryItems, getHistoryItems as getHistoryItemsService, removeHistoryItem as removeHistoryItemService
  } from '../../services/history'

export const addOrUpdateHistoryItem = async (item: NowPlayingItem, isLoggedIn: boolean, globalState: any) => {
  const results = await addOrUpdateHistoryItemService(item, isLoggedIn)
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

export const clearHistoryItems = async (isLoggedIn: boolean, globalState: any) => {
  await clearHistoryItemsService(isLoggedIn)
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

export const getHistoryItems = async (isLoggedIn: boolean, globalState: any) => {
  const historyItems = await getHistoryItemsService(isLoggedIn)
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

export const removeHistoryItem = async (item: NowPlayingItem, isLoggedIn: boolean, globalState: any) => {
  await removeHistoryItemService(item, isLoggedIn)
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
