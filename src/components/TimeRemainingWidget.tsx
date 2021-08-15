import { convertToNowPlayingItem } from 'podverse-shared'
import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { State as RNTPState } from 'react-native-track-player'
import { useGlobal } from 'reactn'
import { convertSecToHhoursMMinutes, testProps, requestAppStoreReviewForEpisodePlayed } from '../lib/utility'
import { PV } from '../resources'
import { handlePlay, PVTrackPlayer, setPlaybackPosition } from '../services/player'
import { loadItemAndPlayTrack, togglePlay } from '../state/actions/player'
import { Icon, MoreButton, Text, View } from './'

type Props = {
  clipTime?: string
  episodeDownloading?: boolean
  handleMorePress?: any
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
  const { clipTime, episodeDownloading, handleMorePress, item,
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

  return (
    <View style={[styles.container, style]} transparent={transparent}>
      <TouchableOpacity
        onPress={playItem}
        style={iconStyle}
        {...testProps(`${testID}_time_remaining_widget_toggle_play`)}>
        {isNowPlayingItem ? <Icon name={'pause'} size={13} /> : <Icon name={'play'} size={13} />}
      </TouchableOpacity>
      {hasStartedItem && !isInvalidDuration && (
        <MiniProgressBar item={isNowPlayingItem} playedTime={playedTime || 0} totalTime={totalTime} />
      )}
      <Text
        fontSizeLargerScale={PV.Fonts.largeSizes.md}
        fontSizeLargestScale={PV.Fonts.largeSizes.sm}
        style={styles.text}>
        {timeLabel}
      </Text>
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
    flex: 1,
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
