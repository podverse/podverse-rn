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
  mediaFileDuration?: number | undefined
  style?: any
  userPlaybackPosition?: number | undefined
  clipTime?: string
  transparent?: boolean
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
  const { clipTime, handleMorePress, item, mediaFileDuration, style, transparent, userPlaybackPosition } = props
  const { episode = {}, podcast = {} } = item
  const playingItem = convertToNowPlayingItem(item, episode, podcast)
  const [player] = useGlobal('player')
  const { nowPlayingItem, playbackState } = player

  const hasStartedItem = !!userPlaybackPosition
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
    <View style={[styles.container, style]} transparent={transparent}>
      <TouchableOpacity onPress={playItem} style={iconStyle}>
        {isNowPlayingItem ? <Icon name={'pause'} size={13} /> : <Icon name={'play'} size={13} />}
      </TouchableOpacity>
      {hasStartedItem && !isInvalidDuration && (
        <MiniProgressBar item={isNowPlayingItem} playedTime={playedTime || 0} totalTime={totalTime} />
      )}
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
    marginRight: 10,
    backgroundColor: PV.Colors.brandBlueDark + '44'
  }
})
