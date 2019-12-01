import { setGlobal } from 'reactn'
import { getAddByRSSPodcasts, parseAddByRSSPodcast, removeAddByRSSPodcast } from '../../services/parser'
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

export const toggleAddByRSSPodcast = async (feedUrl: string) => {
  const podcasts = await getAddByRSSPodcasts()
  const isSubscribed = podcasts.some((x: any) => x.addByRSSPodcastFeedUrl === feedUrl)
  if (isSubscribed) {
    const podcasts = await removeAddByRSSPodcast(feedUrl)
    setGlobal({
      subscribedPodcasts: podcasts,
      subscribedPodcastsTotalCount: podcasts.length
    })
  } else {
    await addAddByRSSPodcast(feedUrl)
  }
}
