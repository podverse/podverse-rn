import RNBackgroundDownloader from 'react-native-background-downloader'
import * as DownloadState from '../state/actions/downloads'
import { getExtensionFromUrl } from './utility'
let downloadTasks: any[] = []

export const downloadEpisode = ({ id = '', url = '' }) => {
  const ext = getExtensionFromUrl(url)
  const task = RNBackgroundDownloader
    .download({
        id,
        url,
        destination: `${RNBackgroundDownloader.directories.documents}/${id}${ext}`
    })
    .begin(() => {
        downloadTasks.push(task)
        DownloadState.addDownloadTask(task)
    }).progress((percent: string) => {
// tslint:disable-next-line: radix
        console.log('ID: ', id, ' | percent: ', (Number(percent) * 100),'%')
        DownloadState.updateDownloadPercent(id, percent)
    }).done(() => {
        console.log(`Done. Saved at: ${RNBackgroundDownloader.directories.documents}/${id}.mp3`)
        downloadTasks = downloadTasks.filter((dTask) => dTask.id !== task.id)
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
