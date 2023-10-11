import { getGlobal } from 'reactn'
import { NowPlayingItem } from "podverse-shared"
import { playerHandlePlayWithUpdate, playerLoadNowPlayingItem } from "../state/actions/player"
import { getQueueItems, removeQueueItem } from "../state/actions/queue"

export const cleanVoiceCommandQuery = (query?: string) => {
  query = query || ''
  query = query.toLowerCase()
  // including all the incorrect auto-corrects we've seen for "podverse"
  query = query.replace(/in podverse|in pod verse|in proverbs|in poppers|in toddlers/g, '')
  query = query.trim()
  return query
}

export const voicePlayNowPlayingItem = (query: string) => {
  let shouldContinue = true
  const nowPlayingItem = getGlobal()?.player?.nowPlayingItem

  if (nowPlayingItem) {
    const isNowPlayingItem = nowPlayingItem.podcastTitle?.toLowerCase()?.trim() === query
    if (isNowPlayingItem) {
      playerHandlePlayWithUpdate()
      shouldContinue = false
    }
  }

  return shouldContinue
}

export const voicePlayNextQueuedItem = async (query: string) => {
  let shouldContinue = true
  const queueItems = await getQueueItems()

  const queueItem = queueItems.find(({ podcastTitle }: NowPlayingItem) => {
    return podcastTitle?.toLowerCase()?.trim() === query
  })
  
  if (queueItem) {
    const shouldPlay = true
    const forceUpdateOrderDate = false
    const setCurrentItemNextInQueue = true
    await playerLoadNowPlayingItem(queueItem, shouldPlay, forceUpdateOrderDate, setCurrentItemNextInQueue)
    await removeQueueItem(queueItem)
    shouldContinue = false
  }

  return shouldContinue
}
