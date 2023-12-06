import { getMediaRefStartPosition, NowPlayingItem } from 'podverse-shared'
import ReactNativeHapticFeedback from 'react-native-haptic-feedback'
import { getGlobal, setGlobal } from 'reactn'
import { translate } from '../../lib/i18n'
import { PV } from '../../resources'
import { retrieveLatestChaptersForEpisodeId } from '../../services/episode'
import { playerGetPosition, playerGetDuration, playerUpdateCurrentTrack } from '../../services/player'
import { debouncedClearSkipChapterInterval, setSkipChapterInterval } from './player'

export const clearChapterPlaybackInfo = async (nowPlayingItem?: NowPlayingItem) => { 
  if (nowPlayingItem) {
    const imageUrl = nowPlayingItem.episodeImageUrl
    || nowPlayingItem.podcastImageUrl
    playerUpdateCurrentTrack(nowPlayingItem.episodeTitle, imageUrl)
  }

  return new Promise((resolve) => {
    setGlobal(
      {
        currentChapters: [],
        currentTocChapters: [],
        currentTocChaptersStartTimePositions: [],
        currentChapter: null,
        currentTocChapter: null
      },
      () => {
        resolve(null)
      }
    )
  })
}

// If an episode stream is slow to load, the duration will not be calculated yet,
// so the currentTocChaptersStartTimePositions cannot be calculated, and the
// PlayerProgressBar chapter flags will not appear. To work around this,
// I'm creating an interval that re-runs until duration is available.
export const loadChaptersForEpisode = async (episode?: any) => {
  if (episode?.id) {
    const { currentChapters, currentTocChapters } = await retriveNowPlayingItemChapters(episode.id)
    let limitCount = 0
    const interval = setInterval(() => {
      (async () => {
        limitCount++
        const duration = await playerGetDuration()
        if (duration > 0 && limitCount < 10) {
          clearInterval(interval)
          setChaptersOnGlobalState(currentChapters, currentTocChapters)
        }
      })()
    }, 2000)
  }
}

export const loadChaptersForNowPlayingItem = async (item?: NowPlayingItem) => {
  if (item?.episodeId) {
    const { currentChapters, currentTocChapters } = await retriveNowPlayingItemChapters(item.episodeId)
    let limitCount = 0
    const interval = setInterval(() => {
      (async () => {
        limitCount++
        const duration = await playerGetDuration()
        if (duration > 0 && limitCount < 10) {
          clearInterval(interval)
          setChaptersOnGlobalState(currentChapters, currentTocChapters)
        }
      })()
    }, 2000)
  }
}

const isNewChapter = (currentChapter: any, newCurrentChapter: any) => (
  !newCurrentChapter
  || (currentChapter && newCurrentChapter && currentChapter.id !== newCurrentChapter.id)
  || (!currentChapter && newCurrentChapter)
)

export const loadChapterPlaybackInfo = () => {
  (async () => {
    const globalState = getGlobal()
    const { currentChapters } = globalState
    if (Array.isArray(currentChapters) && currentChapters.length > 1) {
      const playerPosition = await playerGetPosition()
      if ((playerPosition || playerPosition === 0)) {
        const tocOnly = false
        const newCurrentChapter = getChapterForTime(playerPosition, tocOnly)
        setChapterOnGlobalState(newCurrentChapter)
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

  if (Array.isArray(chapters) && chapters.length > 0) {
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i]
      const remainingChapters = chapters.slice(i + 1)
      const nextChapter = remainingChapters.find((chapter: any) => chapter?.isChapterToc !== false)
      if (chapter?.endTime) {
        // do nothing
      } else if (!chapter?.endTime && nextChapter) {
        chapter.endTime = nextChapter.startTime
      } else if (!chapter?.endTime && backupDuration) {
        chapter.endTime = backupDuration
      }
      enrichedChapters.push(chapter)
    }
  }

  const currentChapters = enrichedChapters
  const currentTocChapters = enrichedChapters.filter((chapter) => chapter?.isChapterToc !== false)

  return {
    currentChapters,
    currentTocChapters
  }
}

export const setChapterOnGlobalState = (newCurrentChapter: any, haptic?: boolean) => {
  const globalState = getGlobal()
  const { currentChapter, player } = globalState

  if (isNewChapter(currentChapter, newCurrentChapter)) {
    if (haptic) {
      ReactNativeHapticFeedback.trigger('impactLight', PV.Haptic.options)
    }

    const tocOnly = true
    const newCurrentTocChapter = getChapterForTime(newCurrentChapter?.startTime, tocOnly)

    if (!newCurrentChapter) {
      const podcastTitle = player?.nowPlayingItem?.podcastTitle || translate('Untitled Podcast')
      const episodeTitle = player?.nowPlayingItem?.episodeTitle || translate('Untitled Episode')
      playerUpdateCurrentTrack(podcastTitle, episodeTitle)
    } else {
      playerUpdateCurrentTrack(newCurrentChapter.title, newCurrentChapter.imageUrl)
    }

    setGlobal({
      currentChapter: newCurrentChapter,
      currentTocChapter: newCurrentTocChapter
    })
  }
}

// NOTE: setChaptersOnGlobalState must wait for the duration to be available!
// otherwise the chapter time flags will not be calculated for the player progress bar.
export const setChaptersOnGlobalState = async (currentChapters: any[], currentTocChapters: any[]) => {
  const { screen } = getGlobal('screen')
  const { screenWidth } = screen
  const sliderWidth = screenWidth - PV.Player.sliderStyles.wrapper.marginHorizontal * 2
  const duration = await playerGetDuration()
  let currentTocChaptersStartTimePositions = [] as number[]

  if (sliderWidth && duration > 0) {
    for (const tocChapter of currentTocChapters) {
      if (tocChapter && tocChapter.startTime >= 0) {
        const chapterStartTimePosition = getMediaRefStartPosition(tocChapter.startTime, sliderWidth, duration)
        currentTocChaptersStartTimePositions.push(chapterStartTimePosition)
      }
    }

    // remove duplicates, in case the podcaster included overlapping
    // start times for some chapters, and to avoid duplicate keys in PlayerProgressBar
    currentTocChaptersStartTimePositions = [...new Set(currentTocChaptersStartTimePositions)]
  }

  setGlobal({
    currentChapters,
    currentTocChapters,
    currentTocChaptersStartTimePositions
  }, () => {
    setTimeout(() => {
      loadChapterPlaybackInfo()
    }, 1000)
  })
}

export const refreshChaptersWidth = () => {
  const { currentChapters, currentTocChapters } = getGlobal()
  setChaptersOnGlobalState(currentChapters, currentTocChapters)
}

export const getChapterPrevious = () => {
  const globalState = getGlobal()
  const { currentTocChapter, currentTocChapters } = globalState
  if (currentTocChapters && currentTocChapters?.length && currentTocChapters.length > 1) {
    const currentIndex = currentTocChapters.findIndex((x: any) => x.id === currentTocChapter.id)
    const previousIndex = currentIndex - 1
    const previousChapter = currentTocChapters[previousIndex]
    return previousChapter
  }
}

export const getTocChapterNext = async () => {
  const globalState = getGlobal()
  const { currentTocChapter, currentTocChapters } = globalState
  if (currentTocChapter && currentTocChapters?.length && currentTocChapters.length > 1) {
    const currentIndex = currentTocChapters.findIndex((x: any) => x.id === currentTocChapter.id)
    const nextIndex = currentIndex + 1
    const nextChapter = currentTocChapters[nextIndex]
    return nextChapter
  } else if (!currentTocChapter && currentTocChapters?.length && currentTocChapters.length > 1) {
    return getNextTocChapterByTime()
  }
}

const getNextTocChapterByTime = async () => {
  const globalState = getGlobal()
  const { currentChapters, player } = globalState
  const { backupDuration } = player
  const position = await playerGetPosition()

  let nextChapter = null
  for (let i = 0; i < currentChapters.length; i++) {
    const chapter = currentChapters[i]
    const isInTimeRange = checkIfChapterInTimeRange(chapter, position, backupDuration)
    if (isInTimeRange) {
      nextChapter = currentChapters[i + 1] || null
    }
  }

  // If no next chapter is found, assume there was no first chapter,
  // and skip to the first chapter
  if (!nextChapter) {
    nextChapter = currentChapters[0] || null
  }

  return nextChapter
}

export const getChapterForTime = (playerPosition: number, tocOnly: boolean) => {
  const globalState = getGlobal()
  const { currentChapters, player } = globalState
  const { backupDuration } = player
  
  // separate into vts, non-toc, and toc chapters
  // loop through each until you find the first match between startTime and endTime
  let newCurrentChapter = null
  const filteredVtsChapters = !tocOnly && currentChapters.filter((chapter: any) => chapter.isChapterVts === true)
  const filteredNonTocChapters = !tocOnly && currentChapters.filter((chapter: any) => chapter.isChapterToc === false)
  const filteredTocChapters = currentChapters.filter((chapter: any) => chapter.isChapterToc !== false)

  if (!tocOnly && filteredVtsChapters && filteredVtsChapters.length > 1) {
    // reverse the value time splits order before finding, so that the items with the later
    // matching startTime take precedence over the items with earlier startTimes.
    // NOTE: see also services/v4v.ts file
    const reverseVtsChapters = filteredVtsChapters.reverse()
    newCurrentChapter = reverseVtsChapters.find(
      (chapter: any) => checkIfChapterInTimeRange(chapter, playerPosition, backupDuration)
    )
  }

  if (!tocOnly && !newCurrentChapter && filteredNonTocChapters && filteredNonTocChapters.length > 1) {
    newCurrentChapter = filteredNonTocChapters.find(
      (chapter: any) => checkIfChapterInTimeRange(chapter, playerPosition, backupDuration)
    )
  }

  if (!newCurrentChapter && filteredTocChapters && filteredTocChapters.length > 1) {
    newCurrentChapter = filteredTocChapters.find(
      // If no chapter.endTime, then assume it is the last chapter, and use the duration instead
      (chapter: any) => checkIfChapterInTimeRange(chapter, playerPosition, backupDuration)
    )
  }

  return newCurrentChapter
}

const checkIfChapterInTimeRange = (chapter: any, playerPosition: number, backupDuration?: number) => {
  // // If no chapter.endTime, then assume it is the last chapter, and use the duration instead
  return chapter.endTime
    ? playerPosition >= chapter.startTime && playerPosition < chapter.endTime
    : playerPosition >= chapter.startTime && backupDuration && playerPosition < backupDuration
}

export const loadChapterPlaybackInfoForTime = async (time: number, haptic?: boolean) => {
  const tocOnly = false
  const chapter = await getChapterForTime(time, tocOnly)
  if (chapter) {
    setChapterOnGlobalState(chapter, haptic)
  }
}

export const pauseChapterInterval = () => {
  setSkipChapterInterval()
}

export const resumeChapterInterval = () => {
  debouncedClearSkipChapterInterval()
}
