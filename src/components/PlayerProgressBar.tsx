import { Dimensions, View } from 'react-native'
import { Slider } from 'react-native-elements'
import React from 'reactn'
import { convertSecToHHMMSS } from '../lib/utility'
import { PV } from '../resources'
import { PVTrackPlayer, setPlaybackPosition } from '../services/player'
import { sliderStyles } from '../styles'
import { Text } from './'

type Props = {
  backupDuration?: number | null
  clipEndTime?: number | null
  clipStartTime?: number | null
  globalTheme: any
  isLoading?: boolean
  value: number
}

type State = {
  bufferedPosition: number
  duration: number
  position: number
  slidingPosition: number | null
}

let lastPropsValue = ''

export class PlayerProgressBar extends PVTrackPlayer.ProgressComponent<Props, State> {
  static getDerivedStateFromProps(nextProps: any, prevState: any) {
    const { value } = nextProps
    const { position } = prevState
    if (value && value !== position && value !== lastPropsValue) {
      lastPropsValue = value
      return {
        ...prevState,
        position: value
      }
    }
    return prevState
  }

  constructor(props: Props) {
    super(props)

    this.state = {
      bufferedPosition: 0,
      duration: 0,
      position: 0,
      slidingPosition: null
    }
  }

  render() {
    const { backupDuration, clipEndTime, clipStartTime, globalTheme, isLoading } = this.props
    const { position, slidingPosition } = this.state

    // If no item is currently in the TrackPlayer, fallback to use the
    // last loaded item's duration (backupDuration).
    let { duration } = this.state
    duration = duration > 0 ? duration : backupDuration

    const pos = slidingPosition || position
    const value = duration > 0 ? pos / duration : 0

    const clipStartTimePosition = { left: 0 }
    const clipEndTimePosition = { left: 0 }
    const screenWidth = Dimensions.get('window').width

    if (clipStartTime && duration > 0) {
      const leftPosition = screenWidth * (clipStartTime / duration)
      clipStartTimePosition.left = leftPosition
    }

    if (clipEndTime && duration > 0) {
      const leftPosition = screenWidth * (clipEndTime / duration)
      clipEndTimePosition.left = leftPosition
    }

    return (
      <View style={sliderStyles.wrapper}>
        {duration > 0 && (clipStartTime || clipStartTime === 0) && (
          <View style={[sliderStyles.clipStartTimeFlag, globalTheme.playerClipTimeFlag, clipStartTimePosition]} />
        )}
        {duration > 0 && clipEndTime && (
          <View style={[sliderStyles.clipEndTimeFlag, globalTheme.playerClipTimeFlag, clipEndTimePosition]} />
        )}
        <Slider
          minimumValue={0}
          maximumValue={isLoading ? 0 : 1}
          onSlidingComplete={(value) => {
            const position = value * duration
            setPlaybackPosition(position)
            this.setState({
              position,
              slidingPosition: null
            })
          }}
          onValueChange={(value) =>
            this.setState({ slidingPosition: value * duration }, () => {
              setTimeout(() => this.setState({ slidingPosition: null }), 500)
            })
          }
          thumbStyle={sliderStyles.thumbStyle}
          thumbTintColor={PV.Colors.brandColor}
          value={isLoading ? 0 : value}
        />
        {!isLoading && (
          <View style={sliderStyles.timeRow}>
            <Text
              fontSizeLargerScale={PV.Fonts.largeSizes.lg}
              fontSizeLargestScale={PV.Fonts.largeSizes.sm}
              style={sliderStyles.time}>
              {convertSecToHHMMSS(slidingPosition || position)}
            </Text>
            <Text
              fontSizeLargerScale={PV.Fonts.largeSizes.lg}
              fontSizeLargestScale={PV.Fonts.largeSizes.sm}
              style={sliderStyles.time}>
              {duration > 0 ? convertSecToHHMMSS(duration) : '--:--'}
            </Text>
          </View>
        )}
        {isLoading && (
          <View style={sliderStyles.timeRow}>
            <Text
              fontSizeLargerScale={PV.Fonts.largeSizes.lg}
              fontSizeLargestScale={PV.Fonts.largeSizes.sm}
              style={sliderStyles.time}>
              {'--:--'}
            </Text>
            <Text
              fontSizeLargerScale={PV.Fonts.largeSizes.lg}
              fontSizeLargestScale={PV.Fonts.largeSizes.sm}
              style={sliderStyles.time}>
              {'--:--'}
            </Text>
          </View>
        )}
      </View>
    )
  }
}
