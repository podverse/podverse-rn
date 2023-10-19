import AsyncStorage from '@react-native-community/async-storage'
import { AndroidAutoContentStyle, AndroidAutoBrowseTree } from 'react-native-track-player'
import { getGlobal } from 'reactn'
import { Episode, NowPlayingItem, Podcast, convertNowPlayingItemToEpisode } from 'podverse-shared'
import { Alert, NativeModules } from 'react-native'

import { PV } from '../../resources'
import { PVAudioPlayer } from '../../services/playerAudio'
import PVEventEmitter from '../../services/eventEmitter'
import { translate } from '../i18n'
import { readableDate } from '../utility'
import { getHistoryItems } from '../../state/actions/userHistoryItem'
import { errorLogger } from '../logger'
import { getEpisodesForPodcast, loadEpisodeInPlayer } from './helpers'

/* Constants */

const _fileName = 'src/lib/carplay/PVCarPlay.android.ts'

enum TabKeys {
  PodcastTab = 'PodcastTab',
  QueueTab = 'QueueTab',
  HistoryTab = 'HistoryTab'
}

enum MediaKeys {
  Podcast = 'Podcast',
  Episode = 'Episode',
  Queue = 'Queue',
  History = 'History',
  PlaceHolder = 'PlaceHolder'
}

const cachedPodcasts: { [key: string]: Podcast } = {}
const cachedEpisodes: { [key: string]: Episode[] } = {}

export let browseTree: AndroidAutoBrowseTree = { '/': [] }
let historyRefreshDebounce = 0
let podcastRefreshDebounce = 0

const updateAndroidAutoBrowseTree = (newContent: Partial<AndroidAutoBrowseTree>) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  browseTree = {
    ...browseTree,
    ...newContent
  }
  PVAudioPlayer.setBrowseTree(browseTree)
}

export const handleAABrowseMediaId = async (mediaId: string) => {
  if (mediaId === TabKeys.HistoryTab) {
    // HACK: debounce this properly. TrackPlayer.setBrowseTree triggers broadcasting all onLoadChildren
    // because contents are updated. Not debounced = infinite loop on refreshHistory.
    // use an event emitter instead.
    const currentTimeStamp = new Date().getTime()
    if (currentTimeStamp - historyRefreshDebounce > 1000) {
      refreshHistory()
      historyRefreshDebounce = currentTimeStamp
    }
  } else if (mediaId === TabKeys.PodcastTab) {
    // HACK: debounce this properly. TrackPlayer.setBrowseTree triggers broadcasting all onLoadChildren
    // because contents are updated. Not debounced = infinite loop on refreshHistory.
    // use an event emitter instead.
    const currentTimeStamp = new Date().getTime()
    if (currentTimeStamp - podcastRefreshDebounce > 1000) {
      handleAndroidAutoPodcastsUpdate()
      podcastRefreshDebounce = currentTimeStamp
    }
  } else if (mediaId.startsWith(MediaKeys.Podcast)) {
    // mirrors handlePodcastsListOnSelect.
    // load podcast if content needs to be refreshed (?), or content is empty.
    // TODO: when is content needs to be refreshed? or always refresh?
    // eslint-disable-next-line @typescript-eslint/tslint/config
    if (browseTree[mediaId] === undefined) {
      const index = mediaId.substring(MediaKeys.Podcast.length + 1)
      const { subscribedPodcasts } = getGlobal()
      const podcast = subscribedPodcasts[index] as Podcast
      const queryEpisodes: Episode[] = (await getEpisodesForPodcast(podcast))[0] || []
      cachedPodcasts[podcast.id] = podcast
      cachedEpisodes[podcast.id] = queryEpisodes
      updateAndroidAutoBrowseTree({
        [mediaId]: queryEpisodes.map((episode, index) => {
          const pubDate =
            (episode?.liveItem?.start && readableDate(episode.liveItem.start)) ||
            (episode.pubDate && readableDate(episode.pubDate)) ||
            ''
          return {
            title: episode.title || translate('Untitled Episode'),
            subtitle: pubDate,
            playable: '0',
            iconUri: episode.imageUrl || podcast.imageUrl || undefined,
            mediaId: `${MediaKeys.Episode}-${podcast.id}-${index}`
          }
        })
      })
    }
  }
}

export const handlePlayRemoteMediaId = async (mediaId: string) => {
  if (mediaId.startsWith(MediaKeys.Queue)) {
    const episodeId = mediaId.substring(MediaKeys.Queue.length + 1)
    const foundEpisode = getQueue().filter((episode) => episode.episodeId === episodeId)
    if (foundEpisode.length === 0) {
      errorLogger(
        _fileName,
        'handlePlayRemoteMediaId',
        `[Android Auto] ${mediaId} no longer exists in the current Queue.`
      )
      return
    }
    const convertedEpisode = convertNowPlayingItemToEpisode(foundEpisode[0])
    loadEpisodeInPlayer(convertedEpisode, convertedEpisode.podcast)
  } else if (mediaId.startsWith(MediaKeys.History)) {
    const episodeId = mediaId.substring(MediaKeys.History.length + 1)
    const foundEpisode = (await getHistory()).filter((episode) => episode.episodeId === episodeId)
    if (foundEpisode.length === 0) {
      errorLogger(
        _fileName,
        'handlePlayRemoteMediaId',
        `[Android Auto] ${mediaId} no longer exists in the current History.`
      )
      return
    }
    const convertedEpisode = convertNowPlayingItemToEpisode(foundEpisode[0])
    await loadEpisodeInPlayer(convertedEpisode, convertedEpisode.podcast)
    refreshHistory()
  } else if (mediaId.startsWith(MediaKeys.Episode)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [_, podcastId, index] = /^Episode-(.+)-(\d+)$/.exec(mediaId)!
    try {
      loadEpisodeInPlayer(cachedEpisodes[podcastId][Number(index)], cachedPodcasts[podcastId])
    } catch (e) {
      errorLogger(_fileName, 'handlePlayRemoteMediaId', `[Android Auto] ${mediaId}, ${podcastId}, ${index}, ${e}`)
    }
  } else {
    errorLogger(_fileName, 'handlePlayRemoteMediaId', `[Android Auto] ${mediaId} format is not supported.`)
  }
}

/* Initialize */

export const requestDrawOverAppsPermission = async () => {
  return new Promise<void>((resolve) => {
    const { PVAndroidAutoModule } = NativeModules
    PVAndroidAutoModule.getDrawOverAppsPermission().then(async (enabled: boolean) => {
      const drawOverAppsPermissionAsked = await AsyncStorage.getItem('DRAW_OVER_APPS_PERMISSION_ASKED_2')

      if (enabled || drawOverAppsPermissionAsked) {
        resolve()
        return
      } else {
        await AsyncStorage.setItem('DRAW_OVER_APPS_PERMISSION_ASKED_2', 'TRUE')
        Alert.alert(translate('Android Auto Permission Title'), translate('Android Auto Permission Body'), [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              resolve()
            }
          },
          {
            text: 'OK',
            onPress: () => {
              PVAndroidAutoModule.askDrawOverAppsPermission()
              setTimeout(() => {
                resolve()
              }, 3000)
            }
          }
        ])
      }
    })
  })
}

export const onAppInitialized = () => {
  const { PVAndroidAutoModule } = NativeModules
  PVAndroidAutoModule.turnOffShowWhenLocked()
  handleAndroidAutoPodcastsUpdate()
}

export const registerAndroidAutoModule = (t: (val: string) => string = translate) => {
  const defaultBrowseTree = {
    '/': [
      {
        mediaId: TabKeys.PodcastTab,
        title: t('Android Auto Podcast Title'),
        playable: '1'
      },
      {
        mediaId: TabKeys.QueueTab,
        title: t('Android Auto Queue Title'),
        playable: '1'
      },
      {
        mediaId: TabKeys.HistoryTab,
        title: t('Android Auto History Title'),
        playable: '1'
      }
    ]
  }
  updateAndroidAutoBrowseTree(defaultBrowseTree)
  PVAudioPlayer.setBrowseTreeStyle(AndroidAutoContentStyle.CategoryGrid, AndroidAutoContentStyle.List)
  PVEventEmitter.on(PV.Events.QUEUE_HAS_UPDATED, handleAndroidAutoQueueUpdate)
  PVEventEmitter.on(PV.Events.APP_FINISHED_INITALIZING_FOR_CARPLAY, onAppInitialized)
}

export const unregisterAndroidAutoModule = () => {
  PVEventEmitter.removeListener(PV.Events.QUEUE_HAS_UPDATED, handleAndroidAutoQueueUpdate)
  PVEventEmitter.removeListener(PV.Events.APP_FINISHED_INITALIZING_FOR_CARPLAY, onAppInitialized)
}

/* Podcasts Tab */

/**
 * mirrors handleCarPlayPodcastsUpdate.
 */
export const handleAndroidAutoPodcastsUpdate = () => {
  const { subscribedPodcasts } = getGlobal()
  updateAndroidAutoBrowseTree({
    [TabKeys.PodcastTab]: subscribedPodcasts.map((podcast: Podcast, index) => ({
      // mediaId: `${MediaKeys.Podcast}-${podcast.id}`,
      mediaId: `${MediaKeys.Podcast}-${index}`,
      playable: '1',
      title: podcast.title || translate('Untitled Podcast'),
      subtitle: podcast.subtitle,
      iconUri: podcast.imageUrl || undefined,
      contentStyle: String(AndroidAutoContentStyle.CategoryGrid)
    }))
  })
}

/* Podcast Episodes Tab */

// See handleAABrowseMediaId's if (mediaId.startsWith(MediaKeys.Podcast))

/* Queue Tab */

const getQueue = (): NowPlayingItem[] => {
  const { session } = getGlobal()
  return session?.userInfo?.queueItems || []
}

export const handleAndroidAutoQueueUpdate = () => {
  // TODO: Android implementation
  const updatedItems = getQueue()
  updateAndroidAutoBrowseTree({
    [TabKeys.QueueTab]: updatedItems.map((episode) => ({
      title: episode.episodeTitle || translate('Untitled Episode'),
      subtitle: episode.podcastTitle,
      playable: '0',
      iconUri: episode.episodeImageUrl,
      mediaId: `${MediaKeys.Queue}-${episode.episodeId}`
    }))
  })
}

/* History Tab */

const getHistory = async (): Promise<NowPlayingItem[]> => {
  const page = 1
  const existingItems: any[] = []
  await getHistoryItems(page, existingItems)
  const { session } = getGlobal()
  return session?.userInfo?.historyItems || []
}

/**
 * mirrors handleCarPlayHistoryUpdate. History is refreshed whenever entering the History tab.
 */
const refreshHistory = async () => {
  const updatedItems = await getHistory()
  // Limit historyItems to the most recent 20 items, for performance reasons.
  const limitedItems = updatedItems.slice(0, 20)
  updateAndroidAutoBrowseTree({
    [TabKeys.HistoryTab]: limitedItems.map((episode: NowPlayingItem) => {
      return {
        title: episode.episodeTitle || translate('Untitled Episode'),
        subtitle: episode.podcastTitle,
        playable: '0',
        iconUri: episode.episodeImageUrl,
        mediaId: `${MediaKeys.History}-${episode.episodeId}`
      }
    })
  })
}
