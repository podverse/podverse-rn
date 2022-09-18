import { checkIfContainsStringMatch } from 'podverse-shared'
import { getGlobal, setGlobal } from 'reactn'
import { safelyUnwrapNestedVariable } from '../../lib/utility'
import { PV } from '../../resources'
import PVEventEmitter from '../../services/eventEmitter'
import {
  removeAddByRSSPodcast as removeAddByRSSPodcastService
} from '../../services/parser'
import {
  combineWithAddByRSSPodcasts as combineWithAddByRSSPodcastsService,
  getPodcast as getPodcastService,
  getSubscribedPodcasts as getSubscribedPodcastsService,
  insertOrRemovePodcastFromAlphabetizedArray,
  setSubscribedPodcasts,
  toggleSubscribeToPodcast as toggleSubscribeToPodcastService
} from '../../services/podcast'
import { updateDownloadedPodcasts } from './downloads'

const handleCombineWithAddByRSSPodcasts = async (searchTitle?: string, sort?: string | null) => {
  const { appMode } = getGlobal()
  const videoOnlyMode = appMode === PV.AppMode.videos

  const combinedPodcasts = await combineWithAddByRSSPodcastsService(sort)
  let finalPodcasts = []

  if (searchTitle) {
    finalPodcasts = combinedPodcasts.filter((podcast) => checkIfContainsStringMatch(searchTitle, podcast.title))
  } else {
    finalPodcasts = combinedPodcasts
  }

  if (videoOnlyMode) {
    finalPodcasts = finalPodcasts.filter((podcast) => podcast.hasVideo)
  }

  return finalPodcasts
}

export const findCombineWithAddByRSSPodcasts = async (
  searchTitle?: string
) => {
  return handleCombineWithAddByRSSPodcasts(searchTitle)
}

export const combineWithAddByRSSPodcasts = async (
  searchTitle?: string,
  sort?: string | null
) => {
  const finalPodcasts = await handleCombineWithAddByRSSPodcasts(searchTitle, sort)

  setGlobal({
    subscribedPodcasts: finalPodcasts,
    subscribedPodcastsTotalCount: finalPodcasts?.length
  })
}

export const getSubscribedPodcasts = async (sort?: string | null) => {
  const globalState = getGlobal() 
  const subscribedPodcastIds = globalState.session.userInfo.subscribedPodcastIds || []
  const data = await getSubscribedPodcastsService(subscribedPodcastIds, sort)
  const subscribedPodcasts = data[0] || []
  const subscribedPodcastsTotalCount = data[1] || 0

  setGlobal({
    subscribedPodcasts,
    subscribedPodcastsTotalCount
  })
  return subscribedPodcasts
}

export const toggleSubscribeToPodcast = async (id: string) => {
  return new Promise<void>((resolve, reject) => {
    (async () => {
      try {
        const globalState = getGlobal()
        const subscribedPodcastIds = await toggleSubscribeToPodcastService(id)
        const subscribedPodcast = await getPodcastService(id)
        let { subscribedPodcasts = [] } = globalState
        subscribedPodcasts = insertOrRemovePodcastFromAlphabetizedArray(subscribedPodcasts, subscribedPodcast) as any
        await setSubscribedPodcasts(subscribedPodcasts)
        const subscribedPodcastsTotalCount = subscribedPodcasts ? subscribedPodcasts.length : 0

        setGlobal(
          {
            session: {
              ...globalState.session,
              userInfo: {
                ...globalState.session.userInfo,
                subscribedPodcastIds
              }
            },
            subscribedPodcasts,
            subscribedPodcastsTotalCount
          },
          async () => {
            await updateDownloadedPodcasts()
            PVEventEmitter.emit(PV.Events.PODCAST_SUBSCRIBE_TOGGLED)
            resolve()
          }
        )
      } catch (error) {
        console.log('toggleSubscribeToPodcast action', error)
        reject()
      }
    })()
  })
}

export const removeAddByRSSPodcast = async (feedUrl: string) => {
  await removeAddByRSSPodcastService(feedUrl)
  await combineWithAddByRSSPodcasts()
  PVEventEmitter.emit(PV.Events.PODCAST_SUBSCRIBE_TOGGLED)
}

export const checkIfSubscribedToPodcast = (
  subscribedPodcastIds: string[],
  podcastId?: string,
  addByRSSPodcastFeedUrl?: string
) => {
  const globalState = getGlobal()
  let isSubscribed = subscribedPodcastIds.some((x: string) => podcastId && podcastId === x)

  if (!isSubscribed && addByRSSPodcastFeedUrl) {
    const subscribedPodcasts = safelyUnwrapNestedVariable(() => globalState.subscribedPodcasts, [])
    isSubscribed = subscribedPodcasts.some(
      (x: any) => x.addByRSSPodcastFeedUrl && x.addByRSSPodcastFeedUrl === addByRSSPodcastFeedUrl
    )
  }

  return isSubscribed
}
