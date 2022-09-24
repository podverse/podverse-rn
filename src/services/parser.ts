import AsyncStorage from '@react-native-community/async-storage'
import { encode as btoa } from 'base-64'
import { checkIfContainsStringMatch, isValidDate } from 'podverse-shared'
import * as RNKeychain from 'react-native-keychain'
import { downloadEpisode } from '../lib/downloader'
import { downloadCustomFileNameId } from '../lib/hash'
import { credentialsPlaceholderUsername } from '../lib/secutity'
import { convertToSortableTitle, getAppUserAgent } from '../lib/utility'
import { PV } from '../resources'
import { handleUpdateNewEpisodesCountAddByRSS } from '../state/actions/newEpisodesCount'
import { checkIfLoggedIn, getBearerToken } from './auth'
import { getAutoDownloadSettings, getAutoDownloadsLastRefreshDate } from './autoDownloads'
import { getNewEpisodeCountCustomRSSLastRefreshDate } from './newEpisodesCount'
import { combineWithAddByRSSPodcasts } from './podcast'
import { request } from './request'
const podcastFeedParser = require('@podverse/podcast-feed-parser')

/*
addByRSSPodcasts: [addByRSSPodcast]
addByRSSPodcast: object {
  addByRSSPodcastFeedUrl: string,
  episodes: [episode],
  ...other podcast properties
}
*/

export const hasAddByRSSEpisodesLocally = async () => {
  const results = await getAddByRSSEpisodesLocally()
  return results.length > 0
}

export const combineEpisodesWithAddByRSSEpisodesLocally = async (
  results: any[],
  searchTitle?: string,
  hasVideo?: boolean
) => {
  let mostRecentDate = ''
  let oldestDate = ''

  if (results[0].length > 0) {
    let recentIdx = 0
    mostRecentDate = results[0][recentIdx].pubDate
    while (!mostRecentDate && recentIdx <= results[0].length) {
      recentIdx++
      mostRecentDate = results[0][recentIdx].pubDate
    }

    let oldestIdx = results[0].length - 1
    oldestDate = results[0][oldestIdx].pubDate
    while (!oldestDate && oldestIdx >= 0) {
      oldestIdx--
      oldestDate = results[0][oldestIdx].pubDate
    }
  }

  mostRecentDate = mostRecentDate ? mostRecentDate : new Date().toString()
  oldestDate = oldestDate ? oldestDate : new Date(0).toString()

  let addByRSSEpisodes =
    results.length > 0
      ? await getAddByRSSEpisodesLocallyByDateRange(new Date(mostRecentDate), new Date(oldestDate))
      : await getAddByRSSEpisodesLocally()

  if (searchTitle) {
    addByRSSEpisodes = addByRSSEpisodes.filter(
      (episode) => episode.title && checkIfContainsStringMatch(searchTitle, episode.title)
    )
  }

  if (hasVideo) {
    addByRSSEpisodes = addByRSSEpisodes.filter((episode) => episode.hasVideo)
  }

  const sortedResults = [...results[0], ...addByRSSEpisodes].sort((a: any, b: any) => {
    const dateA = new Date(a.pubDate) as any
    const dateB = new Date(b.pubDate) as any
    return dateB - dateA
  })

  const newCount = results[1] + addByRSSEpisodes.length

  return [sortedResults, newCount]
}

export const getAddByRSSEpisodesLocally = async () => {
  const addByRSSPodcasts = await getAddByRSSPodcastsLocally()
  const combinedEpisodes = [] as any[]

  for (const addByRSSPodcast of addByRSSPodcasts) {
    for (const episode of addByRSSPodcast.episodes) {
      episode.podcast = addByRSSPodcast
      combinedEpisodes.push(episode)
    }
  }

  return combinedEpisodes
}

export const getAddByRSSEpisodesLocallyByDateRange = async (mostRecentDate: Date, oldestDate: Date) => {
  const addByRSSPodcasts = await getAddByRSSPodcastsLocally()
  const combinedEpisodes = [] as any[]

  for (const addByRSSPodcast of addByRSSPodcasts) {
    for (const episode of addByRSSPodcast.episodes) {
      episode.podcast = addByRSSPodcast
      combinedEpisodes.push(episode)
    }
  }

  return combinedEpisodes.filter((episode) => {
    if (!episode.pubDate) {
      return false
    }

    if (new Date(episode.pubDate).valueOf() > mostRecentDate.valueOf()) {
      return true
    }

    return (
      new Date(episode.pubDate).valueOf() <= mostRecentDate.valueOf() &&
      new Date(episode.pubDate).valueOf() >= oldestDate.valueOf()
    )
  })
}

export const getAddByRSSPodcastLocally = async (feedUrl: string) => {
  const addByRSSPodcastFeedUrlPodcasts = await getAddByRSSPodcastsLocally()
  return addByRSSPodcastFeedUrlPodcasts.find((x: any) => x.addByRSSPodcastFeedUrl === feedUrl)
}

export const getAddByRSSPodcastsLocally = async () => {
  try {
    const itemsString = await AsyncStorage.getItem(PV.Keys.ADD_BY_RSS_PODCASTS)
    return itemsString ? JSON.parse(itemsString) : []
  } catch (error) {
    console.log('getAddByRSSPodcastsLocally', error)
    return []
  }
}

export const getAddByRSSPodcastFeedUrlsLocally = async () => {
  try {
    const itemsString = await AsyncStorage.getItem(PV.Keys.ADD_BY_RSS_PODCAST_FEED_URLS)
    return itemsString ? JSON.parse(itemsString) : []
  } catch (error) {
    console.log('getAddByRSSPodcastFeedUrlsLocally', error)
    return []
  }
}

const setAddByRSSPodcastsLocally = async (podcasts: any[]) => {
  if (Array.isArray(podcasts)) {
    const cleanedPodcasts = podcasts.filter((podcast: any) => !!podcast)
    await AsyncStorage.setItem(PV.Keys.ADD_BY_RSS_PODCASTS, JSON.stringify(cleanedPodcasts))
  }
}

export const setAddByRSSPodcastFeedUrlsLocally = async (addByRSSPodcastFeedUrls: any[]) => {
  if (Array.isArray(addByRSSPodcastFeedUrls)) {
    await AsyncStorage.setItem(PV.Keys.ADD_BY_RSS_PODCAST_FEED_URLS, JSON.stringify(addByRSSPodcastFeedUrls))
  }
}

export const parseAllAddByRSSPodcasts = async () => {
  const [urls, autoDownloadPodcastSettings, allAddByRSSPodcastCredentials] = await Promise.all([
    getAddByRSSPodcastFeedUrlsLocally(),
    getAutoDownloadSettings(),
    getAllPodcastCredentials()
  ])
  const parsedPodcasts = []
  const finalParsedPodcasts = []

  for (const url of urls) {
    try {
      const credentials = allAddByRSSPodcastCredentials[url] || ''
      const parsedPodcast = await parseAddByRSSPodcast(url, credentials)
      if (parsedPodcast) {
        parsedPodcasts.push(parsedPodcast)
      }
    } catch (error) {
      console.log('parseAllAddByRSSPodcasts', error)
    }
  }

  const localPodcasts = await getAddByRSSPodcastsLocally()
  for (const parsedPodcast of parsedPodcasts) {
    const index = localPodcasts.findIndex(
      (localPodcast: any) => localPodcast.addByRSSPodcastFeedUrl === parsedPodcast.addByRSSPodcastFeedUrl
    )
    if (index || index === 0) {
      finalParsedPodcasts[index] = parsedPodcast
    } else {
      finalParsedPodcasts.push(parsedPodcast)
    }

    if (parsedPodcast.episodes && parsedPodcast.episodes.length) {
      const lastAutoDownloadsRefreshDate = await getAutoDownloadsLastRefreshDate()
      const lastNewEpisodesCountRefreshDate = await getNewEpisodeCountCustomRSSLastRefreshDate()
      const newEpisodeIds = []

      for (const episode of parsedPodcast.episodes) {
        if (new Date(episode.pubDate).valueOf() > new Date(lastNewEpisodesCountRefreshDate).valueOf()) {
          newEpisodeIds.push(episode.id)
        }
        if (new Date(episode.pubDate).valueOf() > new Date(lastAutoDownloadsRefreshDate).valueOf()) {
          const restart = false
          const waitToAddTask = true
          if (autoDownloadPodcastSettings[parsedPodcast.addByRSSPodcastFeedUrl]) {
            downloadEpisode(episode, parsedPodcast, restart, waitToAddTask)
          }
        }
      }
      await handleUpdateNewEpisodesCountAddByRSS(parsedPodcast.id, newEpisodeIds)
    }
  }

  await setAddByRSSPodcastsLocally(finalParsedPodcasts)

  await AsyncStorage.setItem(PV.Keys.NEW_EPISODE_COUNT_CUSTOM_RSS_LAST_REFRESHED, new Date().toISOString())

  return finalParsedPodcasts
}

export const getPodcastCredentialsHeader = async (addByRSSPodcastFeedUrl?: string) => {
  const credentials = await getPodcastCredentials(addByRSSPodcastFeedUrl)
  return credentials ? `Basic ${btoa(credentials)}` : ''
}

export const getPodcastCredentials = async (addByRSSPodcastFeedUrl?: string) => {
  let credentials = ''
  if (addByRSSPodcastFeedUrl) {
    const allAddByRSSPodcastCredentials = await getAllPodcastCredentials()
    credentials = allAddByRSSPodcastCredentials[addByRSSPodcastFeedUrl] || ''
  }
  return credentials
}

const getAllPodcastCredentials = async () => {
  let allCredentials = {}

  try {
    const allCredentialsResult = await RNKeychain.getInternetCredentials(PV.Keys.ADD_BY_RSS_PODCASTS_CREDENTIALS)
    if (allCredentialsResult) {
      const allCredentialsString = allCredentialsResult.password
      allCredentials = allCredentialsString ? JSON.parse(allCredentialsString) : {}
    }
  } catch (error) {
    RNKeychain.setInternetCredentials(
      PV.Keys.ADD_BY_RSS_PODCASTS_CREDENTIALS,
      credentialsPlaceholderUsername,
      JSON.stringify({})
    )
  }

  return allCredentials
}

// credentials are a string in format <username>:<password>
export const savePodcastCredentials = async (feedUrl: string, credentials?: string) => {
  const allAddByRSSPodcastCredentials = await getAllPodcastCredentials()
  allAddByRSSPodcastCredentials[feedUrl] = credentials

  RNKeychain.setInternetCredentials(
    PV.Keys.ADD_BY_RSS_PODCASTS_CREDENTIALS,
    credentialsPlaceholderUsername,
    JSON.stringify(allAddByRSSPodcastCredentials)
  )
}

export const removePodcastCredentials = async (feedUrl: string) => {
  const allAddByRSSPodcastCredentials = await getAllPodcastCredentials()
  delete allAddByRSSPodcastCredentials[feedUrl]

  RNKeychain.setInternetCredentials(
    PV.Keys.ADD_BY_RSS_PODCASTS_CREDENTIALS,
    credentialsPlaceholderUsername,
    JSON.stringify(allAddByRSSPodcastCredentials)
  )
}

export const parseAddByRSSPodcast = async (feedUrl: string, credentials?: string) => {
  try {
    const userAgent = getAppUserAgent()
    const Authorization = credentials ? `Basic ${btoa(credentials)}` : ''

    let result = null

    try {
      result = await podcastFeedParser.getPodcastFromURL({
        url: feedUrl,
        headers: {
          'User-Agent': userAgent,
          ...(Authorization ? { Authorization } : {})
        },
        timeout: 30000
      })
    } catch (error) {
      if (feedUrl?.startsWith('http://')) {
        console.log('retry parse using a secure protocol')
        result = await podcastFeedParser.getPodcastFromURL({
          url: feedUrl.replace('http://', 'https://'),
          headers: {
            'User-Agent': userAgent,
            ...(Authorization ? { Authorization } : {})
          },
          timeout: 30000
        })
      } else {
        throw error
      }
    }

    if (credentials) {
      await savePodcastCredentials(feedUrl, credentials)
    } else {
      await removePodcastCredentials(feedUrl)
    }

    const { episodes: parsedEpisodes, meta } = result

    const title = meta.title && meta.title.trim()
    if (!title) {
      throw new Error('parseAddByRSSPodcast: Title not defined')
    }
    const podcast = {} as any

    podcast.addByRSSPodcastFeedUrl = feedUrl
    // The podcast.id must be set to the addByRSSPodcastFeedUrl for
    // addDownloadedPodcastEpisode to work properly.
    podcast.id = feedUrl

    podcast.description = meta.description && meta.description.trim()

    const feedLastUpdated = new Date(meta.lastBuildDate || meta.pubDate)
    podcast.feedLastUpdated = isValidDate(feedLastUpdated) ? feedLastUpdated : new Date()

    podcast.funding = meta.funding
    podcast.guid = meta.guid
    podcast.imageUrl = meta.imageURL
    podcast.isExplicit = meta.explicit
    podcast.language = meta.language

    podcast.linkUrl = meta.link
    podcast.sortableTitle = convertToSortableTitle(title)
    podcast.subtitle = meta.subtitle && meta.subtitle.trim()
    podcast.title = title
    podcast.type = meta.type
    podcast.value = meta.value

    const episodes = [] as any[]

    /* If a feed has more video episodes than audio episodes, mark it as a hasVideo podcast. */
    let videoCount = 0
    let audioCount = 0

    if (parsedEpisodes && Array.isArray(parsedEpisodes)) {
      parsedEpisodes.sort((a, b) => (new Date(b.pubDate) as any) - (new Date(a.pubDate) as any))

      if (parsedEpisodes[0]) {
        const lastEpisodePubDate = new Date(parsedEpisodes[0].pubDate)
        podcast.lastEpisodePubDate = isValidDate(lastEpisodePubDate) && lastEpisodePubDate
        podcast.lastEpisodePubDate = podcast.lastEpisodePubDate || parsedEpisodes[0].published || new Date()
        podcast.lastEpisodeTitle = parsedEpisodes[0].title && parsedEpisodes[0].title.trim()
      }

      for (const parsedEpisode of parsedEpisodes) {
        const episode = {} as any
        const enclosure = parsedEpisode.enclosure
        if (!enclosure || !enclosure.url) continue

        episode.addedByRSS = true

        // The episode.mediaUrl is used as the unique id by the downloads service,
        // and as the unique key by the FlatList component.
        episode.id = downloadCustomFileNameId(enclosure.url)
        episode.mediaUrl = enclosure.url

        // TODO: add chapters support for podcasts added by RSS feed
        // if (parsedEpisode.chapters) {
        //   episode.chaptersUrl = parsedEpisode.chapters.url
        //   episode.chaptersType = parsedEpisode.chapters.type
        // }

        episode.description = parsedEpisode?.summary?.trim() || parsedEpisode?.description?.trim()
        episode.duration = parsedEpisode.duration ? parseInt(parsedEpisode.duration, 10) : 0
        episode.episodeType = parsedEpisode.type
        episode.funding = parsedEpisode.funding
        episode.guid = parsedEpisode.guid
        episode.imageUrl = parsedEpisode.image
        episode.isExplicit = parsedEpisode.explicit
        episode.isPublic = true
        episode.linkUrl = parsedEpisode.link
        episode.mediaType = enclosure.type

        const pubDate = new Date(parsedEpisode.pubDate)
        episode.pubDate = isValidDate(pubDate) ? pubDate : new Date()

        episode.soundbite = parsedEpisode.soundbite
        episode.subtitle = parsedEpisode.subtitle && parsedEpisode.subtitle.trim()
        episode.title = parsedEpisode.title && parsedEpisode.title.trim()
        episode.value = parsedEpisode.value

        if (parsedEpisode.mediaType && parsedEpisode.mediaType.indexOf('video') >= 0) {
          videoCount++
        } else {
          audioCount++
        }

        episodes.push(episode)
      }
    }

    episodes.sort((a, b) => (new Date(b.pubDate) as any) - (new Date(a.pubDate) as any))

    podcast.episodes = episodes
    podcast.hasVideo = videoCount > audioCount

    await addAddByRSSPodcastFeedUrlLocally(feedUrl)
    await addParsedAddByRSSPodcastLocally(podcast)

    return podcast
  } catch (error) {
    console.log('parseAddByRSSPodcast error', feedUrl, error)
    const previouslySavedPodcast = await getAddByRSSPodcastLocally(feedUrl)
    return previouslySavedPodcast
  }
}

const addParsedAddByRSSPodcastLocally = async (parsedPodcast: any) => {
  const rssPodcasts = await getAddByRSSPodcastsLocally()
  const index = rssPodcasts.findIndex(
    (rssPodcast: any) => rssPodcast.addByRSSPodcastFeedUrl === parsedPodcast.addByRSSPodcastFeedUrl
  )
  if ((index && index >= 0) || index === 0) {
    rssPodcasts[index] = parsedPodcast
  } else {
    rssPodcasts.push(parsedPodcast)
  }
  await setAddByRSSPodcastsLocally(rssPodcasts)
}

export const addManyAddByRSSPodcastFeedUrlsOnServer = async (addByRSSPodcastFeedUrls: string[]) => {
  const bearerToken = await getBearerToken()
  const response = await request({
    endpoint: '/add-by-rss-podcast-feed-url/add-many',
    method: 'POST',
    headers: {
      Authorization: bearerToken,
      'Content-Type': 'application/json'
    },
    body: { addByRSSPodcastFeedUrls }
  })

  return response && response.data
}

export const addAddByRSSPodcastFeedUrlOnServer = async (addByRSSPodcastFeedUrl: string) => {
  const bearerToken = await getBearerToken()
  const response = await request({
    endpoint: '/add-by-rss-podcast-feed-url/add',
    method: 'POST',
    headers: {
      Authorization: bearerToken,
      'Content-Type': 'application/json'
    },
    body: { addByRSSPodcastFeedUrl }
  })

  return response && response.data
}

const addAddByRSSPodcastFeedUrlLocally = async (feedUrl: string) => {
  const feedUrls = await getAddByRSSPodcastFeedUrlsLocally()
  if (!feedUrls.some((x: string) => x === feedUrl)) {
    feedUrls.push(feedUrl)
    await setAddByRSSPodcastFeedUrlsLocally(feedUrls)
  }
}

export const removeAddByRSSPodcast = async (feedUrl: string) => {
  const isLoggedIn = await checkIfLoggedIn()
  if (isLoggedIn) {
    await removeAddByRSSPodcastFeedUrlOnServer(feedUrl)
  }

  let podcasts = await getAddByRSSPodcastsLocally()
  podcasts = podcasts.filter((x: any) => x.addByRSSPodcastFeedUrl !== feedUrl)
  await setAddByRSSPodcastsLocally(podcasts)
  await removePodcastCredentials(feedUrl)
  let addByRSSPodcastFeedUrls = await getAddByRSSPodcastFeedUrlsLocally()
  addByRSSPodcastFeedUrls = addByRSSPodcastFeedUrls.filter((x: string) => x !== feedUrl)
  await setAddByRSSPodcastFeedUrlsLocally(addByRSSPodcastFeedUrls)
  const combinedPodcasts = await combineWithAddByRSSPodcasts()
  return combinedPodcasts
}

const removeAddByRSSPodcastFeedUrlOnServer = async (addByRSSPodcastFeedUrl: string) => {
  const bearerToken = await getBearerToken()
  const response = await request({
    endpoint: '/add-by-rss-podcast-feed-url/remove',
    method: 'POST',
    headers: {
      Authorization: bearerToken,
      'Content-Type': 'application/json'
    },
    body: { addByRSSPodcastFeedUrl }
  })

  return response && response.data
}
