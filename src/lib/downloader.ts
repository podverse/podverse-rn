import Bottleneck from 'bottleneck'
import { clone } from 'lodash'
import RNBackgroundDownloader from 'react-native-background-downloader'
import RNFS from 'react-native-fs'
import AsyncStorage from '@react-native-community/async-storage'
import { PV } from '../resources'
import { getSecureUrl } from '../services/tools'
import { getPodcastCredentialsHeader } from '../services/parser'
import { getPodcastFeedUrlAuthority } from '../services/podcast'
import * as DownloadState from '../state/actions/downloads'
import { addDownloadedPodcastEpisode, getDownloadedPodcasts } from './downloadedPodcast'
import { addDownloadingEpisode, getDownloadingEpisodes, removeDownloadingEpisode } from './downloadingEpisode'
import { hasValidDownloadingConnection } from './network'
import {
  convertBytesToHumanReadableString,
  getAppUserAgent,
  getExtensionFromUrl,
  safelyUnwrapNestedVariable
} from './utility'

export const BackgroundDownloader = () => {
  const userAgent = getAppUserAgent()
  RNBackgroundDownloader.setHeaders({
    'user-agent': userAgent
  })

  return RNBackgroundDownloader
}

export enum DownloadStatus {
  DOWNLOADING = 'DOWNLOADING',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
  UNKNOWN = 'UNKNOWN',
  PENDING = 'PENDING',
  FINISHED = 'FINISHED',
  ERROR = 'ERROR'
}

const downloadTasks: any[] = []
let existingDownloadTasks: any[] = []

export const cancelDownloadTask = (episodeId: string) => {
  const task = downloadTasks.find((x: any) => x.id === episodeId)
  if (task) task.stop()
}

export const deleteDownloadedEpisode = async (episode: any) => {
  const ext = getExtensionFromUrl(episode.mediaUrl)
  const downloader = await BackgroundDownloader()
  const customLocation = await AsyncStorage.getItem(PV.Keys.EXT_STORAGE_DLOAD_LOCATION)
  const folderPath = customLocation ? customLocation : downloader.directories.documents

  const path = `${folderPath}/${episode.id}${ext}`

  try {
    await RNFS.unlink(path)
    return true
  } catch (error) {
    return false
  }
}

const addDLTask = (episode: any, podcast: any) =>
  DownloadState.addDownloadTask({
    addByRSSPodcastFeedUrl: podcast.addByRSSPodcastFeedUrl,
    episodeChaptersUrl: episode.chaptersUrl,
    episodeCredentialsRequired: episode.credentialsRequired,
    episodeDescription: episode.description,
    episodeDuration: episode.duration,
    episodeFunding: episode.funding,
    episodeId: episode.id,
    episodeImageUrl: episode.imageUrl,
    episodeLinkUrl: episode.linkUrl,
    episodeMediaUrl: episode.mediaUrl,
    episodePubDate: episode.pubDate,
    episodeTitle: episode.title,
    episodeTranscript: episode.transcript,
    episodeValue: episode.value,
    podcastCredentialsRequired: podcast.credentialsRequired,
    podcastFunding: podcast.funding,
    podcastHasVideo: podcast.hasVideo,
    podcastHideDynamicAdsWarning: podcast.hideDynamicAdsWarning,
    podcastId: podcast.id,
    podcastImageUrl: podcast.shrunkImageUrl || podcast.imageUrl,
    podcastIsExplicit: podcast.isExplicit,
    podcastLinkUrl: podcast.linkUrl,
    podcastMedium: podcast.medium,
    podcastShrunkImageUrl: podcast.shrunkImageUrl,
    podcastSortableTitle: podcast.sortableTitle,
    podcastTitle: podcast.title,
    podcastValue: podcast.value
  })

// NOTE: I was unable to get BackgroundDownloader to successfully resume tasks that were
// retrieved from checkForExistingDownloads, so as a workaround, I am forcing those existing tasks
// to always be restarted instead of resumed.
export const downloadEpisode = async (
  origEpisode: any,
  origPodcast: any,
  restart?: boolean,
  waitToAddTask?: boolean
) => {
  // Don't use the original episode/podcast so the object referenced is not updated
  // in components (like the EpisodesScreen).
  const episode = clone(origEpisode)
  const podcast = clone(origPodcast)

  // Updates UI immediately
  if (!waitToAddTask) addDLTask(episode, podcast)

  const shouldDownload = await hasValidDownloadingConnection()

  if (!shouldDownload) {
    console.log('downloadEpisode: Does not have a valid downloading connection')
    return
  }

  const ext = getExtensionFromUrl(episode.mediaUrl)

  if (!restart) {
    const downloadingEpisodes = await getDownloadingEpisodes()
    if (downloadingEpisodes.some((x: any) => x.id === episode.id)) return

    const downloadedPodcasts = await getDownloadedPodcasts()
    for (const downloadedPodcast of downloadedPodcasts) {
      const episodes = safelyUnwrapNestedVariable(() => downloadedPodcast.episodes, [])
      if (episodes.some((x: any) => x.id === episode.id)) return
    }
  }

  // Updates UI only after the previous conditionals pass and it confirmed we want to download the episode
  if (waitToAddTask) addDLTask(episode, podcast)

  let timeout = 0
  const existingTasks = existingDownloadTasks.filter((x: any) => x.id === episode.id)

  for (const t of existingTasks) {
    if (t.id === episode.id) {
      await t.stop()
      timeout = 1000
    }
  }

  const progressLimiter = new Bottleneck({
    highWater: 0,
    maxConcurrent: 1,
    minTime: 2000
  })

  let finalFeedUrl = podcast.addByRSSPodcastFeedUrl
  if (podcast.credentialsRequired && !podcast.addByRSSPodcastFeedUrl && podcast.id) {
    finalFeedUrl = await getPodcastFeedUrlAuthority(podcast.id)
  }

  const downloader = await BackgroundDownloader()
  const customLocation = await AsyncStorage.getItem(PV.Keys.EXT_STORAGE_DLOAD_LOCATION)
  const folderPath = customLocation ? customLocation : downloader.directories.documents

  
  const destination = `${folderPath}/${episode.id}${ext}`
  const Authorization = await getPodcastCredentialsHeader(finalFeedUrl)

  let downloadUrl = episode.mediaUrl
  if (downloadUrl.startsWith('http://')) {
    try {
      const secureUrlInfo = await getSecureUrl(episode.mediaUrl)
      if (secureUrlInfo?.secureUrl) {
        downloadUrl = secureUrlInfo.secureUrl
      }
    } catch (err) {
      console.log('Secure url not found for http mediaUrl. Info: ', err)
    }
  }

  // Wait for t.stop() to complete
  setTimeout(() => {
    const task = downloader
      .download({
        id: episode.id,
        url: downloadUrl,
        destination,
        headers: {
          ...(Authorization ? { Authorization } : {})
        }
      })
      .begin(() => {
        if (!restart) {
          downloadTasks.push(task)
          episode.podcast = podcast
          addDownloadingEpisode(episode)
        } else {
          const downloadTaskIndex = downloadTasks.indexOf((x: any) => x.episodeId === episode.id)
          if (downloadTaskIndex > -1) {
            downloadTasks[downloadTaskIndex] = task
          } else {
            downloadTasks.push(task)
          }
        }
      })
      .progress((percent: number, bytesWritten: number, bytesTotal: number) => {
        progressLimiter
          .schedule(() => {
            const written = convertBytesToHumanReadableString(bytesWritten)
            const total = convertBytesToHumanReadableString(bytesTotal)
            DownloadState.updateDownloadProgress(episode.id, percent, written, total)
          })
          .catch(() => {
            // limiter has been stopped
          })
      })
      .done(async () => {
        await progressLimiter.stop()
        await addDownloadedPodcastEpisode(episode, podcast)

        // Call updateDownloadComplete after updateDownloadedPodcasts
        // to prevent the download icon from flashing in the EpisodeTableCell
        // right after download finishes.
        DownloadState.updateDownloadedPodcasts(() => {
          DownloadState.updateDownloadComplete(episode.id)
          removeDownloadingEpisode(episode.id)
        })
      })
      .error((error: string) => {
        DownloadState.updateDownloadError(episode.id)
        console.log('Download canceled due to error: ', error)
      })
  }, timeout)
}

export const initDownloads = async () => {
  const episodes = await getDownloadingEpisodes()
  const downloader = await BackgroundDownloader()
  existingDownloadTasks = await downloader.checkForExistingDownloads()

  let timeout = 0
  for (const task of existingDownloadTasks) {
    if (!episodes.some((x: any) => x.id === task.id)) {
      await task.stop()
      timeout = 1000
    }
  }

  for (const episode of episodes) {
    if (!existingDownloadTasks.some((x: any) => x.id === episode.id)) {
      await removeDownloadingEpisode(episode.id)
    }
  }

  const downloadTaskStates = []
  for (const downloadTask of existingDownloadTasks) {
    const episode = episodes.find(
      (x: any) =>
        x.id === downloadTask.id &&
        x.status !== DownloadStatus.STOPPED &&
        x.status !== DownloadStatus.UNKNOWN &&
        x.status !== DownloadStatus.FINISHED
    )

    if (episode) {
      const bytesTotal = downloadTask.totalBytes ? convertBytesToHumanReadableString(downloadTask.totalBytes) : '---'
      const podcast = episode.podcast || {}

      downloadTaskStates.push({
        addByRSSPodcastFeedUrl: podcast.addByRSSPodcastFeedUrl || '',
        bytesTotal,
        bytesWritten: '0 KB',
        episodeId: episode.id || '',
        episodeImageUrl: episode.imageUrl || '',
        episodeMediaUrl: episode.mediaUrl || '',
        episodePubDate: episode.pubDate || '',
        episodeTitle: episode.title || '',
        percent: 0,
        podcastId: podcast.id || '',
        podcastImageUrl: podcast.shrunkImageUrl || podcast.imageUrl || '',
        podcastIsExplicit: !!podcast.isExplicit,
        podcastSortableTitle: podcast.sortableTitle || '',
        podcastTitle: podcast.title || '',
        status: downloadTask.state
      } as DownloadState.DownloadTaskState)
    }
  }

  for (const filteredDownloadTask of downloadTaskStates) {
    const episode = episodes.find((x: any) => x.id === filteredDownloadTask.episodeId)
    if (filteredDownloadTask.status === DownloadStatus.DOWNLOADING) {
      if (existingDownloadTasks.some((x: any) => x.id === filteredDownloadTask.episodeId)) {
        // Wait for task.stop() to complete
        setTimeout(() => {
          const restart = true
          downloadEpisode(episode, episode.podcast, restart)
        }, timeout)
      }
    }
  }

  const downloadsActive = {}
  for (const downloadTaskState of downloadTaskStates) {
    if (
      downloadTaskState.episodeId &&
      (downloadTaskState.status === DownloadStatus.DOWNLOADING ||
        downloadTaskState.status === DownloadStatus.PENDING ||
        downloadTaskState.status === DownloadStatus.PAUSED)
    ) {
      downloadsActive[downloadTaskState.episodeId] = true
    }
  }

  return {
    downloadsArray: downloadTaskStates,
    downloadsActive
  }
}

export const resumeDownloadTask = async (downloadTaskState: DownloadState.DownloadTaskState) => {
  const { episodeId } = downloadTaskState
  const task = downloadTasks.find((task) => task.id === episodeId)

  if (existingDownloadTasks.some((x: any) => x.id === episodeId)) {
    const downloadingEpisodes = await getDownloadingEpisodes()
    const episode = downloadingEpisodes.find((x: any) => x.id === episodeId)
    const restart = true
    await downloadEpisode(episode, episode.podcast, restart)
    existingDownloadTasks = existingDownloadTasks.filter((x: any) => x.id !== episodeId)
  } else if (task) {
    task.resume()
  } else {
    const podcast = DownloadState.convertDownloadTaskStateToPodcast(downloadTaskState)
    const episode = DownloadState.convertDownloadTaskStateToEpisode(downloadTaskState)
    const restart = true
    await downloadEpisode(episode, podcast, restart)
  }
}

export const refreshDownloads = async () => {
  const downloadingEpisodes = await getDownloadingEpisodes()
  downloadTasks.forEach((dTask: any) => {
    if (downloadingEpisodes.some((episode: any) => episode.id === dTask.id)) {
      dTask.resume()
    }
  })
}

export const pauseDownloadTask = (downloadTaskState: DownloadState.DownloadTaskState) => {
  const { episodeId } = downloadTaskState
  const task = downloadTasks.find((task) => task.id === episodeId)
  if (task) task.pause()
}

export const checkIfFileIsDownloaded = async (id: string, episodeMediaUrl: string) => {
  let isDownloadedFile = true
  try {
    const filePath = await getDownloadedFilePath(id, episodeMediaUrl)
    await RNFS.stat(filePath)
  } catch (innerErr) {
    isDownloadedFile = false
  }
  return isDownloadedFile
}

export const getDownloadedFilePath = async (id: string, episodeMediaUrl: string) => {
  const ext = getExtensionFromUrl(episodeMediaUrl)
  const downloader = await BackgroundDownloader()
  const customLocation = await AsyncStorage.getItem(PV.Keys.EXT_STORAGE_DLOAD_LOCATION)
  const folderPath = customLocation ? customLocation : downloader.directories.documents
  
  /* If downloaded episode is for an addByRSSPodcast, then the episodeMediaUrl
     will be the id, so remove the URL params from the URL, and don't append
     an extension to the file path.
  */
  if (id && id.indexOf('http') > -1) {
    const idWithoutUrlParams = id.split('?')[0]
    return `${folderPath}/${idWithoutUrlParams}`
  } else {
    return `${folderPath}/${id}${ext}`
  }
}
