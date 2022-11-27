import { checkIfNowPlayingItem, convertNowPlayingItemToEpisode,
  convertToNowPlayingItem, Episode, NowPlayingItem, Podcast } from 'podverse-shared';
import {getGlobal} from "reactn"
import { playerLoadNowPlayingItem } from '../../state/actions/player';
import { getEpisodes } from '../../services/episode';
import { getEpisodesAndLiveItems } from '../../services/liveItem';
import { playerTogglePlay } from '../../services/player';
import { getHistoryItemIndexInfoForEpisode } from '../../services/userHistoryItem';

export const getEpisodesForPodcast = async (podcast: Podcast): Promise<any[]> => {
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
  } else {
    return getEpisodes({podcastId: podcast.id, maxResults: true, sort: "most-recent"})
  }
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