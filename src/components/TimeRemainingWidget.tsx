import { convertToNowPlayingItem } from 'podverse-shared'
import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { useGlobal } from 'reactn'
import { checkIfNowPlayingItem, requestAppStoreReviewForEpisodePlayed } from '../lib/utility'
import { PV } from '../resources'
import { playerHandlePlayWithUpdate, playerCheckIfStateIsPlaying,
  playerSetPosition, 
  playerGetState} from '../services/player'
import { audioCheckIfIsPlaying } from '../services/playerAudio'
import { playerLoadNowPlayingItem, playerTogglePlay } from '../state/actions/player'
import { Icon, MoreButton, Text, View } from './'

type Props = {
  clipTime?: string
  episodeCompleted?: boolean
  episodeDownloading?: boolean
  handleMorePress?: any
  isChapter?: boolean
  item: any
  itemType: 'episode' | 'clip'
  loadTimeStampOnPlay?: boolean
  mediaFileDuration?: number | undefined
  style?: any
  testID: string
  timeLabel?: string
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

export const TimeRemainingWidget = (props: Props) => {
  const { episodeCompleted, episodeDownloading, handleMorePress, item, itemType,
    loadTimeStampOnPlay, mediaFileDuration, style, testID, timeLabel, transparent,
    userPlaybackPosition } = props
  const { episode = {}, podcast = {} } = item
  const playingItem = convertToNowPlayingItem(item, episode, podcast, userPlaybackPosition)
  const [player] = useGlobal('player')
  const { nowPlayingItem, playbackState } = player

  const hasStartedItem = !!mediaFileDuration
  const totalTime = mediaFileDuration || playingItem.episodeDuration || 0
  const playedTime = userPlaybackPosition || 0

  const handleChapterLoad = async () => {
    await playerSetPosition(item.startTime)
    const playbackState = await playerGetState()
    const isPlaying = playerCheckIfStateIsPlaying(playbackState)
    if (!isPlaying) {
      playerHandlePlayWithUpdate()
    }
  }

  const playItem = async () => {
    const isNowPlayingItem = checkIfNowPlayingItem(item, nowPlayingItem)

    if (loadTimeStampOnPlay) {
      await handleChapterLoad()
    } else {
      if (isNowPlayingItem) {
        playerTogglePlay()
      } else {
        const forceUpdateOrderDate = false
        const shouldPlay = true
        const setCurrentItemNextInQueue = true
        playerLoadNowPlayingItem(playingItem, shouldPlay, forceUpdateOrderDate, setCurrentItemNextInQueue)
      }
    }
    requestAppStoreReviewForEpisodePlayed()
  }

  const isInvalidDuration = totalTime <= 0
  const isPlaying = audioCheckIfIsPlaying(playbackState)
  const isNowPlayingItem = isPlaying && checkIfNowPlayingItem(item, nowPlayingItem)

  const iconStyle = isNowPlayingItem ? styles.playButton : [styles.playButton, { paddingLeft: 2 }]

  return (
    <View style={[styles.container, style]} transparent={transparent}>
      <TouchableOpacity
        accessible={false}
        importantForAccessibility='no-hide-descendants'
        onPress={playItem}
        style={iconStyle}
        testID={`${testID}_time_remaining_widget_toggle_play`.prependTestId()}>
        {isNowPlayingItem
          ? <Icon name={'pause'} size={13} />
          : <Icon name={'play'} size={13} />
        }
      </TouchableOpacity>
      {(hasStartedItem && !isInvalidDuration && playedTime > 0 && !episodeCompleted) && (
        <MiniProgressBar item={isNowPlayingItem} playedTime={playedTime || 0} totalTime={totalTime} />
      )}
      <View
        accessible={false}
        importantForAccessibility='no-hide-descendants'
        style={{ flexDirection: 'row', flex: 1, alignItems: 'center', height: '100%' }}>
        <Text
          accessible={false}
          fontSizeLargerScale={PV.Fonts.largeSizes.md}
          fontSizeLargestScale={PV.Fonts.largeSizes.sm}
          importantForAccessibility='no-hide-descendants'
          style={styles.text}>
          {timeLabel}
        </Text>
        {!!episodeCompleted && !userPlaybackPosition && (
          <Icon
            name={'check'}
            size={22}
            style={styles.iconCompleted} />
        )}
      </View>
      {!!handleMorePress && (
        <MoreButton
          handleMorePress={handleMorePress}
          isLoading={episodeDownloading}
          itemType={itemType}
          testID={testID} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  iconCompleted: {
    color: PV.Colors.green,
    paddingHorizontal: 16
  },
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
