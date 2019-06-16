import AsyncStorage from '@react-native-community/async-storage'
import { PV } from '../resources'
import { cancelDownloadTask } from './downloader'

type DownloadingEpisode = {
  id: string
  podcast: any
  title?: string
}

const filterDownloadingEpisodeById = (episodes: DownloadingEpisode[], episodeId: string) => episodes.filter((x) =>
  x.id !== episodeId
)

export const addDownloadingEpisode = async (episode: any) => {
  const episodes = await getDownloadingEpisodes()

  if (episode && episode.id && !episodes.some((x: any) => x.id === episode.id)) {
    episodes.push(episode)
    await setDownloadingEpisodes(episodes)
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
  cancelDownloadTask(episodeId)
  const episodes = await getDownloadingEpisodes()
  const filteredEpisodes = filterDownloadingEpisodeById(episodes, episodeId)
  return setDownloadingEpisodes(filteredEpisodes)
}

const setDownloadingEpisodes = (downloadingEpisodes: DownloadingEpisode[]) => {
  AsyncStorage.setItem(PV.Keys.DOWNLOADING_EPISODES, JSON.stringify(downloadingEpisodes))
}
