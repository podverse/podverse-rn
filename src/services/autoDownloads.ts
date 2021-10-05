import AsyncStorage from '@react-native-community/async-storage'
import { downloadEpisode } from '../lib/downloader'
import { hasValidNetworkConnection } from '../lib/network'
import { PV } from '../resources'
import { getEpisodes } from './episode'
import { parseAllAddByRSSPodcasts } from './parser'

export const handleAutoDownloadEpisodesAddByRSSPodcasts = async () => {
  const isConnected = await hasValidNetworkConnection()
  if (isConnected) {
    const dateStr = await AsyncStorage.getItem(PV.Keys.SUBSCRIBED_PODCASTS_LAST_REFRESHED)
    const dateISOString = (dateStr && new Date(dateStr).toISOString()) || new Date().toISOString()
    await parseAllAddByRSSPodcasts(dateISOString)
  }
}

export const handleAutoDownloadEpisodes = async () => {
  await handleAutoDownloadEpisodesAddByRSSPodcasts()

  const autoDownloadSettingsString = await AsyncStorage.getItem(PV.Keys.AUTO_DOWNLOAD_SETTINGS)
  const autoDownloadSettings = autoDownloadSettingsString ? JSON.parse(autoDownloadSettingsString) : {}
  const podcastIds = Object.keys(autoDownloadSettings).filter((key: string) => autoDownloadSettings[key] === true)

  const dateStr = await AsyncStorage.getItem(PV.Keys.SUBSCRIBED_PODCASTS_LAST_REFRESHED)
  const dateISOString = (dateStr && new Date(dateStr).toISOString()) || new Date().toISOString()
  const autoDownloadEpisodes = await getAutoDownloadEpisodes(dateISOString, podcastIds)

  // Wait for app to initialize. Without this setTimeout, then when getSubscribedPodcasts is called in
  // PodcastsScreen _initializeScreenData, then downloadEpisode will not successfully update global state
  setTimeout(() => {
    (async () => {
      for (const episode of autoDownloadEpisodes[0]) {
        const podcast = {
          id: episode?.podcast?.id,
          imageUrl: episode?.podcast?.shrunkImageUrl || episode?.podcast?.imageUrl,
          title: episode?.podcast?.title
        }
        const restart = false
        const waitToAddTask = true
        await downloadEpisode(episode, podcast, restart, waitToAddTask)
      }
    })()
  }, 3000)

  await AsyncStorage.setItem(PV.Keys.SUBSCRIBED_PODCASTS_LAST_REFRESHED, new Date().toISOString())
}

export const getAutoDownloadEpisodes = async (sincePubDate: string, podcastIds: any[]) => {
  if (podcastIds && podcastIds.length > 0) {
    return getEpisodes({
      podcastId: podcastIds,
      sincePubDate,
      includePodcast: true
    })
  } else {
    return [[], null]
  }
}

export const getAutoDownloadSettings = async () => {
  try {
    const itemsString = await AsyncStorage.getItem(PV.Keys.AUTO_DOWNLOAD_SETTINGS)
    return itemsString ? JSON.parse(itemsString) : {}
  } catch (error) {
    console.log('getAutoDownloadSettings error', error)
    return {}
  }
}

export const updateAutoDownloadSettings = async (podcastId: string) => {
  const settings = await getAutoDownloadSettings()
  const currentSetting = settings[podcastId]
  settings[podcastId] = !currentSetting
  await AsyncStorage.setItem(PV.Keys.AUTO_DOWNLOAD_SETTINGS, JSON.stringify(settings))
  return settings
}

export const removeAutoDownloadSetting = async (podcastId: string) => {
  const settings = await getAutoDownloadSettings()
  delete settings[podcastId]
  await AsyncStorage.setItem(PV.Keys.AUTO_DOWNLOAD_SETTINGS, JSON.stringify(settings))
  return settings
}
