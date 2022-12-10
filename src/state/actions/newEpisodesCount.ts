import { getGlobal, setGlobal } from 'reactn'
import { errorLogger } from '../../lib/logger'
import {
  clearEpisodesCount as clearEpisodesCountService,
  clearEpisodesCountForPodcast as clearEpisodesCountForPodcastService,
  clearEpisodesCountForPodcastEpisode as clearEpisodesCountForPodcastEpisodeService,
  getNewEpisodesCount as getNewEpisodesCountService,
  handleUpdateNewEpisodesCount as handleUpdateNewEpisodesCountService,
  handleUpdateNewEpisodesCountAddByRSS as handleUpdateNewEpisodesCountAddByRSSService,
  toggleHideNewEpisodesBadges as toggleHideNewEpisodesBadgesService
} from '../../services/newEpisodesCount'
import { getHistoryItemsIndex } from '../../services/userHistoryItem'

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

/*
  In case episodes have been played on a different device, we need to remove
  the newEpisodesCount indicator for those episodes.
  This only needs to run for logged-in users.
*/
export const syncNewEpisodesCountWithHistory = async () => {
  try {
    const { isLoggedIn } = getGlobal().session
    if (isLoggedIn) {
      const historyItemsIndex = await getHistoryItemsIndex()
      const newEpisodesCount = await getNewEpisodesCountService()
      const newEpisodesPodcastIds = Object.keys(newEpisodesCount)
  
      if (newEpisodesPodcastIds && historyItemsIndex?.episodes) {
        for (const newEpisodePodcastId of newEpisodesPodcastIds) {
          const newEpisodesPodcastData = newEpisodesCount[newEpisodePodcastId]?.data
          if (newEpisodesPodcastData) {
            const newEpisodesEpisodeIds = Object.keys(newEpisodesPodcastData)
            for (const newEpisodesEpisodeId of newEpisodesEpisodeIds) {
              if (historyItemsIndex.episodes[newEpisodesEpisodeId]) {
                await clearEpisodesCountForPodcastEpisode(newEpisodePodcastId, newEpisodesEpisodeId)
              }
            }
          }
        }
      }
    }

    // After updated in storage, then update the global state
    getNewEpisodesCount()
  } catch (error) {
    errorLogger('syncNewEpisodesCountWithHistory error', error)
  }
}
