import AsyncStorage from '@react-native-community/async-storage'
import { PV } from '../resources'
import { handleAutoQueueDownloadingEpisode } from '../services/autoQueue'

type DownloadingEpisode = {
  id: string
  podcast: any
  title?: string
}

const filterDownloadingEpisodeById = (episodes: DownloadingEpisode[], episodeId: string) =>
  episodes.filter((x) => x.id !== episodeId)

export const addDownloadingEpisode = async (episode: any) => {
  const episodes = await getDownloadingEpisodes()

  if (episode && episode.id && !episodes.some((x: any) => x.id === episode.id)) {
    episodes.push(episode)
    await setDownloadingEpisodes(episodes)
    handleAutoQueueDownloadingEpisode(episode)
  }
}

export const getDownloadingEpisodes = async () => {
  try {
    const itemsString = await AsyncStorage.getItem(PV.Keys.DOWNLOADING_EPISODES)
    return itemsString ? JSON.parse(itemsString) : []
  } catch (error) {
    return []
  }
}

export const removeDownloadingEpisode = async (episodeId: string) => {
  const episodes = await getDownloadingEpisodes()
  const filteredEpisodes = filterDownloadingEpisodeById(episodes, episodeId)
  return setDownloadingEpisodes(filteredEpisodes)
}

const setDownloadingEpisodes = async (downloadingEpisodes: DownloadingEpisode[]) => {
  if (Array.isArray(downloadingEpisodes)) {
    await AsyncStorage.setItem(PV.Keys.DOWNLOADING_EPISODES, JSON.stringify(downloadingEpisodes))
  }
}
