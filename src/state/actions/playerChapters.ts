import { NowPlayingItem } from 'podverse-shared'
import { getGlobal, setGlobal } from 'reactn'
import { retrieveLatestChaptersForEpisodeId } from '../../services/episode'
import { PVTrackPlayer, updateCurrentTrack } from '../../services/player'

export const clearChapterPlaybackInfo = async (nowPlayingItem?: NowPlayingItem) => { 
  if (nowPlayingItem) {
    const imageUrl = nowPlayingItem.episodeImageUrl
      || nowPlayingItem.podcastShrunkImageUrl
      || nowPlayingItem.podcastImageUrl
    updateCurrentTrack(nowPlayingItem.episodeTitle, imageUrl)
  }

  return new Promise((resolve) => {
    const globalState = getGlobal()
    setGlobal(
      {
        player: {
          ...globalState.player,
          currentChapters: [],
          currentChapter: null
        }
      },
      () => {
        resolve(null)
      }
    )
  })
}

export const loadChaptersForEpisode = async (episode?: any) => {
  if (episode?.id) {
    const currentChapters = await retriveNowPlayingItemChapters(episode.id)
    setChaptersOnGlobalState(currentChapters)
  }
}

export const loadChaptersForNowPlayingItem = async (item?: NowPlayingItem) => {
  if (item?.episodeId) {
    const currentChapters = await retriveNowPlayingItemChapters(item.episodeId)
    setChaptersOnGlobalState(currentChapters)
  }
}

export const loadChapterPlaybackInfo = () => {
  (async () => {
    const globalState = getGlobal()
    const { backupDuration, currentChapters } = globalState.player
    const playerPosition = await PVTrackPlayer.getTrackPosition()

    if ((playerPosition || playerPosition === 0) && Array.isArray(currentChapters) && currentChapters.length > 1) {
      const currentChapter = currentChapters.find(
        // If no chapter.endTime, then assume it is the last chapter, and use the duration instead
        (chapter: any) =>
          chapter.endTime
            ? playerPosition >= chapter.startTime && playerPosition < chapter.endTime
            : playerPosition >= chapter.startTime && backupDuration && playerPosition < backupDuration
      )
      if (currentChapter) {
        setChapterOnGlobalState(currentChapter)
      }
    }
  })()
}

export const retriveNowPlayingItemChapters = async (episodeId: string) => {
  const [chapters] = await retrieveLatestChaptersForEpisodeId(episodeId)
  return enrichChapterDataForPlayer(chapters)
}

const enrichChapterDataForPlayer = (chapters: any[]) => {
  const globalState = getGlobal()
  const { backupDuration } = globalState.player
  const enrichedChapters = []
  let hasCustomImage = false

  if (Array.isArray(chapters) && chapters.length > 0) {
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i]
      const nextChapter = chapters[i + 1]
      if (!chapter?.endTime && nextChapter) {
        chapter.endTime = nextChapter.startTime
      } else if (!chapter?.endTime && backupDuration) {
        chapter.endTime = backupDuration
      }
      if (chapter && chapter.imageUrl) {
        hasCustomImage = true
      }
      enrichedChapters.push(chapter)
    }
  }

  const enrichedChaptersFinal = []
  for (const enrichedChapter of enrichedChapters) {
    if (hasCustomImage) {
      enrichedChapter.hasCustomImage = true
      enrichedChaptersFinal.push(enrichedChapter)
    }
  }

  return enrichedChapters
}

export const setChapterOnGlobalState = (currentChapter: any) => {
  const globalState = getGlobal()
  updateCurrentTrack(currentChapter.title, currentChapter.imageUrl)

  setGlobal({
    player: {
      ...globalState.player,
      currentChapter,
      mediaRef: currentChapter
    }
  })
}

export const setChaptersOnGlobalState = (currentChapters: any[]) => {
  const globalState = getGlobal()
  setGlobal({
    player: {
      ...globalState.player,
      currentChapters
    }
  })
}
