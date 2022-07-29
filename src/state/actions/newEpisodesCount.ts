import { getGlobal, setGlobal } from 'reactn'
import {
  clearEpisodesCount as clearEpisodesCountService,
  clearEpisodesCountForPodcast as clearEpisodesCountForPodcastService,
  getNewEpisodesCount as getNewEpisodesCountService,
  handleUpdateNewEpisodesCount as handleUpdateNewEpisodesCountService,
  handleUpdateNewEpisodesCountAddByRSS as handleUpdateNewEpisodesCountAddByRSSService,
  toggleHideNewEpisodesBadges as toggleHideNewEpisodesBadgesService
} from '../../services/newEpisodesCount'

export const getNewEpisodesCount = async () => {
  const newEpisodesCount = await getNewEpisodesCountService()
  setGlobal({ newEpisodesCount })
}

export const handleUpdateNewEpisodesCountAddByRSS = async (podcastId: string, newEpisodesFoundCount: number) => {
  const global = getGlobal()
  const hideNewEpisodesBadges = global?.hideNewEpisodesBadges

  if (hideNewEpisodesBadges) return
  
  const newEpisodesCount = await handleUpdateNewEpisodesCountAddByRSSService(podcastId, newEpisodesFoundCount)
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

export const toggleHideNewEpisodesBadges = async () => {
  const newValue = await toggleHideNewEpisodesBadgesService()
  setGlobal({ hideNewEpisodesBadges: newValue })
}