import AsyncStorage from '@react-native-community/async-storage'
import { PV } from '../resources'

export const toggleHideDividersInLists = async () => {
  const hideDividersInLists = await AsyncStorage.getItem(PV.Keys.HIDE_DIVIDERS_IN_LISTS)
  const newValue = !!hideDividersInLists ? false : 'TRUE'
  if (newValue) {
    await AsyncStorage.setItem(PV.Keys.HIDE_DIVIDERS_IN_LISTS, newValue)
  } else {
    await AsyncStorage.removeItem(PV.Keys.HIDE_DIVIDERS_IN_LISTS)
  }
  return !!newValue
}
