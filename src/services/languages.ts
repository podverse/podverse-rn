import AsyncStorage from '@react-native-community/async-storage'
import { Keys } from '../resources/Keys'
import { Languages } from '../resources/Languages'

export const getLanguageSelectedKey = async () => {
  let languageSelectedKey = Languages.defaultLanguageKey
  try {
    const str = await AsyncStorage.getItem(Keys.LANGUAGE_SELECTED_KEY)
    if (str && Languages.validLanguageKeys.includes(str)) {
      languageSelectedKey = str
    }
  } catch (error) {
    console.log('getLanguageSelectedKey error', error)
  }
  return languageSelectedKey
}

export const setLanguageSelectedKey = async (value: string) => {
  try {
    await AsyncStorage.setItem(Keys.LANGUAGE_SELECTED_KEY, value)
  } catch (error) {
    console.log('setLanguageSelectedKey error', error)
  }

  return value
}
