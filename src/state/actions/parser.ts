import { setGlobal } from 'reactn'
import { checkIfLoggedIn } from '../../services/auth'
import {
  addAddByRSSPodcastFeedUrlOnServer,
  getAddByRSSPodcastFeedUrlsLocally,
  getAddByRSSPodcastsLocally,
  parseAddByRSSPodcast,
  removeAddByRSSPodcast as removeAddByRSSPodcastService
} from '../../services/parser'
import { getSubscribedPodcastsLocally, sortPodcastArrayAlphabetically } from '../../services/podcast'

export const getAddByRSSPodcasts = async () => {
  try {
    const addByRSSPodcasts = await getAddByRSSPodcastsLocally()
    setGlobal({ addByRSSPodcasts })
  } catch (error) {
    console.log('getAddByRSSPodcasts', error)
    throw error
  }
}

export const clearAddByRSSPodcastAuthModalState = () => {
  setGlobal({
    parser: {
      addByRSSPodcastAuthModal: {
        feedUrl: ''
      }
    }
  })
}

export const setAddByRSSPodcastAuthModalState = (feedUrl: string) => {
  setGlobal({
    parser: {
      addByRSSPodcastAuthModal: {
        feedUrl
      }
    }
  })
}

export const addAddByRSSPodcast = async (feedUrl: string, credentials?: any) => {
  let result = false

  if (!feedUrl) return result

  try {
    const shouldAdd = true
    await handleAddOrRemoveByRSSPodcast(feedUrl, shouldAdd, credentials)
    result = true
  } catch (error) {
    if (error.message === '401') {
      setAddByRSSPodcastAuthModalState(feedUrl)
    } else {
      throw error
    }
  }

  return result
}

export const removeAddByRSSPodcast = async (feedUrl: string) => {
  if (!feedUrl) return

  try {
    await handleAddOrRemoveByRSSPodcast(feedUrl, false)
  } catch (error) {
    console.log('addAddByRSSPodcast remove', error)
    throw error
  }
}

const handleAddOrRemoveByRSSPodcast = async (feedUrl: string, shouldAdd: boolean, credentials?: any) => {
  if (shouldAdd) {
    const podcast = await parseAddByRSSPodcast(feedUrl, credentials)
    if (podcast) {
      const isLoggedIn = await checkIfLoggedIn()
      if (isLoggedIn) {
        await addAddByRSSPodcastFeedUrlOnServer(feedUrl)
      }
    }
  } else {
    await removeAddByRSSPodcastService(feedUrl)
  }

  const parsedPodcasts = await getAddByRSSPodcastsLocally()
  const latestSubscribedPodcasts = await getSubscribedPodcastsLocally()
  const combinedPodcasts = parsedPodcasts.concat(latestSubscribedPodcasts[0])
  const alphabetizedPodcasts = sortPodcastArrayAlphabetically(combinedPodcasts)

  setGlobal({
    subscribedPodcasts: alphabetizedPodcasts,
    subscribedPodcastsTotalCount: alphabetizedPodcasts.length
  })
}

export const toggleAddByRSSPodcastFeedUrl = async (feedUrl: string) => {
  const addByRSSPodcastFeedUrls = await getAddByRSSPodcastFeedUrlsLocally()
  const shouldRemove = addByRSSPodcastFeedUrls.some((x: string) => x === feedUrl)
  if (shouldRemove) {
    await removeAddByRSSPodcast(feedUrl)
  } else {
    await addAddByRSSPodcast(feedUrl)
  }
}
