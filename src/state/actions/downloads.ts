import AsyncStorage from '@react-native-community/async-storage'
import { getGlobal, setGlobal } from 'reactn'
import { getEpisodes } from '../../services/episode'
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
import { PV } from '../../resources'
import {
  getAutoDownloadSettings as getAutoDownloadSettingsService,
  updateAutoDownloadSettings as updateAutoDownloadSettingsService
} from '../../services/autoDownloads'
import { getPodcastCredentials, parseAddByRSSPodcast } from '../../services/parser'
import { clearNowPlayingItem } from './player'

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
  episodeTitle?: string
  episodeTranscript?: any
  episodeValue?: any
  percent?: number
  podcastCredentialsRequired?: boolean
  podcastFunding?: any
  podcastHideDynamicAdsWarning?: boolean
  podcastId?: string
  podcastImageUrl?: string
  podcastIsExplicit?: boolean
  podcastLinkUrl?: string
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
    episodeTitle
  } = downloadTaskState

  return {
    description: episodeDescription,
    duration: episodeDuration,
    id: episodeId,
    imageUrl: episodeImageUrl,
    mediaUrl: episodeMediaUrl,
    pubDate: episodePubDate,
    title: episodeTitle
  }
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
  const downloadedEpisodeLimitCount = await AsyncStorage.getItem(PV.Keys.DOWNLOADED_EPISODE_LIMIT_GLOBAL_COUNT)
  const downloadedEpisodeLimitDefault = await AsyncStorage.getItem(PV.Keys.DOWNLOADED_EPISODE_LIMIT_GLOBAL_DEFAULT)

  // TODO: There is a race condition preventing this state from being set properly on app launch :(
  // I don't know where the problem is coming from...
  setTimeout(() => {
    setGlobal({
      autoDownloadSettings,
      downloadsActive,
      downloadsArray,
      downloadedEpisodeIds,
      downloadedEpisodeLimitCount,
      downloadedEpisodeLimitDefault,
      downloadedPodcastEpisodeCounts,
      downloadedPodcasts
    })
  }, 1000)
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
  const downloadedEpisodeIds = await getDownloadedEpisodeIdsService()
  const downloadedPodcastEpisodeCounts = await getDownloadedPodcastEpisodeCountsService()
  const downloadedPodcasts = await getDownloadedPodcastsService()

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

export const resumeDownloadingEpisode = (downloadTask: DownloadTaskState) => {
  const { downloadsActive, downloadsArray } = getGlobal()
  const { episodeId } = downloadTask
  resumeDownloadTask(downloadTask)

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

export const pauseDownloadingEpisodesAll = () => {
  const { downloadsArray } = getGlobal()
  for (const task of downloadsArray) {
    pauseDownloadingEpisode(task)
  }
}

export const pauseDownloadingEpisode = (downloadTask: DownloadTaskState) => {
  const { downloadsActive, downloadsArray } = getGlobal()
  const { episodeId } = downloadTask
  pauseDownloadTask(downloadTask)

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

export const updateDownloadProgress = (
  downloadTaskId: string,
  percent: number,
  bytesWritten: string,
  bytesTotal: string
) => {
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
