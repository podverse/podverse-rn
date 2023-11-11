import { PodcastMedium, checkIfContainsStringMatch } from 'podverse-shared'
import { getGlobal, setGlobal } from 'reactn'
import { errorLogger } from '../../lib/logger'
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

const _fileName = 'src/state/actions/podcast.ts'

const handleCombineWithAddByRSSPodcasts = async (
  medium: PodcastMedium, searchTitle?: string, sort?: string | null) => {
  const hasVideo = medium === PV.Medium.video
  const isMusic = medium === PV.Medium.music

  const combinedPodcasts = await combineWithAddByRSSPodcastsService(medium, sort)
  let finalPodcasts = []

  if (searchTitle) {
    finalPodcasts = combinedPodcasts.filter((podcast) => checkIfContainsStringMatch(searchTitle, podcast.title))
  } else {
    finalPodcasts = combinedPodcasts
  }

  if (hasVideo) {
    finalPodcasts = finalPodcasts.filter((podcast) => podcast.hasVideo)
  } else if (isMusic) {
    finalPodcasts = finalPodcasts.filter((podcast) => podcast.medium === PV.Medium.music)
  }

  return finalPodcasts
}

export const findCombineWithAddByRSSPodcasts = async (
  medium: PodcastMedium,
  searchTitle?: string
) => {
  return handleCombineWithAddByRSSPodcasts(medium, searchTitle)
}

export const combineWithAddByRSSPodcasts = async (
  medium: PodcastMedium,
  searchTitle?: string,
  sort?: string | null
) => {
  const finalPodcasts = await handleCombineWithAddByRSSPodcasts(medium, searchTitle, sort)

  setGlobal({
    subscribedPodcasts: finalPodcasts,
    subscribedPodcastsTotalCount: finalPodcasts?.length
  })
}

export const getSubscribedPodcasts = async (medium: PodcastMedium, sort?: string | null) => {
  const globalState = getGlobal() 
  const subscribedPodcastIds = globalState.session.userInfo.subscribedPodcastIds || []
  const data = await getSubscribedPodcastsService(medium, subscribedPodcastIds, sort)
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
        const subscribedPodcastIds = await toggleSubscribeToPodcastService(id)
        const subscribedPodcast = await getPodcastService(id)
        const globalState = getGlobal()
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
        errorLogger(_fileName, 'toggleSubscribeToPodcast action', error)
        reject()
      }
    })()
  })
}

export const removeAddByRSSPodcast = async (feedUrl: string) => {
  await removeAddByRSSPodcastService(feedUrl)

  const globalState = getGlobal()
  const { subscribedPodcasts = [] } = globalState

  const filteredPodcasts = subscribedPodcasts.filter((x: any) => {
    return !x.addByRSSPodcastFeedUrl || x.addByRSSPodcastFeedUrl !== feedUrl
  })

  await setSubscribedPodcasts(filteredPodcasts)

  setGlobal({
    subscribedPodcasts: filteredPodcasts,
    subscribedPodcastsTotalCount: filteredPodcasts.length
  })

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
