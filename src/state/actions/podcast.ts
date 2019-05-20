import { setGlobal } from 'reactn'
import { getPodcasts, toggleSubscribeToPodcast as toggleSubscribeToPodcastService } from '../../services/podcast'

export const getSubscribedPodcasts = async (subscribedPodcastIds: [string]) => {
  if (subscribedPodcastIds.length < 1) return []
  const query = {
    podcastIds: subscribedPodcastIds,
    sort: 'alphabetical'
  }
  const data = await getPodcasts(query, true)
  setGlobal({ subscribedPodcasts: data[0] || [] })
  return data
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
