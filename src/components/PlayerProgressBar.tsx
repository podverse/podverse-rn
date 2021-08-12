import {useState, useEffect} from 'react';
import { Animated, Dimensions, View } from 'react-native'
import { Slider } from 'react-native-elements'
import React from 'reactn'
import { convertSecToHHMMSS } from '../lib/utility'
import { PV } from '../resources'
import { setPlaybackPosition } from '../services/player'
import { loadChapterPlaybackInfo } from '../state/actions/playerChapters'
import { sliderStyles } from '../styles'
import { Text } from '.'


type Props = {
  backupDuration?: number | null
  clipEndTime?: number | null
  clipStartTime?: number | null
  globalTheme: any
  isLoading?: boolean
  isMakeClipScreen?: boolean
  value: number
}

// type State = {
//   bufferedPosition: number
//   duration: number
//   position: number
//   slidingPosition: number | null
//   clipColorAnimation: any
// }

let lastPropsValue = 0;

export function PlayerProgressBar(props: Props) {
  let isAnimationRunning = false;
  const {value} = props;
  const [state, setState] = useState({   
    bufferedPosition: 0,
    duration: 0,
    position: 0,
    slidingPosition: null,
    clipColorAnimation: new Animated.Value(0)
  })

  useEffect(()=>{
    if (value && value!== state.position && value !== lastPropsValue){
      lastPropsValue = value
      setState({
        ...state,
        position: value,
      })
    }
  }, [value])

  const _handleAnimation = () => {
    if (isAnimationRunning) return
    isAnimationRunning = true

    Animated.timing(state.clipColorAnimation, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false
    }).start(() => {
      Animated.timing(state.clipColorAnimation, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: false
      }).start(() => {
        _handleAnimation()
      })
    })
  }

  const { backupDuration, clipEndTime, clipStartTime, isLoading, isMakeClipScreen } = props;
  const { position, slidingPosition } = state

  const backgroundColorInterpolator = state.clipColorAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [PV.Colors.skyLight + '99', PV.Colors.yellow + '99']
  })

    // If no item is currently in the TrackPlayer, fallback to use the
    // last loaded item's duration (backupDuration).
    let { duration } = state
    duration = duration > 0 ? duration : backupDuration || 0

    const pos = slidingPosition || position
    const newProgressValue = duration > 0 ? pos / duration : 0

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
        onSlidingStart={(newProgressValue) => {
          setState({ ...state, slidingPosition: newProgressValue * duration })
        }}
        onSlidingComplete={async (newProgressValue) => {
          const position = newProgressValue * duration

          setState({
            ...state,
            position,
            slidingPosition: null
          })

          await setPlaybackPosition(position)
          loadChapterPlaybackInfo()
        }}
        onValueChange={(newProgressValue) => {
          if (state.slidingPosition) {
            setState({ ...state, slidingPosition: newProgressValue * duration })
          }
        }}
        thumbStyle={sliderStyles.thumbStyle}
        thumbTintColor={PV.Colors.white}
        value={isLoading ? 0 : newProgressValue}
      />
      {!isLoading ? (
        <View style={sliderStyles.timeRow}>
          <Text
            fontSizeLargerScale={PV.Fonts.largeSizes.lg}
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            style={sliderStyles.time}>
            {convertSecToHHMMSS(slidingPosition || position)}
          </Text>
          <Text
            fontSizeLargerScale={PV.Fonts.largeSizes.lg}
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            style={sliderStyles.time}>
            {duration > 0 ? convertSecToHHMMSS(duration) : '--:--'}
          </Text>
        </View>
      ) : (
        <View style={sliderStyles.timeRow}>
          <Text
            fontSizeLargerScale={PV.Fonts.largeSizes.lg}
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            style={sliderStyles.time}>
            {'--:--'}
          </Text>
          <Text
            fontSizeLargerScale={PV.Fonts.largeSizes.lg}
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            style={sliderStyles.time}>
            {'--:--'}
          </Text>
        </View>
      )}
      {!!clipStartTimePosition && !!clipEndTime && (
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
            _handleAnimation()
          }}
        />
      )}
    </View>
  )
}