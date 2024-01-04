import { Alert } from 'react-native'
import { setGlobal } from 'reactn'
import { errorLogger } from '../../lib/logger'
import { PV } from '../../resources'
import { checkIfLoggedIn } from '../../services/auth'
import PVEventEmitter from '../../services/eventEmitter'
import {
  addManyAddByRSSPodcastFeedUrlsOnServer,
  addAddByRSSPodcastFeedUrlOnServer,
  getAddByRSSPodcastFeedUrlsLocally,
  getAddByRSSPodcastsLocally,
  parseAddByRSSPodcast,
  removeAddByRSSPodcast as removeAddByRSSPodcastService,
  parseAllAddByRSSPodcasts
} from '../../services/parser'
import { findPodcastsByFeedUrls, getSubscribedPodcastsLocally,
  sortPodcastArrayAlphabetically, subscribeToPodcastIfNotAlready } from '../../services/podcast'
import { getAuthUserInfo } from './auth'
import { getSubscribedPodcasts } from './podcast'

const _fileName = 'src/state/actions/parser.ts'

const handleAddOrRemoveByRSSPodcast = async (feedUrl: string, shouldAdd: boolean, credentials?: string,
  throwError?: boolean) => {
  if (shouldAdd) {
    const podcast = await parseAddByRSSPodcast(feedUrl, credentials, throwError)
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


const addAddByRSSPodcastIfNotAlready = async (
  alreadySubscribedAddByRSSPodcasts: any[], feedUrl: string, skipBadParse?: boolean) => {
  if (Array.isArray(alreadySubscribedAddByRSSPodcasts) && !alreadySubscribedAddByRSSPodcasts.some(
    alreadySubscribedAddByRSSPodcast =>
      alreadySubscribedAddByRSSPodcast.addByRSSPodcastFeedUrl === feedUrl)
      ) {
    const skipSubscribedEvent = true
    await addAddByRSSPodcast(feedUrl, skipBadParse, skipSubscribedEvent)
  }
}

const addManyAddByRSSPodcastFeedUrlsLocally = async (urls: string[]) => {
  const { foundPodcastIds, notFoundFeedUrls } = await findPodcastsByFeedUrls(urls)
  const alreadySubscribedPodcasts = await getSubscribedPodcasts()
  const alreadyAddByRSSPodcasts = await getAddByRSSPodcastsLocally()
  
  /* Bypass autodownloading so episodes are not autodownloaded during import process. */  
  const skipDownloadOnce = true
  for (const foundPodcastId of foundPodcastIds) {
    await subscribeToPodcastIfNotAlready(alreadySubscribedPodcasts, foundPodcastId, skipDownloadOnce)
  }
  for (const notFoundFeedUrl of notFoundFeedUrls) {
    const skipBadParse = true
    await addAddByRSSPodcastIfNotAlready(alreadyAddByRSSPodcasts, notFoundFeedUrl, skipBadParse)
  }
}

export const addAddByRSSPodcasts = async (urls: string[]) => {
  try {
    const isLoggedIn = await checkIfLoggedIn()
    if (isLoggedIn) {
      await addManyAddByRSSPodcastFeedUrlsOnServer(urls)
    } else {
      await addManyAddByRSSPodcastFeedUrlsLocally(urls)
    }

    await getAuthUserInfo()
    await getSubscribedPodcasts()
    await parseAllAddByRSSPodcasts()
    await getSubscribedPodcasts()
    
    PVEventEmitter.emit(PV.Events.RELOAD_SUBSCRIPTIONS)
  } catch (error) {
    errorLogger(_fileName, 'addAddByRSSPodcasts', error)
    Alert.alert(PV.Alerts.SOMETHING_WENT_WRONG.title, PV.Alerts.SOMETHING_WENT_WRONG.message, PV.Alerts.BUTTONS.OK)
  }
}

export const addAddByRSSPodcast = async (feedUrl: string, skipBadParse = false, skipSubscribedEvent = false) => {
  let result = false

  if (!feedUrl) return result

  try {
    const shouldAdd = true
    const credentials = ''
    const throwError = true
    await handleAddOrRemoveByRSSPodcast(feedUrl, shouldAdd, credentials, throwError)
    if (!skipSubscribedEvent) PVEventEmitter.emit(PV.Events.PODCAST_SUBSCRIBE_TOGGLED)
    result = true
  } catch (error) {
    if (skipBadParse) {
      // Log error but don't do anything
      errorLogger(_fileName, 'Manual skip of parsing error. Error reason: ', error)
    } else if (error.message === '401') {
      PVEventEmitter.emit(PV.Events.ADD_BY_RSS_AUTH_SCREEN_SHOW, { feedUrl })
    } else {
      errorLogger(_fileName, 'addAddByRSSPodcast', error)
      Alert.alert(PV.Alerts.SOMETHING_WENT_WRONG.title, PV.Alerts.SOMETHING_WENT_WRONG.message, PV.Alerts.BUTTONS.OK)
    }
  }

  return result
}

export const addAddByRSSPodcastWithCredentials = async (feedUrl: string, credentials?: any) => {
  let result = false

  if (!feedUrl) return result

  try {
    const shouldAdd = true
    const throwError = true
    await handleAddOrRemoveByRSSPodcast(feedUrl, shouldAdd, credentials, throwError)
    result = true
  } catch (error) {
    if (error.message === '401') {
      Alert.alert(PV.Alerts.LOGIN_INVALID.title, PV.Alerts.LOGIN_INVALID.message, PV.Alerts.BUTTONS.OK)
    } else {
      errorLogger(_fileName, 'addAddByRSSPodcastWithCredentials', error)
      Alert.alert(PV.Alerts.SOMETHING_WENT_WRONG.title, PV.Alerts.SOMETHING_WENT_WRONG.message, PV.Alerts.BUTTONS.OK)
    }
  }

  return result
}

export const removeAddByRSSPodcast = async (feedUrl: string) => {
  if (!feedUrl) return

  try {
    const shouldAdd = false
    await handleAddOrRemoveByRSSPodcast(feedUrl, shouldAdd)
    PVEventEmitter.emit(PV.Events.PODCAST_SUBSCRIBE_TOGGLED)
  } catch (error) {
    errorLogger(_fileName, 'addAddByRSSPodcast remove', error)
    throw error
  }
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
