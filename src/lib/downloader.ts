import RNBackgroundDownloader from 'react-native-background-downloader'
import RNFS from 'react-native-fs'
import * as DownloadState from '../state/actions/downloads'
import { addDownloadedPodcastEpisode, getDownloadedPodcasts } from './downloadedPodcast'
import { addDownloadingEpisode, getDownloadingEpisodes, removeDownloadingEpisode } from './downloadingEpisode'
import { hasValidDownloadingConnection } from './network'
import { convertBytesToHumanReadableString, getExtensionFromUrl } from './utility'

export enum DownloadStatus {
  DOWNLOADING = 'DOWNLOADING',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
  UNKNOWN = 'UNKNOWN',
  PENDING = 'PENDING',
  FINISHED = 'FINISHED'
}

const downloadTasks: any[] = []
let existingDownloadTasks: any[] = []

export const cancelDownloadTask = (episodeId: string) => {
  const task = downloadTasks.find((x: any) => x.id === episodeId)
  if (task) task.stop()
}

export const deleteDownloadedEpisode = async (episode: any) => {
  const ext = getExtensionFromUrl(episode.mediaUrl)
  const path = `${RNBackgroundDownloader.directories.documents}/${episode.id}${ext}`

  try {
    await RNFS.unlink(path)
    return true
  } catch (error) {
    return false
  }
}

// NOTE: I was unable to get RNBackgroundDownloader to successfully resume tasks that were
// retrieved from checkForExistingDownloads, so as a workaround, I am forcing those existing tasks
// to always be restarted instead of resumed.
export const downloadEpisode = async (episode: any, podcast: any, restart?: boolean) => {
  const shouldDownload = await hasValidDownloadingConnection()
  if (!shouldDownload) return
  const ext = getExtensionFromUrl(episode.mediaUrl)

  if (!restart) {
    const downloadingEpisodes = await getDownloadingEpisodes()
    if (downloadingEpisodes.some((x: any) => x.id === episode.id)) return

    const downloadedPodcasts = await getDownloadedPodcasts()
    for (const downloadedPodcast of downloadedPodcasts) {
      if (downloadedPodcast.episodes &&
        downloadedPodcast.episodes.some((x: any) => x.id === episode.id)) return
    }
  }

  let timeout = 0
  const existingTasks = existingDownloadTasks.filter((x: any) => x.id === episode.id)
  for (const t of existingTasks) {
    if (t.id === episode.id) {
      await t.stop()
      timeout = 1000
    }
  }

  // Wait for t.stop() to complete
  setTimeout(() => {
    const task = RNBackgroundDownloader
      .download({
        id: episode.id,
        url: episode.mediaUrl,
        destination: `${RNBackgroundDownloader.directories.documents}/${episode.id}${ext}`
      })
      .begin(() => {
        if (!restart) {
          downloadTasks.push(task)
          episode.podcast = podcast
          DownloadState.addDownloadTask({
            episodeId: episode.id,
            episodeTitle: episode.title,
            podcastImageUrl: podcast.imageUrl,
            podcastTitle: podcast.title
          })
          addDownloadingEpisode(episode)
        } else {
          const downloadTaskIndex = downloadTasks.indexOf((x: any) => x.episodeId === episode.id)
          if (downloadTaskIndex > -1) {
            downloadTasks[downloadTaskIndex] = task
          } else {
            downloadTasks.push(task)
          }
        }

      }).progress((percent: number, bytesWritten: number, bytesTotal: number) => {
        const written = convertBytesToHumanReadableString(bytesWritten)
        const total = convertBytesToHumanReadableString(bytesTotal)
        DownloadState.updateDownloadProgress(episode.id, percent, written, total)
      }).done(async () => {
        DownloadState.updateDownloadComplete(episode.id)
        removeDownloadingEpisode(episode.id)
        await addDownloadedPodcastEpisode(episode, podcast)
        DownloadState.updateDownloadedEpisodeIds()
        console.log('downloadEpisode complete')
      }).error((error: string) => {
        console.log('Download canceled due to error: ', error)
      })
  }, timeout)
}

export const initDownloads = async () => {
  const episodes = await getDownloadingEpisodes()
  existingDownloadTasks = await RNBackgroundDownloader.checkForExistingDownloads()

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
    const episode = episodes.find((x: any) =>
      x.id === downloadTask.id && x.status !== DownloadStatus.STOPPED &&
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
        podcastImageUrl: episode.podcast.imageUrl,
        podcastTitle: episode.podcast.title,
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

  return downloadTaskStates
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

export const pauseDownloadTask = (episodeId: string) => {
  const task = downloadTasks.find((task) => task.id === episodeId)
  if (task) task.pause()
}
