import { Platform, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import React, { useGlobal } from 'reactn'
import { readableDate, testProps } from '../lib/utility'
import { PV } from '../resources'
import { core } from '../styles'
import { ActivityIndicator, FastImage, Text, View } from './'

type Props = {
  isLoading?: boolean
  nowPlayingItem: any
  onPress?: any
  testID: string
}

export const PlayerTableHeader = (props: Props) => {
  const { isLoading, nowPlayingItem, onPress, testID } = props
  const [fontScaleMode] = useGlobal('fontScaleMode')

  const episodeTitleNumberOfLines = PV.Fonts.fontScale.largest === fontScaleMode ? 1 : 2

  const textWrapperStyle =
    Platform.OS === 'ios' && ![PV.Fonts.fontScale.larger, PV.Fonts.fontScale.largest].includes(fontScaleMode)
      ? [styles.textWrapper, { marginTop: 4 }]
      : styles.textWrapper

  const episodePubDateStyle =
    Platform.OS === 'ios' && ![PV.Fonts.fontScale.larger, PV.Fonts.fontScale.largest].includes(fontScaleMode)
      ? [styles.episodePubDate, { marginTop: 3 }]
      : styles.episodePubDate

  return (
    <TouchableWithoutFeedback onPress={onPress} {...(testID ? testProps(testID) : {})}>
      <View transparent={true}>
        {isLoading && (
          <View style={core.row}>
            <ActivityIndicator />
          </View>
        )}
        {!isLoading && !!nowPlayingItem && (
          <View style={core.row} transparent={true}>
            <FastImage
              key={nowPlayingItem.podcastImageUrl}
              source={nowPlayingItem.podcastImageUrl}
              styles={styles.image}
            />
            <View style={textWrapperStyle} transparent={true}>
              {fontScaleMode !== PV.Fonts.fontScale.largest && (
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                  isSecondary={true}
                  numberOfLines={1}
                  style={styles.podcastTitle}
                  testID={`${testID}_header_podcast_title`}>
                  {nowPlayingItem.podcastTitle}
                </Text>
              )}
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.md}
                numberOfLines={episodeTitleNumberOfLines}
                style={styles.episodeTitle}
                testID={`${testID}_header_episode_title`}>
                {nowPlayingItem.episodeTitle}
              </Text>
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                isSecondary={true}
                numberOfLines={1}
                style={episodePubDateStyle}
                testID={`${testID}_header_episode_pub_date`}>
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
    fontSize: PV.Fonts.sizes.xs,
    marginTop: 1
  },
  episodeTitle: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  },
  image: {
    flex: 0,
    height: PV.Table.cells.podcast.image.height,
    width: PV.Table.cells.podcast.image.width
  },
  podcastTitle: {
    flex: 0,
    fontSize: PV.Fonts.sizes.xs,
    justifyContent: 'flex-start'
  },
  textWrapper: {
    flex: 1,
    marginHorizontal: 8
  }
})
