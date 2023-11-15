import { Episode, NowPlayingItem, Podcast, convertToNowPlayingItem } from "podverse-shared"

/* AutoPlayQueue */

export type AutoPlayQueueParams = {
  episodes: Episode[]
  inheritedPodcast: Podcast | null
  nowPlayingItems: NowPlayingItem[]
  startFromIndex: number
}

export const getAutoPlayQueueItemAtStartIndex = (autoPlayQueue: AutoPlayQueueParams | AutoPlayQueueSingleton) => {
  if (autoPlayQueue?.episodes?.length > 0) {
    return (autoPlayQueue?.startFromIndex === 0 || autoPlayQueue?.startFromIndex > 0)
      ? autoPlayQueue.episodes[autoPlayQueue.startFromIndex]
      : null
  } else if (autoPlayQueue?.nowPlayingItems?.length > 0) {
    return (autoPlayQueue?.startFromIndex === 0 || autoPlayQueue?.startFromIndex > 0)
      ? autoPlayQueue.nowPlayingItems[autoPlayQueue.startFromIndex]
      : null
  }
  return null
}

/* AutoPlayQueueSingleton */

type AutoPlayQueueSingleton = {
  nowPlayingItems: NowPlayingItem[]
  startFromIndex: number
}

let autoPlayQueueSingleton: AutoPlayQueueSingleton = {
  nowPlayingItems: [],
  startFromIndex: 0
}

export const getAutoPlayQueueSingleton = () => {
  return autoPlayQueueSingleton
}

/*
  If autoPlayQueueParams has episodes, convert them to nowPlayingItems, and include the inheritedPodcast.
  If autoPlayQueueParams has nowPlayingItems, no conversion needed.
  The inheritedPodcast is needed for when there is no episode.podcast property.
  Else clear the autoPlayQueueSingleton.
*/
export const setAutoPlayQueueSingleton = (autoPlayQueueParams: AutoPlayQueueParams) => {
  if (autoPlayQueueParams?.episodes?.length > 0) {
    const nowPlayingItems = autoPlayQueueParams.episodes.map(() => {
      return convertToNowPlayingItem(autoPlayQueueParams.episodes, null, autoPlayQueueParams.inheritedPodcast)
    })
    autoPlayQueueSingleton = {
      nowPlayingItems,
      startFromIndex: autoPlayQueueParams.startFromIndex
    }
  } else if (autoPlayQueueParams?.nowPlayingItems?.length > 0) {
    autoPlayQueueSingleton = {
      nowPlayingItems: autoPlayQueueParams.nowPlayingItems,
      startFromIndex: autoPlayQueueParams.startFromIndex
    }
  } else {
    autoPlayQueueSingleton = {
      nowPlayingItems: [],
      startFromIndex: 0
    }
  }
}