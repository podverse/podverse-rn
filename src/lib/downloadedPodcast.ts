import AsyncStorage from '@react-native-community/async-storage'
import { PV } from '../resources'

// const filterDownloadingEpisodeById = (episodes: DownloadingEpisode[], episodeId: string) => episodes.filter((x) =>
//   x.id !== episodeId
// )

export const addDownloadedPodcastEpisode = async (episode: any, podcast: any) => {
  delete episode.podcast
  let downloadedPodcasts = await getDownloadedPodcasts()

  const podcastIndex = downloadedPodcasts.findIndex((x: any) => x.id === podcast.id)
  if (podcastIndex === -1) {
    podcast.episodes = [episode]
    downloadedPodcasts.push(podcast)
    downloadedPodcasts = sortPodcastArray(downloadedPodcasts)
    await setDownloadedPodcasts(downloadedPodcasts)
  } else {
    let downloadedPodcast = downloadedPodcasts[podcastIndex]
    const downloadedEpisodes = downloadedPodcast.episodes || []
    const episodeIndex = downloadedEpisodes.findIndex((x: any) => x.id === episode.id)
    downloadedPodcast = Object.assign(podcast, downloadedPodcast)
    if (episodeIndex === -1) {
      downloadedEpisodes.push(episode)
      downloadedEpisodes.sort((a: any, b: any) => new Date(b.pubDate) - new Date(a.pubDate))
    }
    downloadedPodcasts[podcastIndex] = downloadedPodcast
    downloadedPodcasts = sortPodcastArray(downloadedPodcasts)
    await setDownloadedPodcasts(downloadedPodcasts)
  }
}

export const getDownloadedPodcasts = async () => {
  try {
    const itemsString = await AsyncStorage.getItem(PV.Keys.DOWNLOADED_PODCASTS)
    return itemsString ? JSON.parse(itemsString) : []
  } catch (error) {
    return []
  }
}

// export const removeDownloadedPodcastEpisode = async (episodeId: string) => {
//   const episodes = await getDownloadedPodcasts()
//   const filteredEpisodes = filterDownloadingEpisodeById(episodes, episodeId)
//   return setDownloadingEpisodes(filteredEpisodes)
// }

const setDownloadedPodcasts = (podcasts: any[]) => {
  AsyncStorage.setItem(PV.Keys.DOWNLOADED_PODCASTS, JSON.stringify(podcasts))
}

const sortPodcastArray = (podcasts: any[]) => {
  return podcasts.sort((a: any, b: any) => {
    const textA = a.title.toUpperCase()
    const textB = b.title.toUpperCase()
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
  })
}
