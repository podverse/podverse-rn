import { Episode, MediaRef, Podcast } from "podverse-shared"
import { request } from "./request"

type SecondaryQueueForPodcastResponseData = {
  previousEpisodes: Episode[]
  nextEpisodes: Episode[]
  inheritedPodcast: Podcast | null
}

const emptyResponseData = { previousEpisodes: [], nextEpisodes: [], inheritedPodcast: null }

export const getSecondaryQueueEpisodesForPodcastId = async (episodeId: string, podcastId: string) => {
  try {
    const response = await request({
      endpoint: `/secondary-queue/podcast/${podcastId}/episode/${episodeId}?withFix=true`,
      method: 'GET'
    })

    const data: SecondaryQueueForPodcastResponseData = (response && response.data) || emptyResponseData
      
    return data
  } catch (error) {
    return emptyResponseData
  }
}    

type SecondaryQueueForPlaylistResponseData = {
  previousEpisodesAndMediaRefs: Array<Episode | MediaRef>
  nextEpisodesAndMediaRefs: Array<Episode | MediaRef>
}

export const getSecondaryQueueEpisodesForPlaylist = async (playlistId: string, episodeOrMediaRefId: string) => {
  try {
    const response = await request({
      endpoint: `/secondary-queue/playlist/${playlistId}/episode-or-media-ref/${episodeOrMediaRefId}`,
      method: 'GET',
      query: {
        audioOnly: true
      }
    })

    const data: SecondaryQueueForPlaylistResponseData = (response && response.data) || emptyResponseData
      
    return data
  } catch (error) {
    console.log('error', error)
    return emptyResponseData
  }
}    
