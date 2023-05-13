import url from 'url'
import Bottleneck from 'bottleneck'
import { clone } from 'lodash'
import { convertBytesToHumanReadableString, Episode, getExtensionFromUrl } from 'podverse-shared'
import RNBackgroundDownloader from '@kesha-antonov/react-native-background-downloader'
import RNFS from 'react-native-fs'
import * as ScopedStorage from 'react-native-scoped-storage'
import { AndroidScoped, FileSystem } from 'react-native-file-access'
import AsyncStorage from '@react-native-community/async-storage'
import { PV } from '../resources'
import PVEventEmitter from '../services/eventEmitter'
import { getPodcastCredentialsHeader } from '../services/parser'
import { playerCheckIfDownloadableFile } from '../services/player'
import { getPodcastFeedUrlAuthority } from '../services/podcast'
import { getSecureUrl } from '../services/tools'
import * as DownloadState from '../state/actions/downloads'
import { debugLogger, errorLogger } from './logger'
import { addDownloadedPodcastEpisode, getDownloadedPodcasts } from './downloadedPodcast'
import { downloadCustomFileNameId } from './hash'
import { addDownloadingEpisode, getDownloadingEpisodes, removeDownloadingEpisode } from './downloadingEpisode'
import { hasValidDownloadingConnection } from './network'
import { getAppUserAgent, safelyUnwrapNestedVariable } from './utility'
import { downloadImageFile } from './storage'

const _fileName = 'src/lib/downloader.ts'

const forceSecureRedirectDomains = {
  'feeds.gty.org': true
}

export const BackgroundDownloader = () => {
  const userAgent = getAppUserAgent()
  RNBackgroundDownloader.setHeaders({
    'user-agent': userAgent
  })

  return RNBackgroundDownloader
}

export enum DownloadStatus {
  DOWNLOADING = 'DOWNLOADING',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
  UNKNOWN = 'UNKNOWN',
  PENDING = 'PENDING',
  FINISHED = 'FINISHED',
  ERROR = 'ERROR'
}

const downloadTasks: any[] = []
let existingDownloadTasks: any[] = []

export const cancelDownloadTask = (episodeId: string) => {
  const task = downloadTasks.find((x: any) => x.id === episodeId)
  if (task) task.stop()
}

const addDLTask = (episode: any, podcast: any) =>
  DownloadState.addDownloadTask({
    addByRSSPodcastFeedUrl: podcast.addByRSSPodcastFeedUrl,
    episodeChaptersUrl: episode.chaptersUrl,
    episodeCredentialsRequired: episode.credentialsRequired,
    episodeDescription: episode.description,
    episodeDuration: episode.duration,
    episodeFunding: episode.funding,
    episodeGuid: episode.guid,
    episodeId: episode.id,
    episodeImageUrl: episode.imageUrl,
    episodeLinkUrl: episode.linkUrl,
    episodeMediaUrl: episode.mediaUrl,
    episodePubDate: episode.pubDate,
    episodeSubtitle: episode.subtitle,
    episodeTitle: episode.title,
    episodeTranscript: episode.transcript,
    episodeValue: episode.value,
    podcastCredentialsRequired: podcast.credentialsRequired,
    podcastFunding: podcast.funding,
    podcastHasVideo: podcast.hasVideo,
    podcastHideDynamicAdsWarning: podcast.hideDynamicAdsWarning,
    podcastId: podcast.id,
    podcastImageUrl: podcast.shrunkImageUrl || podcast.imageUrl,
    podcastIsExplicit: podcast.isExplicit,
    podcastLinkUrl: podcast.linkUrl,
    podcastMedium: podcast.medium,
    podcastShrunkImageUrl: podcast.shrunkImageUrl,
    podcastSortableTitle: podcast.sortableTitle,
    podcastTitle: podcast.title,
    podcastValue: podcast.value
  })

// NOTE: I was unable to get BackgroundDownloader to successfully resume tasks that were
// retrieved from checkForExistingDownloads, so as a workaround, I am forcing those existing tasks
// to always be restarted instead of resumed.
export const downloadEpisode = async (
  origEpisode: any,
  origPodcast: any,
  restart?: boolean,
  waitToAddTask?: boolean
) => {
  // Don't use the original episode/podcast so the object referenced is not updated
  // in components (like the EpisodesScreen).
  const episode = clone(origEpisode)
  const podcast = clone(origPodcast)

  const isDownloadable = playerCheckIfDownloadableFile(episode.mediaUrl)
  if (!isDownloadable) {
    debugLogger('downloadEpisode: Not a valid download file type')
    return
  }

  // Updates UI immediately
  if (!waitToAddTask) addDLTask(episode, podcast)

  const shouldDownload = await hasValidDownloadingConnection()

  if (!shouldDownload) {
    debugLogger('downloadEpisode: Does not have a valid downloading connection')
    return
  }

  const ext = getExtensionFromUrl(episode.mediaUrl)

  if (!restart) {
    const downloadingEpisodes = await getDownloadingEpisodes()
    if (downloadingEpisodes.some((x: any) => x.id === episode.id)) return

    const downloadedPodcasts = await getDownloadedPodcasts()
    for (const downloadedPodcast of downloadedPodcasts) {
      const episodes = safelyUnwrapNestedVariable(() => downloadedPodcast.episodes, [])
      if (episodes.some((x: any) => x.id === episode.id)) return
    }
  }

  // Updates UI only after the previous conditionals pass and it confirmed we want to download the episode
  if (waitToAddTask) addDLTask(episode, podcast)

  let timeout = 0
  const existingTasks = existingDownloadTasks.filter((x: any) => x.id === episode.id)

  for (const t of existingTasks) {
    if (t.id === episode.id) {
      await t.stop()
      timeout = 1000
    }
  }

  const progressLimiter = new Bottleneck({
    highWater: 0,
    maxConcurrent: 1,
    minTime: 2000
  })

  let finalFeedUrl = podcast.addByRSSPodcastFeedUrl
  if (podcast.credentialsRequired && !podcast.addByRSSPodcastFeedUrl && podcast.id) {
    finalFeedUrl = await getPodcastFeedUrlAuthority(podcast.id)
  }

  const [downloader, customLocation] = await Promise.all([
    BackgroundDownloader(),
    AsyncStorage.getItem(PV.Keys.EXT_STORAGE_DLOAD_LOCATION)
  ])
  const folderPath = customLocation ? RNFS.TemporaryDirectoryPath : downloader.directories.documents
  const origDestination = `${folderPath}/${episode.id}${ext}`
  const Authorization = await getPodcastCredentialsHeader(finalFeedUrl)

  let downloadUrl = episode.mediaUrl
  const hostname = url?.parse(downloadUrl)?.hostname
  if ((hostname && forceSecureRedirectDomains[hostname]) || downloadUrl.startsWith('http://')) {
    try {
      const secureUrlInfo = await getSecureUrl(episode.mediaUrl)
      if (secureUrlInfo?.secureUrl) {
        downloadUrl = secureUrlInfo.secureUrl
      }
    } catch (error) {
      errorLogger(_fileName, 'Secure url not found for http mediaUrl. Info: ', error)
    }
  } else if (downloadUrl.indexOf('http://') >= 0) {
    /*
      Find and replace ALL "http://" matches because sometimes
      episodes use a tracker prefix url, then redirects to
      the actual URL passed in as a parameter
      For example: from Andrew Schulz's Flagrant with Akaash Singh
      https://chrt.fm/track/9DD8D/pdst.fm/e/http://feeds.soundcloud.com/stream/1351569700-flagrantpodcast-mr-beast.mp3
    */
    downloadUrl = downloadUrl.replaceAll('http://', 'https://')
  }

  (async () => {
    // Download and store the image files if available
    if (podcast?.imageUrl) await downloadImageFile(podcast.imageUrl)
    if (podcast?.shrunkImageUrl) await downloadImageFile(podcast.shrunkImageUrl)
    if (episode?.imageUrl) await downloadImageFile(episode.imageUrl)
  })()

  // Wait for t.stop() to complete
  setTimeout(() => {
    const task = downloader
      .download({
        id: episode.id,
        url: downloadUrl,
        destination: origDestination,
        headers: {
          ...(Authorization ? { Authorization } : {})
        }
      })
      .begin(() => {
        if (!restart) {
          downloadTasks.push(task)
          episode.podcast = podcast
          addDownloadingEpisode(episode)
        } else {
          const downloadTaskIndex = downloadTasks.indexOf((x: any) => x.episodeId === episode.id)
          if (downloadTaskIndex > -1) {
            downloadTasks[downloadTaskIndex] = task
          } else {
            downloadTasks.push(task)
          }
        }
      })
      .progress((percent: number, bytesWritten: number, bytesTotal: number) => {
        progressLimiter
          .schedule(() => {
            const written = convertBytesToHumanReadableString(bytesWritten)
            const total = convertBytesToHumanReadableString(bytesTotal)
            DownloadState.updateDownloadProgress(episode.id, percent, written, total)
          })
          .catch(() => {
            // limiter has been stopped
          })
      })
      .done(async () => {
        await progressLimiter.stop()

        if (customLocation) {
          try {
            const tempDownloadFileType = await FileSystem.stat(origDestination)
            const newFileType = await ScopedStorage.createFile(customLocation, `${episode.id}${ext}`, 'audio/mpeg')
            if (tempDownloadFileType && newFileType) {
              const { uri: newFileUri } = newFileType
              await FileSystem.cp(origDestination, newFileUri)
            }
          } catch (error) {
            errorLogger(_fileName, 'done error', error)
          }
        }

        await addDownloadedPodcastEpisode(episode, podcast)

        // Call updateDownloadComplete after updateDownloadedPodcasts
        // to prevent the download icon from flashing in the EpisodeTableCell
        // right after download finishes.
        DownloadState.updateDownloadedPodcasts(() => {
          DownloadState.updateDownloadComplete(episode.id)
          removeDownloadingEpisode(episode.id)
        })

        PVEventEmitter.emit(PV.Events.DOWNLOADED_EPISODE_REFRESH)
      })
      .error((error: string) => {
        DownloadState.updateDownloadError(episode.id)
        errorLogger(_fileName, 'Download canceled', error)
      })
  }, timeout)
}

export const deleteDownloadedEpisode = async (episode: Episode) => {
  try {
    const [downloader, customLocation] = await Promise.all([
      BackgroundDownloader(),
      AsyncStorage.getItem(PV.Keys.EXT_STORAGE_DLOAD_LOCATION)
    ])
    const ext = getExtensionFromUrl(episode.mediaUrl)
    if (customLocation) {
      const uri = AndroidScoped.appendPath(customLocation, `/${episode.id}${ext}`)
      await FileSystem.unlink(uri)
    } else {
      const path = `${downloader.directories.documents}/${episode.id}${ext}`
      await FileSystem.unlink(path)
    }
    return true
  } catch (error) {
    errorLogger(_fileName, 'deleteDownloadedEpisode', error)
    return false
  }
}

export const initDownloads = async () => {
  const [episodes, downloader] = await Promise.all([getDownloadingEpisodes(), BackgroundDownloader()])
  existingDownloadTasks = await downloader.checkForExistingDownloads()

  let timeout = 0
  for (const task of existingDownloadTasks) {
    if (!episodes.some((x: any) => x.id === task.id)) {
      await task.stop()
      timeout = 1000
    }
  }

  for (const episode of episodes) {
    if (!existingDownloadTasks.some((x: any) => x.id === episode.id)) {
      await removeDownloadingEpisode(episode.id)
    }
  }

  const downloadTaskStates = []
  for (const downloadTask of existingDownloadTasks) {
    const episode = episodes.find(
      (x: any) =>
        x.id === downloadTask.id &&
        x.status !== DownloadStatus.STOPPED &&
        x.status !== DownloadStatus.UNKNOWN &&
        x.status !== DownloadStatus.FINISHED
    )

    if (episode) {
      const bytesTotal = downloadTask.totalBytes ? convertBytesToHumanReadableString(downloadTask.totalBytes) : '---'
      const podcast = episode.podcast || {}

      downloadTaskStates.push({
        addByRSSPodcastFeedUrl: podcast.addByRSSPodcastFeedUrl || '',
        bytesTotal,
        bytesWritten: '0 KB',
        episodeId: episode.id || '',
        episodeImageUrl: episode.imageUrl || '',
        episodeMediaUrl: episode.mediaUrl || '',
        episodePubDate: episode.pubDate || '',
        episodeTitle: episode.title || '',
        percent: 0,
        podcastId: podcast.id || '',
        podcastImageUrl: podcast.shrunkImageUrl || podcast.imageUrl || '',
        podcastIsExplicit: !!podcast.isExplicit,
        podcastSortableTitle: podcast.sortableTitle || '',
        podcastTitle: podcast.title || '',
        status: downloadTask.state
      } as DownloadState.DownloadTaskState)
    }
  }

  for (const filteredDownloadTask of downloadTaskStates) {
    const episode = episodes.find((x: any) => x.id === filteredDownloadTask.episodeId)
    if (filteredDownloadTask.status === DownloadStatus.DOWNLOADING) {
      if (existingDownloadTasks.some((x: any) => x.id === filteredDownloadTask.episodeId)) {
        // Wait for task.stop() to complete
        setTimeout(() => {
          const restart = true
          downloadEpisode(episode, episode.podcast, restart)
        }, timeout)
      }
    }
  }

  const downloadsActive = {}
  for (const downloadTaskState of downloadTaskStates) {
    if (
      downloadTaskState.episodeId &&
      (downloadTaskState.status === DownloadStatus.DOWNLOADING ||
        downloadTaskState.status === DownloadStatus.PENDING ||
        downloadTaskState.status === DownloadStatus.PAUSED)
    ) {
      downloadsActive[downloadTaskState.episodeId] = true
    }
  }

  return {
    downloadsArrayInProgress: downloadTaskStates,
    downloadsActive
  }
}

export const resumeDownloadTask = async (downloadTaskState: DownloadState.DownloadTaskState) => {
  const { episodeId } = downloadTaskState
  const task = downloadTasks.find((task) => task.id === episodeId)

  if (existingDownloadTasks.some((x: any) => x.id === episodeId)) {
    const downloadingEpisodes = await getDownloadingEpisodes()
    const episode = downloadingEpisodes.find((x: any) => x.id === episodeId)
    const restart = true
    await downloadEpisode(episode, episode.podcast, restart)
    existingDownloadTasks = existingDownloadTasks.filter((x: any) => x.id !== episodeId)
  } else if (task) {
    task.resume()
  } else {
    const podcast = DownloadState.convertDownloadTaskStateToPodcast(downloadTaskState)
    const episode = DownloadState.convertDownloadTaskStateToEpisode(downloadTaskState)
    const restart = true
    await downloadEpisode(episode, podcast, restart)
  }
}

export const refreshDownloads = async () => {
  const downloadingEpisodes = await getDownloadingEpisodes()
  downloadTasks.forEach((dTask: any) => {
    if (downloadingEpisodes.some((episode: any) => episode.id === dTask.id)) {
      dTask.resume()
    }
  })
}

export const pauseDownloadTask = (downloadTaskState: DownloadState.DownloadTaskState) => {
  const { episodeId } = downloadTaskState
  const task = downloadTasks.find((task) => task.id === episodeId)
  if (task) task.pause()
}

export const checkIfFileIsDownloaded = async (id: string, episodeMediaUrl: string, isAddByRSSPodcast?: boolean) => {
  let isDownloadedFile = true
  try {
    const filePath = await getDownloadedFilePath(id, episodeMediaUrl, isAddByRSSPodcast)
    await RNFS.stat(filePath)
  } catch (innerErr) {
    isDownloadedFile = false
  }
  return isDownloadedFile
}

export const getDownloadedFilePath = async (id: string, episodeMediaUrl: string, isAddByRSSPodcast?: boolean) => {
  const ext = getExtensionFromUrl(episodeMediaUrl)
  const [downloader, customLocation] = await Promise.all([
    BackgroundDownloader(),
    AsyncStorage.getItem(PV.Keys.EXT_STORAGE_DLOAD_LOCATION)
  ])
  const folderPath = customLocation ? customLocation : downloader.directories.documents

  if (isAddByRSSPodcast) {
    const customRSSItemId = downloadCustomFileNameId(episodeMediaUrl)
    return `${folderPath}/${customRSSItemId}${ext}`
  } else {
    return `${folderPath}/${id}${ext}`
  }
}
