import AsyncStorage from '@react-native-community/async-storage'
import { setDownloadedEpisodeLimit } from '../lib/downloadedEpisodeLimiter'
import { removeDownloadedPodcast } from '../lib/downloadedPodcast'
import { downloadEpisode } from '../lib/downloader'
import { hasValidNetworkConnection } from '../lib/network'
import { PV } from '../resources'
import { checkIfLoggedIn, getBearerToken } from './auth'
import {
  getAutoDownloadEpisodes,
  removeAutoDownloadSetting
} from './autoDownloads'
import { getAddByRSSPodcasts, removeAddByRSSPodcast } from './parser'
import { request } from './request'

export const getPodcast = async (id: string) => {
  const response = await request({
    endpoint: `/podcast/${id}`
  })

  return response && response.data
}

export const getPodcasts = async (query: any = {}, nsfwMode?: boolean) => {
  const filteredQuery = {
    // NOTE: disabling includeAuthors and includeCategories because something is wrong with those queries...
    // the queries are not returning a full list, and are including duplicates
    // ...(query.includeAuthors ? { includeAuthors: query.includeAuthors } : {}),
    // ...(query.includeCategories
    //   ? { includeCategories: query.includeCategories }
    //   : {}),
    ...(query.maxResults ? { maxResults: true } : {}),
    ...(query.page ? { page: query.page } : { page: 1 }),
    ...(query.sort ? { sort: query.sort } : { sort: 'top-past-week' }),
    ...(query.searchAuthor ? { searchAuthor: query.searchAuthor } : {}),
    ...(query.searchTitle ? { searchTitle: query.searchTitle } : {})
  } as any

  if (query.categories) {
    filteredQuery.categories = query.categories
  } else if (query.podcastIds) {
    filteredQuery.podcastId = query.podcastIds
      ? query.podcastIds.join(',')
      : ['no-results']
  }

  const response = await request(
    {
      endpoint: '/podcast',
      query: filteredQuery
    },
    nsfwMode
  )

  return response && response.data
}

export const getSubscribedPodcasts = async (subscribedPodcastIds: [string]) => {
  if (subscribedPodcastIds.length < 1) return []
  const query = {
    podcastIds: subscribedPodcastIds,
    sort: 'alphabetical',
    maxResults: true
  }
  const isConnected = await hasValidNetworkConnection()

  if (isConnected) {
    try {
      const date = await AsyncStorage.getItem(
        PV.Keys.SUBSCRIBED_PODCASTS_LAST_REFRESHED
      )
      const dateObj = (date && new Date(date).toISOString()) || new Date().toISOString()

      const autoDownloadSettingsString = await AsyncStorage.getItem(
        PV.Keys.AUTO_DOWNLOAD_SETTINGS
      )
      const autoDownloadSettings = autoDownloadSettingsString
        ? JSON.parse(autoDownloadSettingsString)
        : {}
      const data = await getPodcasts(query, true)
      const subscribedPodcasts = data[0]
      const subscribedPodcastsTotalCount = data[1]
      const podcastIds = Object.keys(autoDownloadSettings).filter(
        (key: string) => autoDownloadSettings[key] === true
      )

      const autoDownloadEpisodes = await getAutoDownloadEpisodes(
        dateObj,
        podcastIds
      )

      // Wait for app to initialize. Without this setTimeout, then when getSubscribedPodcasts is called in
      // PodcastsScreen _initializeScreenData, then downloadEpisode will not successfully update global state
      setTimeout(async () => {
        for (const episode of autoDownloadEpisodes[0]) {
          const podcast = {
            id: episode.podcast_id,
            imageUrl: episode.podcast_imageUrl,
            title: episode.podcast_title
          }
          await downloadEpisode(episode, podcast, false, true)
        }
      }, 3000)

      await AsyncStorage.setItem(
        PV.Keys.SUBSCRIBED_PODCASTS_LAST_REFRESHED,
        new Date().toISOString()
      )
      if (Array.isArray(subscribedPodcasts)) {
        await AsyncStorage.setItem(
          PV.Keys.SUBSCRIBED_PODCASTS,
          JSON.stringify(subscribedPodcasts)
        )
      }

      const combinedPodcasts = await combineWithAddByRSSPodcasts()
      return [combinedPodcasts, combinedPodcasts.length]
    } catch (error) {
      console.log(error)
      const combinedPodcasts = await combineWithAddByRSSPodcasts()
      return [combinedPodcasts, combinedPodcasts.length]
    }
  } else {
    const combinedPodcasts = await combineWithAddByRSSPodcasts()
    return [combinedPodcasts, combinedPodcasts.length]
  }
}
export const combineWithAddByRSSPodcasts = async () => {
  // Combine the AddByRSSPodcast in with the subscribed podcast data, then alphabetize array
  const subscribedPodcasts = await getSubscribedPodcastsLocally()
  const addByRSSPodcasts = await getAddByRSSPodcasts()
  // @ts-ignore
  const combinedPodcasts = [...subscribedPodcasts[0], ...addByRSSPodcasts]
  return sortPodcastArrayAlphabetically(combinedPodcasts)
}

export const getSubscribedPodcastsLocally = async () => {
  const subscribedPodcastsJSON = await AsyncStorage.getItem(
    PV.Keys.SUBSCRIBED_PODCASTS
  )
  if (subscribedPodcastsJSON) {
    const subscribedPodcasts = JSON.parse(subscribedPodcastsJSON)
    if (Array.isArray(subscribedPodcasts)) {
      return [subscribedPodcasts, subscribedPodcasts.length]
    }
    return [[], 0]
  } else {
    return [[], 0]
  }
}

export const searchPodcasts = async (
  title?: string,
  author?: string,
  nsfwMode?: boolean
) => {
  const response = await request(
    {
      endpoint: '/podcast',
      query: {
        sort: 'alphabetical',
        ...(title ? { title } : {}),
        ...(author ? { author } : {}),
        page: 1
      }
    },
    nsfwMode
  )

  return response && response.data
}

export const toggleSubscribeToPodcast = async (id: string) => {
  const isLoggedIn = await checkIfLoggedIn()
  const itemsString = await AsyncStorage.getItem(PV.Keys.SUBSCRIBED_PODCAST_IDS)
  let isUnsubscribing = false
  let isUnsubscribingAddByRSS = false

  if (itemsString) {
    const podcastIds = JSON.parse(itemsString)
    isUnsubscribing =
      Array.isArray(podcastIds) && podcastIds.some((x: string) => id === x)
  }

  const addByRSSPodcastsString = await AsyncStorage.getItem(PV.Keys.ADD_BY_RSS_PODCASTS)
  if (!isUnsubscribing && addByRSSPodcastsString) {
    const addByRSSPodcasts = JSON.parse(addByRSSPodcastsString)
    isUnsubscribingAddByRSS =
      Array.isArray(addByRSSPodcasts) && addByRSSPodcasts.some((podcast: any) => podcast.addByRSSPodcastFeedUrl === id)
  }

  const globalDownloadedEpisodeLimitDefault = await AsyncStorage.getItem(
    PV.Keys.DOWNLOADED_EPISODE_LIMIT_GLOBAL_DEFAULT
  )
  if (globalDownloadedEpisodeLimitDefault) {
    let globalDownloadedEpisodeLimitCount = (await AsyncStorage.getItem(
      PV.Keys.DOWNLOADED_EPISODE_LIMIT_GLOBAL_COUNT
    )) as any
    if (globalDownloadedEpisodeLimitCount) {
      globalDownloadedEpisodeLimitCount = parseInt(
        globalDownloadedEpisodeLimitCount,
        10
      )
      await setDownloadedEpisodeLimit(id, globalDownloadedEpisodeLimitCount)
    }
  }

  let items
  if (isUnsubscribingAddByRSS) {
    await removeAddByRSSPodcast(id)
    await removeDownloadedPodcast(id)
    await setDownloadedEpisodeLimit(id)
  } else if (isLoggedIn) {
    items = await toggleSubscribeToPodcastOnServer(id)
  } else {
    items = await toggleSubscribeToPodcastLocally(id)
  }

  if (isUnsubscribing) {
    await removeDownloadedPodcast(id)
    await setDownloadedEpisodeLimit(id)
  }

  return items
}

const toggleSubscribeToPodcastLocally = async (id: string) => {
  let items = []

  const itemsString = await AsyncStorage.getItem(PV.Keys.SUBSCRIBED_PODCAST_IDS)
  if (itemsString) {
    items = JSON.parse(itemsString)
  }

  const index = items.indexOf(id)
  if (index > -1) {
    items.splice(index, 1)
    await removeAutoDownloadSetting(id)
  } else {
    items.push(id)
  }

  if (Array.isArray(items)) {
    await AsyncStorage.setItem(
      PV.Keys.SUBSCRIBED_PODCAST_IDS,
      JSON.stringify(items)
    )
  }

  return items
}

const toggleSubscribeToPodcastOnServer = async (id: string) => {
  const bearerToken = await getBearerToken()
  const response = await request({
    endpoint: `/podcast/toggle-subscribe/${id}`,
    headers: { Authorization: bearerToken }
  })

  let podcastIds = []
  const itemsString = await AsyncStorage.getItem(PV.Keys.SUBSCRIBED_PODCAST_IDS)
  if (itemsString) {
    podcastIds = JSON.parse(itemsString)
    podcastIds = addOrRemovePodcastIdFromArray(podcastIds, id)
  }
  if (Array.isArray(podcastIds)) {
    await AsyncStorage.setItem(
      PV.Keys.SUBSCRIBED_PODCAST_IDS,
      JSON.stringify(podcastIds)
    )
  }

  return response && response.data
}

export const sortPodcastArrayAlphabetically = (podcasts: any[]) => {
  podcasts.sort((a, b) => {
    let titleA = a.sortableTitle
      ? a.sortableTitle.toLowerCase().trim()
      : a.title.toLowerCase().trim()
    let titleB = b.sortableTitle
      ? b.sortableTitle.toLowerCase().trim()
      : b.title.toLowerCase().trim()
    titleA = titleA.replace(/#/g, '')
    titleB = titleB.replace(/#/g, '')
    return titleA < titleB ? -1 : titleA > titleB ? 1 : 0
  })

  return podcasts
}

export const insertOrRemovePodcastFromAlphabetizedArray = (
  podcasts: any[],
  podcast: any
) => {
  if (!Array.isArray(podcasts)) return []
  if (podcasts.some((x) => x.id === podcast.id)) {
    return podcasts.filter((x) => x.id !== podcast.id)
  } else {
    podcasts.push(podcast)
    sortPodcastArrayAlphabetically(podcasts)
    return podcasts
  }
}

const addOrRemovePodcastIdFromArray = (
  podcastIds: any[],
  podcastId: string
) => {
  if (!Array.isArray(podcastIds)) return []
  if (podcastIds.some((x) => x === podcastId)) {
    return podcastIds.filter((x) => x !== podcastId)
  } else {
    podcastIds.push(podcastId)
    return podcastIds
  }
}
