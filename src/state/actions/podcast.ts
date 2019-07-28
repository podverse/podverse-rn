import { setGlobal } from 'reactn'
import { getPodcast as getPodcastService, getSubscribedPodcasts as getSubscribedPodcastsService,
  insertOrRemovePodcastFromAlphabetizedArray, toggleSubscribeToPodcast as toggleSubscribeToPodcastService
  } from '../../services/podcast'

export const getSubscribedPodcasts = async (subscribedPodcastIds: [string]) => {
  const data = await getSubscribedPodcastsService(subscribedPodcastIds)
  const subscribedPodcasts = data[0]
  const subscribedPodcastsTotalCount = data[1]
  setGlobal({ subscribedPodcasts, subscribedPodcastsTotalCount })
  return subscribedPodcasts
}

export const toggleSubscribeToPodcast = async (id: string, globalState: any) => {
  const subscribedPodcastIds = await toggleSubscribeToPodcastService(id, globalState.session.isLoggedIn)
  const subscribedPodcast = await getPodcastService(id)
  let { subscribedPodcasts } = globalState
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
  })
}
