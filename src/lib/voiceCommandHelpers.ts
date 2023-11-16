import { getGlobal } from 'reactn'
import { NowPlayingItem, convertToNowPlayingItem } from "podverse-shared"
import { PV } from '../resources'
import { getEpisodesAndLiveItems } from '../services/liveItem'
import { playerHandlePlayWithUpdate, playerLoadNowPlayingItem } from "../state/actions/player"
import { getPodcasts } from '../services/podcast'
import { getSubscribedPodcasts } from '../state/actions/podcast'
import { getQueueItems, removeQueueItem } from "../state/actions/queue"

const playerLoadNowPlayingItemOptions = {
  forceUpdateOrderDate: false,
  setCurrentItemNextInQueue: true,
  shouldPlay: true
}

const checkIfQueryMatch = (query?: string, title?: string) => {
  return query && title?.toLowerCase()?.trim()?.includes(query)
}

export const cleanVoiceCommandQuery = (query?: string) => {
  query = query || ''
  query = query.toLowerCase()
  // including all the incorrect auto-corrects we've seen for "podverse"
  query = query.replace(/in podverse$|in pod verse$|in proverbs$|in poppers$|in toddlers$|in pod versus$/g, '')
  query = query.replace(/on podverse$|on pod verse$|on proverbs$|on poppers$|on toddlers$|on pod versus$/g, '')
  query = query.trim()
  return query
}

export const voicePlayNowPlayingItem = (query: string) => {
  let shouldContinue = true
  const nowPlayingItem = getGlobal()?.player?.nowPlayingItem

  if (nowPlayingItem) {
    const isNowPlayingItem = checkIfQueryMatch(query, nowPlayingItem.podcastTitle)
    if (isNowPlayingItem) {
      playerHandlePlayWithUpdate()
      shouldContinue = false
    }
  }

  return shouldContinue
}

export const voicePlayNextQueuedItem = async (query: string) => {
  let shouldContinue = true
  const queueItems = await getQueueItems()

  const queueItem = queueItems.find(({ podcastTitle }: NowPlayingItem) => {
    return checkIfQueryMatch(query, podcastTitle)
  })
  
  if (queueItem) {
    await playerLoadNowPlayingItem(queueItem, playerLoadNowPlayingItemOptions)
    await removeQueueItem(queueItem)
    shouldContinue = false
  }

  return shouldContinue
}

export const voicePlayNextSubscribedPodcast = async (query: string) => {
  let shouldContinue = true
  const podcasts = await getSubscribedPodcasts()
  
  let matchingPodcast = null
  if (podcasts && podcasts.length > 0) {
    for (const podcast of podcasts) {
      if (checkIfQueryMatch(query, podcast?.title)) {
        matchingPodcast = podcast
      }
    }
  }

  if (matchingPodcast) {
    if (matchingPodcast.addByRSSPodcastFeedUrl) {
      const episodes = matchingPodcast.episodes
      const episode = episodes?.[0]
      if (episode) {
        const inheritedEpisode = null
        const inheritedPodcast = matchingPodcast
        const nowPlayingItem = convertToNowPlayingItem(episode, inheritedEpisode, inheritedPodcast)
        await playerLoadNowPlayingItem(nowPlayingItem, playerLoadNowPlayingItemOptions)
        await removeQueueItem(nowPlayingItem)
        shouldContinue = false
      }
    }
    if (!matchingPodcast.addByRSSPodcastFeedUrl) {
      const results = await getEpisodesAndLiveItems(
        {
          sort: PV.Filters._mostRecentKey,
          page: 1,
          podcastId: matchingPodcast.id
        },
        matchingPodcast.id
      )

      const combinedEpisodes = results?.combinedEpisodes
      const episode = combinedEpisodes?.[0]?.[0]

      if (episode) {
        const inheritedEpisode = null
        const inheritedPodcast = matchingPodcast
        const nowPlayingItem = convertToNowPlayingItem(episode, inheritedEpisode, inheritedPodcast)
        await playerLoadNowPlayingItem(nowPlayingItem, playerLoadNowPlayingItemOptions)
        await removeQueueItem(nowPlayingItem)
        shouldContinue = false
      }
    }
  }

  return shouldContinue
}

export const voicePlayPodcastFromSearchAPI = async (query: string) => {
  let shouldContinue = true
  const results = await getPodcasts({ searchTitle: query })
  const podcasts = results?.[0]
  const matchingPodcast = podcasts?.[0]
  if (matchingPodcast) {
    const results = await getEpisodesAndLiveItems(
      {
        sort: PV.Filters._mostRecentKey,
        page: 1,
        podcastId: matchingPodcast.id
      },
      matchingPodcast.id
    )

    const combinedEpisodes = results?.combinedEpisodes
    const episode = combinedEpisodes?.[0]?.[0]

    if (episode) {
      const inheritedEpisode = null
      const inheritedPodcast = matchingPodcast
      const nowPlayingItem = convertToNowPlayingItem(episode, inheritedEpisode, inheritedPodcast)
      await playerLoadNowPlayingItem(nowPlayingItem, playerLoadNowPlayingItemOptions)
      await removeQueueItem(nowPlayingItem)
      shouldContinue = false
    }
  }
  
  return shouldContinue
}
