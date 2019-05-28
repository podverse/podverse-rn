import { setGlobal } from 'reactn'
import { getSubscribedPodcasts as getSubscribedPodcastsService,
  toggleSubscribeToPodcast as toggleSubscribeToPodcastService } from '../../services/podcast'

export const getSubscribedPodcasts = async (subscribedPodcastIds: [string]) => {
  const subscribedPodcasts = await getSubscribedPodcastsService(subscribedPodcastIds)
  setGlobal({ subscribedPodcasts })
  return subscribedPodcasts
}

export const toggleSubscribeToPodcast = async (id: string, globalState: any) => {
  const subscribedPodcastIds = await toggleSubscribeToPodcastService(id, globalState.session.isLoggedIn)
  setGlobal({
    session: {
      ...globalState.session,
      userInfo: {
        ...globalState.session.userInfo,
        subscribedPodcastIds
      }
    }
  })
}
