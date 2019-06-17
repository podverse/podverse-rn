import { getGlobal, setGlobal } from 'reactn'
import { getDownloadedEpisodeIds as getDownloadedEpisodeIdsService,
  removeDownloadedPodcastEpisode as removeDownloadedPodcastEpisodeService } from '../../lib/downloadedPodcast'
import { DownloadStatus, initDownloads as initDownloadsService, pauseDownloadTask, resumeDownloadTask } from '../../lib/downloader'
import { removeDownloadingEpisode as removeDownloadingEpisodeService } from '../../lib/downloadingEpisode'
import { clearNowPlayingItem } from './player'

export type DownloadTaskState = {
  bytesTotal?: string
  bytesWritten?: string
  completed?: boolean
  episodeId: string
  episodeTitle?: string
  percent?: number
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

export const initDownloads = async () => {
  const downloads = await initDownloadsService()
  const downloadedEpisodeIds = await getDownloadedEpisodeIdsService()

  setGlobal({
    downloads: [...downloads],
    downloadedEpisodeIds: [...downloadedEpisodeIds]
  })
}

export const updateDownloadedEpisodeIds = async () => {
  const downloadedEpisodeIds = await getDownloadedEpisodeIdsService()

  setGlobal({
    downloadedEpisodeIds: [...downloadedEpisodeIds]
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

export const resumeDownloadingEpisode = (episodeId: string) => {
  const { downloads } = getGlobal()
  resumeDownloadTask(episodeId)

  for (const task of downloads) {
    if (task.episodeId === episodeId) {
      task.status = DownloadStatus.DOWNLOADING
      break
    }
  }

  setGlobal({
    downloads: [...downloads]
  })
}

export const pauseDownloadingEpisode = (episodeId: string) => {
  const { downloads } = getGlobal()
  pauseDownloadTask(episodeId)

  for (const task of downloads) {
    if (task.episodeId === episodeId) {
      task.status = DownloadStatus.PAUSED
      break
    }
  }

  setGlobal({
    downloads: [...downloads]
  })
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

export const removeDownloadedPodcastEpisode = async (episodeId: string) => {
  const { clearedNowPlayingItem, downloadedEpisodeIds } = await removeDownloadedPodcastEpisodeService(episodeId)

  setGlobal({
    downloadedEpisodeIds: [...downloadedEpisodeIds]
  }, () => {
    if (clearedNowPlayingItem) {
      clearNowPlayingItem()
    }
  })
}
