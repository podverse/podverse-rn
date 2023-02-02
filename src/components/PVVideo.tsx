import { addParameterToURL, convertUrlToSecureHTTPS, encodeSpacesInString } from 'podverse-shared'
import { Modal, StyleSheet } from 'react-native'
import React from 'reactn'
import Orientation from 'react-native-orientation-locker'
import Video from 'react-native-video-controls'
import { debugLogger, errorLogger } from '../lib/logger'
import { pvIsTablet } from '../lib/deviceDetection'
import { PV } from '../resources'
import PVEventEmitter from '../services/eventEmitter'
import { syncNowPlayingItemWithTrack } from '../services/playerBackgroundTimer'
import {
  getClipHasEnded,
  getPlaybackSpeed,
  playerCheckIfStateIsPlaying,
  playerHandleResumeAfterClipHasEnded,
  playerUpdateUserPlaybackPosition
} from '../services/player'
import { addOrUpdateHistoryItem } from '../services/userHistoryItem'
import { getNowPlayingItemFromLocalStorage } from '../services/userNowPlayingItem'
import { handleValueStreamingTimerIncrement } from '../services/v4v/v4vStreaming'
import {
  videoCheckIfStateIsPlaying,
  videoGetDownloadedFileInfo,
  videoGetState,
  videoGetTrackPosition,
  videoResetHistoryItem,
  videoStateUpdateDuration,
  videoStateUpdatePosition,
  videoUpdatePlaybackState
} from '../state/actions/playerVideo'

type Props = {
  disableFullscreen?: boolean
  isMiniPlayer?: boolean
  navigation: any
}

type State = {
  Authorization?: string
  destroyPlayer: boolean
  disableOnProgress?: boolean
  fileType?: 'hls' | 'other'
  finalUri?: string
  isDownloadedFile: boolean
  isFullscreen: boolean
  isReadyToPlay: boolean
  transitionPlaybackState?: any // remember what the playback state was between navigations
}

let lastNowPlayingItemUri = ''
const _fileName = 'src/components/PVVideo.tsx'
export class PVVideo extends React.PureComponent<Props, State> {
  videoRef: any | null = null
  willFocusListener: any

  constructor(props: Props) {
    super(props)

    this.state = {
      destroyPlayer: false,
      isDownloadedFile: false,
      isFullscreen: false,
      isReadyToPlay: false
    }
  }

  componentDidMount() {
    const { isMiniPlayer, navigation } = this.props
    PVEventEmitter.on(PV.Events.PLAYER_VIDEO_DESTROY_PRIOR_PLAYERS, this._handleDestroyPlayer)
    PVEventEmitter.on(PV.Events.PLAYER_VIDEO_NEW_CLIP_ITEM_LOADED, this._handleNewClipItemShouldLoad)
    PVEventEmitter.on(PV.Events.PLAYER_VIDEO_NEW_EPISODE_ITEM_LOADED, this._handleNewEpisodeItemShouldLoad)
    PVEventEmitter.on(PV.Events.PLAYER_VIDEO_PLAYBACK_STATE_CHANGED, this._handlePlaybackStateChange)
    PVEventEmitter.on(PV.Events.PLAYER_VIDEO_SEEK_TO, this._handleSeekTo)
    PVEventEmitter.on(PV.Events.PLAYER_VIDEO_LIVE_GO_TO_CURRENT_TIME, this._handleGoToLiveCurrentTime)

    if (isMiniPlayer) {
      const { player } = this.global
      let { nowPlayingItem } = player
      // nowPlayingItem will be undefined when loading from a deep link
      nowPlayingItem = nowPlayingItem || {}
      if (nowPlayingItem.clipId) {
        this._handleNewClipItemShouldLoad()
      } else {
        this._handleNewEpisodeItemShouldLoad()
      }
    } else {
      this._handleInitializeState()
    }

    this.willFocusListener = navigation.addListener('willFocus', this._handleNewEpisodeItemShouldLoad)
  }

  componentWillUnmount() {
    PVEventEmitter.removeListener(PV.Events.PLAYER_VIDEO_DESTROY_PRIOR_PLAYERS, this._handleDestroyPlayer)
    PVEventEmitter.removeListener(PV.Events.PLAYER_VIDEO_NEW_CLIP_ITEM_LOADED, this._handleNewClipItemShouldLoad)
    PVEventEmitter.removeListener(PV.Events.PLAYER_VIDEO_NEW_EPISODE_ITEM_LOADED, this._handleNewEpisodeItemShouldLoad)
    PVEventEmitter.removeListener(PV.Events.PLAYER_VIDEO_PLAYBACK_STATE_CHANGED, this._handlePlaybackStateChange)
    PVEventEmitter.removeListener(PV.Events.PLAYER_VIDEO_SEEK_TO, this._handleSeekTo)
    PVEventEmitter.removeListener(PV.Events.PLAYER_VIDEO_LIVE_GO_TO_CURRENT_TIME, this._handleGoToLiveCurrentTime)
  }

  _handleInitializeState = async (callback?: any) => {
    const { player } = this.global
    let { nowPlayingItem } = player
    // nowPlayingItem will be undefined when loading from a deep link
    nowPlayingItem = nowPlayingItem || {}
    const uri = nowPlayingItem.episodeMediaUrl
    let finalUri = encodeSpacesInString(convertUrlToSecureHTTPS(uri || '').trim())

    const { Authorization, filePath, fileType, isDownloadedFile } = await videoGetDownloadedFileInfo(
      nowPlayingItem
    )

    if (isDownloadedFile && filePath) {
      finalUri = filePath
    }

    this.setState({
      Authorization,
      fileType,
      finalUri,
      isDownloadedFile
    }, () => {
      if (callback) {
        callback()
      }
    })
  }

  _handleGoToLiveCurrentTime = () => {
    try {
      const { finalUri } = this.state
      if (finalUri) {
        const refreshUri = addParameterToURL(finalUri, `forceRefresh=${Date.now()}`)
        if (refreshUri) {
          this.setState({ finalUri: refreshUri })
        }
      }
    } catch (error) {
      errorLogger(_fileName, '_handleGoToLiveCurrentTime', error)
    }
  }

  _handleNewClipItemShouldLoad = () => {
    const setClipTime = true
    this._handleNewItemShouldLoad(setClipTime)
  }

  _handleNewEpisodeItemShouldLoad = () => {
    const setClipTime = false
    this._handleNewItemShouldLoad(setClipTime)
  }

  _handleNewItemShouldLoad = (setClipTime: boolean) => {
    const { playbackState } = this.global.player
    const transitionPlaybackState = playbackState
    this.setState({ transitionPlaybackState }, () => {
      videoUpdatePlaybackState(PV.Player.videoInfo.videoPlaybackState.paused, () => {
        this.setState(
          {
            destroyPlayer: false,
            isReadyToPlay: false
          },
          () => {
            (async () => {
              try {
                this._handleInitializeState(() => {
                  const { player } = this.global
                  let { nowPlayingItem } = player
                  // nowPlayingItem will be undefined when loading from a deep link
                  nowPlayingItem = nowPlayingItem || {}
                  if (setClipTime && nowPlayingItem.clipId) {
                    syncNowPlayingItemWithTrack()
                  }
                })
              } catch (error) {
                errorLogger('PVVideo _handleNewItemShouldLoad error', error)
              }
            })()
          }
        )
      })
    })
  }

  _handleScreenChange = () => {
    let { transitionPlaybackState } = this.state
    if (!transitionPlaybackState) {
      const { playbackState } = this.global.player
      transitionPlaybackState = playbackState
    }

    this.setState({ transitionPlaybackState }, () => {
      (async () => {
        await this._setupNowPlayingItemPlayer()
      })()
    })
  }

  /* If there is still a videoPosition in globalState AND the current episodeMediaUrl
     is the same as the last episodeMediaUrl, use the video position from globalState
     instead of digging it out of the local storage. This is needed to handle going in
     and out of fullscreen mode immediately. */
  _setupNowPlayingItemPlayer = async () => {
    const { player } = this.global
    const { nowPlayingItem, videoInfo } = player
    const { videoPosition: lastVideoPosition } = videoInfo
    const handlePlayAfterSeek = true

    if (nowPlayingItem.episodeMediaUrl === lastNowPlayingItemUri && lastVideoPosition) {
      this._handleSeekTo(lastVideoPosition, handlePlayAfterSeek)
    } else {
      const nowPlayingItemFromHistory = await getNowPlayingItemFromLocalStorage(
        nowPlayingItem.clipId || nowPlayingItem.episodeId
      )

      this._handleSeekTo(
        nowPlayingItemFromHistory
          ? nowPlayingItemFromHistory.userPlaybackPosition
          : nowPlayingItem.userPlaybackPosition,
        handlePlayAfterSeek
      )
    }

    lastNowPlayingItemUri = nowPlayingItem.episodeMediaUrl || ''
  }

  _handleDestroyPlayer = () => {
    this.setState({ destroyPlayer: true })
  }

  _disableFullscreen = () => {
    this._handleScreenChange()

    if (!pvIsTablet()) {
      Orientation.lockToPortrait()
    }

    this.setState({ isFullscreen: false }, () => {
      const { playbackState: lastPlaybackState } = this.global.player
      if (videoCheckIfStateIsPlaying(lastPlaybackState)) {
        this._handlePlay()
      }
    })
  }

  _enableFullscreen = () => {
    this._handleScreenChange()

    if (!pvIsTablet()) {
      Orientation.unlockAllOrientations()
      Orientation.lockToLandscape()
    }

    this.setState({ isFullscreen: true }, () => {
      const { playbackState: lastPlaybackState } = this.global.player
      if (videoCheckIfStateIsPlaying(lastPlaybackState)) {
        this._handlePlay()
      }
    })
  }

  _handlePlaybackStateChange = () => {
    const { destroyPlayer } = this.state
    if (!destroyPlayer) {
      const { playbackState } = this.global.player
      if (videoCheckIfStateIsPlaying(playbackState)) {
        this._handlePlay()
      } else {
        this._handlePause()
      }
    }
  }

  _handlePlay = async () => {
    await this._handleResumeAfterClipHasEnded()

    const playbackRate = await getPlaybackSpeed()
    this.videoRef.setState({ rate: playbackRate })
    videoUpdatePlaybackState(PV.Player.videoInfo.videoPlaybackState.playing)
    playerUpdateUserPlaybackPosition()
  }

  _handlePause = () => {
    videoUpdatePlaybackState(PV.Player.videoInfo.videoPlaybackState.paused)
    playerUpdateUserPlaybackPosition()
  }

  _handleResumeAfterClipHasEnded = async () => {
    let shouldContinue = true
    const clipHasEnded = await getClipHasEnded()
    if (clipHasEnded) {
      const { nowPlayingItem } = this.global.player
      const { clipEndTime } = nowPlayingItem
      const [currentPosition, currentState] = await Promise.all([videoGetTrackPosition(), videoGetState()])
      const isPlaying = videoCheckIfStateIsPlaying(currentState)
      const shouldHandleAfterClip = clipHasEnded && clipEndTime && currentPosition >= clipEndTime && isPlaying
      if (shouldHandleAfterClip) {
        await playerHandleResumeAfterClipHasEnded()
        shouldContinue = false
      }
    }
    return shouldContinue
  }

  _handlePlayIfShouldResumePlay = async () => {
    const { transitionPlaybackState } = this.state
    if (videoCheckIfStateIsPlaying(transitionPlaybackState)) {
      await this._handlePlay()
    }
    this.setState({ transitionPlaybackState: null })
  }

  // Use delay when trying to seek after initial load to give the player time to finish loading
  _handleSeekTo = (position: number, handlePlayAfterSeek: boolean) => {
    const { destroyPlayer } = this.state
    if (!destroyPlayer) {
      this.setState({ disableOnProgress: true }, () => {
        videoStateUpdatePosition(position, () => {
          if (position >= 0) {
            this.videoRef.seekTo(position)
          }

          // Wait a second to give it time to seek before initial play
          setTimeout(() => {
            (() => {
              this.setState(
                {
                  disableOnProgress: false,
                  isReadyToPlay: true
                },
                () => {
                  if (handlePlayAfterSeek) {
                    this._handlePlayIfShouldResumePlay()
                  }
                }
              )
            })()
          }, 1000)
        })
      })
    }
  }

  _handleEnd = () => {
    this._handlePause()
  }

  render() {
    const { disableFullscreen, isMiniPlayer } = this.props
    const { Authorization, destroyPlayer, fileType, finalUri, isFullscreen, isReadyToPlay } = this.state
    const { player, userAgent } = this.global
    const { playbackState } = player

    // nowPlayingItem will be undefined when loading from a deep link
    let { nowPlayingItem } = player
    nowPlayingItem = nowPlayingItem || {}

    const pvVideo = finalUri ? (
      <Video
        disableBack={!isFullscreen || isMiniPlayer}
        disablePlayPause={!isFullscreen || isMiniPlayer}
        disableSeekbar={!isFullscreen || isMiniPlayer}
        disableTimer
        disableVolume
        disableFullscreen={isFullscreen || disableFullscreen || isMiniPlayer}
        ignoreSilentSwitch='ignore'
        onBack={this._disableFullscreen}
        onEnd={() => {
          videoResetHistoryItem()
          this._handlePause()
        }}
        onEnterFullscreen={this._enableFullscreen}
        onError={(error) => {
          debugLogger('PVVideo onError', error)
        }}
        onLoad={(payload: any) => {
          const { duration } = payload
          videoStateUpdateDuration(duration)
          /* call addOrUpdateHistoryItem within the onLoad function of PVVideo to ensure
            we have the duration saved to userHistoryItems */
          const forceUpdateOrderDate = true
          addOrUpdateHistoryItem(
            nowPlayingItem,
            nowPlayingItem.userPlaybackPosition || 0,
            nowPlayingItem.episodeDuration || 0,
            forceUpdateOrderDate
          )

          this._handleScreenChange()
        }}
        onPause={() => {
          /* Only call in fullscreen mode you can get an infinite loop :( */
          if (this.state.isFullscreen) {
            this._handlePause()
          }
        }}
        onPlay={() => {
          /* Only call in fullscreen mode you can get an infinite loop :( */
          if (this.state.isFullscreen) {
            this._handlePlay()
          }
        }}
        onProgress={(payload: any) => {
          const { disableOnProgress } = this.state
          /* 
            This is some kind of race condition where disableOnProgress can be undefined
            for a tick while navigating between MiniPlayer and the PlayerScreen.
            In the case of undefined, we should set disableOnProgress to true,
            so a state update with an invalid position does not happen.
            Also, re: currentTime = 0, when navigating between MiniPlayer
            and PlayerScreen, the currentTime can sometimes return 0, which then
            breaks the videoPosition we have in global state.
            Ideally this would be fixed by not destroying and recreating the video
            across multiple screens...
          */
          const { currentTime } = payload
          if (!disableOnProgress && typeof disableOnProgress !== 'undefined' && currentTime !== 0) {
            videoStateUpdatePosition(currentTime)
            const isVideo = true
            handleValueStreamingTimerIncrement(isVideo)
          }
        }}
        // onReadyForDisplay={}
        paused={!isReadyToPlay || !playerCheckIfStateIsPlaying(playbackState)}
        poster={nowPlayingItem.episodeImageUrl || nowPlayingItem.podcastImageUrl}
        progressUpdateInterval={1000}
        /* The props.rate is only used in the Video constructor.
          Call this.videoRef.setState({ rate }) to change the rate. */
        rate={1}
        ref={(ref: Video) => (this.videoRef = ref)}
        source={{
          uri: finalUri,
          headers: {
            'User-Agent': userAgent,
            ...(Authorization ? { Authorization } : {})
          },
          ...(fileType === 'hls' ? { type: 'm3u8' } : {})
        }}
        style={styles.videoMini}
      />
    ) : null

    return (
      <>
        {!destroyPlayer && isFullscreen && (
          <Modal
            supportedOrientations={['portrait', 'landscape']}
            style={{ height: 200, width: 200, position: 'relative' }}
            transparent={false}
            visible>
            {pvVideo}
          </Modal>
        )}
        {!destroyPlayer && !isFullscreen && pvVideo}
      </>
    )
  }
}

const styles = StyleSheet.create({
  videoMini: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  }
})
