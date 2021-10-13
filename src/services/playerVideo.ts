import { getGlobal } from 'reactn'
import { checkIfVideoFileType } from '../lib/utility'
import { getNowPlayingItemLocally } from './userNowPlayingItem'

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


