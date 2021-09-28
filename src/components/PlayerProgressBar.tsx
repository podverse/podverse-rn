import debounce from 'lodash/debounce'
import { useState } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native'
import { Slider } from 'react-native-elements'
import React, { getGlobal } from 'reactn'
import { useProgress } from 'react-native-track-player'
import { translate } from '../lib/i18n';
import { convertSecToHHMMSS, getMediaRefStartPosition } from '../lib/utility'
import { PV } from '../resources'
import { setPlaybackPosition } from '../services/player'
import { clearChapterInterval, getChapterForTimeAndSetOnState, loadChapterPlaybackInfo,
  startChapterInterval } from '../state/actions/playerChapters'
import { sliderStyles } from '../styles'
import { Text } from '.'

type Props = {
  backupDuration?: number | null
  clipEndTime?: number | null
  clipStartTime?: number | null
  currentChaptersStartTimePositions?: number[]
  globalTheme: any
  isLoading?: boolean
  isMakeClipScreen?: boolean
  value: number
}

let parentScopeDuration = 0

/* Only allow the onValueChange logic to run every 100 milliseconds */
let lastOnValueChangeTime = Date.now()
const handleOnValueChange = (newProgressValue: number, localState: any, setLocalState: any) => {
  const currentTime = Date.now()
  if (currentTime - 100 > lastOnValueChangeTime) {
    lastOnValueChangeTime = currentTime
    const slidingPositionOverride = newProgressValue * parentScopeDuration
    setLocalState({ ...localState, slidingPositionOverride })
  }
}

/* Make sure the position is updated one more time after the last onValueChange event */
const debouncedOnValueChange = debounce(handleOnValueChange, 750, {
  leading: false,
  trailing: true
})

/* Only allow the onValueChangeChapterTime logic to run every 500 milliseconds */
let lastOnValueChangeChapterTime = Date.now()
const handleOnValueChangeChapter = (newProgressValue: number) => {
  const { currentChapters } = getGlobal()
  if (currentChapters && currentChapters.length > 1) {
    const currentTime = Date.now()
    if (currentTime - 500 > lastOnValueChangeChapterTime) {
      lastOnValueChangeChapterTime = currentTime
      const position = newProgressValue * parentScopeDuration
      const haptic = true
      getChapterForTimeAndSetOnState(position, haptic)
    }
  }
}

/* Make sure the chapter is updated one more time after the last onValueChange event */
const debouncedOnValueChangeChapterTime = debounce(handleOnValueChangeChapter, 750, {
  leading: false,
  trailing: true
})

export function PlayerProgressBar(props: Props) {
  let isAnimationRunning = false;

  const [localState, setLocalState] = useState({   
    clipColorAnimation: new Animated.Value(0),
    slidingPositionOverride: 0
  })

  const _handleAnimation = () => {
    if (isAnimationRunning) return
    isAnimationRunning = true

    Animated.timing(localState.clipColorAnimation, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false
    }).start(() => {
      Animated.timing(localState.clipColorAnimation, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: false
      }).start(() => {
        _handleAnimation()
      })
    })
  }

  const { backupDuration, clipEndTime, clipStartTime, currentChaptersStartTimePositions,
    isLoading, isMakeClipScreen } = props;
  const { slidingPositionOverride } = localState
  const { position } = useProgress()
  const { duration } = useProgress()

  const backgroundColorInterpolator = localState.clipColorAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [PV.Colors.skyLight + '99', PV.Colors.yellow + '99']
  })

  // If no item is currently in the TrackPlayer, fallback to use the
  // last loaded item's duration (backupDuration).
  parentScopeDuration = duration > 0 ? duration : backupDuration || 0

  const pos = slidingPositionOverride || position
  const newProgressValue = parentScopeDuration > 0 ? pos / parentScopeDuration : 0
  
  const sliderWidth = Dimensions.get('screen').width - sliderStyles.wrapper.marginHorizontal * 2
  const clipStartTimePosition = getMediaRefStartPosition(clipStartTime, sliderWidth, parentScopeDuration)

  let clipWidthBar = sliderWidth - clipStartTimePosition
  if (isMakeClipScreen && !clipEndTime) {
    clipWidthBar = 0
  } else if (parentScopeDuration && clipEndTime) {
    const endPosition = sliderWidth * (clipEndTime / parentScopeDuration)
    clipWidthBar = endPosition - clipStartTimePosition
  }

  const components = []
  if (currentChaptersStartTimePositions && currentChaptersStartTimePositions.length > 1) {
    for (const currentChaptersStartTimePosition of currentChaptersStartTimePositions) {
      components.push(<View style={[
        sliderStyles.clipBarStyle,
        styles.chapterFlagView,
        { left: currentChaptersStartTimePosition }
      ]} />)
    }
  }

  return (
    <View style={sliderStyles.wrapper}>
      <Slider
        minimumValue={0}
        maximumValue={isLoading ? 0 : 1}
        minimumTrackTintColor={PV.Colors.skyDark}
        maximumTrackTintColor={PV.Colors.gray}
        onSlidingStart={(newProgressValue) => {
          clearChapterInterval()
          const slidingPositionOverride = newProgressValue * parentScopeDuration
          setLocalState({ ...localState, slidingPositionOverride })
        }}
        onSlidingComplete={async (newProgressValue) => {
          const position = newProgressValue * parentScopeDuration
          await setPlaybackPosition(position)
          startChapterInterval()

          /*
            Calling TrackPlayer.seekTo(position) in setPlaybackPosition causes the progress bar
            to re-render with the *last* position, before finally seeking to the new position
            and then re-rendering with the new correct position. To workaround this, I am adding
            a 1.5 second delay before clearing the slidingPositionOverride from local state.
          */
          setTimeout(() => {
            setLocalState({ ...localState, slidingPositionOverride: 0 })
          }, 1500)

          const { currentChapters } = getGlobal()
          if (currentChapters && currentChapters.length > 1) {
            loadChapterPlaybackInfo()
          }
        }}
        onValueChange={(newProgressValue) => {
          handleOnValueChange(newProgressValue, localState, setLocalState)
          debouncedOnValueChange(newProgressValue, localState, setLocalState)
          handleOnValueChangeChapter(newProgressValue)
          debouncedOnValueChangeChapterTime(newProgressValue)
        }}
        thumbStyle={sliderStyles.thumbStyle}
        thumbTintColor={PV.Colors.white}
        value={isLoading ? 0 : newProgressValue}
      />
      {!isLoading ? (
        <View style={sliderStyles.timeRow}>
          <Text
            accessibilityHint={translate('ARIA HINT - Current playback time')}
            accessibilityLabel={convertSecToHHMMSS(slidingPositionOverride || position)}
            fontSizeLargerScale={PV.Fonts.largeSizes.lg}
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            style={sliderStyles.time}>
            {convertSecToHHMMSS(slidingPositionOverride || position)}
          </Text>
          <Text
            accessibilityHint={translate('ARIA HINT - episode duration')}
            accessibilityLabel={duration > 0 ? convertSecToHHMMSS(parentScopeDuration) : translate('Unknown duration')}
            fontSizeLargerScale={PV.Fonts.largeSizes.lg}
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            style={sliderStyles.time}>
            {parentScopeDuration > 0 ? convertSecToHHMMSS(parentScopeDuration) : '--:--'}
          </Text>
        </View>
      ) : (
        <View style={sliderStyles.timeRow}>
          <Text
            accessibilityHint={translate('ARIA HINT - Current playback time')}
            accessibilityLabel={
              parentScopeDuration > 0 ? convertSecToHHMMSS(parentScopeDuration) : translate('Unknown duration')}
            fontSizeLargerScale={PV.Fonts.largeSizes.lg}
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            style={sliderStyles.time}>
            {'--:--'}
          </Text>
          <Text
            accessibilityHint={translate('ARIA HINT - episode duration')}
            accessibilityLabel={
              parentScopeDuration > 0 ? convertSecToHHMMSS(parentScopeDuration) : translate('Unknown duration')}
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
      {components}
    </View>
  )
}

const styles = StyleSheet.create({
  chapterFlagView: {
    height: 4,
    width: 4,
    borderRadius: 2,
    backgroundColor: PV.Colors.yellow,
    top: 14,
    zIndex: 1,
    opacity: 1
  }
})
