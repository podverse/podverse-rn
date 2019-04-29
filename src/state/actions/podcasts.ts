import { setGlobal } from 'reactn'
import { getPodcasts, toggleSubscribeToPodcast as toggleSubscribe } from '../../services/podcast'

export const getSubscribedPodcasts = async (subscribedPodcastIds: [string]) => {
  const query = {
    podcastIds: subscribedPodcastIds,
    sort: 'alphabetical'
  }
  const data = await getPodcasts(query, true)
  setGlobal({ subscribedPodcasts: data[0] || [] })
  return data
}

export const toggleSubscribeToPodcast = async (id: string, globalState: any) => {
  const subscribedPodcastIds = await toggleSubscribe(id)
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
