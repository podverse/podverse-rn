import { NowPlayingItem } from 'podverse-shared'
import { getGlobal, setGlobal } from 'reactn'
import {
  clearHistoryItems as clearHistoryItemsService,
  filterItemFromHistoryItems,
  filterItemFromHistoryItemsIndex,
  getHistoryItems as getHistoryItemsService,
  getHistoryItemsIndex,
  getHistoryItemsIndexLocally,
  removeHistoryItem as removeHistoryItemService
} from '../../services/userHistoryItem'

export const clearHistoryItems = async () => {
  const globalState = getGlobal()
  await clearHistoryItemsService()
  const historyItemsIndex = await getHistoryItemsIndex()

  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        historyItems: [],
        historyItemsCount: 0,
        historyItemsIndex,
        historyQueryPage: 1
      }
    }
  })
  return []
}

export const getHistoryItems = async (page: number, existingItems: any[]) => {
  const globalState = getGlobal()
  const { userHistoryItems, userHistoryItemsCount } = await getHistoryItemsService(page)
  const historyItemsIndex = await getHistoryItemsIndexLocally()
  const historyQueryPage = page || 1

  let combinedHistoryItems = [] as any
  if (historyQueryPage > 1 && Array.isArray(existingItems) && existingItems.length > 0) {
    combinedHistoryItems = combinedHistoryItems.concat(existingItems)
  }
  combinedHistoryItems = combinedHistoryItems.concat(userHistoryItems)

  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        historyItems: combinedHistoryItems,
        historyItemsCount: userHistoryItemsCount,
        historyItemsIndex,
        historyQueryPage
      }
    }
  })

  return combinedHistoryItems
}

export const updateHistoryItemsIndex = async () => {
  const globalState = getGlobal()
  const historyItemsIndex = await getHistoryItemsIndex()

  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        historyItemsIndex
      }
    }
  })
}

export const removeHistoryItem = async (item: NowPlayingItem) => {
  const globalState = getGlobal()
  const { historyItems, historyItemsIndex } = globalState.session.userInfo
  await removeHistoryItemService(item)

  const remainingHistoryItems = filterItemFromHistoryItems(historyItems, item)
  const remainingHistoryItemsIndex = filterItemFromHistoryItemsIndex(historyItemsIndex, item)

  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        historyItems: remainingHistoryItems,
        historyItemsIndex: remainingHistoryItemsIndex
      }
    }
  })

  return historyItems
}
