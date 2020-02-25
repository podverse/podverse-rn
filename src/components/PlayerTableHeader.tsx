import { StyleSheet, TouchableWithoutFeedback } from 'react-native'
import React from 'reactn'
import { readableDate } from '../lib/utility'
import { PV } from '../resources'
import { core } from '../styles'
import { ActivityIndicator, FastImage, Text, View } from './'

type Props = {
  isLoading?: boolean
  nowPlayingItem: any
  onPress?: any
}

export const PlayerTableHeader = (props: Props) => {
  const { isLoading, nowPlayingItem, onPress } = props

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.wrapper}>
        {isLoading && (
          <View style={core.row}>
            <ActivityIndicator />
          </View>
        )}
        {!isLoading && !!nowPlayingItem && (
          <View style={core.row}>
            <FastImage
              key={nowPlayingItem.podcastImageUrl}
              source={nowPlayingItem.podcastImageUrl}
              styles={styles.image}
            />
            <View style={styles.textWrapper}>
              <Text isSecondary={true} numberOfLines={1} style={styles.podcastTitle}>
                {nowPlayingItem.podcastTitle}
              </Text>
              <Text
                numberOfLines={2}
                style={styles.episodeTitle}>
                {nowPlayingItem.episodeTitle}
              </Text>
              <Text
                isSecondary={true}
                numberOfLines={1}
                style={styles.episodePubDate}>
                {readableDate(nowPlayingItem.episodePubDate)}
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  episodePubDate: {
    fontSize: PV.Fonts.sizes.sm,
    marginTop: 3
  },
  episodeTitle: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    lineHeight: PV.Fonts.sizes.xl,
    marginTop: 5
  },
  image: {
    flex: 0,
    height: PV.Table.cells.podcast.image.height,
    width: PV.Table.cells.podcast.image.width
  },
  podcastTitle: {
    flex: 0,
    fontSize: PV.Fonts.sizes.md,
    justifyContent: 'flex-start',
    lineHeight: PV.Fonts.sizes.md
  },
  textWrapper: {
    flex: 1,
    marginHorizontal: 8,
    marginTop: 6
  },
  wrapper: {
    height: PV.Table.cells.podcast.wrapper.height
  }
})
