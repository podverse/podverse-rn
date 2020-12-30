import { convertToNowPlayingItem } from 'podverse-shared'
import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { convertSecToHhoursMMinutes } from '../lib/utility'
import { PV } from '../resources'
import { loadItemAndPlayTrack } from '../state/actions/player'
import { Icon, MoreButton, Text, View } from './'

type Props = {
  handleShowMore?: any
  item: any
  style?: any
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

export const TimeRemainingWidget = (props: Props) => {
  const { handleShowMore, item, style } = props
  const { podcast = {} } = item
  const playingItem = convertToNowPlayingItem(item, null, podcast)

  // TODO: Look up id on global.user.historyItems[item.id] to set playbacktime if it exists
  const hasStartedItem = false
  const totalTime = playingItem.episodeDuration || 0
  const playedTime = 0

  let timeLabel = convertSecToHhoursMMinutes(totalTime)
  if (hasStartedItem) {
    timeLabel = convertSecToHhoursMMinutes(totalTime - playedTime) + ' left'
  }

  const playItem = () => {
    loadItemAndPlayTrack(playingItem, true)
  }

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity onPress={playItem} style={styles.playButton}>
        <Icon name={'play'} size={13} />
      </TouchableOpacity>
      {hasStartedItem && <MiniProgressBar playedTime={30} totalTime={120} />}
      <Text style={styles.text}>{timeLabel}</Text>
      {!!handleShowMore && <MoreButton handleShowMore={handleShowMore} />}
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
    paddingLeft: 4
  }
})
