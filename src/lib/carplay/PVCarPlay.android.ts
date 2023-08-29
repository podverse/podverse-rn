import { Platform } from 'react-native'
import TrackPlayer, { AndroidAutoContentStyle, AndroidAutoBrowseTree } from 'react-native-track-player'
import { getGlobal } from 'reactn'
import { Episode, NowPlayingItem, Podcast } from 'podverse-shared'

import { translate } from '../i18n'
import { getPodcast } from '../../services/podcast'

/* Constants */

enum TabKeys {
  PodcastTab = 'PodcastTab',
  QueueTab = 'QueueTab',
  HistoryTab = 'HistoryTab'
}

enum MediaKeys {
  Podcast = 'Podcast',
  Queue = 'Queue',
  History = 'History',
  PlaceHolder = 'PlaceHolder'
}

// This timeout is a work-around for asynchronous state loading issues in background tabs.
const stateUpdateTimeout = 10000

export let browseTree: AndroidAutoBrowseTree = { '/': [] }

const setAndroidAutoBrowseTree = (newContent: Partial<AndroidAutoBrowseTree>) => {
  browseTree = {
    ...browseTree,
    ...newContent
  }
  TrackPlayer.setBrowseTree(browseTree)
}

export const handleAABrowseMediaId = async (mediaId: string) => {
  if (mediaId.startsWith(MediaKeys.Podcast)) {
    // load podcast if content needs to be refreshed (?), or content is empty.
    // TODO: when is content needs to be refreshed
    if (browseTree[mediaId] === undefined) {
      console.log(mediaId.substring(MediaKeys.Podcast.length + 1))
      console.log(await getPodcast(mediaId.substring(MediaKeys.Podcast.length + 1)))
    }
  }
}

export const handlePlayRemoteMediaId = (mediaId: string) => {
  console.log(`[remotePlay] TODO: ${mediaId}`)
}

/* Initialize */

export const registerCarModule = (onConnect, onDisconnect) => {
  if (Platform.OS !== 'android') return
}

export const initializeAndroidAutoContent = (t: (val: string) => string = translate) => {
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
  setAndroidAutoBrowseTree(defaultBrowseTree)
  TrackPlayer.setBrowseTreeStyle(AndroidAutoContentStyle.CategoryGrid, AndroidAutoContentStyle.List)
}

/* Root View */

export const showRootView = (subscribedPodcasts: Podcast[], historyItems: any[], queueItems: any[]) => {
  // TODO: Android implementation
}

/* Podcasts Tab */

export const handleAndroidAutoPodcastsUpdate = () => {
  const { subscribedPodcasts } = getGlobal()
  setAndroidAutoBrowseTree({
    [TabKeys.PodcastTab]: subscribedPodcasts.map((podcast) => ({
      mediaId: `${MediaKeys.Podcast}-${podcast.id}`,
      playable: '1',
      title: podcast.title,
      subtitle: podcast.subtitle,
      iconUri: podcast.imageUrl
    }))
  })
}

/* Podcast Episodes Tab */

// TODO: Android implementation

/* Queue Tab */

export const handleAndroidAutoQueueUpdate = () => {
  // TODO: Android implementation
  console.error('handleAndroidAutoQueueUpdate not implemented')
}

/* History Tab */

export const handleAndroidAutoHistoryUpdate = () => {
  // TODO: Android implementation
}

/* Player Helpers */

export const showAndroidAutoerForEpisode = async (episode: Episode, podcast: Podcast) => {
  // TODO: Android implementation
}

export const showAndroidAutoerForNowPlayingItem = async (nowPlayingItem: NowPlayingItem) => {
  // TODO: Android implementation
}
