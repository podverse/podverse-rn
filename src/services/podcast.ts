import AsyncStorage from '@react-native-community/async-storage'
import { removeDownloadedPodcast } from '../lib/downloadedPodcast'
import { downloadEpisode } from '../lib/downloader'
import { hasValidNetworkConnection } from '../lib/network'
import { PV } from '../resources'
import { checkIfLoggedIn, getBearerToken } from './auth'
import { getAutoDownloadEpisodes, removeAutoDownloadSetting } from './autoDownloads'
import { request } from './request'

export const getPodcast = async (id: string) => {
  const response = await request({
    endpoint: `/podcast/${id}`
  })

  return response && response.data
}

export const getPodcasts = async (query: any = {}, nsfwMode?: boolean) => {
  const filteredQuery = {
    ...(query.includeAuthors ? { includeAuthors: query.includeAuthors } : {}),
    ...(query.includeCategories ? { includeCategories: query.includeCategories } : {}),
    ...(query.maxResults ? { maxResults: true } : {}),
    ...(query.page ? { page: query.page } : { page: 1 }),
    ...(query.sort ? { sort: query.sort } : { sort: 'top-past-week' }),
    ...(query.searchAuthor ? { searchAuthor: query.searchAuthor } : {}),
    ...(query.searchTitle ? { searchTitle: query.searchTitle } : {})
  } as any

  if (query.categories) {
    filteredQuery.categories = query.categories
  } else if (query.podcastIds) {
    filteredQuery.podcastId = query.podcastIds ? query.podcastIds.join(',') : ['no-results']
  }

  const response = await request({
    endpoint: '/podcast',
    query: filteredQuery
  }, nsfwMode)

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
      const date = await AsyncStorage.getItem(PV.Keys.SUBSCRIBED_PODCASTS_LAST_REFRESHED)
      const dateObj = date || new Date().toISOString()

      const autoDownloadSettingsString = await AsyncStorage.getItem(PV.Keys.AUTO_DOWNLOAD_SETTINGS)
      const autoDownloadSettings = autoDownloadSettingsString ? JSON.parse(autoDownloadSettingsString) : {}
      const data = await getPodcasts(query, true)
      const subscribedPodcasts = data[0]
      const subscribedPodcastsTotalCount = data[1]
      const podcastIds = Object.keys(autoDownloadSettings).filter((key: string) => autoDownloadSettings[key] === true)
      const autoDownloadEpisodes = await getAutoDownloadEpisodes(dateObj, podcastIds)

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

      await AsyncStorage.setItem(PV.Keys.SUBSCRIBED_PODCASTS_LAST_REFRESHED, new Date().toISOString())
      if (Array.isArray(subscribedPodcasts)) await AsyncStorage.setItem(PV.Keys.SUBSCRIBED_PODCASTS, JSON.stringify(subscribedPodcasts))

      return [subscribedPodcasts, subscribedPodcastsTotalCount]
    } catch (error) {
      console.log(error)
      return getSubscribedPodcastsLocally()
    }
  } else {
    return getSubscribedPodcastsLocally()
  }
}

const getSubscribedPodcastsLocally = async () => {
  const subscribedPodcastsJSON = await AsyncStorage.getItem(PV.Keys.SUBSCRIBED_PODCASTS)
  if (subscribedPodcastsJSON) {
    const subscribedPodcasts = JSON.parse(subscribedPodcastsJSON)
    if (Array.isArray(subscribedPodcasts)) return [subscribedPodcasts, subscribedPodcasts.length]
    return [[], 0]
  } else {
    return [[], 0]
  }
}

export const searchPodcasts = async (title?: string, author?: string, nsfwMode?: boolean) => {
  const response = await request({
    endpoint: '/podcast',
    query: {
      sort: 'alphabetical',
      ...(title ? { title } : {}),
      ...(author ? { author } : {}),
      page: 1
    }
  }, nsfwMode)

  return response && response.data
}

export const toggleSubscribeToPodcast = async (id: string) => {
  const isLoggedIn = await checkIfLoggedIn()
  const itemsString = await AsyncStorage.getItem(PV.Keys.SUBSCRIBED_PODCAST_IDS)
  let isUnsubscribing = false
  if (itemsString) {
    const podcastIds = JSON.parse(itemsString)
    isUnsubscribing = podcastIds.some((x: string) => id === x)
  }

  let items
  if (isLoggedIn) {
    items = await toggleSubscribeToPodcastOnServer(id)
  } else {
    items = await toggleSubscribeToPodcastLocally(id)
  }

  if (isUnsubscribing) {
    await removeDownloadedPodcast(id)
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

  if (Array.isArray(items)) await AsyncStorage.setItem(PV.Keys.SUBSCRIBED_PODCAST_IDS, JSON.stringify(items))

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
  if (Array.isArray(podcastIds)) await AsyncStorage.setItem(PV.Keys.SUBSCRIBED_PODCAST_IDS, JSON.stringify(podcastIds))

  return response && response.data
}

export const sortPodcastArrayAlphabetically = (podcasts: any[]) => {
  podcasts.sort((a, b) => {
    let titleA = a.sortableTitle ? a.sortableTitle.toLowerCase().trim() : a.title.toLowerCase().trim()
    let titleB = b.sortableTitle ? b.sortableTitle.toLowerCase().trim() : b.title.toLowerCase().trim()
    titleA = titleA.replace(/#/g, '')
    titleB = titleB.replace(/#/g, '')
    return (titleA < titleB) ? -1 : (titleA > titleB) ? 1 : 0
  })

  return podcasts
}

export const insertOrRemovePodcastFromAlphabetizedArray = (podcasts: any[], podcast: any) => {
  if (podcasts.some((x) => x.id === podcast.id)) {
    return podcasts.filter((x) => x.id !== podcast.id)
  } else {
    podcasts.push(podcast)
    sortPodcastArrayAlphabetically(podcasts)
    return podcasts
  }
}

const addOrRemovePodcastIdFromArray = (podcastIds: any[], podcastId: string) => {
  if (podcastIds.some((x) => x === podcastId)) {
    return podcastIds.filter((x) => x !== podcastId)
  } else {
    podcastIds.push(podcastId)
    return podcastIds
  }
}
