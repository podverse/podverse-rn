import { getGlobal, setGlobal } from 'reactn'
import {
  clearEpisodesCount as clearEpisodesCountService,
  clearEpisodesCountForPodcast as clearEpisodesCountForPodcastService,
  clearEpisodesCountForPodcastEpisode as clearEpisodesCountForPodcastEpisodeService,
  getNewEpisodesCount as getNewEpisodesCountService,
  handleUpdateNewEpisodesCount as handleUpdateNewEpisodesCountService,
  handleUpdateNewEpisodesCountAddByRSS as handleUpdateNewEpisodesCountAddByRSSService,
  toggleHideNewEpisodesBadges as toggleHideNewEpisodesBadgesService
} from '../../services/newEpisodesCount'

export const getNewEpisodesCount = async () => {
  const newEpisodesCount = await getNewEpisodesCountService()
  setGlobal({ newEpisodesCount })
}

export const handleUpdateNewEpisodesCountAddByRSS = async (podcastId: string, episodeIds: string[]) => {
  const global = getGlobal()
  const hideNewEpisodesBadges = global?.hideNewEpisodesBadges

  if (hideNewEpisodesBadges) return
  
  const newEpisodesCount = await handleUpdateNewEpisodesCountAddByRSSService(podcastId, episodeIds)

  setGlobal({ newEpisodesCount })
}

export const handleUpdateNewEpisodesCount = async () => {
  const global = getGlobal()
  const hideNewEpisodesBadges = global?.hideNewEpisodesBadges
  
  if (hideNewEpisodesBadges) return
  
  const newEpisodesCount = await handleUpdateNewEpisodesCountService()
  setGlobal({ newEpisodesCount })
}

export const clearEpisodesCount = async () => {
  const newEpisodesCount = await clearEpisodesCountService()
  setGlobal({ newEpisodesCount })
}

export const clearEpisodesCountForPodcast = async (podcastId: string) => {
  const newEpisodesCount = await clearEpisodesCountForPodcastService(podcastId)
  setGlobal({ newEpisodesCount })
}

export const clearEpisodesCountForPodcastEpisode = async (podcastId: string, episodeId: string) => {
  const episodesCount = await clearEpisodesCountForPodcastEpisodeService(podcastId, episodeId)
  setGlobal({ newEpisodesCount: episodesCount })
}

export const toggleHideNewEpisodesBadges = async () => {
  const newValue = await toggleHideNewEpisodesBadgesService()
  setGlobal({ hideNewEpisodesBadges: newValue })
}