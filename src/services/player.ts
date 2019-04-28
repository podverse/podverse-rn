import RNSecureKeyStore, { ACCESSIBLE } from 'react-native-secure-key-store'
import { PV } from '../resources'
import { addOrUpdateHistoryItem } from './history'
import { filterItemFromQueueItems, getQueueItems, setAllQueueItems } from './queue'

export const getNowPlayingItem = async (isLoggedIn: boolean) => {
  try {
    const itemString = await RNSecureKeyStore.get(PV.Keys.NOW_PLAYING_ITEM)
    return JSON.parse(itemString)
  } catch (error) {
    setNowPlayingItem(null, isLoggedIn)
    return null
  }
}

export const setNowPlayingItem = async (item: any, isLoggedIn: boolean) => {
  const items = await getQueueItems(isLoggedIn)
  const filteredItems = filterItemFromQueueItems(items, item)
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
