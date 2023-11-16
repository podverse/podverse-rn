import { Episode, Podcast } from "podverse-shared"
import { request } from "./request"

type SecondaryQueueResponseData = {
  previousEpisodes: Episode[]
  nextEpisodes: Episode[]
  inheritedPodcast: Podcast | null
}

const emptyResponseData = { previousEpisodes: [], nextEpisodes: [], inheritedPodcast: null }

export const getSecondaryQueueEpisodesForPodcastId = async (episodeId: string, podcastId: string) => {
  try {
    const response = await request({
      endpoint: `/secondary-queue/episode/${episodeId}/podcast/${podcastId}`,
      method: 'GET'
    })

    const data: SecondaryQueueResponseData =
      (response && response.data) || emptyResponseData
      
    return data
  } catch (error) {
    return emptyResponseData
  }
}    

