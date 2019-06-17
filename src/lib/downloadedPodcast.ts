import AsyncStorage from '@react-native-community/async-storage'
import { PV } from '../resources'
import { clearNowPlayingItem, getNowPlayingItem } from '../services/player'
import { deleteDownloadedEpisode } from './downloader'

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

export const getDownloadedEpisodeIds = async () => {
  const episodeIds = []
  const downloadedPodcasts = await getDownloadedPodcasts()
  for (const podcast of downloadedPodcasts) {
    for (const episode of podcast.episodes) {
      episodeIds.push(episode.id)
    }
  }
  return episodeIds
}

export const getDownloadedEpisodes = async () => {
  const episodes = []
  const downloadedPodcasts = await getDownloadedPodcasts()
  for (const podcast of downloadedPodcasts) {
    for (const episode of podcast.episodes) {
      episode.podcast = podcast
      episodes.push(episode)
    }
  }
  episodes.sort((a: any, b: any) => new Date(b.pubDate) - new Date(a.pubDate))
  return episodes
}

export const getDownloadedPodcasts = async () => {
  try {
    const itemsString = await AsyncStorage.getItem(PV.Keys.DOWNLOADED_PODCASTS)
    return itemsString ? JSON.parse(itemsString) : []
  } catch (error) {
    return []
  }
}

export const removeDownloadedPodcastEpisode = async (episodeId: string) => {
  const newPodcasts = []
  const newDownloadedEpisodeIds = []
  const podcasts = await getDownloadedPodcasts()
  for (const podcast of podcasts) {
    const newEpisodes = []
    for (const episode of podcast.episodes) {
      if (episode.id !== episodeId) {
        newEpisodes.push(episode)
        newDownloadedEpisodeIds.push(episode.id)
      } else {
        await deleteDownloadedEpisode(episode)
      }
    }

    podcast.episodes = newEpisodes
    if (podcast.episodes.length > 0) {
      newPodcasts.push(podcast)
    }
  }
  setDownloadedPodcasts(newPodcasts)

  const nowPlayingItem = await getNowPlayingItem()
  let clearedNowPlayingItem = false
  if (nowPlayingItem.episodeId === episodeId) {
    clearNowPlayingItem()
    clearedNowPlayingItem = true
  }

  return {
    clearedNowPlayingItem,
    downloadedEpisodeIds: newDownloadedEpisodeIds,
    downloadedPodcasts: newPodcasts
  }
}

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
