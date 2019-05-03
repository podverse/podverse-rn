import RNSecureKeyStore, { ACCESSIBLE } from 'react-native-secure-key-store'
import { NowPlayingItem } from '../lib/NowPlayingItem'
import { PV } from '../resources'
import { addOrUpdateHistoryItem } from './history'
import { filterItemFromQueueItems, getQueueItems, setAllQueueItems } from './queue'

export const getNowPlayingItem = async () => {
  try {
    const itemString = await RNSecureKeyStore.get(PV.Keys.NOW_PLAYING_ITEM)
    return JSON.parse(itemString)
  } catch (error) {
    return null
  }
}

export const setNowPlayingItem = async (item: NowPlayingItem, isLoggedIn: boolean) => {
  const items = await getQueueItems(isLoggedIn)

  let filteredItems = [] as any[]
  filteredItems = filterItemFromQueueItems(items, item)
  await setAllQueueItems(filteredItems, isLoggedIn)
  await addOrUpdateHistoryItem(item, isLoggedIn)
  RNSecureKeyStore.set(
    PV.Keys.NOW_PLAYING_ITEM,
    item ? JSON.stringify(item) : null,
    { accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY }
  )

  return {
    nowPlayingItem: item,
    queueItems: filteredItems
  }
}
