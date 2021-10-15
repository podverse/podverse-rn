import React  from 'reactn'
import { Dimensions, StyleSheet } from 'react-native'
import Orientation from 'react-native-orientation-locker'
import Video from 'react-native-video-controls'
import { initialWindowMetrics } from 'react-native-safe-area-context'
import { PV } from '../resources'

type Props = {}

type State = {
  isFullscreen: boolean
}

export class PVVideo extends React.PureComponent<Props, State> {
  videoRef: any | null = null

  constructor(props) {
    super(props)

    this.state = {
      isFullscreen: false
    }
  }

  _disableFullscreen = () => {
    Orientation.lockToPortrait()
    this.setState({ isFullscreen: false })
  }

  _enableFullscreen = () => {
    Orientation.unlockAllOrientations()
    Orientation.lockToLandscape()
    this.setState({ isFullscreen: true })
  }

  render() {
    const { isFullscreen } = this.state

    const safeAreaInsetBottom = initialWindowMetrics?.insets.bottom || 0

    const borderHeight = 1
    const videoStyle = isFullscreen
      ? [styles.backgroundVideoFull]
      : [styles.backgroundVideoMini, { bottom: safeAreaInsetBottom + PV.Tabs.styles.height + borderHeight }]

    return (
      <Video
        disableBack
        disableTimer
        disableVolume
        onEnterFullscreen={this._enableFullscreen}
        onExitFullscreen={this._disableFullscreen}
        ref={(ref: Video) => (this.videoRef = ref)}
        source={{
          uri: 'https://noagendatube.com/static/webseed/a5765c6f-a065-434e-bb35-ed2d85798423-1080.mp4'
        }}
        style={videoStyle} />
    )
  }
}

const styles = StyleSheet.create({
  backgroundVideoFull: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  },
  backgroundVideoMini: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 82,
    height: 200
  }
})
