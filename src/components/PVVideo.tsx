import { Modal, StyleSheet } from 'react-native'
import React, { getGlobal }  from 'reactn'
import Orientation from 'react-native-orientation-locker'
import Video from 'react-native-video-controls'
import { PV } from '../resources'
import PVEventEmitter from '../services/eventEmitter'
import { syncNowPlayingItemWithTrack } from '../services/playerBackgroundTimer'
import { getClipHasEnded, getPlaybackSpeed, playerCheckIfStateIsPlaying,
  playerHandleResumeAfterClipHasEnded, playerUpdateUserPlaybackPosition } from '../services/player'
import { addOrUpdateHistoryItem } from '../services/userHistoryItem'
import { getNowPlayingItemFromLocalStorage } from '../services/userNowPlayingItem'
import { videoCheckIfStateIsPlaying, videoGetDownloadedFileInfo, videoGetState,
  videoGetTrackPosition, videoResetHistoryItem, videoStateUpdateDuration, videoStateUpdatePosition,
  videoUpdatePlaybackState } from '../state/actions/playerVideo'

type Props = {
  disableFullscreen?: boolean
  navigation: any
}

type State = {
  Authorization?: string
  destroyPlayer: boolean
  disableOnProgress?: boolean
  isDownloadedFile: boolean
  isFullscreen: boolean
  isInitialLoad: boolean
  uri?: string
}

// let hasMounted = false

export class PVVideo extends React.PureComponent<Props, State> {
  videoRef: any | null = null
  willFocusListener: any

  constructor(props) {
    super(props)

    this.state = {
      destroyPlayer: false,
      isDownloadedFile: false,
      isFullscreen: false,
      isInitialLoad: true
    }
  }

  componentDidMount() {
    const { navigation } = this.props
    PVEventEmitter.on(PV.Events.PLAYER_VIDEO_PLAYBACK_STATE_CHANGED, this._handlePlaybackStateChange)
    PVEventEmitter.on(PV.Events.PLAYER_VIDEO_SEEK_TO, this._handleSeekTo)
    PVEventEmitter.on(PV.Events.PLAYER_VIDEO_NAVIGATE_DEEPER_INTO_STACK, this._handleDestroyPlayer)
    // if (!hasMounted) {
    //   hasMounted = true
    //   this._handleWillAppear()
    // }
    this.willFocusListener = navigation.addListener('willFocus', this._handleWillAppear)
  }

  componentWillUnmount() {
    PVEventEmitter.removeListener(PV.Events.PLAYER_VIDEO_PLAYBACK_STATE_CHANGED, this._handlePlaybackStateChange)
    PVEventEmitter.removeListener(PV.Events.PLAYER_VIDEO_SEEK_TO, this._handleSeekTo)
    this.willFocusListener.remove()
  }

  _handleDestroyPlayer = () => {
    this.setState({ destroyPlayer: true })
  }

  _handleWillAppear = () => {
    console.log('_handleWillAppear')
    this.setState({ destroyPlayer: false, isInitialLoad: false }, () => {
      (async () => {
        try {
          const { player } = this.global
          let { nowPlayingItem } = player
            // nowPlayingItem will be undefined when loading from a deep link
          nowPlayingItem = nowPlayingItem || {}
          let uri = nowPlayingItem.episodeMediaUrl
    
          const { Authorization, filePath, isDownloadedFile } = await videoGetDownloadedFileInfo(nowPlayingItem)
    
          if (isDownloadedFile && filePath) {
            uri = filePath
          }
    
          await this._setupNowPlayingItemPlayer()
    
          this.setState({
            Authorization,
            isDownloadedFile,
            uri
          })
        } catch (error) {
          console.log('PVVideo componentDidMount error', error)
        }
      })()
    })
  }


  _disableFullscreen = () => {
    this._handleScreenChange()
    Orientation.lockToPortrait()
    this.setState({ isFullscreen: false }, () => {
      const { playbackState: lastPlaybackState } = this.global.player
      if (videoCheckIfStateIsPlaying(lastPlaybackState)) {
        this._handlePlay()
      }
    })
  }

  _enableFullscreen = () => {
    this._handleScreenChange()
    Orientation.unlockAllOrientations()
    Orientation.lockToLandscape()
    this.setState({ isFullscreen: true }, () => {
      const { playbackState: lastPlaybackState } = this.global.player
      if (videoCheckIfStateIsPlaying(lastPlaybackState)) {
        this._handlePlay()
      }
    })
  }

  _handleScreenChange = () => {
    const { playbackState: lastPlaybackState } = this.global.player
    const setClipTime = false
    videoUpdatePlaybackState(PV.Player.videoInfo.videoPlaybackState.paused, async () => {
      await this._setupNowPlayingItemPlayer(setClipTime)
      if (videoCheckIfStateIsPlaying(lastPlaybackState)) {
        await this._handlePlay()
      }
    })
  }

  _handlePlaybackStateChange = () => {
    const globalState = getGlobal()
    const { playbackState } = globalState.player
    if (videoCheckIfStateIsPlaying(playbackState)) {
      this._handlePlay()
    } else {
      this._handlePause()
    }
  }

  _handleResumeAfterClipHasEnded = async () => {
    let shouldContinue = true
    const { nowPlayingItem } = this.global.player
    const { clipEndTime } = nowPlayingItem
    const clipHasEnded = await getClipHasEnded()
    const currentPosition = await videoGetTrackPosition()
    const currentState = await videoGetState()
    const isPlaying = videoCheckIfStateIsPlaying(currentState)
    const shouldHandleAfterClip = clipHasEnded && clipEndTime && currentPosition >= clipEndTime && isPlaying
    if (shouldHandleAfterClip) {
      await playerHandleResumeAfterClipHasEnded()
      shouldContinue = false
    }
    return shouldContinue
  }

  _handlePlay = async () => {
    const { nowPlayingItem } = this.global.player
    if (nowPlayingItem.clipId) {
      await this._handleResumeAfterClipHasEnded()
    }

    const playbackRate = await getPlaybackSpeed()
    this.videoRef.setState({ rate: playbackRate })
    videoUpdatePlaybackState(PV.Player.videoInfo.videoPlaybackState.playing)
    playerUpdateUserPlaybackPosition()
  }

  _handlePause = () => {
    videoUpdatePlaybackState(PV.Player.videoInfo.videoPlaybackState.paused)
    playerUpdateUserPlaybackPosition()
  }

  // Use delay when trying to seek after initial load to give the player time to finish loading
  _handleSeekTo = (position: number, withDelay?: boolean) => {
    this.setState({ disableOnProgress: true }, () => {
      videoStateUpdatePosition(position, () => {
        setTimeout(() => {
          if (position >= 0) {
            this.videoRef.seekTo(position)
          }
          this.setState({ disableOnProgress: false })
        }, withDelay ? 1000 : 0)
      })
    })
  }

  /* If there is still a videoPosition in globalState, use that instead of
     digging it out of the local storage. This is needed to handle going in
     and out of fullscreen mode immediately. */
  _setupNowPlayingItemPlayer = async (setClipTime = true) => {
    const { player } = getGlobal()
    const { nowPlayingItem, videoInfo } = player
    const { videoPosition: lastVideoPosition } = videoInfo
    const withDelay = true
    if (nowPlayingItem.clipId && setClipTime && lastVideoPosition < nowPlayingItem.clipEndTime) {
      syncNowPlayingItemWithTrack()
    } else if (lastVideoPosition) {
      this._handleSeekTo(lastVideoPosition, withDelay)
    } else {
      const nowPlayingItemFromHistory = await getNowPlayingItemFromLocalStorage(
        nowPlayingItem.clipId || nowPlayingItem.episodeId
      )
        
      this._handleSeekTo(
        nowPlayingItemFromHistory
          ? nowPlayingItemFromHistory.userPlaybackPosition
          : nowPlayingItem.userPlaybackPosition,
        withDelay
      )
    }
  }

  _handleEnd = () => {
    this._handlePause()
  }

  render() {
    const { disableFullscreen } = this.props
    const { Authorization, destroyPlayer, isFullscreen, isInitialLoad, uri } = this.state
    const { player, userAgent } = this.global
    const { playbackState } = player
    
    // nowPlayingItem will be undefined when loading from a deep link
    let { nowPlayingItem } = player
    nowPlayingItem = nowPlayingItem || {}

    const pvVideo = (
      <Video
        disableBack={!isFullscreen}
        disablePlayPause={!isFullscreen}
        disableSeekbar={!isFullscreen}
        disableTimer
        disableVolume
        disableFullscreen={isFullscreen || disableFullscreen}
        onBack={this._disableFullscreen}
        onEnd={() => {
          videoResetHistoryItem()
          this._handlePause()
        }}
        onEnterFullscreen={this._enableFullscreen}
        // onError={() => {
        //   console.log('onError')
        // }}
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
          if (!disableOnProgress) {
            const { currentTime } = payload
            videoStateUpdatePosition(currentTime)
          }
        }}
        // onReadyForDisplay={}
        paused={!isInitialLoad && !playerCheckIfStateIsPlaying(playbackState)}
        poster={nowPlayingItem.episodeImageUrl || nowPlayingItem.shrunkPodcastImageUrl}
        progressUpdateInterval={1000}
        /* The props.rate is only used in the Video constructor.
           Call this.videoRef.setState({ rate }) to change the rate. */
        rate={1}
        ref={(ref: Video) => (this.videoRef = ref)}
        source={{
          uri,
          headers: {
            'User-Agent': userAgent,
            ...(Authorization ? { Authorization } : {})
          }
        }}
        style={styles.videoMini} />
    )

    return (
      <>
        {
          isFullscreen && (
            <Modal
              supportedOrientations={['portrait', 'landscape']}
              style={{ height: 200, width: 200, position: 'relative' }}
              transparent={false}
              visible>
              {!destroyPlayer && pvVideo}
            </Modal>
          )
        }
        {
          !isFullscreen && pvVideo
        }
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
