import AsyncStorage from '@react-native-community/async-storage'
import { checkIfContainsStringMatch, getExtensionFromUrl } from 'podverse-shared'
import RNFS from 'react-native-fs'
import { PV } from '../resources'
import PVEventEmitter from '../services/eventEmitter'
import { sortPodcastArrayAlphabetically } from '../services/podcast'
import { clearNowPlayingItem, getNowPlayingItem } from '../services/userNowPlayingItem'
import { errorLogger } from './logger'
import { getDownloadedEpisodeLimits } from './downloadedEpisodeLimiter'
import { BackgroundDownloader, deleteDownloadedEpisode } from './downloader'
import { setItemWithStorageCapacityCheck } from './asyncStorage'

const _fileName = 'src/lib/downloadedPodcast.ts'
export const addDownloadedPodcastEpisode = async (episode: any, podcast: any) => {
  delete episode.podcast
  let downloadedPodcasts = await getDownloadedPodcasts()

  const podcastIndex = downloadedPodcasts.findIndex((x: any) => x.id === podcast.id)
  if (podcastIndex === -1) {
    podcast.episodes = [episode]
    podcast.lastEpisodePubDate = episode.pubDate
    downloadedPodcasts.push(podcast)
    downloadedPodcasts = sortPodcastArrayAlphabetically(downloadedPodcasts)
    await setDownloadedPodcasts(downloadedPodcasts)
  } else {
    let downloadedPodcast = downloadedPodcasts[podcastIndex]
    const downloadedEpisodes = downloadedPodcast.episodes || []
    const episodeIndex = downloadedEpisodes.findIndex((x: any) => x.id === episode.id)
    downloadedPodcast = Object.assign(podcast, downloadedPodcast)

    const downloadedEpisodeLimits = await getDownloadedEpisodeLimits()
    const downloadedEpisodeLimit = downloadedEpisodeLimits[podcast.id]

    if (downloadedEpisodes.length && downloadedEpisodeLimit) {
      downloadedEpisodes.sort((a: any, b: any) => new Date(b.pubDate) - new Date(a.pubDate))
      if (downloadedEpisodes.length >= downloadedEpisodeLimit) {
        const oldestEpisode = downloadedEpisodes[downloadedEpisodes.length - 1]
        await removeDownloadedPodcastEpisode(oldestEpisode.id)
        downloadedEpisodes.pop(downloadedEpisodes.length - 1)
      }
    }

    if (episodeIndex === -1) {
      downloadedEpisodes.push(episode)
      downloadedEpisodes.sort((a: any, b: any) => new Date(b.pubDate) - new Date(a.pubDate))
    }
    if (downloadedEpisodes.length > 0) {
      downloadedPodcast.lastEpisodePubDate = downloadedEpisodes[0].pubDate
    }
    downloadedPodcasts[podcastIndex] = downloadedPodcast
    downloadedPodcasts = sortPodcastArrayAlphabetically(downloadedPodcasts)
    await setDownloadedPodcasts(downloadedPodcasts)
  }
}

export const getDownloadedEpisodeIds = async () => {
  const episodeIds = {}
  const downloadedPodcasts = await getDownloadedPodcasts()
  for (const podcast of downloadedPodcasts) {
    for (const episode of podcast.episodes) {
      episodeIds[episode.id] = true
    }
  }
  return episodeIds
}

export const getDownloadedPodcastEpisodeCounts = async () => {
  const podcastEpisodeCounts = {}
  const downloadedPodcasts = await getDownloadedPodcasts()
  for (const podcast of downloadedPodcasts) {
    const length = (podcast.episodes && podcast.episodes.length) || 0
    podcastEpisodeCounts[podcast.id] = length
  }

  return podcastEpisodeCounts
}

export const getDownloadedEpisodes = async (
  searchPodcastTitle?: string,
  searchEpisodeTitle?: string,
  hasVideo?: boolean,
  sort?: string
) => {
  const finalEpisodes = []
  const downloadedPodcasts = await getDownloadedPodcasts({
    searchTitle: searchPodcastTitle,
    hasVideo
  })

  for (const podcast of downloadedPodcasts) {
    for (const episode of podcast.episodes) {
      if (!searchEpisodeTitle || checkIfContainsStringMatch(searchEpisodeTitle, episode.title)) {
        episode.podcast = podcast
        finalEpisodes.push(episode)
      }
    }
  }

  if (sort === PV.Filters._oldestKey) {
    finalEpisodes.sort((a: any, b: any) => new Date(a.pubDate) - new Date(b.pubDate))
  } else {
    finalEpisodes.sort((a: any, b: any) => new Date(b.pubDate) - new Date(a.pubDate))
  }
  return finalEpisodes
}

export const getDownloadedEpisode = async (episodeId: string) => {
  const episodes = await getDownloadedEpisodes()
  return episodes.find((x) => x.id === episodeId)
}

export const getDownloadedPodcast = async (podcastId: string) => {
  const downloadedPodcasts = await getDownloadedPodcasts()
  const downloadedPodcast = downloadedPodcasts.find((x: any) => x.id === podcastId)
  return downloadedPodcast
}

type GetDownloadedPodcastsParams = {
  hasVideo?: boolean
  isMusic?: boolean
  podcastsOnly?: boolean
  searchTitle?: string
}
export const getDownloadedPodcasts = async (options?: GetDownloadedPodcastsParams) => {
  try {
    const { hasVideo, isMusic, podcastsOnly, searchTitle } = options || {}
    const itemsString = await AsyncStorage.getItem(PV.Keys.DOWNLOADED_PODCASTS)
    let items = itemsString ? JSON.parse(itemsString) : []

    if (isMusic) {
      items = items.filter((podcast: any) => podcast.medium === PV.Medium.music)
    } else if (hasVideo) {
      items = items.filter((podcast: any) => podcast.hasVideo)
    } else if (podcastsOnly) {
      items = items.filter((podcast: any) => podcast.medium === PV.Medium.podcast || podcast.hasVideo)
    }

    if (searchTitle) {
      items = items.filter((podcast: any) => checkIfContainsStringMatch(searchTitle, podcast.title))
    }

    return items
  } catch (error) {
    return []
  }
}

export const refreshDownloadedPodcasts = async () => {
  const downloadedPodcasts = await getDownloadedPodcasts()
  await setDownloadedPodcasts(downloadedPodcasts)
}

export const removeDownloadedPodcastEpisode = async (episodeId: string) => {
  const newPodcasts = []
  const newDownloadedEpisodeIds = {}
  const podcasts = await getDownloadedPodcasts()
  for (const podcast of podcasts) {
    const newEpisodes = []
    for (const episode of podcast.episodes) {
      if (episode.id !== episodeId) {
        newEpisodes.push(episode)
        newDownloadedEpisodeIds[episodeId] = true
      } else {
        await deleteDownloadedEpisode(episode)
      }
    }

    podcast.episodes = newEpisodes
    if (podcast.episodes.length > 0) {
      newPodcasts.push(podcast)
    }
  }
  await setDownloadedPodcasts(newPodcasts)

  const nowPlayingItem = await getNowPlayingItem()
  let clearedNowPlayingItem = false
  if (nowPlayingItem && nowPlayingItem.episodeId === episodeId) {
    clearNowPlayingItem()
    clearedNowPlayingItem = true
  }

  PVEventEmitter.emit(PV.Events.DOWNLOADED_EPISODE_REFRESH)

  return {
    clearedNowPlayingItem,
    downloadedEpisodeIds: newDownloadedEpisodeIds,
    downloadedPodcasts: newPodcasts
  }
}

export const removeDownloadedPodcast = async (podcastId: string) => {
  const downloadedPodcasts = await getDownloadedPodcasts()
  const downloadedPodcast = downloadedPodcasts.find((x: any) => x.id === podcastId)
  const episodes = (downloadedPodcast && downloadedPodcast.episodes) || []
  let clearedNowPlayingItem = false
  if (downloadedPodcast) {
    for (const episode of episodes) {
      const clearedItem = await removeDownloadedPodcastEpisode(episode.id)
      if (clearedItem) clearedNowPlayingItem = true
    }
  }

  return { clearedNowPlayingItem }
}

export const removeAllDownloadedPodcasts = async () => {
  const downloadedPodcasts = await getDownloadedPodcasts()
  for (const podcast of downloadedPodcasts) {
    await removeDownloadedPodcast(podcast.id)
  }
}

const setDownloadedPodcasts = async (podcasts: any[]) => {
  podcasts = sortPodcastArrayAlphabetically(podcasts)
  if (Array.isArray(podcasts)) {
    await setItemWithStorageCapacityCheck(PV.Keys.DOWNLOADED_PODCASTS, JSON.stringify(podcasts))
  }
}

export const removeDownloadedPodcastsFromInternalStorage = async () => {
  const podcasts = await getDownloadedPodcasts()
  for (const podcast of podcasts) {
    for (const episode of podcast.episodes) {
      try {
        await deleteDownloadedEpisode(episode)
      } catch (error) {
        errorLogger(_fileName, 'removeDownloadedPodcastsFromInternalStorage', episode.id)
      }
    }
  }
  PVEventEmitter.emit(PV.Events.DOWNLOADED_EPISODE_REFRESH)
}

export const moveDownloadedPodcastsToExternalStorage = async () => {
  const [podcasts, downloader, destinationFolder] = await Promise.all([
    getDownloadedPodcasts(),
    BackgroundDownloader(),
    AsyncStorage.getItem(PV.Keys.EXT_STORAGE_DLOAD_LOCATION)
  ])

  for (const podcast of podcasts) {
    for (const episode of podcast.episodes) {
      try {
        const ext = getExtensionFromUrl(episode.mediaUrl)
        const source = `${downloader.directories.documents}/${episode.id}${ext}`
        const dest = `${destinationFolder}/${episode.id}${ext}`

        if (destinationFolder) {
          await RNFS.moveFile(source, dest)
        }
      } catch (error) {
        errorLogger(_fileName, 'moveDownloadedPodcastsToExternalStorage', episode.id)
      }
    }
  }
}
