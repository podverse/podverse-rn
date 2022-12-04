import { checkIfNowPlayingItem, convertNowPlayingItemToEpisode,
  convertToNowPlayingItem, Episode, NowPlayingItem, Podcast } from 'podverse-shared';
import {getGlobal} from "reactn"
import { playerLoadNowPlayingItem } from '../../state/actions/player';
import { getEpisodes } from '../../services/episode';
import { getEpisodesAndLiveItems } from '../../services/liveItem';
import { playerTogglePlay } from '../../services/player';
import { getHistoryItemIndexInfoForEpisode } from '../../services/userHistoryItem';
import { hasValidNetworkConnection } from '../network';

export const getEpisodesForPodcast = async (podcast: Podcast): Promise<any[]> => {
  const hasInternetConnection = await hasValidNetworkConnection()
  if (!hasInternetConnection) {
    return getDownloadedEpisodes(podcast)
  } else {
    const liveEnabledPodcastStatuses = ['pending', 'live', 'ended']
    if (liveEnabledPodcastStatuses.includes(podcast.latestLiveItemStatus)) {
      const results = await getEpisodesAndLiveItems(
        {
          podcastId: podcast.id,
          maxResults: true,
          page: 1,
          sort: 'most-recent'
        },
        podcast.id
      )
    
      const { combinedEpisodes } = results
      return combinedEpisodes
    } else if (podcast.addByRSSPodcastFeedUrl) {
      const episodes = podcast.episodes || []
      return [episodes]
    } else {
      return getEpisodes({ podcastId: podcast.id, maxResults: true, sort: 'most-recent' })
    }
  }
}

const getDownloadedEpisodes = (podcast: Podcast) => {
  let podcastId = podcast.id
  if (podcast.addByRSSPodcastFeedUrl) {
    podcastId = podcast.addByRSSPodcastFeedUrl
  }

  const { downloadedPodcasts } = getGlobal()
  const downloadedPodcast = downloadedPodcasts.find((x: any) => podcastId && x.id && x.id === podcastId)
  const episodes = downloadedPodcast?.episodes || []
  return [episodes]
}

export const loadEpisodeInPlayer = async (episode: Episode, podcast: Podcast) => {
    const {player: {nowPlayingItem}} = getGlobal()
    const isNowPlayingItem = checkIfNowPlayingItem(episode, nowPlayingItem)
    if (isNowPlayingItem) {
        await playerTogglePlay()
    } else {
        const { userPlaybackPosition } = getHistoryItemIndexInfoForEpisode(episode?.id)
        const newNowPlayingItem = convertToNowPlayingItem(episode, null, podcast, userPlaybackPosition)
        const shouldPlay = true
        const forceUpdateOrderDate = true
        const setCurrentItemNextInQueue = false // TODO: Determine correctly
        await playerLoadNowPlayingItem(newNowPlayingItem, shouldPlay, forceUpdateOrderDate, setCurrentItemNextInQueue)
    }
}

export const loadNowPlayingItemInPlayer = async (newNowPlayingItem: NowPlayingItem) => {
  if (newNowPlayingItem?.episodeId) {
    const {
      player: { nowPlayingItem }
    } = getGlobal()
    const episode = convertNowPlayingItemToEpisode(newNowPlayingItem)
    const isNowPlayingItem = checkIfNowPlayingItem(episode, nowPlayingItem)
    if (isNowPlayingItem) {
      await playerTogglePlay()
    } else {
      const { userPlaybackPosition } = getHistoryItemIndexInfoForEpisode(newNowPlayingItem.episodeId)
      newNowPlayingItem.userPlaybackPosition = userPlaybackPosition
      const shouldPlay = true
      const forceUpdateOrderDate = true
      const setCurrentItemNextInQueue = false // TODO: Determine correctly
      await playerLoadNowPlayingItem(newNowPlayingItem, shouldPlay, forceUpdateOrderDate, setCurrentItemNextInQueue)
    }
  }
}