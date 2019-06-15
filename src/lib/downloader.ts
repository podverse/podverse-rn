import RNBackgroundDownloader from 'react-native-background-downloader'
import * as DownloadState from '../state/actions/downloads'
import { convertBytesToHumanReadableString, getExtensionFromUrl } from './utility'
const downloadTasks: any[] = []

export const downloadEpisode = ({ episodeId, episodeMediaUrl, episodeTitle, podcastImageUrl,
  podcastTitle }) => {
  const ext = getExtensionFromUrl(episodeMediaUrl)
  const task = RNBackgroundDownloader
    .download({
      id: episodeId,
      url: episodeMediaUrl,
      destination: `${RNBackgroundDownloader.directories.documents}/${episodeId}${ext}`
    })
    .begin(() => {
      downloadTasks.push(task)
      DownloadState.addDownloadTask({
        episodeId,
        episodeTitle,
        podcastImageUrl,
        podcastTitle
      })
    }).progress((percent: number, bytesWritten: number, bytesTotal: number) => {
      const written = convertBytesToHumanReadableString(bytesWritten)
      const total = convertBytesToHumanReadableString(bytesTotal)
      DownloadState.updateDownloadProgress(episodeId, percent, written, total)
    }).done(() => {
      DownloadState.updateDownloadComplete(episodeId)
    }).error((error: string) => {
      console.log('Download canceled due to error: ', error)
    })
}

export const togglePauseDownload = (id: string) => {
  const task = downloadTasks.find((task) => task.id === id)

  if (task) {
    const status = DownloadState.toggleDownloadTaskStatus(id)
    if (status === DownloadState.DownloadStatus.DOWNLOADING) {
      task.pause()
    } else {
      task.resume()
    }
  }
}
