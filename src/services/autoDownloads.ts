import AsyncStorage from '@react-native-community/async-storage'
import { PV } from '../resources'

export const getAutoDownloadSettings = async () => {
  try {
    const itemsString = await AsyncStorage.getItem(PV.Keys.AUTO_DOWNLOAD_SETTINGS)
    return itemsString ? JSON.parse(itemsString) : {}
  } catch (error) {
    return {}
  }
}
export const updateAutoDownloadSettings = async (podcastId: string) => {
  const settings = await getAutoDownloadSettings()
  const currentSetting = settings[podcastId]
  settings[podcastId] = !currentSetting
  AsyncStorage.setItem(PV.Keys.AUTO_DOWNLOAD_SETTINGS, JSON.stringify(settings))
  return settings
}
