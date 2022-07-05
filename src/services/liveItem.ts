import { LiveItem, Podcast } from 'podverse-shared'
import { getEpisodes } from './episode'
import { request } from './request'

export const getPublicLiveItemsByPodcastId = async (podcastId: string) => {
  if (!podcastId) {
    return { currentlyLive: [], scheduled: [] }
  } else {
    const liveItems = await request({
      endpoint: `/liveItem/podcast/${podcastId}`,
      method: 'get'
    })

    const { data } = liveItems
    const currentlyLive = []
    const scheduled = []

    for (const liveItem of data) {
      const episode = liveItem.episode
      delete liveItem.episode
      episode.liveItem = liveItem
      if (liveItem.status === 'live') {
        currentlyLive.push(episode)
      } else {
        scheduled.push(episode)
      }
    }

    return { currentlyLive, scheduled }
  }
}

export const getEpisodesAndLiveItems = async (query: any, podcastId: string) => {
  // If a show is currently live, it will appear at the top of the episodes list.
  // TODO: Scheduled live shows should appear in their own section.
  const episodesResponse = await getEpisodes(query)
  const [episodesData, episodesDataCount] = episodesResponse
  let combinedEpisodesData = episodesData
  let scheduledLiveItems: LiveItem[] = []

  if (query.page === 1) {
    const { currentlyLive, scheduled } = await getPublicLiveItemsByPodcastId(podcastId)
    combinedEpisodesData = [...currentlyLive, ...episodesData]
    scheduledLiveItems = [...currentlyLive, ...scheduled]
  }

  return {
    combinedEpisodes: [combinedEpisodesData, episodesDataCount],
    scheduledLiveItems
  }
}
