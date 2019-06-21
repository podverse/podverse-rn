import AsyncStorage from '@react-native-community/async-storage'
import { downloadEpisode } from '../lib/downloader'
import { hasValidNetworkConnection } from '../lib/network'
import { PV } from '../resources'
import { getBearerToken } from './auth'
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
    sort: 'alphabetical'
  }
  const isConnected = await hasValidNetworkConnection()

  if (isConnected) {
    try {
      // let date = await AsyncStorage.getItem(PV.Keys.SUBSCRIBED_PODCASTS_LAST_REFRESHED)
      const date = new Date()
      date.setMonth(date.getMonth() - 1)

      const autoDownloadSettingsString = await AsyncStorage.getItem(PV.Keys.AUTO_DOWNLOAD_SETTINGS)
      const autoDownloadSettings = autoDownloadSettingsString ? JSON.parse(autoDownloadSettingsString) : {}
      const data = await getPodcasts(query, true)
      const subscribedPodcasts = data[0]
      const podcastIds = Object.keys(autoDownloadSettings)
      const autoDownloadEpisodes = await getAutoDownloadEpisodes(date.toISOString(), podcastIds)

      for (const episode of autoDownloadEpisodes[0]) {
        const podcast = {
          id: episode.podcast_id,
          imageUrl: episode.podcast_imageUrl,
          title: episode.podcast_title
        }
        downloadEpisode(episode, podcast)
      }

      await AsyncStorage.setItem(PV.Keys.SUBSCRIBED_PODCASTS_LAST_REFRESHED, new Date().toISOString())
      await AsyncStorage.setItem(PV.Keys.SUBSCRIBED_PODCASTS, JSON.stringify(subscribedPodcasts || []))
      return subscribedPodcasts
    } catch (error) {
      console.log(error)
      return []
    }
  } else {
    const subscribedPodcastsJSON = await AsyncStorage.getItem(PV.Keys.SUBSCRIBED_PODCASTS)
    return subscribedPodcastsJSON ? JSON.parse(subscribedPodcastsJSON) : []
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

export const toggleSubscribeToPodcast = async (id: string, isLoggedIn: boolean) => {
  return isLoggedIn ? toggleSubscribeToPodcastOnServer(id) : toggleSubscribeToPodcastLocally(id)
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

  AsyncStorage.setItem(PV.Keys.SUBSCRIBED_PODCAST_IDS, JSON.stringify(items))
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
  AsyncStorage.setItem(PV.Keys.SUBSCRIBED_PODCAST_IDS, JSON.stringify(podcastIds))

  return response && response.data
}

export const insertOrRemovePodcastFromAlphabetizedArray = (podcasts: any[], podcast: any) => {
  if (podcasts.some((x) => x.id === podcast.id)) {
    return podcasts.filter((x) => x.id !== podcast.id)
  } else {
    podcasts.push(podcast)
    podcasts.sort((a, b) => {
      const titleA = a.title.toLowerCase()
      const titleB = b.title.toLowerCase()
      return (titleA < titleB) ? -1 : (titleA > titleB) ? 1 : 0
    })
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
