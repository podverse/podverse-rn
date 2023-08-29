import TrackPlayer, { AndroidAutoContentStyle, AndroidAutoBrowseTree } from 'react-native-track-player'
import { getGlobal } from 'reactn'
import { Episode, NowPlayingItem, Podcast } from 'podverse-shared'

import { translate } from '../i18n'
import { readableDate } from '../utility'
import { getEpisodesForPodcast } from './helpers'

/* Constants */

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

// TODO: ts type?
let episodes: any[] = []

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
      const podcast = subscribedPodcasts[index]
      episodes = (await getEpisodesForPodcast(podcast))[0] || []
      updateAndroidAutoBrowseTree({
        [mediaId]: episodes.map((episode, index) => {
          const pubDate =
            (episode?.liveItem?.start && readableDate(episode.liveItem.start)) ||
            (episode.pubDate && readableDate(episode.pubDate)) ||
            ''
          return {
            title: episode.title || translate('Untitled Episode'),
            subtitle: pubDate,
            playable: '0',
            iconUri: podcast.imageUrl,
            mediaId: `${MediaKeys.Episode}-${index}`
          }
        })
      })
    }
  }
}

export const handlePlayRemoteMediaId = (mediaId: string) => {
  console.log(`[remotePlay] TODO: ${mediaId}`)
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
