import AsyncStorage from '@react-native-community/async-storage'
import * as rssParser from 'react-native-rss-parser'
import { convertToSortableTitle, convertURLToSecureProtocol } from '../lib/utility'
import { PV } from '../resources'
import { checkIfLoggedIn, getBearerToken } from './auth'
import { combineWithAddByRSSPodcasts } from './podcast'
import { request } from './request'
const uuidv4 = require('uuid/v4')

/*
addByRSSPodcasts: [addByRSSPodcast]
addByRSSPodcast: object {
  addByRSSPodcastFeedUrl: string,
  episodes: [episode],
  ...other podcast properties
}
*/

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
  return fetch(feedUrl)
    .then((response) => response.text())
    .then((responseData) => rssParser.parse(responseData))
    .then(async (rss) => {
      const title = rss.title && rss.title.trim()
      if (!title) {
        throw new Error('parseAddByRSSPodcast: Title not defined')
      }
      const podcast = {} as any

      podcast.addByRSSPodcastFeedUrl = feedUrl
      podcast.description = rss.description && rss.description.trim()
      podcast.feedLastUpdated = rss.lastUpdated || rss.lastPublished
      podcast.imageUrl = (rss.image && rss.image.url) || (rss.itunes && rss.itunes.image)
      podcast.isExplicit = rss.itunes && rss.itunes.explicit
      podcast.language = rss.language

      if (rss.items && rss.items.length > 0) {
        podcast.lastEpisodePubDate = rss.items[0].published
        podcast.lastEpisodeTitle = rss.items[0].title && rss.items[0].title.trim()
      }

      podcast.linkUrl = rss.links && rss.links[0] && rss.links[0].url
      podcast.sortableTitle = convertToSortableTitle(title)
      podcast.title = rss.title && rss.title.trim()
      podcast.type = rss.type

      const episodes = []
      if (rss.items && Array.isArray(rss.items)) {
        for (const item of rss.items) {
          const episode = {} as any
          const enclosure = item.enclosures && item.enclosures[0]
          if (!enclosure) continue
          // A unique episode.id is needed for downloading episodes.
          episode.id = uuidv4()
          episode.description = item.description && item.description.trim()
          episode.duration = item.itunes && item.itunes.duration
          episode.isExplicit = item.itunes && item.itunes.explicit
          episode.linkUrl = item.links && item.links[0] && item.links[0].url
          episode.mediaFilesize = enclosure.length
          episode.mediaType = enclosure.mimeType
          episode.mediaUrl = convertURLToSecureProtocol(enclosure.url)
          episode.pubDate = item.published
          episode.title = item.title && item.title.trim()
          episodes.push(episode)
        }
      }

      podcast.episodes = episodes

      await addParsedAddByRSSPodcastLocally(podcast)

      return podcast
    })
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
