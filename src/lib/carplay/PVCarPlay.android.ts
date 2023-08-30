import TrackPlayer, { AndroidAutoContentStyle, AndroidAutoBrowseTree } from 'react-native-track-player'
import { getGlobal } from 'reactn'
import { Episode, NowPlayingItem, Podcast, convertNowPlayingItemToEpisode } from 'podverse-shared'

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

const updateAndroidAutoBrowseTree = (newContent: Partial<AndroidAutoBrowseTree>) => {
  browseTree = {
    ...browseTree,
    ...newContent
  }
  TrackPlayer.setBrowseTree(browseTree)
}

export const handleAABrowseMediaId = async (mediaId: string) => {
  if (mediaId.startsWith(MediaKeys.Podcast)) {
    // mirrors handlePodcastsListOnSelect.
    // load podcast if content needs to be refreshed (?), or content is empty.
    // TODO: when is content needs to be refreshed? or always refresh?
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
            iconUri: episode.imageUrl || podcast.imageUrl,
            mediaId: `${MediaKeys.Episode}-${podcast.id}-${index}`
          }
        })
      })
    }
  } else if (mediaId === TabKeys.HistoryTab) {
    refreshHistory()
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

export const registerAndroidAutoModule = (t: (val: string) => string = translate) => {
  const defaultBrowseTree = {
    '/': [
      {
        mediaId: TabKeys.PodcastTab,
        title: t('AndroidAuto Podcast Title'),
        playable: '1'
      },
      {
        mediaId: TabKeys.QueueTab,
        title: t('AndroidAuto Queue Title'),
        playable: '1'
      },
      {
        mediaId: TabKeys.HistoryTab,
        title: t('AndroidAuto History Title'),
        playable: '1'
      }
    ]
  }
  updateAndroidAutoBrowseTree(defaultBrowseTree)
  TrackPlayer.setBrowseTreeStyle(AndroidAutoContentStyle.CategoryGrid, AndroidAutoContentStyle.List)
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
      title: podcast.title,
      subtitle: podcast.subtitle,
      iconUri: podcast.imageUrl
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
