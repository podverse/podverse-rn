import { Image, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import React from 'reactn'
import { readableDate } from '../lib/utility'
import { PV } from '../resources'
import { Text, View } from './'

type Props = {
  nowPlayingItem: any
  onPress: any
}

export const PlayerTableHeader = (props: Props) => {
  const { nowPlayingItem, onPress } = props

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.wrapper}>
        <Image
          source={{ uri: nowPlayingItem.podcastImageUrl }}
          style={styles.image} />
        <View style={styles.textWrapper}>
            <Text
              numberOfLines={1}
              style={styles.podcastTitle}>
              {nowPlayingItem.podcastTitle}
            </Text>
            <Text
              isSecondary={true}
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
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  episodePubDate: {
    fontSize: PV.Fonts.sizes.md,
    marginTop: 2
  },
  episodeTitle: {
    fontSize: PV.Fonts.sizes.md,
    marginTop: 2
  },
  image: {
    flex: 0,
    height: 92,
    width: 92
  },
  textWrapper: {
    flex: 1,
    marginHorizontal: 8,
    marginTop: 6
  },
  podcastTitle: {
    fontSize: PV.Fonts.sizes.md,
    fontWeight: PV.Fonts.weights.bold
  },
  wrapper: {
    flexDirection: 'row'
  }
})
