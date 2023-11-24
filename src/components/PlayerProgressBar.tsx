import debounce from 'lodash/debounce'
import { convertSecToHHMMSS, getMediaRefStartPosition } from 'podverse-shared'
import { useState } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import { Slider } from 'react-native-elements'
import React, { getGlobal, setGlobal, useGlobal } from 'reactn'
import { useProgress } from 'react-native-track-player'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { playerHandleSeekTo } from '../services/player'
import {
  loadChapterPlaybackInfoForTime,
  loadChapterPlaybackInfo,
  pauseChapterInterval,
  resumeChapterInterval
} from '../state/actions/playerChapters'
import { sliderStyles } from '../styles'
import { Text } from '.'

type Props = {
  backupDuration?: number | null
  clipEndTime?: number | null
  clipStartTime?: number | null
  currentTocChaptersStartTimePositions?: number[]
  globalTheme: any
  isLiveItem?: boolean
  isLoading?: boolean
  isMakeClipScreen?: boolean
  onlySlider?: boolean
  value: number
}

let parentScopeDuration = 0

/* Only allow the onValueChange logic to run every 100 milliseconds */
let lastOnValueChangeTime = Date.now()
const handleOnValueChange = (newProgressValue: number) => {
  const currentTime = Date.now()
  if (currentTime - 100 > lastOnValueChangeTime) {
    lastOnValueChangeTime = currentTime
    const slidingPositionOverride = newProgressValue * parentScopeDuration
    setGlobal({ slidingPositionOverride })
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
      const innerPosition = newProgressValue * parentScopeDuration
      const haptic = true
      loadChapterPlaybackInfoForTime(innerPosition, haptic)
    }
  }
}

/* Make sure the chapter is updated one more time after the last onValueChange event */
const debouncedOnValueChangeChapterTime = debounce(handleOnValueChangeChapter, 750, {
  leading: false,
  trailing: true
})

export function PlayerProgressBar(props: Props) {
  let isAnimationRunning = false

  const [localState, setLocalState] = useState({
    clipColorAnimation: new Animated.Value(0)
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

  const {
    backupDuration,
    clipEndTime,
    clipStartTime,
    currentTocChaptersStartTimePositions,
    isLiveItem,
    isLoading,
    isMakeClipScreen,
    onlySlider
  } = props
  const { position } = useProgress()
  const { duration } = useProgress()
  const [player] = useGlobal('player')
  const [screen] = useGlobal('screen')
  const [slidingPositionOverride] = useGlobal('slidingPositionOverride')
  const { screenWidth } = screen
  const { videoDuration, videoPosition } = player.videoInfo

  const backgroundColorInterpolator = localState.clipColorAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [PV.Colors.skyLight + '99', PV.Colors.yellow + '99']
  })

  // If no item is currently in the PVAudioPlayer, fallback to use the
  // last loaded item's duration (backupDuration).

  if (duration > 0) {
    parentScopeDuration = duration
  } else if (videoDuration > 0) {
    parentScopeDuration = videoDuration
  } else if (backupDuration && backupDuration > 0) {
    parentScopeDuration = backupDuration
  }

  const outerPosition = slidingPositionOverride || position || videoPosition || 0
  const newProgressValue = parentScopeDuration > 0 ? outerPosition / parentScopeDuration : 0

  const sliderWidth = screenWidth - sliderStyles.wrapper.marginHorizontal * 2
  const clipStartTimePosition = getMediaRefStartPosition(clipStartTime, sliderWidth, parentScopeDuration)

  let clipWidthBar = sliderWidth - clipStartTimePosition
  if (isMakeClipScreen && !clipEndTime) {
    clipWidthBar = 0
  } else if (parentScopeDuration && clipEndTime) {
    const endPosition = sliderWidth * (clipEndTime / parentScopeDuration)
    clipWidthBar = endPosition - clipStartTimePosition
  }

  const components = []
  if (currentTocChaptersStartTimePositions && currentTocChaptersStartTimePositions.length > 1) {
    for (const currentChaptersStartTimePosition of currentTocChaptersStartTimePositions) {
      components.push(
        <View
          key={`player-progress-bar-chapter-flag-${currentChaptersStartTimePosition}`}
          style={[sliderStyles.clipBarStyle, styles.chapterFlagView, { left: currentChaptersStartTimePosition }]}
        />
      )
    }
  }

  let durationText = parentScopeDuration > 0 ? convertSecToHHMMSS(parentScopeDuration) : '--:--'
  if (isLiveItem) {
    durationText = translate('Live')
  }

  const slider = (
    <Slider
      disabled={isLiveItem || onlySlider}
      minimumValue={0}
      maximumValue={isLoading ? 0 : 1}
      minimumTrackTintColor={PV.Colors.skyDark}
      maximumTrackTintColor={onlySlider ? 'transparent' : PV.Colors.gray}
      onSlidingStart={(newProgressValue) => {
        pauseChapterInterval()
        const slidingPositionOverride = newProgressValue * parentScopeDuration
        setGlobal({ slidingPositionOverride })
      }}
      onSlidingComplete={async (newProgressValue) => {
        const innerPosition = newProgressValue * parentScopeDuration
        await playerHandleSeekTo(innerPosition)
        loadChapterPlaybackInfo()
        resumeChapterInterval()
        /*
          slidingPositionOverride is required to make the currentTime label update with the slider's hhmmss value,
          prior to the seekTo method being called on slide complete.
          Calling PVAudioPlayer.seekTo(innerPosition) in playerHandleSeekTo causes the progress bar
          to re-render with the *last* innerPosition, before finally seeking to the new innerPosition
          and then re-rendering with the new correct innerPosition. To workaround this, I am adding
          a 3 second delay before clearing the slidingPositionOverride from local state.
        */
          setTimeout(() => {
            setGlobal({ slidingPositionOverride: null })
          }, 3000)
        }}
      onValueChange={(newProgressValue) => {
        handleOnValueChange(newProgressValue)
        debouncedOnValueChange(newProgressValue)
        handleOnValueChangeChapter(newProgressValue)
        debouncedOnValueChangeChapterTime(newProgressValue)
      }}
      style={onlySlider ? sliderStyles.onlySliderStyle : {}}
      thumbStyle={onlySlider ? sliderStyles.onlySliderThumbStyle : sliderStyles.thumbStyle}
      thumbTintColor={PV.Colors.white}
      // NOTE: there is a crazy bug where the slider value change behavior breaks
      // (always goes to 0) if you override trackStyle with an empty array
      {...(onlySlider ? { trackStyle: sliderStyles.onlySliderTrackStyle } : {})}
      value={isLiveItem ? 0 : newProgressValue}
    />
  )

  if (onlySlider) {
    return slider
  }

  return (
    <View style={onlySlider ? sliderStyles.onlySliderWrapperStyle : sliderStyles.wrapper}>
      {slider}
      {!isLoading ? (
        <View style={sliderStyles.timeRow}>
          <Text
            accessibilityHint={translate('ARIA HINT - Current playback time')}
            accessibilityLabel={convertSecToHHMMSS(outerPosition)}
            fontSizeLargerScale={PV.Fonts.largeSizes.lg}
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            style={sliderStyles.time}>
            {convertSecToHHMMSS(outerPosition)}
          </Text>
          <Text
            accessibilityHint={translate('ARIA HINT - episode duration')}
            accessibilityLabel={duration > 0 ? convertSecToHHMMSS(parentScopeDuration) : translate('Unknown duration')}
            fontSizeLargerScale={PV.Fonts.largeSizes.lg}
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            style={sliderStyles.time}>
            {durationText}
          </Text>
        </View>
      ) : (
        <View style={sliderStyles.timeRow}>
          <Text
            accessibilityHint={translate('ARIA HINT - Current playback time')}
            accessibilityLabel={
              parentScopeDuration > 0 ? convertSecToHHMMSS(parentScopeDuration) : translate('Unknown duration')
            }
            fontSizeLargerScale={PV.Fonts.largeSizes.lg}
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            style={sliderStyles.time}>
            {'--:--'}
          </Text>
          <Text
            accessibilityHint={translate('ARIA HINT - episode duration')}
            accessibilityLabel={
              parentScopeDuration > 0 ? convertSecToHHMMSS(parentScopeDuration) : translate('Unknown duration')
            }
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
