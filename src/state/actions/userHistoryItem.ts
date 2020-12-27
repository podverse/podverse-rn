import { NowPlayingItem } from 'podverse-shared'
import { getGlobal, setGlobal } from 'reactn'
import {
  clearHistoryItems as clearHistoryItemsService,
  getHistoryItems as getHistoryItemsService,
  removeHistoryItem as removeHistoryItemService
} from '../../services/userHistoryItem'

export const clearHistoryItems = async () => {
  const globalState = getGlobal()
  await clearHistoryItemsService()
  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        historyItems: [],
        historyItemsIndex: {}
      }
    }
  })
  return []
}

export const getHistoryItems = async () => {
  const globalState = getGlobal()
  const { historyItems, historyItemsIndex } = await getHistoryItemsService()
  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        historyItems,
        historyItemsIndex
      }
    }
  })
  return historyItems
}

export const removeHistoryItem = async (item: NowPlayingItem) => {
  const globalState = getGlobal()
  const { historyItems, historyItemsIndex } = await removeHistoryItemService(item)

  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        historyItems,
        historyItemsIndex
      }
    }
  })

  return historyItems
}
