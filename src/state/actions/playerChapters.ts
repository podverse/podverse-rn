import { NowPlayingItem } from 'podverse-shared'
import { Dimensions } from 'react-native'
import ReactNativeHapticFeedback from 'react-native-haptic-feedback'
import { getGlobal, setGlobal } from 'reactn'
import { getMediaRefStartPosition } from '../../lib/utility'
import { PV } from '../../resources'
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
    setGlobal(
      {
        currentChapters: [],
        currentChapter: null
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

const isNewChapter = (currentChapter: any, newCurrentChapter: any) => (
  (currentChapter && newCurrentChapter && currentChapter.id !== newCurrentChapter.id)
  || (!currentChapter && newCurrentChapter)
)

export const loadChapterPlaybackInfo = () => {
  (async () => {
    const globalState = getGlobal()
    const { currentChapters } = globalState
    const playerPosition = await PVTrackPlayer.getTrackPosition()
    if ((playerPosition || playerPosition === 0) && Array.isArray(currentChapters) && currentChapters.length > 1) {
      const newCurrentChapter = getChapterForTime(playerPosition)
      setChapterOnGlobalState(newCurrentChapter)
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

export const setChapterOnGlobalState = (newCurrentChapter: any, haptic?: boolean) => {
  const globalState = getGlobal()
  const { currentChapter } = globalState

  if (isNewChapter(currentChapter, newCurrentChapter)) {
    if (haptic) {
      ReactNativeHapticFeedback.trigger('impactLight', PV.Haptic.options)
    }
    updateCurrentTrack(newCurrentChapter.title, newCurrentChapter.imageUrl)

    setGlobal({
      currentChapter: newCurrentChapter
    })
  }
}

export const setChaptersOnGlobalState = async (currentChapters: any[]) => {
  const sliderWidth = Dimensions.get('screen').width - PV.Player.sliderStyles.wrapper.marginHorizontal * 2
  const duration = await PVTrackPlayer.getTrackDuration()
  const currentChaptersStartTimePositions = [] as number[]

  if (sliderWidth && duration > 0) {
    for (const chapter of currentChapters) {
      if (chapter && chapter.startTime >= 0) {
        const chapterStartTimePosition = getMediaRefStartPosition(chapter.startTime, sliderWidth, duration)
        currentChaptersStartTimePositions.push(chapterStartTimePosition)
      }
    }
  }

  setGlobal({
    currentChapters,
    currentChaptersStartTimePositions
  })
}

export const getChapterPrevious = () => {
  const globalState = getGlobal()
  const { currentChapter, currentChapters } = globalState
  if (currentChapter && currentChapters?.length && currentChapters.length > 1) {
    const currentIndex = currentChapters.findIndex((x: any) => x.id === currentChapter.id)
    const previousIndex = currentIndex - 1
    const previousChapter = currentChapters[previousIndex]
    return previousChapter
  }
}

export const getChapterNext = () => {
  const globalState = getGlobal()
  const { currentChapter, currentChapters } = globalState
  if (currentChapter && currentChapters?.length && currentChapters.length > 1) {
    const currentIndex = currentChapters.findIndex((x: any) => x.id === currentChapter.id)
    const nextIndex = currentIndex + 1
    const nextChapter = currentChapters[nextIndex]
    return nextChapter
  }
}

export const getChapterForTime = (playerPosition: number) => {
  const globalState = getGlobal()
  const { currentChapters, player } = globalState
  const { backupDuration } = player
  
  let newCurrentChapter = null
  if (currentChapters && currentChapters.length > 1) {
    newCurrentChapter = currentChapters.find(
      // If no chapter.endTime, then assume it is the last chapter, and use the duration instead
      (chapter: any) =>
        chapter.endTime
          ? playerPosition >= chapter.startTime && playerPosition < chapter.endTime
          : playerPosition >= chapter.startTime && backupDuration && playerPosition < backupDuration
    )
  }

  return newCurrentChapter
}

export const getChapterForTimeAndSetOnState = async (time: number, haptic?: boolean) => {
  const chapter = await getChapterForTime(time)
  if (chapter) {
    setChapterOnGlobalState(chapter, haptic)
  }
}

export let chapterInterval: NodeJS.Timeout
export const clearChapterInterval = () => {
  if (chapterInterval) {
    clearInterval(chapterInterval)
  }
}
export const startChapterInterval = () => {
  chapterInterval = setInterval(loadChapterPlaybackInfo, 3000)
}
startChapterInterval()
