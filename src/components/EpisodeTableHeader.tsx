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
  mediaFileDuration?: number
  testID: string
  userPlaybackPosition?: number
}

export const EpisodeTableHeader = (props: Props) => {
  const {
    episode,
    episodeDownloaded = false,
    handleMorePress,
    isLoading,
    mediaFileDuration,
    testID,
    userPlaybackPosition
  } = props

  const isNotFound = !isLoading && !episode
  const podcastImageUrl =
    episode &&
    ((episode.podcast && episode.podcast.shrunkImageUrl) ||
      episode.podcast_shrunkImageUrl ||
      (episode.podcast && episode.podcast.imageUrl))
  const pubDate = episode && episode.pubDate
  const isDownloaded = episodeDownloaded

  let episodeTitle = episode?.title
  if (!episodeTitle) episodeTitle = translate('Untitled Episode')

  const podcastTitle = episode?.podcast?.title
  if (!podcastTitle) episodeTitle = translate('Untitled Podcast')

  const [fontScaleMode] = useGlobal('fontScaleMode')

  const titleNumberOfLines = [PV.Fonts.fontScale.larger, PV.Fonts.fontScale.largest].includes(fontScaleMode) ? 1 : 2

  return (
    <View style={styles.view}>
      {isLoading ? (
        <ActivityIndicator fillSpace={true} />
      ) : (
        <View style={styles.wrapper}>
          {isNotFound ? (
            <View style={styles.textWrapper}>
              <Text
                fontSizeLargerScale={PV.Fonts.largeSizes.md}
                fontSizeLargestScale={PV.Fonts.largeSizes.md}
                style={styles.notFoundText}
                testID={`${testID}_episode_not_found_text`}>
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
                  style={styles.podcastTitle}
                  testID={`${testID}_podcast_title`}>
                  {podcastTitle.trim()}
                </Text>
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.md}
                  numberOfLines={titleNumberOfLines}
                  style={styles.title}
                  testID={`${testID}_title`}>
                  {episodeTitle.trim()}
                </Text>
                <View style={styles.textWrapperBottomRow}>
                  <Text
                    fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                    isSecondary={true}
                    style={styles.pubDate}
                    testID={`${testID}_pub_date`}>
                    {readableDate(pubDate)}
                  </Text>
                  {isDownloaded && <IndicatorDownload />}
                </View>
              </View>
              <TimeRemainingWidget
                item={episode}
                handleMorePress={handleMorePress}
                style={{ marginVertical: 20 }}
                mediaFileDuration={mediaFileDuration}
                userPlaybackPosition={userPlaybackPosition}
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
    height: 110,
    width: 110
  },
  notFoundText: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  },
  pubDate: {
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    fontWeight: PV.Fonts.weights.semibold,
    color: PV.Colors.skyLight,
    marginTop: 3,
    marginRight: 10
  },
  textWrapper: {
    paddingTop: 15
  },
  textWrapperBottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  title: {
    fontSize: PV.Fonts.sizes.huge,
    fontWeight: PV.Fonts.weights.thin,
    flexWrap: 'wrap'
  },
  podcastTitle: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold,
    justifyContent: 'flex-start'
  }
})
