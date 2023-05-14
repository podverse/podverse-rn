import { checkIfNowPlayingItem, convertToNowPlayingItem } from 'podverse-shared'
import React, { useState } from 'react'
import { Platform, StyleSheet } from 'react-native'
import { getGlobal } from 'reactn'
import { requestAppStoreReviewForEpisodePlayed } from '../lib/reviews'
import { PV } from '../resources'
import PVEventEmitter from '../services/eventEmitter'
import {
  playerHandlePlayWithUpdate,
  playerCheckIfStateIsPlaying,
  playerHandleSeekTo,
  playerGetState
} from '../services/player'
import { setNowPlayingItem } from '../services/userNowPlayingItem'
import { playerLoadNowPlayingItem, playerTogglePlay, playerUpdatePlayerState } from '../state/actions/player'
import { Icon, LiveStatusBadge, MoreButton, PressableWithOpacity, Text, View } from './'

type Props = {
  clipTime?: string
  episodeCompleted?: boolean
  episodeDownloading?: boolean
  forceShowProgressBar?: boolean
  handleMorePress?: any
  hidePlayButton?: boolean
  isChapter?: boolean
  item: any
  itemType: 'episode' | 'clip' | 'chapter'
  loadChapterOnPlay?: boolean
  mediaFileDuration?: number | undefined
  progressFullWidth?: boolean
  style?: any
  testID: string
  timeLabel?: string
  transparent?: boolean
  userPlaybackPosition?: number | undefined
}

type BarProps = {
  fullWidth?: boolean
  item: any
  playedTime: number
  totalTime: number
}

const MiniProgressBar = (props: BarProps) => {
  const [fillerWidth, setFillerWidth] = useState(0)
  const { fullWidth, item, playedTime, totalTime } = props
  const percentage = playedTime ? (playedTime / totalTime) * 100 : 0

  const barWidth = fullWidth ? '45%' : '30%'
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
  const {
    episodeCompleted,
    episodeDownloading,
    forceShowProgressBar,
    handleMorePress,
    hidePlayButton,
    item,
    itemType,
    loadChapterOnPlay,
    mediaFileDuration,
    progressFullWidth,
    style,
    testID,
    timeLabel,
    transparent,
    userPlaybackPosition
  } = props
  const { episode = {}, liveItem, podcast = {} } = item
  const convertedItem = convertToNowPlayingItem(item, episode, podcast, userPlaybackPosition)
  const player = getGlobal().player
  const { nowPlayingItem, playbackState } = player
  const [forceRerender, setForceRerender] = useState(false)

  const hasStartedItem = !!mediaFileDuration
  const totalTime = mediaFileDuration || convertedItem.episodeDuration || 0
  const playedTime = userPlaybackPosition || 0

  const handleChapterLoad = async () => {
    await playerHandleSeekTo(item.startTime)
    const playbackState = await playerGetState()
    const isPlaying = playerCheckIfStateIsPlaying(playbackState)
    if (!isPlaying) {
      playerHandlePlayWithUpdate()
    }
  }

  const handleClipFromSameEpisodeLoaded = () => {
    playerUpdatePlayerState(convertedItem, async () => {
      if (convertedItem.clipStartTime || convertedItem.clipStartTime === 0) {
        await playerHandleSeekTo(convertedItem.clipStartTime)
        const playbackState = await playerGetState()
        const isPlaying = playerCheckIfStateIsPlaying(playbackState)
        if (!isPlaying) {
          await playerHandlePlayWithUpdate()
        }
        setNowPlayingItem(convertedItem, convertedItem.clipStartTime)
        PVEventEmitter.emit(PV.Events.PLAYER_START_CLIP_TIMER)
      }
    })
  }

  const playItem = async () => {
    const isNowPlayingItem = checkIfNowPlayingItem(item, nowPlayingItem)
    if (loadChapterOnPlay) {
      await handleChapterLoad()
    } else if (
      nowPlayingItem &&
      !isNowPlayingItem &&
      convertedItem.clipId &&
      convertedItem.episodeId === nowPlayingItem.episodeId
    ) {
      handleClipFromSameEpisodeLoaded()
    } else if (isNowPlayingItem) {
      playerTogglePlay()
    } else {
      const forceUpdateOrderDate = false
      const shouldPlay = true
      const setCurrentItemNextInQueue = true
      await playerLoadNowPlayingItem(convertedItem, shouldPlay, forceUpdateOrderDate, setCurrentItemNextInQueue)

      setTimeout(() => {
        setForceRerender(!forceRerender)
      }, 1500)
    }
    requestAppStoreReviewForEpisodePlayed()
  }

  const isInvalidDuration = totalTime <= 0
  const isPlaying = playerCheckIfStateIsPlaying(playbackState)
  const isNowPlayingItem = isPlaying && checkIfNowPlayingItem(item, nowPlayingItem)

  const iconStyle = isNowPlayingItem ? styles.playButton : [styles.playButton, { paddingLeft: 2 }]

  return (
    <View accessible={false} style={[styles.container, style]} transparent={transparent}>
      {!hidePlayButton && (
        <PressableWithOpacity
          accessible={false}
          importantForAccessibility='no-hide-descendants'
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          // People have reported issues with this play button not always playing
          // on the first try as expected on Android. I'm not sure why Android has
          // this issue but not iOS, but I'm using onPressOut to work around this.
          // {...(Platform.OS === 'ios' ? { onPress: playItem } : { onPressOut: playItem })}
          onPress={playItem}
          style={iconStyle}
          testID={`${testID}_time_remaining_widget_toggle_play`.prependTestId()}>
          {isNowPlayingItem ? <Icon name={'pause'} size={13} /> : <Icon name={'play'} size={13} />}
        </PressableWithOpacity>
      )}
      {liveItem?.status === 'live' && (
        <>
          <LiveStatusBadge testID={testID} />
          <View style={styles.spacer} />
        </>
      )}
      {(forceShowProgressBar || (!liveItem && hasStartedItem && !isInvalidDuration && playedTime > 0)) && (
        <MiniProgressBar
          fullWidth={progressFullWidth}
          item={isNowPlayingItem}
          playedTime={playedTime || 0}
          totalTime={totalTime}
        />
      )}
      {!liveItem && (
        <View
          accessible={false}
          importantForAccessibility='no-hide-descendants'
          style={{ flexDirection: 'row', flex: 1, alignItems: 'center', height: '100%' }}>
          {!!timeLabel && (
            <Text
              accessible={false}
              fontSizeLargerScale={PV.Fonts.largeSizes.md}
              fontSizeLargestScale={PV.Fonts.largeSizes.sm}
              importantForAccessibility='no-hide-descendants'
              style={styles.text}>
              {timeLabel}
            </Text>
          )}
          {!!episodeCompleted && (
            <View style={styles.icon}>
              <Icon name={'check'} size={22} style={styles.iconCompleted} />
            </View>
          )}
        </View>
      )}
      <View style={{ flexDirection: 'row' }}>
        {!!handleMorePress && (
          <MoreButton
            accessible={false}
            handleMorePress={handleMorePress}
            isLoading={episodeDownloading}
            itemType={itemType}
            testID={testID}
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly'
  },
  icon: {
    marginLeft: 8
  },
  iconCompleted: {
    color: PV.Colors.green
  },
  playButton: {
    borderColor: PV.Colors.skyLight,
    borderWidth: 1,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    width: 44,
    marginRight: 10,
    backgroundColor: PV.Colors.brandBlueDark + '44'
  },
  spacer: {
    flex: 1
  },
  text: {
    color: PV.Colors.skyLight,
    fontSize: PV.Fonts.sizes.sm,
    marginRight: 8
  }
})
