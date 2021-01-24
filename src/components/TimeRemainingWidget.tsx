import { convertToNowPlayingItem } from 'podverse-shared'
import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { useGlobal } from 'reactn'
import { convertSecToHhoursMMinutes } from '../lib/utility'
import { PV } from '../resources'
import { PVTrackPlayer } from '../services/player'
import { loadItemAndPlayTrack, togglePlay } from '../state/actions/player'
import { Icon, MoreButton, Text, View } from './'

type Props = {
  handleMorePress?: any
  item: any
  style?: any
  userPlaybackPosition?: number | undefined
}

type BarProps = {
  playedTime?: number
  totalTime: number
}

const MiniProgressBar = (props: BarProps) => {
  const [fillerWidth, setFillerWidth] = useState(0)
  const { playedTime, totalTime } = props
  const percentage = playedTime ? playedTime * (100 / totalTime) : 0

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

  return (
    <View
      style={bar}
      onLayout={(e) => {
        setFillerWidth(e.nativeEvent.layout.width * (percentage / 100))
      }}>
      <View style={filler} />
    </View>
  )
}

const checkIfNowPlayingItem = (item?: any, nowPlayingItem?: any) => {
  return item && nowPlayingItem && (nowPlayingItem.clipId === item.id || nowPlayingItem.episodeId === item.id)
}

export const TimeRemainingWidget = (props: Props) => {
  const { handleMorePress, item, style, userPlaybackPosition } = props
  const { podcast = {} } = item
  const playingItem = convertToNowPlayingItem(item, null, podcast)
  const [player] = useGlobal('player')
  const { nowPlayingItem, playbackState } = player

  const hasStartedItem = !!userPlaybackPosition
  const totalTime = playingItem.episodeDuration || 0
  const playedTime = userPlaybackPosition || 0

  let timeLabel = ''
  if (totalTime) {
    timeLabel = convertSecToHhoursMMinutes(totalTime)
    if (hasStartedItem) {
      timeLabel = convertSecToHhoursMMinutes(totalTime - playedTime) + ' left'
    }
  }

  const playItem = () => {
    const isNowPlayingItem = checkIfNowPlayingItem(item, nowPlayingItem)

    if (isNowPlayingItem) {
      togglePlay()
    } else {
      loadItemAndPlayTrack(playingItem, true)
    }
  }

  const isInvalidDuration = totalTime <= 0
  const isPlaying = playbackState === PVTrackPlayer.STATE_PLAYING
  const isNowPlayingItem = isPlaying && checkIfNowPlayingItem(item, nowPlayingItem)

  const iconStyle = isNowPlayingItem ? styles.playButton : [styles.playButton, { paddingLeft: 2 }]

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity onPress={playItem} style={iconStyle}>
        {isNowPlayingItem ? <Icon name={'pause'} size={13} /> : <Icon name={'play'} size={13} />}
      </TouchableOpacity>
      {hasStartedItem && !isInvalidDuration && <MiniProgressBar playedTime={playedTime} totalTime={totalTime} />}
      <Text style={styles.text}>{timeLabel}</Text>
      {!!handleMorePress && <MoreButton handleMorePress={handleMorePress} />}
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
    marginRight: 10
  }
})
