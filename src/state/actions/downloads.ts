import { getGlobal, setGlobal } from 'reactn'

export enum DownloadStatus {
  DOWNLOADING,
  PAUSED,
  STOPPED,
  UNKNOWN
}

type DownloadTask = {
  id: string,
  percent: string
}

type DownloadTaskState = {
  id: string,
  percent: string,
  status: DownloadStatus
}

export const addDownloadTask = (downloadTask: DownloadTask) => {
  const { downloads } = getGlobal()
  const downloadTaskState: DownloadTaskState = {
    id: downloadTask.id,
    status: DownloadStatus.DOWNLOADING,
    percent: downloadTask.percent
  }

  setGlobal({
    downloads: [...downloads, downloadTaskState]
  })
}

export const toggleDownloadTaskStatus = (downloadTaskId: string) => {
  const { downloads } = getGlobal()
  let newStatus = DownloadStatus.UNKNOWN
  for (const task of downloads) {
    if (task.id === downloadTaskId) {
      if (task.status === DownloadStatus.PAUSED) {
        newStatus = DownloadStatus.DOWNLOADING
      } else {
        newStatus = DownloadStatus.PAUSED
      }

      task.status = newStatus
      break
    }
  }

  setGlobal({
    downloads: [...downloads]
  })

  return newStatus
}

export const clearDownloadTask = (downloadTaskId: string) => {
  const { downloads } = getGlobal()

  const newDownloads = downloads.filter((task: DownloadTask) => {
    return task.id !== downloadTaskId
  })

  setGlobal({
    downloads: [...newDownloads]
  })
}

export const updateDownloadPercent = (downloadTaskId: string, percent: string) => {
  const { downloads } = getGlobal()

  for (const task of downloads) {
    if (task.id === downloadTaskId) {
      task.percent = percent
      break
    }
  }

  setGlobal({
    downloads: [...downloads]
  })
}
