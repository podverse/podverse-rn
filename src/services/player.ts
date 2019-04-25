import RNSecureKeyStore, { ACCESSIBLE } from 'react-native-secure-key-store'
import { PV } from '../resources'
import { getQueueItemsLocally, setAllQueueItemsLocally } from './queue'

export const getNowPlayingItem = async () => {
  try {
    const itemString = await RNSecureKeyStore.get(PV.Keys.NOW_PLAYING_ITEM)
    return JSON.parse(itemString)
  } catch (error) {
    setNowPlayingItem(null)
    return []
  }
}

export const setNowPlayingItem = async (item?: any) => {
  const items = await getQueueItemsLocally()
  const filteredItems = items.filter(x => x !== item)
  setAllQueueItemsLocally(filteredItems)

  RNSecureKeyStore.set(
    PV.Keys.NOW_PLAYING_ITEM,
    item ? JSON.stringify(item) : null,
    { accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY }
  )
}
