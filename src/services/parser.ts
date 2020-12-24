import AsyncStorage from '@react-native-community/async-storage'
import { convertToSortableTitle, getAppUserAgent, isValidDate } from '../lib/utility'
import { PV } from '../resources'
import { checkIfLoggedIn, getBearerToken } from './auth'
import { combineWithAddByRSSPodcasts } from './podcast'
import { request } from './request'
const podcastFeedParser = require('@podverse/podcast-feed-parser')
const uuidv4 = require('uuid/v4')

/*
addByRSSPodcasts: [addByRSSPodcast]
addByRSSPodcast: object {
  addByRSSPodcastFeedUrl: string,
  episodes: [episode],
  ...other podcast properties
}
*/

export const hasAddByRSSEpisodesLocally = async () => {
  const results = await getAddByRSSEpisodesLocally(new Date(), new Date(0))
  return results.length > 0
}

export const combineEpisodesWithAddByRSSEpisodesLocally = async (results: any[]) => {
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

  const addByRSSEpisodes = await getAddByRSSEpisodesLocally(new Date(mostRecentDate), new Date(oldestDate))

  const sortedResults = [...results[0], ...addByRSSEpisodes].sort((a: any, b: any) => {
    const dateA = new Date(a.pubDate) as any
    const dateB = new Date(b.pubDate) as any
    return dateB - dateA
  })

  const newCount = results[1] + addByRSSEpisodes.length

  return [sortedResults, newCount]
}

export const getAddByRSSEpisodesLocally = async (mostRecentDate: Date, oldestDate: Date) => {
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
    await AsyncStorage.setItem(PV.Keys.ADD_BY_RSS_PODCASTS, JSON.stringify(podcasts))
  }
}

export const setAddByRSSPodcastFeedUrlsLocally = async (addByRSSPodcastFeedUrls: any[]) => {
  if (Array.isArray(addByRSSPodcastFeedUrls)) {
    await AsyncStorage.setItem(PV.Keys.ADD_BY_RSS_PODCAST_FEED_URLS, JSON.stringify(addByRSSPodcastFeedUrls))
  }
}

export const parseAllAddByRSSPodcasts = async () => {
  const urls = await getAddByRSSPodcastFeedUrlsLocally()
  const parsedPodcasts = []
  const finalParsedPodcasts = []

  for (const url of urls) {
    try {
      const parsedPodcast = await parseAddByRSSPodcast(url)
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
  }

  await setAddByRSSPodcastsLocally(finalParsedPodcasts)

  return finalParsedPodcasts
}

export const parseAddByRSSPodcast = async (feedUrl: string) => {
  const userAgent = await getAppUserAgent()
  const result = await podcastFeedParser.getPodcastFromURL({
    url: feedUrl,
    headers: { 'User-Agent': userAgent },
    timeout: 20000
  })
  const { episodes: parsedEpisodes, meta } = result

  const title = meta.title && meta.title.trim()
  if (!title) {
    throw new Error('parseAddByRSSPodcast: Title not defined')
  }
  const podcast = {} as any

  podcast.addByRSSPodcastFeedUrl = feedUrl
  podcast.description = meta.description && meta.description.trim()

  const feedLastUpdated = new Date(meta.lastBuildDate || meta.pubDate)
  podcast.feedLastUpdated = isValidDate(feedLastUpdated) ? feedLastUpdated : new Date()

  podcast.funding = meta.funding
  podcast.guid = meta.guid
  podcast.imageUrl = meta.imageURL
  podcast.isExplicit = meta.explicit
  podcast.language = meta.language

  if (parsedEpisodes && parsedEpisodes.length > 0) {
    const lastEpisodePubDate = new Date(parsedEpisodes[0].pubDate)
    podcast.lastEpisodePubDate = isValidDate(lastEpisodePubDate) ? lastEpisodePubDate : new Date()
    podcast.lastEpisodePubDate = parsedEpisodes[0].published || new Date()
    podcast.lastEpisodeTitle = parsedEpisodes[0].title && parsedEpisodes[0].title.trim()
  }

  podcast.linkUrl = meta.link
  podcast.sortableTitle = convertToSortableTitle(title)
  podcast.title = title
  podcast.type = meta.type
  podcast.value = meta.value

  const episodes = [] as any[]
  if (parsedEpisodes && Array.isArray(parsedEpisodes)) {
    for (const parsedEpisode of parsedEpisodes) {
      const episode = {} as any
      const enclosure = parsedEpisode.enclosure
      if (!enclosure || !enclosure.url) continue

      episode.isPublic = true

      // A unique episode.id is needed for downloading episodes.
      episode.id = uuidv4()

      // TODO: add chapters support for podcasts added by RSS feed
      // if (parsedEpisode.chapters) {
      //   episode.chaptersUrl = parsedEpisode.chapters.url
      //   episode.chaptersType = parsedEpisode.chapters.type
      // }

      episode.description = parsedEpisode.description && parsedEpisode.description.trim()
      episode.duration = parsedEpisode.duration ? parseInt(parsedEpisode.duration, 10) : 0
      episode.episodeType = parsedEpisode.type
      episode.funding = parsedEpisode.funding
      episode.guid = parsedEpisode.guid
      episode.imageUrl = parsedEpisode.image
      episode.isExplicit = parsedEpisode.explicit
      episode.linkUrl = parsedEpisode.link
      episode.mediaType = enclosure.type
      episode.mediaUrl = enclosure.url

      const pubDate = new Date(parsedEpisode.pubDate)
      episode.pubDate = isValidDate(pubDate) ? pubDate : new Date()

      episode.soundbite = parsedEpisode.soundbite
      episode.title = parsedEpisode.title && parsedEpisode.title.trim()
      episodes.push(episode)
    }
  }

  episodes.sort((a, b) => (new Date(b.pubDate) as any) - (new Date(a.pubDate) as any))

  podcast.episodes = episodes
  await addAddByRSSPodcastFeedUrlLocally(feedUrl)
  await addParsedAddByRSSPodcastLocally(podcast)

  return podcast
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
