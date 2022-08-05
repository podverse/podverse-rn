// import AsyncStorage from '@react-native-community/async-storage'
import AsyncStorage from '@react-native-community/async-storage'
import { checkIfVideoFileOrVideoLiveType, NowPlayingItem } from 'podverse-shared'
import { getGlobal, setGlobal } from 'reactn'
import { checkIfFileIsDownloaded, getDownloadedFilePath } from '../../lib/downloader'
import { PV } from '../../resources'
import PVEventEmitter from '../../services/eventEmitter'
import { getPodcastCredentialsHeader } from '../../services/parser'
import { playerUpdateUserPlaybackPosition } from '../../services/player'
import { PVAudioPlayer } from '../../services/playerAudio'
import { getPodcastFeedUrlAuthority } from '../../services/podcast'
import { addOrUpdateHistoryItem, getHistoryItemsIndexLocally } from '../../services/userHistoryItem'
import { getNowPlayingItemFromLocalStorage, getNowPlayingItemLocally } from '../../services/userNowPlayingItem'
import { removeDownloadedPodcastEpisode } from './downloads'
import { playerUpdatePlaybackState, playerUpdatePlayerState, showMiniPlayer } from './player'
import { updateHistoryItemsIndex } from './userHistoryItem'

export const videoInitializePlayer = async (item: NowPlayingItem) => {
  if (item && checkIfVideoFileOrVideoLiveType(item?.episodeMediaType)) {
    /* Use the item from history to make sure we have the same
        userPlaybackPosition that was last saved from other devices. */
    if (!item.clipId && item.episodeId) {
      await updateHistoryItemsIndex()
      const itemFromStorage = await getNowPlayingItemFromLocalStorage(item.episodeId)
      if (itemFromStorage) {
        item = itemFromStorage
      }
    }

    const shouldPlay = false
    const forceUpdateOrderDate = false
    await videoLoadNowPlayingItem(item, shouldPlay, forceUpdateOrderDate)
    showMiniPlayer()
  }

  const globalState = getGlobal()
  setGlobal({
    screenPlayer: {
      ...globalState.screenPlayer,
      isLoading: false,
      liveStreamWasPaused: false
    }
  })
}

export const videoGetState = () => {
  const globalState = getGlobal()
  return globalState.player.playbackState
}

export const videoGetRate = () => {
  const globalState = getGlobal()
  return globalState.player.playbackRate
}

export const videoSetRate = (rate = 1.0) => {
  const globalState = getGlobal()
  const { player } = globalState
  setGlobal({
    player: {
      ...player,
      playbackRate: rate
    }
  }, () => {
    PVEventEmitter.emit(PV.Events.PLAYER_VIDEO_PLAYBACK_STATE_CHANGED)
  })
}

export const videoIsLoaded = () => {
  const { player } = getGlobal()
  return player.videoInfo.videoIsLoaded
}

export const videoCheckIfStateIsPlaying = (playbackState: any) => 
  playbackState === PV.Player.videoInfo.videoPlaybackState.playing

export const videoCheckIfStateIsBuffering = (playbackState: any) => 
  playbackState === PV.Player.videoInfo.videoPlaybackState.buffering

export const videoGetCurrentLoadedTrackId = () => {
  let currentTrackId = ''
  const { player } = getGlobal()
  try {
    const { nowPlayingItem } = player
    if (checkIfVideoFileOrVideoLiveType(nowPlayingItem?.episodeMediaType)) {
      currentTrackId = nowPlayingItem.clipId || nowPlayingItem.episodeId
    }
  } catch (error) {
    console.log('videoGetCurrentLoadedTrackId error', error)
  }
  return currentTrackId
}

export const videoGetTrackDuration = () => {
  const { player } = getGlobal()
  return player.videoInfo.videoDuration
}

export const videoGetTrackPosition = () => {
  const { player } = getGlobal()
  return player.videoInfo.videoPosition
}

export const videoStateSetVideoInfo = (item: NowPlayingItem) => {
  if (checkIfVideoFileOrVideoLiveType(item?.episodeMediaType)) {
    return {
      videoDuration: item.episodeDuration,
      videoPosition: item.userPlaybackPosition,
      videoIsLoaded: true
    }
  } else {
    return videoStateClearVideoInfo()
  }
}

export const videoStateClearVideoInfo = () => {
  return {
      videoDuration: 0,
      videoIsLoaded: false,
      videoPosition: 0
    }
}

export const videoStateUpdateDuration = (duration = 0) => {
  const globalState = getGlobal()
  const { player } = globalState
  const { videoInfo } = player
  setGlobal({
    player: {
      ...player,
      videoInfo: {
        ...videoInfo,
        videoDuration: duration
      }
    }
  })
}

export const videoStateUpdatePosition = (position = 0, callback?: any) => {
  const globalState = getGlobal()
  const { player } = globalState
  const { videoInfo } = player
  setGlobal({
    player: {
      ...player,
      videoInfo: {
        ...videoInfo,
        videoPosition: position
      }
    }
  }, callback)
}

export const videoUpdatePlaybackState = (playbackState?: any, callback?: any) => {
  const globalState = getGlobal()
  setGlobal({
    player: {
      ...globalState.player,
      playbackState
    }
  }, callback)
}

export const videoTogglePlay = () => {
  const globalState = getGlobal()
  const { player } = globalState
  const { playbackState } = player

  let newPlaybackState = PV.Player.videoInfo.videoPlaybackState.paused
  if (!videoCheckIfStateIsPlaying(playbackState)) {
    newPlaybackState = PV.Player.videoInfo.videoPlaybackState.playing
  }

  setGlobal({
    player: {
      ...player,
      playbackState: newPlaybackState
    }
  }, () => {
    PVEventEmitter.emit(PV.Events.PLAYER_VIDEO_PLAYBACK_STATE_CHANGED)
  })
}

export const videoPlay = () => {
  const globalState = getGlobal()
  const { player } = globalState
  const newPlaybackState = PV.Player.videoInfo.videoPlaybackState.playing

  setGlobal({
    player: {
      ...player,
      playbackState: newPlaybackState
    }
  }, () => {
    PVEventEmitter.emit(PV.Events.PLAYER_VIDEO_PLAYBACK_STATE_CHANGED)
  })
}

export const videoHandlePause = () => {
  const globalState = getGlobal()
  const { player } = globalState
  const newPlaybackState = PV.Player.videoInfo.videoPlaybackState.paused

  setGlobal({
    player: {
      ...player,
      playbackState: newPlaybackState
    }
  }, () => {
    PVEventEmitter.emit(PV.Events.PLAYER_VIDEO_PLAYBACK_STATE_CHANGED)
  })
}

export const videoHandlePauseWithUpdate = () => {
  videoHandlePause()
  playerUpdateUserPlaybackPosition()
}

export const videoLoadNowPlayingItem = async (
  item: NowPlayingItem,
  shouldPlay: boolean,
  forceUpdateOrderDate: boolean,
  previousNowPlayingItem?: NowPlayingItem | null
) => {
  const { clipId: previousClipId, episodeId: previousEpisodeId } = previousNowPlayingItem || {}
  await AsyncStorage.setItem(PV.Events.PLAYER_VIDEO_IS_LOADING, 'TRUE')
  await PVAudioPlayer.reset()

  const historyItemsIndex = await getHistoryItemsIndexLocally()
  const { clipId, episodeId } = item

  if (episodeId) {
    item.episodeDuration = historyItemsIndex?.episodes[episodeId]?.mediaFileDuration || 0
    if (clipId && previousClipId !== clipId) {
      /* Use a callback to wait until video is finished loading in global state    
         before calling the PLAYER_VIDEO_NEW_ITEM event. */
      playerUpdatePlayerState(item, () => {
        PVEventEmitter.emit(PV.Events.PLAYER_VIDEO_NEW_CLIP_ITEM_LOADED)
      })
    } else if (episodeId !== previousEpisodeId) {
      item.episodeDuration = historyItemsIndex?.episodes[episodeId]?.mediaFileDuration || 0
      /* Use a callback to wait until video is finished loading in global state    
         before calling the PLAYER_VIDEO_NEW_ITEM event. */
      playerUpdatePlayerState(item, () => {
          PVEventEmitter.emit(PV.Events.PLAYER_VIDEO_NEW_EPISODE_ITEM_LOADED)
      })
    }
  }

  addOrUpdateHistoryItem(item, item.userPlaybackPosition || 0, item.episodeDuration || 0, forceUpdateOrderDate)

  /* Add second delay to make sure the playback-track-changed and playback-queue-ended
     events triggered by PVAudioPlayer.reset() finishes */
  setTimeout(() => {
    (async () => {
      await AsyncStorage.removeItem(PV.Events.PLAYER_VIDEO_IS_LOADING)
      if (shouldPlay) {
        playerUpdatePlaybackState(PV.Player.videoInfo.videoPlaybackState.playing)
      }
    })()
  }, 1000)

  return item
}

export const videoHandleSeekTo = (position: number) => {
  PVEventEmitter.emit(PV.Events.PLAYER_VIDEO_SEEK_TO, position)
}

export const videoHandlePlayWithUpdate = () => {
  videoPlay()
  playerUpdateUserPlaybackPosition()
}

export const videoResetHistoryItem = async () => {
  const nowPlayingItem = await getNowPlayingItemLocally()
  if (nowPlayingItem) {
    const autoDeleteEpisodeOnEnd = await AsyncStorage.getItem(PV.Keys.AUTO_DELETE_EPISODE_ON_END)
    if (autoDeleteEpisodeOnEnd && nowPlayingItem?.episodeId) {
      removeDownloadedPodcastEpisode(nowPlayingItem.episodeId)
    }

    const forceUpdateOrderDate = false
    const skipSetNowPlaying = false
    const completed = true
    await addOrUpdateHistoryItem(nowPlayingItem, 0, null, forceUpdateOrderDate, skipSetNowPlaying, completed)
  }
}

export const videoGetDownloadedFileInfo = async (nowPlayingItem: NowPlayingItem) => {
  const { addByRSSPodcastFeedUrl, episodeId, episodeMediaUrl, podcastCredentialsRequired,
    podcastId } = nowPlayingItem

  let finalFeedUrl = addByRSSPodcastFeedUrl
  let isDownloadedFile = false
  let filePath = ''
  let Authorization = ''

  /*
    If credentials are required but it is a podcast stored in our database,
    then get the authority feedUrl for the podcast before proceeding.
  */
  if (podcastCredentialsRequired && !addByRSSPodcastFeedUrl && podcastId) {
    finalFeedUrl = await getPodcastFeedUrlAuthority(podcastId)
  }

  if (episodeId) {
    isDownloadedFile = await checkIfFileIsDownloaded(episodeId, episodeMediaUrl)
    filePath = await getDownloadedFilePath(episodeId, episodeMediaUrl)
    Authorization = await getPodcastCredentialsHeader(finalFeedUrl)
  }

  return {
    Authorization,
    filePath,
    finalFeedUrl,
    isDownloadedFile
  }
}