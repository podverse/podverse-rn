import { NowPlayingItem } from 'podverse-shared'
import { checkIfVideoFileType } from '../../lib/utility'

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
