import AsyncStorage from '@react-native-community/async-storage'
import { errorLogger } from '../lib/logger'
import { downloadEpisode } from '../lib/downloader'
import { hasValidNetworkConnection } from '../lib/network'
import { PV } from '../resources'
import { getEpisodesSincePubDate } from './episode'
import { parseAllAddByRSSPodcasts } from './parser'

const _fileName = 'src/services/autoDownloads.ts'

export const getAutoDownloadsLastRefreshDate = async () => {
  const dateStr = await AsyncStorage.getItem(PV.Keys.AUTODOWNLOADS_LAST_REFRESHED)
  const dateISOString = !!dateStr ? new Date(dateStr).toISOString() : new Date().toISOString()
  return dateISOString
}

export const handleAutoDownloadEpisodesAddByRSSPodcasts = async () => {
  const isConnected = await hasValidNetworkConnection()
  if (isConnected) {
    await parseAllAddByRSSPodcasts()
  }
}

export const handleAutoDownloadEpisodes = async (dateISOString: string) => {
  // SLOW JS -5
  // now it's telling me 0 :/
  await handleAutoDownloadEpisodesAddByRSSPodcasts()

  const autoDownloadSettingsString = await AsyncStorage.getItem(PV.Keys.AUTO_DOWNLOAD_SETTINGS)
  const autoDownloadSettings = autoDownloadSettingsString ? JSON.parse(autoDownloadSettingsString) : {}
  const autoDownloadPodcastIds = Object.keys(autoDownloadSettings).filter(
    (key: string) => autoDownloadSettings[key] === true
  )

  const autoDownloadEpisodes = await getEpisodesSincePubDate(dateISOString, autoDownloadPodcastIds)

  // Wait for app to initialize. Without this setTimeout, then when getSubscribedPodcasts is called in
  // PodcastsScreen _initializeScreenData, then downloadEpisode will not successfully update global state
  setTimeout(() => {
    (async () => {
      for (const episode of autoDownloadEpisodes) {
        // Auto-downloading episode.medium === PV.Medium.music is not currently supported.
        if (episode?.podcast?.medium === PV.Medium.music) continue
        const podcast = {
          id: episode?.podcast?.id,
          imageUrl: episode?.podcast?.shrunkImageUrl || episode?.podcast?.imageUrl,
          shrunkImageUrl: episode?.podcast?.shrunkImageUrl,
          title: episode?.podcast?.title
        }
        const restart = false
        const waitToAddTask = true
        await downloadEpisode(episode, podcast, restart, waitToAddTask)
      }
    })()
  }, 3000)
}

export const getAutoDownloadSettings = async () => {
  try {
    const itemsString = await AsyncStorage.getItem(PV.Keys.AUTO_DOWNLOAD_SETTINGS)
    return itemsString ? JSON.parse(itemsString) : {}
  } catch (error) {
    errorLogger(_fileName, 'getAutoDownloadSettings', error)
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
