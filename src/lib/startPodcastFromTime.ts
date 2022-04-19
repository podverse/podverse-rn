import AsyncStorage from '@react-native-community/async-storage'
import { PV } from '../resources'

export const getStartPodcastFromTime = async (podcastId?: string) => {
  if (podcastId) {
    const allStartPodcastFromTime = await getAllStartPodcastFromTime()
    return allStartPodcastFromTime[podcastId] || 0
  } else {
    return 0
  }
}

export const getAllStartPodcastFromTime = async () => {
  const limits = await AsyncStorage.getItem(PV.Keys.START_PODCAST_FROM_TIME)
  return limits ? JSON.parse(limits) : {}
}

export const setStartPodcastFromTime = async (podcastId?: string, seconds?: number) => {
  if (podcastId) {
    const allStartPodcastFromTime: any = await getAllStartPodcastFromTime()

    if (!seconds) {
      delete allStartPodcastFromTime[podcastId]
    } else {
      allStartPodcastFromTime[podcastId] = seconds
    }

    await AsyncStorage.setItem(PV.Keys.START_PODCAST_FROM_TIME, JSON.stringify(allStartPodcastFromTime))
  }
}
