import AsyncStorage from '@react-native-community/async-storage'
import { PV } from '../resources'
import { getAuthenticatedUserInfoLocally } from '../services/auth'

export const getDownloadedEpisodeLimit = async (podcastId: string) => {
  const downloadedEpisodeLimits = await getDownloadedEpisodeLimits()
  return downloadedEpisodeLimits[podcastId]
}

export const getDownloadedEpisodeLimits = async () => {
  const limits = await AsyncStorage.getItem(PV.Keys.DOWNLOADED_EPISODE_LIMITS)
  return limits ? JSON.parse(limits) : {}
}

export const setDownloadedEpisodeLimit = async (
  podcastId: string,
  limit?: number
) => {
  const downloadedEpisodeLimits: any = await getDownloadedEpisodeLimits()
  downloadedEpisodeLimits[podcastId] = limit && limit > 0 ? limit : null
  await AsyncStorage.setItem(
    PV.Keys.DOWNLOADED_EPISODE_LIMITS,
    JSON.stringify(downloadedEpisodeLimits)
  )
}

export const setAllDownloadedEpisodeLimits = async (episodeLimits: any) => {
  if (episodeLimits) {
    await AsyncStorage.setItem(
      PV.Keys.DOWNLOADED_EPISODE_LIMITS,
      JSON.stringify(episodeLimits)
    )
  } else {
    await AsyncStorage.removeItem(PV.Keys.DOWNLOADED_EPISODE_LIMITS)
  }
}

export const setDownloadedEpisodeLimitGlobalCount = async (
  limit?: number | string
) => {
  if (!limit) {
    await AsyncStorage.removeItem(PV.Keys.DOWNLOADED_EPISODE_LIMIT_GLOBAL_COUNT)
  }

  if (limit) {
    const parsedInt = Number.isInteger(limit) ? limit : parseInt(limit, 10)
    await AsyncStorage.setItem(
      PV.Keys.DOWNLOADED_EPISODE_LIMIT_GLOBAL_COUNT,
      JSON.stringify(parsedInt)
    )
  }
}

export const setDownloadedEpisodeLimitGlobalDefault = async (bool: boolean) => {
  if (bool) {
    await AsyncStorage.setItem(
      PV.Keys.DOWNLOADED_EPISODE_LIMIT_GLOBAL_DEFAULT,
      JSON.stringify(bool)
    )
  } else {
    await AsyncStorage.removeItem(
      PV.Keys.DOWNLOADED_EPISODE_LIMIT_GLOBAL_DEFAULT
    )
  }
}

export const updateAllDownloadedEpisodeLimitCounts = async (count: number) => {
  const userInfo = await getAuthenticatedUserInfoLocally()
  const info = userInfo[0]
  const { subscribedPodcastIds } = info ? info : {}
  const limits = {}

  const downloadedEpisodeLimits = await getDownloadedEpisodeLimits()

  for (const id of subscribedPodcastIds) {
    const shouldSetCount = downloadedEpisodeLimits[id]
    limits[id] = shouldSetCount ? count : null
  }
  setAllDownloadedEpisodeLimits(limits)
}

export const updateAllDownloadedEpisodeLimitDefaults = async (bool: boolean) => {
  const userInfo = await getAuthenticatedUserInfoLocally()
  const subscribedPodcastIds = userInfo[0]
    ? userInfo[0].subscribedPodcastIds
    : []
  const limits = {}
  const globalDownloadedEpisodeLimitCount = await AsyncStorage.getItem(PV.Keys.DOWNLOADED_EPISODE_LIMIT_GLOBAL_COUNT) as any
  for (const id of subscribedPodcastIds) {
    limits[id] = bool ? globalDownloadedEpisodeLimitCount : null
  }
  setAllDownloadedEpisodeLimits(limits)
}
