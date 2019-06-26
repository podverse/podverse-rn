import { getGlobal, setGlobal } from 'reactn'
import { getDownloadedEpisodeIds as getDownloadedEpisodeIdsService, getDownloadedPodcastEpisodeCounts as
  getDownloadedPodcastEpisodeCountsService, getDownloadedPodcasts as getDownloadedPodcastsService,
  removeDownloadedPodcastEpisode as removeDownloadedPodcastEpisodeService } from '../../lib/downloadedPodcast'
import { DownloadStatus, initDownloads as initDownloadsService, pauseDownloadTask, resumeDownloadTask } from '../../lib/downloader'
import { removeDownloadingEpisode as removeDownloadingEpisodeService } from '../../lib/downloadingEpisode'
import { getAutoDownloadSettings as getAutoDownloadSettingsService, updateAutoDownloadSettings
  as updateAutoDownloadSettingsService } from '../../services/autoDownloads'
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
  } else if (status === DownloadStatus.ERROR) {
    return 'Error'
  } else {
    return ''
  }
}

export const initDownloads = async () => {
  const { downloadsActive, downloadsArray } = await initDownloadsService()
  const downloadedEpisodeIds = await getDownloadedEpisodeIdsService()
  const downloadedPodcastEpisodeCounts = await getDownloadedPodcastEpisodeCountsService()
  const downloadedPodcasts = await getDownloadedPodcastsService()
  const autoDownloadSettings = await getAutoDownloadSettingsService()

  setGlobal({
    autoDownloadSettings,
    downloadsActive,
    downloadsArray,
    downloadedEpisodeIds,
    downloadedPodcastEpisodeCounts,
    downloadedPodcasts
  })
}

export const updateAutoDownloadSettings = async (podcastId: string, autoDownloadOn: boolean) => {
  const { autoDownloadSettings } = getGlobal()
  autoDownloadSettings[podcastId] = autoDownloadOn

  setGlobal({
    autoDownloadSettings
  }, async () => {
    const newAutoDownloadSettings = await updateAutoDownloadSettingsService(podcastId)
    setGlobal({ autoDownloadSettings: newAutoDownloadSettings })
  })
}

export const updateDownloadedPodcasts = async () => {
  const downloadedEpisodeIds = await getDownloadedEpisodeIdsService()
  const downloadedPodcastEpisodeCounts = await getDownloadedPodcastEpisodeCountsService()
  const downloadedPodcasts = await getDownloadedPodcastsService()

  setGlobal({
    downloadedEpisodeIds,
    downloadedPodcastEpisodeCounts,
    downloadedPodcasts
  })
}

export const addDownloadTask = async (downloadTask: DownloadTaskState) => {
  const { downloadsActive, downloadsArray } = getGlobal()

  if (!downloadsArray.some((x: any) => x.episodeId === downloadTask.episodeId)) {
    downloadTask.status = DownloadStatus.PENDING
    downloadsActive[downloadTask.episodeId] = true

    setGlobal({
      downloadsActive,
      downloadsArray: [...downloadsArray, downloadTask]
    })
  }
}

export const resumeDownloadingEpisode = (episodeId: string) => {
  const { downloadsActive, downloadsArray } = getGlobal()
  resumeDownloadTask(episodeId)

  for (const task of downloadsArray) {
    if (task.episodeId === episodeId) {
      task.status = DownloadStatus.DOWNLOADING
      downloadsActive[episodeId] = true
      break
    }
  }

  setGlobal({
    downloadsActive,
    downloadsArray
  })
}

export const pauseDownloadingEpisode = (episodeId: string) => {
  const { downloadsActive, downloadsArray } = getGlobal()
  pauseDownloadTask(episodeId)

  for (const task of downloadsArray) {
    if (task.episodeId === episodeId) {
      task.status = DownloadStatus.PAUSED
      downloadsActive[episodeId] = true
      break
    }
  }

  setGlobal({
    downloadsActive,
    downloadsArray
  })
}

export const removeDownloadingEpisode = async (episodeId: string) => {
  const { downloadsActive, downloadsArray } = getGlobal()
  await removeDownloadingEpisodeService(episodeId)

  const newDownloadsArray = downloadsArray.filter((task: DownloadTaskState) => {
    if (task.episodeId !== episodeId) {
      return true
    } else {
      downloadsActive[episodeId] = false
      return false
    }
  })

  setGlobal({
    downloadsActive,
    downloadsArray: newDownloadsArray
  })
}

export const updateDownloadProgress = (downloadTaskId: string, percent: number, bytesWritten: string, bytesTotal: string) => {
  const { downloadsActive, downloadsArray } = getGlobal()

  for (const task of downloadsArray) {
    if (task.episodeId === downloadTaskId) {
      task.percent = percent
      task.bytesWritten = bytesWritten
      task.bytesTotal = bytesTotal
      task.completed = false
      task.status = DownloadStatus.DOWNLOADING
      downloadsActive[downloadTaskId] = true
      break
    }
  }

  setGlobal({
    downloadsArray
  })
}

export const updateDownloadComplete = (downloadTaskId: string) => {
  const { downloadsActive, downloadsArray } = getGlobal()

  for (const task of downloadsArray) {
    if (task.episodeId === downloadTaskId) {
      task.completed = true
      task.status = DownloadStatus.FINISHED
      downloadsActive[downloadTaskId] = false
      break
    }
  }

  setGlobal({
    downloadsActive,
    downloadsArray
  })
}

export const updateDownloadError = (downloadTaskId: string) => {
  const { downloadsActive, downloadsArray } = getGlobal()

  for (const task of downloadsArray) {
    if (task.episodeId === downloadTaskId) {
      task.status = DownloadStatus.ERROR
      downloadsActive[downloadTaskId] = false
      break
    }
  }

  setGlobal({
    downloadsActive,
    downloadsArray
  })
}

export const removeDownloadedPodcastEpisode = async (episodeId: string) => {
  const { clearedNowPlayingItem } = await removeDownloadedPodcastEpisodeService(episodeId)
  await updateDownloadedPodcasts()

  if (clearedNowPlayingItem) {
    clearNowPlayingItem()
  }
}
