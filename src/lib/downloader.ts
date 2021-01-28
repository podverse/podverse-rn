import Bottleneck from 'bottleneck'
import { clone } from 'lodash'
import RNBackgroundDownloader from 'react-native-background-downloader'
import RNFS from 'react-native-fs'
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

export const BackgroundDownloader = async () => {
  const userAgent = await getAppUserAgent()
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
  const path = `${downloader.directories.documents}/${episode.id}${ext}`

  try {
    await RNFS.unlink(path)
    return true
  } catch (error) {
    return false
  }
}

const addDLTask = async (episode: any, podcast: any) =>
  DownloadState.addDownloadTask({
    addByRSSPodcastFeedUrl: podcast.addByRSSPodcastFeedUrl,
    episodeDescription: episode.description,
    episodeDuration: episode.duration,
    episodeId: episode.id,
    episodeImageUrl: episode.imageUrl,
    episodeMediaUrl: episode.mediaUrl,
    episodePubDate: episode.pubDate,
    episodeTitle: episode.title,
    podcastId: podcast.id,
    podcastImageUrl: podcast.shrunkImageUrl || podcast.imageUrl,
    podcastIsExplicit: podcast.isExplicit,
    podcastSortableTitle: podcast.sortableTitle,
    podcastTitle: podcast.title
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
  if (!waitToAddTask) await addDLTask(episode, podcast)

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
  if (waitToAddTask) await addDLTask(episode, podcast)

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

  const downloader = await BackgroundDownloader()
  const destination = `${downloader.directories.documents}/${episode.id}${ext}`

  // Wait for t.stop() to complete
  setTimeout(() => {
    const task = downloader
      .download({
        id: episode.id,
        url: episode.mediaUrl,
        destination
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
      .progress(async (percent: number, bytesWritten: number, bytesTotal: number) => {
        progressLimiter
          .schedule(async () => {
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

      downloadTaskStates.push({
        bytesTotal,
        bytesWritten: '0 KB',
        episodeId: episode.id,
        episodeTitle: episode.title,
        percent: 0,
        podcastImageUrl: episode.podcast.shrunkImageUrl || episode.podcast.imageUrl,
        podcastTitle: (episode.podcast && episode.podcast.title) || '',
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
          downloadEpisode(episode, episode.podcast, true)
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

export const resumeDownloadTask = async (episodeId: string) => {
  const task = downloadTasks.find((task) => task.id === episodeId)
  if (existingDownloadTasks.some((x: any) => x.id === episodeId)) {
    const downloadingEpisodes = await getDownloadingEpisodes()
    const episode = downloadingEpisodes.find((x: any) => x.id === episodeId)
    await downloadEpisode(episode, episode.podcast, true)
    existingDownloadTasks = existingDownloadTasks.filter((x: any) => x.id !== episodeId)
  } else if (task) {
    task.resume()
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

export const pauseDownloadTask = (episodeId: string) => {
  const task = downloadTasks.find((task) => task.id === episodeId)
  if (task) task.pause()
}
