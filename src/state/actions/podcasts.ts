import { setGlobal } from 'reactn'
import { getPodcasts } from '../../services/podcast'

export const getSubscribedPodcasts = async (subscribedPodcastIds: [string]) => {
  const data = await getPodcasts(subscribedPodcastIds || [])
  setGlobal({ subscribedPodcasts: data[0] || [] })
  return data
}
