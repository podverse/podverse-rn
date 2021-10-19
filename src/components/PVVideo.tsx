import { Modal, StyleSheet } from 'react-native'
import React, { getGlobal }  from 'reactn'
import Orientation from 'react-native-orientation-locker'
import Video from 'react-native-video-controls'
import { PV } from '../resources'
import PVEventEmitter from '../services/eventEmitter'
import { getPlaybackSpeed, playerCheckIfStateIsPlaying, playerUpdateUserPlaybackPosition } from '../services/player'
import { addOrUpdateHistoryItem } from '../services/userHistoryItem'
import { getNowPlayingItemFromLocalStorage } from '../services/userNowPlayingItem'
import { videoCheckIfStateIsPlaying, videoGetDownloadedFileInfo, videoResetHistoryItem,
  videoStateUpdateDuration, 
  videoStateUpdatePosition,
  videoUpdatePlaybackState} from '../state/actions/playerVideo'

type Props = {
  
}

type State = {
  Authorization?: string
  isDownloadedFile: boolean
  isFullscreen: boolean
  uri?: string
}

export class PVVideo extends React.PureComponent<Props, State> {
  videoRef: any | null = null

  constructor(props) {
    super(props)

    this.state = {
      isDownloadedFile: false,
      isFullscreen: false
    }
  }

  async componentDidMount() {
    try {
      PVEventEmitter.on(PV.Events.PLAYER_VIDEO_PLAYBACK_STATE_CHANGED, this._handlePlaybackStateChange)
      PVEventEmitter.on(PV.Events.PLAYER_VIDEO_SEEK_TO, this._handleSeekTo)
      
      const { player } = this.global
      let { nowPlayingItem } = player
        // nowPlayingItem will be undefined when loading from a deep link
      nowPlayingItem = nowPlayingItem || {}
      let uri = nowPlayingItem.episodeMediaUrl

      const { Authorization, filePath, isDownloadedFile } = await videoGetDownloadedFileInfo(nowPlayingItem)

      if (isDownloadedFile && filePath) {
        uri = filePath
      }

      await this._seekToLastVideoPositionOrHistoryPosition()

      this.setState({
        Authorization,
        isDownloadedFile,
        uri
      })
    } catch (error) {
      console.log('PVVideo componentDidMount error', error)
    }
  }

  componentWillUnmount() {
    PVEventEmitter.removeListener(PV.Events.PLAYER_VIDEO_PLAYBACK_STATE_CHANGED, this._handlePlaybackStateChange)
    PVEventEmitter.removeListener(PV.Events.PLAYER_VIDEO_SEEK_TO, this._handleSeekTo)
  }

  _disableFullscreen = () => {
    const { videoPosition: lastVideoPosition } = getGlobal().player.videoInfo
    this._handleSeekTo(lastVideoPosition)
    Orientation.lockToPortrait()
    this.setState({ isFullscreen: false })
  }

  _enableFullscreen = () => {
    const { videoPosition: lastVideoPosition } = getGlobal().player.videoInfo
    this._handleSeekTo(lastVideoPosition)
    Orientation.unlockAllOrientations()
    Orientation.lockToLandscape()
    this.setState({ isFullscreen: true })
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

  _handlePlay = async () => {
    const playbackRate = await getPlaybackSpeed()
    this.videoRef.setState({ rate: playbackRate })
    videoUpdatePlaybackState(PV.Player.videoInfo.videoPlaybackState.playing)
    playerUpdateUserPlaybackPosition()
  }

  _handlePause = () => {
    videoUpdatePlaybackState(PV.Player.videoInfo.videoPlaybackState.paused)
    playerUpdateUserPlaybackPosition()
  }

  _handleSeekTo = (position: number) => {
    if (position >= 0) {
      this.videoRef.seekTo(position)
    }
  }

  /* If there is still a videoPosition in globalState, use that instead of
     digging it out of the local storage. This is needed to handle going in
     and out of fullscreen mode immediately. */
  _seekToLastVideoPositionOrHistoryPosition = async () => {
    const { player } = getGlobal()
    const { nowPlayingItem, videoInfo } = player
    const { videoPosition: lastVideoPosition } = videoInfo
    if (lastVideoPosition) {
      this._handleSeekTo(lastVideoPosition)
    } else {
      const nowPlayingItemFromHistory = await getNowPlayingItemFromLocalStorage(
        nowPlayingItem.clipId || nowPlayingItem.episodeId
      )
  
      this._handleSeekTo(
        nowPlayingItemFromHistory
          ? nowPlayingItemFromHistory.userPlaybackPosition
          : nowPlayingItem.userPlaybackPosition
      )
    }
  }

  _handleEnd = () => {
    this._handlePause()
  }

  render() {
    const { Authorization, isFullscreen, uri } = this.state
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
        disableFullscreen={isFullscreen}
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
          const { currentTime } = payload
          videoStateUpdatePosition(currentTime)
        }}
        onReadyForDisplay={async () => {
          /* If a videoPosition is in globalState, resume from that time.
          This is needed to handle switching between fullscreen and back. */
          await this._seekToLastVideoPositionOrHistoryPosition()
          
          this._handlePlay()

          /* Call immediately when readyForDisplay to make sure the duration
             is saved to userHistoryItems. */
          playerUpdateUserPlaybackPosition()
        }}
        paused={!playerCheckIfStateIsPlaying(playbackState)}
        poster={nowPlayingItem.episodeImageUrl || nowPlayingItem.shrunkPodcastImageUrl}
        progressUpdateInterval={1000}
        /* The props.rate is only used in the Video constructor.
           Call this.videoRef.setState({ rate }) to change the rate. */
        // rate={0}
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
              {pvVideo}
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
