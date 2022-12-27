import AsyncStorage from '@react-native-community/async-storage'
import { convertToNowPlayingItem, Episode, NowPlayingItem } from 'podverse-shared'
import { getGlobal } from 'reactn'
import { errorLogger } from '../lib/logger'
import { PV } from '../resources'
import { getEpisodesSincePubDate } from './episode'
import { addQueueItemLast, addQueueItemNext } from './queue'
import { getNowPlayingItem } from './userNowPlayingItem'

const _fileName = 'src/services/autoQueue.ts'

export type AutoQueueSettingsPosition = 'next' | 'last'

/* Auto queue new episdoes helpers */

export const getAutoQueueSettings = async () => {
  try {
    const itemsString = await AsyncStorage.getItem(PV.Keys.AUTO_QUEUE_SETTINGS)
    return itemsString ? JSON.parse(itemsString) : {}
  } catch (error) {
    errorLogger(_fileName, 'getAutoQueueSettings', error)
    return {}
  }
}

export const updateAutoQueueSettings = async (podcastId: string, autoQueueOn: boolean) => {
  const settings = await getAutoQueueSettings()
  settings[podcastId] = autoQueueOn
  await AsyncStorage.setItem(PV.Keys.AUTO_QUEUE_SETTINGS, JSON.stringify(settings))
  return settings
}

export const removeAutoQueueSetting = async (podcastId: string) => {
  const settings = await getAutoQueueSettings()
  delete settings[podcastId]
  await AsyncStorage.setItem(PV.Keys.AUTO_QUEUE_SETTINGS, JSON.stringify(settings))
  return settings
}

export const getAutoQueueSettingsPosition = async () => {
  try {
    const position = await AsyncStorage.getItem(PV.Keys.AUTO_QUEUE_SETTINGS_POSITION)
    return position ? position : 'last'
  } catch (error) {
    return 'last'
  }
}

export const setAutoQueueSettingsPosition = async (position: AutoQueueSettingsPosition) => {
  await AsyncStorage.setItem(PV.Keys.AUTO_QUEUE_SETTINGS_POSITION, position)
  return position
}

export const handleAutoQueueDownloadingEpisode = async (episode: Episode) => {
  const { autoQueueDownloadsOn } = getGlobal()
  if (autoQueueDownloadsOn && episode) {
    const nowPlayingItem = convertToNowPlayingItem(episode)
    if (nowPlayingItem?.episodeId && !nowPlayingItem.addByRSSPodcastFeedUrl) {
      const autoQueueSettingsPosition = await getAutoQueueSettingsPosition()
      if (autoQueueSettingsPosition === 'next') {
        await addQueueItemNext(nowPlayingItem)
      } else {
        await addQueueItemLast(nowPlayingItem)
      }
    }
  }
}

export const handleAutoQueueEpisodes = async (dateISOString: string) => {
  const currentNowPlayingItem = await getNowPlayingItem()
  const autoQueueSettingsString = await AsyncStorage.getItem(PV.Keys.AUTO_QUEUE_SETTINGS)
  const autoQueueSettings = autoQueueSettingsString ? JSON.parse(autoQueueSettingsString) : {}
  const autoQueuePodcastIds = Object.keys(autoQueueSettings).filter((key: string) => autoQueueSettings[key] === true)

  const autoQueueEpisodes = await getEpisodesSincePubDate(dateISOString, autoQueuePodcastIds)

  // Make sure we accidentally don't send an unlimited number of requests to our server.
  const limitedAutoQueueEpisodes = autoQueueEpisodes.slice(0, 50)

  const unsortedNowPlayingItems: NowPlayingItem[] = []
  for (const episode of limitedAutoQueueEpisodes) {
    unsortedNowPlayingItems.push(convertToNowPlayingItem(episode))
  }

  const autoQueueSettingsPosition = await getAutoQueueSettingsPosition()
  let orderedNowPlayingItems: NowPlayingItem[] = []

  if (autoQueueSettingsPosition === 'next') {
    orderedNowPlayingItems = unsortedNowPlayingItems.sort((a, b) => {
      return new Date(b.episodePubDate) - new Date(a.episodePubDate)
    })
    for (const nowPlayingItem of orderedNowPlayingItems) {
      if (!currentNowPlayingItem || currentNowPlayingItem.episodeId !== nowPlayingItem.episodeId) {
        await addQueueItemNext(nowPlayingItem)
      }
    }
  } else {
    orderedNowPlayingItems = unsortedNowPlayingItems.sort((a, b) => {
      return new Date(a.episodePubDate) - new Date(b.episodePubDate)
    })
    for (const nowPlayingItem of orderedNowPlayingItems) {
      if (!currentNowPlayingItem || currentNowPlayingItem.episodeId !== nowPlayingItem.episodeId) {
        await addQueueItemLast(nowPlayingItem)
      }
    }
  }
}

/* Auto queue downloads helpers */

export const getAutoQueueDownloadsOn = async () => {
  try {
    const booleanString = await AsyncStorage.getItem(PV.Keys.AUTO_QUEUE_DOWNLOADS_ON)
    return booleanString === 'true'
  } catch (error) {
    errorLogger(_fileName, 'getAutoQueueDownloadsOn', error)
    return false
  }
}

export const setAutoQueueDownloadsOn = async (autoQueueDownloadsOn: boolean) => {
  try {
    if (autoQueueDownloadsOn) {
      await AsyncStorage.setItem(PV.Keys.AUTO_QUEUE_DOWNLOADS_ON, 'true')
    } else {
      await AsyncStorage.removeItem(PV.Keys.AUTO_QUEUE_DOWNLOADS_ON)
    }
  } catch (error) {
    errorLogger(_fileName, 'setAutoQueueDownloadsOn', error)
  }
}
