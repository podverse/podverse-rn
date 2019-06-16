import RNBackgroundDownloader from 'react-native-background-downloader'
import * as DownloadState from '../state/actions/downloads'
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

export const downloadEpisode = (episode: any, podcast: any) => {
  const ext = getExtensionFromUrl(episode.mediaUrl)

  const task = RNBackgroundDownloader
    .download({
      id: episode.id,
      url: episode.mediaUrl,
      destination: `${RNBackgroundDownloader.directories.documents}/${episode.id}${ext}`
    })
    .begin(() => {
      downloadTasks.push(task)
      episode.podcast = podcast

      DownloadState.addDownloadTask({
        episodeId: episode.id,
        episodeTitle: episode.title,
        podcastImageUrl: podcast.imageUrl,
        podcastTitle: podcast.title
      })
      addDownloadingEpisode(episode)
    }).progress((percent: number, bytesWritten: number, bytesTotal: number) => {
      const written = convertBytesToHumanReadableString(bytesWritten)
      const total = convertBytesToHumanReadableString(bytesTotal)
      DownloadState.updateDownloadProgress(episode.id, percent, written, total)
    }).done(() => {
      DownloadState.updateDownloadComplete(episode.id)
      removeDownloadingEpisode(episode.id)
      console.log('downloadEpisode complete')
    }).error((error: string) => {
      console.log('Download canceled due to error: ', error)
    })
}

const resumeDownloadTask = (downloadTask: any, episodeId: string) => {
  downloadTask.progress((percent: number, bytesWritten: number, bytesTotal: number) => {
    const written = convertBytesToHumanReadableString(bytesWritten)
    const total = convertBytesToHumanReadableString(bytesTotal)
    DownloadState.updateDownloadProgress(episodeId, percent, written, total)
  }).done(() => {
    DownloadState.updateDownloadComplete(episodeId)
    removeDownloadingEpisode(episodeId)
    console.log('resumeDownloadTask complete')
  }).error((error: string) => {
    console.log('Resumed download canceled due to error: ', error)
  })
}

export const initDownloadTasks = async () => {
  const episodes = await getDownloadingEpisodes()
  const downloadTasks = await RNBackgroundDownloader.checkForExistingDownloads()

  const filteredDownloadTasks = []
  for (const downloadTask of downloadTasks) {
    const episode = episodes.find((x: any) =>
      x.id === downloadTask.id && x.status !== DownloadStatus.STOPPED &&
      x.status !== DownloadStatus.UNKNOWN &&
      x.status !== DownloadStatus.FINISHED
    )

    if (episode) {
      const bytesTotal = downloadTask.totalBytes ? convertBytesToHumanReadableString(downloadTask.totalBytes) : '---'
      const bytesWritten = downloadTask.bytesWritten ? convertBytesToHumanReadableString(downloadTask.bytesWritten) : '0 KB'
      filteredDownloadTasks.push({
        bytesTotal,
        bytesWritten,
        episodeId: episode.id,
        episodeTitle: episode.title,
        percent: downloadTask.percent,
        podcastImageUrl: episode.podcast.imageUrl,
        podcastTitle: episode.podcast.title,
        status: downloadTask.state
      } as DownloadState.DownloadTaskState)
    }
  }

  const shouldDownload = await hasValidDownloadingConnection()
  if (shouldDownload) {
    for (const filteredDownloadTask of filteredDownloadTasks) {
      const episode = episodes.find((x: any) => x.id === filteredDownloadTask.episodeId)
      if (shouldDownload && filteredDownloadTask.status === DownloadStatus.DOWNLOADING) {
        const task = downloadTasks.find((x: any) => x.id === filteredDownloadTask.episodeId)
        resumeDownloadTask(task, episode.id)
      }
    }
  }

  return filteredDownloadTasks
}

export const togglePauseDownload = (id: string) => {
  const task = downloadTasks.find((task) => task.id === id)

  if (task) {
    const status = DownloadState.toggleDownloadTaskStatus(id)
    if (status === DownloadStatus.DOWNLOADING) {
      task.pause()
    } else {
      task.resume()
    }
  }
}
