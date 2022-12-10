import AsyncStorage from '@react-native-community/async-storage'
import type { PodcastMedium } from 'podverse-shared'
import { getGlobal, setGlobal } from 'reactn'
import { errorLogger } from '../../lib/logger'
import {
  getDownloadedEpisodeIds as getDownloadedEpisodeIdsService,
  getDownloadedPodcastEpisodeCounts as getDownloadedPodcastEpisodeCountsService,
  getDownloadedPodcasts as getDownloadedPodcastsService,
  removeDownloadedPodcast as removeDownloadedPodcastService,
  removeDownloadedPodcastEpisode as removeDownloadedPodcastEpisodeService
} from '../../lib/downloadedPodcast'
import {
  downloadEpisode,
  DownloadStatus,
  initDownloads as initDownloadsService,
  pauseDownloadTask,
  resumeDownloadTask
} from '../../lib/downloader'
import { removeDownloadingEpisode as removeDownloadingEpisodeService } from '../../lib/downloadingEpisode'
import { translate } from '../../lib/i18n'
import { PV } from '../../resources'
import {
  getAutoDownloadSettings as getAutoDownloadSettingsService,
  updateAutoDownloadSettings as updateAutoDownloadSettingsService
} from '../../services/autoDownloads'
import { getEpisodes } from '../../services/episode'
import { getPodcastCredentials, parseAddByRSSPodcast } from '../../services/parser'
import { clearNowPlayingItem } from '../../services/userNowPlayingItem'

// The DownloadTaskState should have the same episode and podcast properties as a NowPlayingItem,
// or playing the download directly from the DownloadsScreen will not work.
export type DownloadTaskState = {
  addByRSSPodcastFeedUrl?: string
  bytesTotal?: string
  bytesWritten?: string
  completed?: boolean
  episodeChaptersUrl?: string
  episodeCredentialsRequired?: boolean
  episodeDescription?: string
  episodeDuration?: number
  episodeFunding?: any
  episodeId: string
  episodeImageUrl?: string
  episodeLinkUrl?: string
  episodeMediaUrl: string
  episodePubDate?: string
  episodeSubtitle?: string
  episodeTitle?: string
  episodeTranscript?: any
  episodeValue?: any
  percent?: number
  podcastCredentialsRequired?: boolean
  podcastFunding?: any
  podcastHasVideo: boolean
  podcastHideDynamicAdsWarning?: boolean
  podcastId?: string
  podcastImageUrl?: string
  podcastIsExplicit?: boolean
  podcastLinkUrl?: string
  podcastMedium: PodcastMedium
  podcastShrunkImageUrl?: string
  podcastSortableTitle?: boolean
  podcastTitle?: string
  podcastValue?: any
  status?: DownloadStatus
}

export const convertDownloadTaskStateToPodcast = (downloadTaskState: any) => {
  const {
    addByRSSPodcastFeedUrl,
    podcastId,
    podcastImageUrl,
    podcastIsExplicit,
    podcastSortableTitle,
    podcastTitle
  } = downloadTaskState

  return {
    addByRSSPodcastFeedUrl,
    id: podcastId,
    imageUrl: podcastImageUrl,
    isExplicit: podcastIsExplicit,
    sortableTitle: podcastSortableTitle,
    title: podcastTitle
  }
}

export const convertDownloadTaskStateToEpisode = (downloadTaskState: any) => {
  const {
    episodeDescription,
    episodeDuration,
    episodeId,
    episodeImageUrl,
    episodeMediaUrl,
    episodePubDate,
    episodeSubtitle,
    episodeTitle
  } = downloadTaskState

  return {
    description: episodeDescription,
    duration: episodeDuration,
    id: episodeId,
    imageUrl: episodeImageUrl,
    mediaUrl: episodeMediaUrl,
    pubDate: episodePubDate,
    subtitle: episodeSubtitle,
    title: episodeTitle
  }
}

export const getDownloadStatusText = (status?: string) => {
  if (status === DownloadStatus.DOWNLOADING) {
    return translate('Downloading')
  } else if (status === DownloadStatus.PAUSED) {
    return translate('Paused')
  } else if (status === DownloadStatus.STOPPED) {
    return translate('Cancelled')
  } else if (status === DownloadStatus.PENDING) {
    return translate('Pending')
  } else if (status === DownloadStatus.FINISHED) {
    return translate('Finished')
  } else if (status === DownloadStatus.ERROR) {
    return translate('Error')
  } else {
    return ''
  }
}

export const initDownloads = async () => {
  const [
    { downloadsActive, downloadsArrayInProgress },
    downloadedEpisodeIds,
    downloadedPodcastEpisodeCounts,
    downloadedPodcasts,
    autoDownloadSettings,
    downloadedEpisodeLimitCount,
    downloadedEpisodeLimitDefault
  ] = await Promise.all([
    initDownloadsService(),
    getDownloadedEpisodeIdsService(),
    getDownloadedPodcastEpisodeCountsService(),
    getDownloadedPodcastsService(),
    getAutoDownloadSettingsService(),
    AsyncStorage.getItem(PV.Keys.DOWNLOADED_EPISODE_LIMIT_GLOBAL_COUNT),
    AsyncStorage.getItem(PV.Keys.DOWNLOADED_EPISODE_LIMIT_GLOBAL_DEFAULT)
  ])

  setGlobal({
    autoDownloadSettings,
    downloadsActive,
    downloadsArrayInProgress,
    downloadedEpisodeIds,
    downloadedEpisodeLimitCount,
    downloadedEpisodeLimitDefault,
    downloadedPodcastEpisodeCounts,
    downloadedPodcasts
  })
}

export const updateAutoDownloadSettings = (podcastId: string, autoDownloadOn: boolean) => {
  const { autoDownloadSettings } = getGlobal()
  autoDownloadSettings[podcastId] = autoDownloadOn

  setGlobal(
    {
      autoDownloadSettings
    },
    async () => {
      const newAutoDownloadSettings = await updateAutoDownloadSettingsService(podcastId)
      setGlobal({ autoDownloadSettings: newAutoDownloadSettings }, async () => {
        if(autoDownloadOn) {
          const [serverEpisodes, episodesCount] = await getEpisodes({ 
            sort:"most-recent", 
            podcastId, 
            includePodcast: true
          })
          
          if(episodesCount) {
            downloadEpisode(serverEpisodes[0], serverEpisodes[0].podcast)
          }
        }
      })
    }
  )
}

export const updateAutoDownloadSettingsAddByRSS = (addByRSSPodcastFeedUrl: string, autoDownloadOn: boolean) => {
  const { autoDownloadSettings } = getGlobal()
  autoDownloadSettings[addByRSSPodcastFeedUrl] = autoDownloadOn

  setGlobal(
    {
      autoDownloadSettings
    },
    async () => {
      const newAutoDownloadSettings = await updateAutoDownloadSettingsService(addByRSSPodcastFeedUrl)
      setGlobal({ autoDownloadSettings: newAutoDownloadSettings }, async () => {
        if(autoDownloadOn) {
          const credentials = await getPodcastCredentials(addByRSSPodcastFeedUrl)
          const podcast = await parseAddByRSSPodcast(addByRSSPodcastFeedUrl, credentials)
          if(podcast && podcast.episodes && podcast.episodes[0]) {
            downloadEpisode(podcast.episodes[0], podcast)
          }
        }
      })
    }
  )
}

export const updateDownloadedPodcasts = async (cb?: any) => {
  const [downloadedEpisodeIds, downloadedPodcastEpisodeCounts, downloadedPodcasts] = await Promise.all([
    getDownloadedEpisodeIdsService(),
    getDownloadedPodcastEpisodeCountsService(),
    getDownloadedPodcastsService()
  ])

  setGlobal(
    {
      downloadedEpisodeIds,
      downloadedPodcastEpisodeCounts,
      downloadedPodcasts
    },
    () => {
      if (cb) cb()
    }
  )
}

export const addDownloadTask = (downloadTask: DownloadTaskState) => {
  const { downloadsActive, downloadsArrayInProgress } = getGlobal()

  if (!downloadsArrayInProgress.some((x: any) => x.episodeId === downloadTask.episodeId)) {
    downloadTask.status = DownloadStatus.PENDING
    downloadsActive[downloadTask.episodeId] = true

    setGlobal({
      downloadsActive,
      downloadsArrayInProgress: [...downloadsArrayInProgress, downloadTask]
    })
  }
}

export const resumeDownloadingEpisode = (downloadTask: DownloadTaskState) => {
  const { downloadsActive, downloadsArrayInProgress } = getGlobal()
  const { episodeId } = downloadTask
  resumeDownloadTask(downloadTask)

  for (const task of downloadsArrayInProgress) {
    if (task.episodeId === episodeId) {
      task.status = DownloadStatus.DOWNLOADING
      downloadsActive[episodeId] = true
      break
    }
  }

  setGlobal({
    downloadsActive,
    downloadsArrayInProgress
  })
}

export const pauseDownloadingEpisodesAll = () => {
  const { downloadsArrayInProgress } = getGlobal()
  for (const task of downloadsArrayInProgress) {
    pauseDownloadingEpisode(task)
  }
}

export const pauseDownloadingEpisode = (downloadTask: DownloadTaskState) => {
  const { downloadsActive, downloadsArrayInProgress } = getGlobal()
  const { episodeId } = downloadTask
  pauseDownloadTask(downloadTask)

  for (const task of downloadsArrayInProgress) {
    if (task.episodeId === episodeId) {
      task.status = DownloadStatus.PAUSED
      downloadsActive[episodeId] = true
      break
    }
  }

  setGlobal({
    downloadsActive,
    downloadsArrayInProgress
  })
}

export const removeDownloadingEpisode = async (episodeId: string) => {
  const { downloadsActive, downloadsArrayInProgress, downloadsArrayFinished } = getGlobal()
  await removeDownloadingEpisodeService(episodeId)

  const newDownloadsArray = downloadsArrayInProgress.filter((task: DownloadTaskState) => {
    if (task.episodeId !== episodeId) {
      return true
    } else {
      downloadsActive[episodeId] = false
      return false
    }
  })

  const newDownloadsArrayFinished = downloadsArrayFinished.filter((task: DownloadTaskState) => {
    if (task.episodeId !== episodeId) {
      return true
    } else {
      downloadsActive[episodeId] = false
      return false
    }
  })

  setGlobal({
    downloadsActive,
    downloadsArrayInProgress: newDownloadsArray,
    downloadsArrayFinished: newDownloadsArrayFinished
  })
}

export const updateDownloadProgress = (
  downloadTaskId: string,
  percent: number,
  bytesWritten: string,
  bytesTotal: string
) => {
  const { downloadsActive, downloadsArrayInProgress } = getGlobal()

  for (const task of downloadsArrayInProgress) {
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
    downloadsArrayInProgress
  })
}

export const updateDownloadComplete = (downloadTaskId: string) => {
  const { downloadsActive, downloadsArrayFinished, downloadsArrayInProgress } = getGlobal()

  let newDownloadsArrayInProgress = []
  const newDownloadsArrayFinished = downloadsArrayFinished

  for (const task of downloadsArrayInProgress) {
    if (task.episodeId === downloadTaskId) {
      task.completed = true
      task.status = DownloadStatus.FINISHED
      newDownloadsArrayFinished.push(task)
      newDownloadsArrayInProgress = downloadsArrayInProgress.filter((task) => task.episodeId !== downloadTaskId)
      downloadsActive[downloadTaskId] = false
      break
    }
  }

  setGlobal({
    downloadsActive,
    downloadsArrayInProgress: newDownloadsArrayInProgress,
    downloadsArrayFinished: newDownloadsArrayFinished
  })
}

export const updateDownloadError = (downloadTaskId: string) => {
  const { downloadsActive, downloadsArrayInProgress } = getGlobal()

  for (const task of downloadsArrayInProgress) {
    if (task.episodeId === downloadTaskId) {
      task.status = DownloadStatus.ERROR
      downloadsActive[downloadTaskId] = false
      break
    }
  }

  setGlobal({
    downloadsActive,
    downloadsArrayInProgress
  })
}

export const removeDownloadedPodcast = async (podcastId: string) => {
  const { clearedNowPlayingItem } = await removeDownloadedPodcastService(podcastId)
  await updateDownloadedPodcasts()

  if (clearedNowPlayingItem) {
    clearNowPlayingItem()
  }
}

export const removeDownloadedPodcastEpisode = async (episodeId: string) => {
  await removeDownloadedPodcastEpisodeService(episodeId)
  await updateDownloadedPodcasts()
}

export const downloadedEpisodeMarkForDeletion = async (episodeId: string) => {
  try {
    const markedForDeletionString = await AsyncStorage.getItem(PV.Keys.DOWNLOADED_EPISODE_MARKED_FOR_DELETION)
    const markedForDeletion = JSON.parse(markedForDeletionString || '[]') || []
    if (episodeId && !markedForDeletion.includes(episodeId)) {
      markedForDeletion.push(episodeId)
    }
    await AsyncStorage.setItem(PV.Keys.DOWNLOADED_EPISODE_MARKED_FOR_DELETION, JSON.stringify(markedForDeletion))
  } catch (error) {
    errorLogger('downloadedEpisodeMarkForDeletion error', error, episodeId)
  }
}

export const downloadedEpisodeDeleteMarked = async () => {
  try {
    const markedForDeletionString = await AsyncStorage.getItem(PV.Keys.DOWNLOADED_EPISODE_MARKED_FOR_DELETION)
    const markedForDeletion = JSON.parse(markedForDeletionString || '[]') || []
    for (const episodeId of markedForDeletion) {
      await removeDownloadedPodcastEpisode(episodeId)
    }
  } catch (error) {
    errorLogger('downloadedEpisodeDeleteMarked error', error)
  }
  await AsyncStorage.removeItem(PV.Keys.DOWNLOADED_EPISODE_MARKED_FOR_DELETION)
}
