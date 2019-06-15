import { getGlobal, setGlobal } from 'reactn'

export enum DownloadStatus {
  DOWNLOADING,
  PAUSED,
  STOPPED,
  UNKNOWN,
  PENDING,
  FINISHED
}

type DownloadTaskState = {
  bytesWritten?: string
  completed?: boolean
  episodeId: string
  episodeTitle?: string
  percent?: string
  podcastImageUrl?: string
  podcastTitle?: string
  status?: DownloadStatus
  bytesTotal?: string
}

export const getDownloadStatusText = (status?: number) => {
  if (status === DownloadStatus.DOWNLOADING) {
    return 'Downloading'
  } else if (status === DownloadStatus.PAUSED) {
    return 'Paused'
  } else if (status === DownloadStatus.STOPPED) {
    return 'Cancelled'
  } else if (status === DownloadStatus.PENDING) {
    return 'Pending'
  } else if (status === DownloadStatus.FINISHED) {
    return 'Finished'
  } else {
    return ''
  }
}

export const addDownloadTask = (downloadTask: DownloadTaskState) => {
  const { downloads } = getGlobal()
  downloadTask.status = DownloadStatus.PENDING
  setGlobal({
    downloads: [...downloads, downloadTask]
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

  const newDownloads = downloads.filter((task: DownloadTaskState) => {
    return task.episodeId !== downloadTaskId
  })

  setGlobal({
    downloads: [...newDownloads]
  })
}

export const updateDownloadProgress = (downloadTaskId: string, percent: number, bytesWritten: string, bytesTotal: string) => {
  const { downloads } = getGlobal()

  for (const task of downloads) {
    if (task.episodeId === downloadTaskId) {
      task.percent = percent
      task.bytesWritten = bytesWritten
      task.bytesTotal = bytesTotal
      task.completed = false
      task.status = DownloadStatus.DOWNLOADING
      break
    }
  }

  setGlobal({
    downloads: [...downloads]
  })
}

export const updateDownloadComplete = (downloadTaskId: string) => {
  const { downloads } = getGlobal()

  for (const task of downloads) {
    if (task.episodeId === downloadTaskId) {
      task.completed = true
      task.status = DownloadStatus.FINISHED
      break
    }
  }

  setGlobal({
    downloads: [...downloads]
  })
}
