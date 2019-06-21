import AsyncStorage from '@react-native-community/async-storage'
import { PV } from '../resources'
import { getEpisodes } from './episode'

export const getAutoDownloadEpisodes = async (sincePubDate: string, podcastIds: any[]) => {
  if (podcastIds && podcastIds.length > 0) {
    return getEpisodes({
      podcastId: podcastIds,
      sincePubDate,
      includePodcast: true
    }, true)
  } else {
    return []
  }
}

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

export const removeAutoDownloadSetting = async (podcastId: string) => {
  const settings = await getAutoDownloadSettings()
  delete settings[podcastId]
  AsyncStorage.setItem(PV.Keys.AUTO_DOWNLOAD_SETTINGS, JSON.stringify(settings))
  return settings
}
