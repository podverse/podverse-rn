import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useGlobal } from 'reactn'
import { translate } from '../lib/i18n'
import { readableDate } from '../lib/utility'
import { PV } from '../resources'
import { ActivityIndicator, FastImage, IndicatorDownload, Text } from './'
import { TimeRemainingWidget } from './TimeRemainingWidget'

type Props = {
  episode: any | null
  handleMorePress?: any
  episodeDownloaded?: boolean
  isLoading?: boolean
  testID: string
}

export const EpisodeTableHeader = (props: Props) => {
  const { episodeDownloaded = false, handleMorePress, testID, episode, isLoading } = props

  const isNotFound = !isLoading && !episode
  const podcastImageUrl =
    episode &&
    ((episode.podcast && episode.podcast.shrunkImageUrl) ||
      episode.podcast_shrunkImageUrl ||
      (episode.podcast && episode.podcast.imageUrl))
  const pubDate = episode && episode.pubDate
  const title = episode && episode.title
  const isDownloaded = episodeDownloaded

  const [fontScaleMode] = useGlobal('fontScaleMode')

  const titleNumberOfLines = [PV.Fonts.fontScale.larger, PV.Fonts.fontScale.largest].includes(fontScaleMode) ? 1 : 2

  console.log('Episode: ', episode)

  return (
    <View style={styles.view}>
      {isLoading ? (
        <ActivityIndicator styles={{ margin: 25 }} />
      ) : (
        <View style={styles.wrapper}>
          {isNotFound ? (
            <View style={styles.textWrapper}>
              <Text
                fontSizeLargerScale={PV.Fonts.largeSizes.md}
                fontSizeLargestScale={PV.Fonts.largeSizes.md}
                style={styles.notFoundText}
                testID={testID}>
                {translate('Episode Not Found')}
              </Text>
            </View>
          ) : (
            <View style={styles.innerWrapper}>
              <FastImage source={podcastImageUrl} styles={styles.image} />
              <View style={styles.textWrapper}>
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                  isSecondary={true}
                  style={styles.pubDate}
                  testID={testID}>
                  {!!pubDate && readableDate(pubDate)}
                  {isDownloaded && <IndicatorDownload style={{ paddingLeft: 10 }} />}
                </Text>
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.md}
                  numberOfLines={titleNumberOfLines}
                  style={styles.title}
                  testID={testID}>
                  {title}
                </Text>
                <Text fontSizeLargestScale={PV.Fonts.largeSizes.sm} style={styles.podcastTitle} testID={testID}>
                  {!!episode.podcast && episode.podcast.title}
                </Text>
              </View>
              <TimeRemainingWidget
                item={episode}
                handleShowMore={handleMorePress}
                testID={testID}
                style={{ marginVertical: 20 }}
              />
            </View>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  view: {
    marginHorizontal: 15,
    marginTop: 20
  },
  wrapper: {},
  buttonView: {
    marginLeft: 8,
    marginRight: 8
  },
  innerWrapper: {},
  image: {
    height: 90,
    width: 90
  },
  notFoundText: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  },
  pubDate: {
    fontSize: PV.Fonts.sizes.xs,
    color: PV.Colors.skyLight
  },
  textWrapper: {
    paddingTop: 15
  },
  textWrapperBottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  title: {
    fontSize: PV.Fonts.sizes.huge,
    fontWeight: PV.Fonts.weights.thin,
    flexWrap: 'wrap'
  },
  podcastTitle: {
    marginTop: 5,
    fontSize: PV.Fonts.sizes.xs,
    color: PV.Colors.brandBlueLight
  }
})
