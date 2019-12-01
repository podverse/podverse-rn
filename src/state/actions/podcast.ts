import { getGlobal, setGlobal } from 'reactn'
import { safelyUnwrapNestedVariable } from '../../lib/utility'
import { removeAddByRSSPodcast as removeAddByRSSPodcastService } from '../../services/parser'
import { getPodcast as getPodcastService, getSubscribedPodcasts as getSubscribedPodcastsService,
  insertOrRemovePodcastFromAlphabetizedArray, toggleSubscribeToPodcast as toggleSubscribeToPodcastService
  } from '../../services/podcast'
import { updateDownloadedPodcasts } from './downloads'

export const getSubscribedPodcasts = async (subscribedPodcastIds: [string]) => {
  const data = await getSubscribedPodcastsService(subscribedPodcastIds)
  const subscribedPodcasts = data[0]
  const subscribedPodcastsTotalCount = data[1]
  setGlobal({ subscribedPodcasts, subscribedPodcastsTotalCount })
  return subscribedPodcasts
}

export const toggleSubscribeToPodcast = async (id: string) => {
  try {
    const globalState = getGlobal()
    const subscribedPodcastIds = await toggleSubscribeToPodcastService(id)
    const subscribedPodcast = await getPodcastService(id)
    let { subscribedPodcasts = [] } = globalState
    subscribedPodcasts = insertOrRemovePodcastFromAlphabetizedArray(subscribedPodcasts, subscribedPodcast)

    setGlobal({
      session: {
        ...globalState.session,
        userInfo: {
          ...globalState.session.userInfo,
          subscribedPodcastIds
        }
      },
      subscribedPodcasts
    }, async () => {
      await updateDownloadedPodcasts()
    })
  } catch (error) {
    console.log('toggleSubscribeToPodcast action', error)
  }
}

export const removeAddByRSSPodcast = async (feedUrl: string) => {
  await removeAddByRSSPodcastService(feedUrl)
  const globalState = getGlobal()
  const subscribedPodcastIds = safelyUnwrapNestedVariable(() => globalState.session.userInfo.subscribedPodcastIds, [])
  await getSubscribedPodcasts(subscribedPodcastIds)
}
