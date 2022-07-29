import { setGlobal } from 'reactn'
import {
  clearEpisodesCount as clearEpisodesCountService,
  clearEpisodesCountForPodcast as clearEpisodesCountForPodcastService,
  getNewEpisodesCount as getNewEpisodesCountService,
  handleUpdateNewEpisodesCount as handleUpdateNewEpisodesCountService,
  handleUpdateNewEpisodesCountAddByRSS as handleUpdateNewEpisodesCountAddByRSSService
} from '../../services/newEpisodesCount'

export const getNewEpisodesCount = async () => {
  const newEpisodesCount = await getNewEpisodesCountService()
  setGlobal({ newEpisodesCount })
}

export const handleUpdateNewEpisodesCountAddByRSS = async (podcastId: string, newEpisodesFoundCount: number) => {
  const newEpisodesCount = await handleUpdateNewEpisodesCountAddByRSSService(podcastId, newEpisodesFoundCount)
  setGlobal({ newEpisodesCount })
}

export const handleUpdateNewEpisodesCount = async () => {
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
