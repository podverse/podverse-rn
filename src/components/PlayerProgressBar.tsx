import { Animated, Dimensions, View } from 'react-native'
import { Slider } from 'react-native-elements'
import React from 'reactn'
import { convertSecToHHMMSS } from '../lib/utility'
import { PV } from '../resources'
import { PVTrackPlayer, setPlaybackPosition } from '../services/player'
import { loadChapterPlaybackInfo } from '../state/actions/playerChapters'
import { sliderStyles } from '../styles'
import { Text } from './'

type Props = {
  backupDuration?: number | null
  clipEndTime?: number | null
  clipStartTime?: number | null
  globalTheme: any
  isLoading?: boolean
  isMakeClipScreen?: boolean
  value: number
}

type State = {
  bufferedPosition: number
  duration: number
  position: number
  slidingPosition: number | null
  clipColorAnimation: any
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

  isAnimationRunning: boolean

  constructor(props: Props) {
    super(props)

    this.isAnimationRunning = false

    this.state = {
      bufferedPosition: 0,
      duration: 0,
      position: 0,
      slidingPosition: null,
      clipColorAnimation: new Animated.Value(0)
    }
  }

  _handleAnimation = () => {
    if (this.isAnimationRunning) return
    this.isAnimationRunning = true

    Animated.timing(this.state.clipColorAnimation, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false
    }).start(() => {
      Animated.timing(this.state.clipColorAnimation, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: false
      }).start(() => {
        this._handleAnimation()
      })
    })
  }

  render() {
    const { backupDuration, clipEndTime, clipStartTime, isLoading, isMakeClipScreen } = this.props
    const { position, slidingPosition } = this.state

    const backgroundColorInterpolator = this.state.clipColorAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [PV.Colors.skyLight + '99', PV.Colors.yellow + '99']
    })

    // If no item is currently in the TrackPlayer, fallback to use the
    // last loaded item's duration (backupDuration).
    let { duration } = this.state
    duration = duration > 0 ? duration : backupDuration || 0

    const pos = slidingPosition || position
    const value = duration > 0 ? pos / duration : 0

    let clipStartTimePosition = 0
    const sliderWidth = Dimensions.get('screen').width - sliderStyles.wrapper.marginHorizontal * 2

    if (duration && clipStartTime) {
      clipStartTimePosition = sliderWidth * (clipStartTime / duration)
    }

    let clipWidthBar = sliderWidth - clipStartTimePosition
    if (isMakeClipScreen && !clipEndTime) {
      clipWidthBar = 0
    } else if (duration && clipEndTime) {
      const endPosition = sliderWidth * (clipEndTime / duration)
      clipWidthBar = endPosition - clipStartTimePosition
    }

    return (
      <View style={sliderStyles.wrapper}>
        <Slider
          minimumValue={0}
          maximumValue={isLoading ? 0 : 1}
          minimumTrackTintColor={PV.Colors.skyDark}
          maximumTrackTintColor={PV.Colors.gray}
          onSlidingComplete={async (value) => {
            const position = value * duration

            this.setState({
              position,
              slidingPosition: null
            })

            await setPlaybackPosition(position)
            await loadChapterPlaybackInfo()
          }}
          onValueChange={(value) =>
            this.setState({ slidingPosition: value * duration }, () => {
              setTimeout(() => this.setState({ slidingPosition: null }), 500)
            })
          }
          thumbStyle={sliderStyles.thumbStyle}
          thumbTintColor={PV.Colors.white}
          value={isLoading ? 0 : value}
        />
        {!isLoading ? (
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
        ) : (
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
        {!!clipStartTimePosition && (
          <Animated.View
            style={[
              sliderStyles.clipBarStyle,
              {
                backgroundColor: backgroundColorInterpolator,
                width: clipWidthBar,
                left: clipStartTimePosition
              }
            ]}
            onLayout={() => {
              this._handleAnimation()
            }}
          />
        )}
      </View>
    )
  }
}
