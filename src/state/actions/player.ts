import AsyncStorage from '@react-native-community/async-storage'
import {
  convertNowPlayingItemClipToNowPlayingItemEpisode,
  convertNowPlayingItemToEpisode,
  convertNowPlayingItemToMediaRef,
  NowPlayingItem
} from 'podverse-shared'
import Config from 'react-native-config'
import { State as RNTPState } from 'react-native-track-player'
import { getGlobal, setGlobal } from 'reactn'
import { getParsedTranscript } from '../../lib/transcriptHelpers'
import { convertPodcastIndexValueTagToStandardValueTag } from '../../lib/valueTagHelpers'
import { PV } from '../../resources'
import PVEventEmitter from '../../services/eventEmitter'
import {
  getCurrentLoadedTrackId,
  handlePlay,
  initializePlayerQueue as initializePlayerQueueService,
  loadItemAndPlayTrack as loadItemAndPlayTrackService,
  playNextFromQueue as playNextFromQueueService,
  PVTrackPlayer,
  setPlaybackPosition,
  setPlaybackSpeed as setPlaybackSpeedService,
  togglePlay as togglePlayService
} from '../../services/player'
import { getPodcastFromPodcastIndexById } from '../../services/podcastIndex'
import { initSleepTimerDefaultTimeRemaining } from '../../services/sleepTimer'
import { trackPlayerScreenPageView } from '../../services/tracking'
import {
  clearNowPlayingItem as clearNowPlayingItemService,
  setNowPlayingItem as setNowPlayingItemService
} from '../../services/userNowPlayingItem'
import { getQueueItems } from '../../state/actions/queue'
import { clearChapterPlaybackInfo, loadChapterPlaybackInfo, loadChaptersForNowPlayingItem } from './playerChapters'

const clearEnrichedPodcastDataIfNewEpisode =
 async (previousNowPlayingItem: NowPlayingItem, nowPlayingItem: NowPlayingItem) => {
  const shouldClearPreviousPlaybackInfo =
    previousNowPlayingItem && previousNowPlayingItem.episodeId !== nowPlayingItem.episodeId
  if (shouldClearPreviousPlaybackInfo) {
    await clearChapterPlaybackInfo(nowPlayingItem)
    setGlobal({ podcastValueFinal: null })
  }
}

export const updatePlayerState = (item: NowPlayingItem) => {
  if (!item) return

  const globalState = getGlobal()

  const episode = convertNowPlayingItemToEpisode(item)
  episode.description = episode.description || 'No show notes available'
  const mediaRef = convertNowPlayingItemToMediaRef(item)

  const newState = {
    player: {
      ...globalState.player,
      episode,
      ...(!item.clipId ? { mediaRef } : { mediaRef: null }),
      nowPlayingItem: item
    }
  } as any

  if (!item.clipId) {
    newState.screenPlayer = {
      ...globalState.screenPlayer,
      showFullClipInfo: false
    }
  }

  setGlobal(newState)
}

export const initializePlayerQueue = async () => {
  const nowPlayingItem = await initializePlayerQueueService()

  if (nowPlayingItem) {
    const shouldPlay = false
    await loadItemAndPlayTrack(nowPlayingItem, shouldPlay)
    showMiniPlayer()
  }

  const globalState = getGlobal()
  setGlobal({
    screenPlayer: {
      ...globalState.screenPlayer,
      isLoading: false
    }
  })
}

export const clearNowPlayingItem = async () => {
  await clearNowPlayingItemService()

  const globalState = getGlobal()
  setGlobal({
    player: {
      ...globalState.player,
      nowPlayingItem: null,
      playbackState: RNTPState.Stopped,
      showMiniPlayer: false
    },
    screenPlayer: {
      ...globalState.screenPlayer,
      showFullClipInfo: false
    }
  })
}

export const hideMiniPlayer = () => {
  const globalState = getGlobal()
  setGlobal({
    player: {
      ...globalState.player,
      showMiniPlayer: false
    }
  })
}

export const showMiniPlayer = () => {
  const globalState = getGlobal()
  setGlobal({
    player: {
      ...globalState.player,
      showMiniPlayer: true
    }
  })
}

export const initPlayerState = async (globalState: any) => {
  const sleepTimerDefaultTimeRemaining = await initSleepTimerDefaultTimeRemaining()

  setGlobal({
    player: {
      ...globalState.player,
      sleepTimer: {
        defaultTimeRemaining: sleepTimerDefaultTimeRemaining,
        isActive: false,
        timeRemaining: sleepTimerDefaultTimeRemaining
      }
    }
  })
}

export const playNextFromQueue = async () => {
  const item = await playNextFromQueueService()
  await getQueueItems()

  if (item) trackPlayerScreenPageView(item)
}

const handleLoadChapterForNowPlayingEpisode = async (item: NowPlayingItem) => {
  setPlaybackPosition(item.clipStartTime)
  const nowPlayingItemEpisode = convertNowPlayingItemClipToNowPlayingItemEpisode(item)
  await setNowPlayingItem(nowPlayingItemEpisode, item.clipStartTime || 0)
  handlePlay()
  loadChapterPlaybackInfo()
}

export const loadItemAndPlayTrack = async (
  item: NowPlayingItem,
  shouldPlay: boolean,
  forceUpdateOrderDate?: boolean
) => {
  const globalState = getGlobal()

  if (item) {
    const { nowPlayingItem: previousNowPlayingItem } = globalState.player
    await clearEnrichedPodcastDataIfNewEpisode(previousNowPlayingItem, item)

    item.clipId
      ? await AsyncStorage.setItem(PV.Keys.PLAYER_CLIP_IS_LOADED, 'TRUE')
      : await AsyncStorage.removeItem(PV.Keys.PLAYER_CLIP_IS_LOADED)

    if (item.clipIsOfficialChapter) {
      if (previousNowPlayingItem && item.episodeId === previousNowPlayingItem.episodeId) {
        await handleLoadChapterForNowPlayingEpisode(item)
        return
      } else {
        loadChapterPlaybackInfo()
      }
    }

    updatePlayerState(item)

    // If the value tag is unavailable, try to enrich it from Podcast Index API
    // then make sure the enrichedItem is on global state.
    // If the transcript tag is available, parse it and assign it to the enrichedItem.
    const enrichedItem = await loadItemAndPlayTrackService(item, shouldPlay, forceUpdateOrderDate)
    if (enrichedItem) {
      updatePlayerState(enrichedItem)
    }

    showMiniPlayer()
  }

  setGlobal(
    {
      screenPlayer: {
        ...globalState.screenPlayer,
        isLoading: false
      }
    },
    () => {
      handleEnrichingPlayerState(item)
    }
  )
}

export const handleEnrichingPlayerState = (item: NowPlayingItem) => {
  trackPlayerScreenPageView(item)
  loadChaptersForNowPlayingItem(item)
  enrichPodcastValue(item)
  enrichParsedTranscript(item)
}

const enrichParsedTranscript = (item: NowPlayingItem) => {
  setGlobal({ parsedTranscript: [] }, async () => {
    if (item.episodeTranscript && item.episodeTranscript[0] && item.episodeTranscript[0].url) {
      try {
        const parsedTranscript =
        await getParsedTranscript(item.episodeTranscript[0].url, item.episodeTranscript[0].type)
        setGlobal({ parsedTranscript })
      } catch (error) {
        console.log('loadItemAndPlayTrack transcript parsing error', error)
      }
    }
  })
}

const enrichPodcastValue = async (item: NowPlayingItem) => {
  if (!Config.ENABLE_VALUE_TAG_TRANSACTIONS) return

  if (
    item?.episodeValue?.length
    || item?.episodeValue?.recipients?.length
    || item?.podcastValue?.length
    || item?.podcastValue?.recipients?.length
  ) {
    PVEventEmitter.emit(PV.Events.PLAYER_VALUE_ENABLED_ITEM_LOADED)
  } else if (item.podcastIndexPodcastId) {
    const podcastIndexPodcast = await getPodcastFromPodcastIndexById(item.podcastIndexPodcastId)
    const podcastIndexPodcastValueTag = podcastIndexPodcast?.feed?.value
    if (podcastIndexPodcastValueTag?.model && podcastIndexPodcastValueTag?.destinations) {
      const podcastValue = convertPodcastIndexValueTagToStandardValueTag(podcastIndexPodcastValueTag)
      PVEventEmitter.emit(PV.Events.PLAYER_VALUE_ENABLED_ITEM_LOADED)
      setGlobal({ podcastValueFinal: podcastValue })
    }
  }
}

export const setPlaybackSpeed = async (rate: number) => {
  await setPlaybackSpeedService(rate)

  const globalState = getGlobal()
  setGlobal({
    player: {
      ...globalState.player,
      playbackRate: rate
    }
  })

  PVEventEmitter.emit(PV.Events.PLAYER_SPEED_UPDATED)
}

export const togglePlay = async () => {
  // If somewhere a play button is pressed, but nothing is currently loaded in the player,
  // then load the last time from memory by re-initializing the player.
  const trackId = await getCurrentLoadedTrackId()
  if (!trackId) {
    await initializePlayerQueue()
  }
  await togglePlayService()

  showMiniPlayer()
}

export const updatePlaybackState = async (state?: any) => {
  let playbackState = state

  if (!playbackState) playbackState = await PVTrackPlayer.getState()

  const backupDuration = await PVTrackPlayer.getTrackDuration()

  const globalState = getGlobal()
  setGlobal({
    player: {
      ...globalState.player,
      playbackState,
      ...(backupDuration ? { backupDuration } : {})
    }
  })
}

export const setNowPlayingItem = async (item: NowPlayingItem | null, playbackPosition: number) => {
  if (item) {
    await setNowPlayingItemService(item, playbackPosition)
    updatePlayerState(item)
  }
}

export const initializePlaybackSpeed = async () => {
  const playbackSpeedString = await AsyncStorage.getItem(PV.Keys.PLAYER_PLAYBACK_SPEED)
  let playbackSpeed = 1
  if (playbackSpeedString) {
    playbackSpeed = JSON.parse(playbackSpeedString)
  }

  const globalState = getGlobal()
  setGlobal({
    player: {
      ...globalState.player,
      playbackRate: playbackSpeed
    }
  })
}

