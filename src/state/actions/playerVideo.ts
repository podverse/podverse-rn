// import AsyncStorage from '@react-native-community/async-storage'
import { NowPlayingItem } from 'podverse-shared'
import { getGlobal } from 'reactn'
import { PV } from '../../resources'
// import PVEventEmitter from '../../services/eventEmitter'
import { getNowPlayingItemLocally } from '../../services/userNowPlayingItem'
import { PVAudioPlayer } from '../../services/playerAudio'
import { addOrUpdateHistoryItem, getHistoryItemsIndexLocally } from '../../services/userHistoryItem'

export const checkIfVideoFileType = (nowPlayingItem?: NowPlayingItem) => {
  return nowPlayingItem?.episodeMediaType && nowPlayingItem.episodeMediaType.indexOf('video') >= 0
}

export const videoIsLoaded = () => {
  const { player } = getGlobal()
  return player.videoInfo.videoIsLoaded
}

export const videoGetCurrentLoadedTrackId = async () => {
  let currentTrackId = ''
  try {
    const nowPlayingItem = await getNowPlayingItemLocally()
    if (checkIfVideoFileType(nowPlayingItem)) {
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
  if (checkIfVideoFileType(item)) {
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

export const videoLoadNowPlayingItem = async (
  item: NowPlayingItem,
  shouldPlay: boolean,
  forceUpdateOrderDate: boolean,
  navigation: any
) => {
  await PVAudioPlayer.reset()

  const lastPlayingItem = await getNowPlayingItemLocally()
  const historyItemsIndex = await getHistoryItemsIndexLocally()

  const { clipId, episodeId } = item
  if (!clipId && episodeId) {
    item.episodeDuration = historyItemsIndex?.episodes[episodeId]?.mediaFileDuration || 0
  }

  addOrUpdateHistoryItem(item, item.userPlaybackPosition || 0, item.episodeDuration || 0, forceUpdateOrderDate)

  navigation.navigate(PV.RouteNames.PlayerScreen)

  // load video 
  // should it just load on navigate?
  // then handle other player functions in onEvents?

  if (shouldPlay) {
    if (item && !item.clipId) {
      setTimeout(() => {
        // videoHandlePlay()
      }, 1500)
    } else if (item && item.clipId) {
      // AsyncStorage.setItem(PV.Keys.PLAYER_SHOULD_PLAY_WHEN_CLIP_IS_LOADED, 'true')
    }
  }

  if (lastPlayingItem && lastPlayingItem.episodeId && lastPlayingItem.episodeId !== item.episodeId) {
    // PVEventEmitter.emit(PV.Events.PLAYER_NEW_EPISODE_LOADED)
  }

  return item
}
