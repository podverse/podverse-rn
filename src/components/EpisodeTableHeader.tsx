import React, { useGlobal } from 'reactn'
import { Pressable, StyleSheet, View } from 'react-native'
import { translate } from '../lib/i18n'
import { getTimeLabelText, readableDate } from '../lib/utility'
import { PV } from '../resources'
import { TimeRemainingWidget } from './TimeRemainingWidget'
import { ActivityIndicator, FastImage, IndicatorDownload, Text } from './'

type Props = {
  episode: any | null
  episodeDownloaded?: boolean
  episodeDownloading?: boolean
  handleMorePress?: any
  isLoading?: boolean
  mediaFileDuration?: number
  testID: string
  userPlaybackPosition?: number
}

export const EpisodeTableHeader = (props: Props) => {
  const {
    episode,
    episodeDownloaded = false,
    episodeDownloading = false,
    handleMorePress,
    isLoading,
    mediaFileDuration,
    testID,
    userPlaybackPosition
  } = props

  const [screenReaderEnabled] = useGlobal('screenReaderEnabled')
  const [session] = useGlobal('session')
  const { userInfo } = session
  const { historyItemsIndex } = userInfo

  const isNotFound = !isLoading && !episode

  const imageUrl =
    episode?.imageUrl ||
    episode?.podcast?.shrunkImageUrl ||
    episode?.podcast_shrunkImageUrl ||
    episode?.podcast?.imageUrl

  const duration = episode?.duration || 0

  const pubDate = episode?.pubDate
  const isDownloaded = episodeDownloaded

  const id = episode?.id
  const episodeCompleted = historyItemsIndex && historyItemsIndex.episodes && id
    && historyItemsIndex.episodes[id] && historyItemsIndex.episodes[id].completed

  let episodeTitleText = episode?.title?.trim()
  if (!episodeTitleText) episodeTitleText = translate('Untitled Episode')

  let podcastTitleText = episode?.podcast?.title?.trim()
  if (!podcastTitleText) podcastTitleText = translate('Untitled Podcast')

  const pubDateText = readableDate(pubDate)
  const timeLabel = getTimeLabelText(mediaFileDuration, duration, userPlaybackPosition)
  const timeLabelText = timeLabel ? timeLabel : translate('Unplayed episode')

  const accessibilityLabel =
    `${podcastTitleText}, ${episodeTitleText}, ${pubDateText}, ${timeLabelText}`

  return (
    <Pressable
      accessible={screenReaderEnabled}
      accessibilityHint={translate('ARIA HINT - tap to show options for this episode')}
      accessibilityLabel={accessibilityLabel}
      importantForAccessibility={screenReaderEnabled ? 'yes' : 'no-hide-descendants'}
      onPress={handleMorePress}
      style={styles.view}>
      {isLoading ? (
        <ActivityIndicator fillSpace testID={testID} />
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
              <FastImage fallback source={imageUrl} styles={styles.image} />
              <View style={styles.textWrapper}>
                <Text
                  accessibilityHint={translate('ARIA HINT - This is the podcast title')}
                  accessibilityLabel={podcastTitleText}
                  fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                  isSecondary
                  style={styles.podcastTitle}
                  testID={`${testID}_podcast_title`}>
                  {podcastTitleText}
                </Text>
                <Text
                  accessibilityHint={translate('ARIA HINT - This is the episode title')}
                  accessibilityLabel={episodeTitleText}
                  fontSizeLargestScale={PV.Fonts.largeSizes.md}
                  style={styles.title}
                  testID={`${testID}_title`}>
                  {episodeTitleText}
                </Text>
                <View style={styles.textWrapperBottomRow}>
                  <Text
                    accessibilityHint={translate('ARIA HINT - This is the episode publication date')}
                    accessibilityLabel={pubDateText}
                    fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                    isSecondary
                    style={styles.pubDate}
                    testID={`${testID}_pub_date`}>
                    {pubDateText}
                  </Text>
                  {isDownloaded && <IndicatorDownload />}
                </View>
              </View>
              <TimeRemainingWidget
                episodeCompleted={episodeCompleted}
                episodeDownloading={episodeDownloading}
                handleMorePress={handleMorePress}
                item={episode}
                itemType='episode'
                mediaFileDuration={mediaFileDuration}
                style={{ marginVertical: 20 }}
                testID={testID}
                timeLabel={timeLabel}
                userPlaybackPosition={userPlaybackPosition}
              />
            </View>
          )}
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  view: {
    marginHorizontal: 8,
    marginTop: 20
  },
  wrapper: {},
  buttonView: {
    marginLeft: 8,
    marginRight: 8
  },
  innerWrapper: {},
  image: {
    height: 200,
    width: 200
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
