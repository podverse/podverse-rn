import { getGlobal, setGlobal } from 'reactn'
import { DownloadStatus, initDownloadTasks as initDownloadTasksService } from '../../lib/downloader'
import { removeDownloadingEpisode as removeDownloadingEpisodeService } from '../../lib/downloadingEpisode'

export type DownloadTaskState = {
  bytesTotal?: string
  bytesWritten?: string
  completed?: boolean
  episodeId: string
  episodeTitle?: string
  percent?: string
  podcastImageUrl?: string
  podcastTitle?: string
  status?: DownloadStatus
}

export const getDownloadStatusText = (status?: string) => {
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

export const initDownloadTasks = async () => {
  const downloads = await initDownloadTasksService()

  setGlobal({
    downloads: [...downloads]
  })
}

export const addDownloadTask = (downloadTask: DownloadTaskState) => {
  const { downloads } = getGlobal()

  if (!downloads.some((x: any) => x.episodeId === downloadTask.episodeId)) {
    downloadTask.status = DownloadStatus.PENDING
    setGlobal({
      downloads: [...downloads, downloadTask]
    })
  }
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

export const removeDownloadingEpisode = async (episodeId: string) => {
  const { downloads } = getGlobal()
  await removeDownloadingEpisodeService(episodeId)

  const newDownloads = downloads.filter((task: DownloadTaskState) => {
    return task.episodeId !== episodeId
  })

  setGlobal({
    downloads: [...newDownloads]
  })

  return newDownloads
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
