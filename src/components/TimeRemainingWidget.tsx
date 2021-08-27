import { convertToNowPlayingItem } from 'podverse-shared'
import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { State as RNTPState } from 'react-native-track-player'
import { useGlobal } from 'reactn'
import { translate } from '../lib/i18n'
import { convertSecToHhoursMMinutes, requestAppStoreReviewForEpisodePlayed } from '../lib/utility'
import { PV } from '../resources'
import { handlePlay, PVTrackPlayer, setPlaybackPosition } from '../services/player'
import { loadItemAndPlayTrack, togglePlay } from '../state/actions/player'
import { Icon, MoreButton, Text, View } from './'

type Props = {
  clipTime?: string
  episodeDownloading?: boolean
  handleMorePress?: any
  isChapter?: boolean
  item: any
  loadTimeStampOnPlay?: boolean
  mediaFileDuration?: number | undefined
  style?: any
  testID: string
  transparent?: boolean
  userPlaybackPosition?: number | undefined
}

type BarProps = {
  item: any
  playedTime: number
  totalTime: number
}

const MiniProgressBar = (props: BarProps) => {
  const [fillerWidth, setFillerWidth] = useState(0)
  const { item, playedTime, totalTime } = props
  const percentage = playedTime ? (playedTime / totalTime) * 100 : 0

  const barWidth = '30%'
  const bar = {
    marginRight: 10,
    height: 3,
    width: barWidth,
    backgroundColor: PV.Colors.brandBlueDark
  }

  const filler = {
    height: 3,
    backgroundColor: PV.Colors.white,
    width: fillerWidth
  }

  const episodeId = item && item.episodeId

  // Change key based on episodeId and playedTime so the cell calls onLayout again
  // whenever playedTime changes.
  const viewKey = `${episodeId}-${playedTime}`

  return (
    <View
      key={viewKey}
      onLayout={(e) => {
        setFillerWidth(e.nativeEvent.layout.width * (percentage / 100))
      }}
      style={bar}>
      <View style={filler} />
    </View>
  )
}

const checkIfNowPlayingItem = (item?: any, nowPlayingItem?: any) => {
  return item && nowPlayingItem && (nowPlayingItem.clipId === item.id || nowPlayingItem.episodeId === item.id)
}

export const TimeRemainingWidget = (props: Props) => {
  const { clipTime, episodeDownloading, handleMorePress, isChapter, item,
    loadTimeStampOnPlay, mediaFileDuration, style, testID, transparent, userPlaybackPosition } = props
  const { episode = {}, podcast = {} } = item
  const playingItem = convertToNowPlayingItem(item, episode, podcast, userPlaybackPosition)
  const [player] = useGlobal('player')
  const { nowPlayingItem, playbackState } = player

  const hasStartedItem = !!mediaFileDuration
  const totalTime = mediaFileDuration || playingItem.episodeDuration || 0
  const playedTime = userPlaybackPosition || 0

  let timeLabel = ''
  if (totalTime) {
    timeLabel = convertSecToHhoursMMinutes(totalTime)
    if (hasStartedItem) {
      timeLabel = convertSecToHhoursMMinutes(totalTime - playedTime) + ' left'
    }
  }

  if (clipTime) {
    timeLabel = clipTime
  }

  const handleChapterLoad = async () => {
    await setPlaybackPosition(item.startTime)
    const currentState = await PVTrackPlayer.getState()
    const isPlaying = currentState === RNTPState.Playing
    if (!isPlaying) {
      handlePlay()
    }
  }

  const playItem = async () => {
    const isNowPlayingItem = checkIfNowPlayingItem(item, nowPlayingItem)
    if (loadTimeStampOnPlay) {
      await handleChapterLoad()
    } else {
      if (isNowPlayingItem) {
        togglePlay()
      } else {
        loadItemAndPlayTrack(playingItem, true)
      }
    }
    requestAppStoreReviewForEpisodePlayed()
  }

  const isInvalidDuration = totalTime <= 0
  const isPlaying = playbackState === RNTPState.Playing
  const isNowPlayingItem = isPlaying && checkIfNowPlayingItem(item, nowPlayingItem)

  const iconStyle = isNowPlayingItem ? styles.playButton : [styles.playButton, { paddingLeft: 2 }]

  const timeViewAccessibilityHint = !clipTime
    ? translate('ARIA - This is the time remaining for this episode')
    : ''

  let playButtonAccessibilityHint = ''
  if (!clipTime) {
    playButtonAccessibilityHint = isNowPlayingItem
      ? translate('ARIA - Tap to pause this episode')
      : translate('ARIA - Tap to play this episode')
  } else if (clipTime && isChapter) {
    playButtonAccessibilityHint = isNowPlayingItem
      ? translate('ARIA - Tap to pause this chapter')
      : translate('ARIA - Tap to play this chapter')
  } else if (clipTime) {
    playButtonAccessibilityHint = isNowPlayingItem
      ? translate('ARIA - Tap to pause this clip')
      : translate('ARIA - Tap to play this clip')
  }

  return (
    <View style={[styles.container, style]} transparent={transparent}>
      <TouchableOpacity
        accessibilityHint={playButtonAccessibilityHint}
        accessibilityLabel={isNowPlayingItem
          ? translate('Pause')
          : translate('Play')
        }
        accessibilityRole='button'
        onPress={playItem}
        style={iconStyle}
        testID={`${testID}_time_remaining_widget_toggle_play`}>
        {isNowPlayingItem
          ? <Icon name={'pause'} size={13} />
          : <Icon name={'play'} size={13} />
        }
      </TouchableOpacity>
      {hasStartedItem && !isInvalidDuration && (
        <MiniProgressBar item={isNowPlayingItem} playedTime={playedTime || 0} totalTime={totalTime} />
      )}
      <View
        accessible={!clipTime}
        accessibilityHint={timeViewAccessibilityHint}
        accessibilityLabel={timeLabel
          ? timeLabel
          : translate('Unplayed episode')
        }
        style={{ flexDirection: 'row', flex: 1, alignItems: 'center', height: '100%' }}>
        <Text
          accessible={!clipTime}
          fontSizeLargerScale={PV.Fonts.largeSizes.md}
          fontSizeLargestScale={PV.Fonts.largeSizes.sm}
          style={styles.text}>
          {timeLabel}
        </Text>
      </View>
      {!!handleMorePress && (
        <MoreButton
          handleMorePress={handleMorePress}
          isLoading={episodeDownloading}
          testID={testID} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly'
  },
  text: {
    color: PV.Colors.skyLight,
    fontSize: PV.Fonts.sizes.sm
  },
  playButton: {
    borderColor: PV.Colors.skyLight,
    borderWidth: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    width: 40,
    marginRight: 10,
    backgroundColor: PV.Colors.brandBlueDark + '44'
  }
})
