import { setGlobal } from 'reactn'
import { getAddByRSSPodcasts, parseAddByRSSPodcast } from '../../services/parser'
import { getSubscribedPodcastsLocally, sortPodcastArrayAlphabetically } from '../../services/podcast'

export const addAddByRSSPodcast = async (feedUrl: string) => {
  if (!feedUrl) return

  try {
    await parseAddByRSSPodcast(feedUrl)
    const parsedPodcasts = await getAddByRSSPodcasts()
    const latestSubscribedPodcasts = await getSubscribedPodcastsLocally()
    const combinedPodcasts = parsedPodcasts.concat(latestSubscribedPodcasts[0])
    const alphabetizedPodcasts = sortPodcastArrayAlphabetically(combinedPodcasts)
    setGlobal({
      subscribedPodcasts: alphabetizedPodcasts,
      subscribedPodcastsTotalCount: alphabetizedPodcasts.length
    })
  } catch (error) {
    console.log('addAddByRSSPodcast action', error)
    throw error
  }
}
