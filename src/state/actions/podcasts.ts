import { setGlobal } from 'reactn'
import { getPodcasts } from '../../services/podcast'

export const getSubscribedPodcasts = async (subscribedPodcastIds: [string]) => {
  const query = {
    podcastIds: subscribedPodcastIds,
    sort: 'alphabetical'
  }
  const data = await getPodcasts(query, true)
  setGlobal({ subscribedPodcasts: data[0] || [] })
  return data
}
