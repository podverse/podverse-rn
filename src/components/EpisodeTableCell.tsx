import { decodeHTMLString, getTimeLabelText, removeHTMLFromString } from 'podverse-shared'
import { Pressable, StyleSheet, View as RNView } from 'react-native'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { generateEpisodeAccessibilityText, readableDate, removeAndDecodeHTMLInString } from '../lib/utility'
import { PV } from '../resources'
import { images } from '../styles'
import { DownloadOrDeleteButton } from './DownloadOrDeleteButton'
import { TimeRemainingWidget } from './TimeRemainingWidget'
import { Divider, FastImage, NewContentBadge, Text, View } from './'

type Props = {
  handleDeletePress?: any
  handleDownloadPress?: any
  handleMorePress?: any
  handleNavigationPress?: any
  hideDivider?: boolean
  hideImage?: boolean
  item?: any
  mediaFileDuration?: number
  navigation: any
  shouldHideCompleted?: boolean
  showPodcastInfo?: boolean
  testID: string
  transparent?: boolean
  userPlaybackPosition?: number
}

export class EpisodeTableCell extends React.PureComponent<Props> {
  render() {
    const {
      handleDeletePress,
      handleDownloadPress,
      handleMorePress,
      handleNavigationPress,
      hideDivider,
      hideImage,
      item,
      mediaFileDuration,
      navigation,
      shouldHideCompleted,
      showPodcastInfo,
      testID,
      userPlaybackPosition
    } = this.props

    const { duration, id, liveItem, mediaUrl, pubDate = '', podcast = {} } = item
    const { description = '', subtitle = '' } = item
    let { title = '' } = item

    const podcastTitle = podcast.title || translate('Untitled Podcast')
    let summaryText = subtitle && subtitle !== title ? subtitle : description
    summaryText = removeAndDecodeHTMLInString(summaryText)

    let finalPubDate = pubDate
    if (liveItem?.start) {
      finalPubDate = liveItem.start
    }

    const {
      downloadedEpisodeIds,
      downloadsActive,
      fontScaleMode,
      newEpisodesCount,
      screenReaderEnabled,
      session
    } = this.global
    const { userInfo } = session
    const { historyItemsIndex } = userInfo

    const isDownloading = downloadsActive[id]
    const isDownloaded = item.addByRSSPodcastFeedUrl ? downloadedEpisodeIds[mediaUrl] : downloadedEpisodeIds[id]

    const episodeCompleted =
      historyItemsIndex &&
      historyItemsIndex.episodes &&
      id &&
      historyItemsIndex.episodes[id] &&
      historyItemsIndex.episodes[id].completed

    if (!title) title = translate('Untitled Episode')

    const titleStyle = (podcastTitle ? styles.title : [styles.title, { marginTop: 0 }]) as any

    const imageUrl = podcast.shrunkImageUrl || podcast.imageUrl

    const podcastTitleText = podcastTitle.trim()
    const episodeTitleText = title.trim()
    const pubDateText = readableDate(finalPubDate)
    const timeLabel = getTimeLabelText(mediaFileDuration, duration, userPlaybackPosition)
    const timeLabelText = generateEpisodeAccessibilityText(episodeCompleted, timeLabel)

    const accessibilityLabel = `${
      showPodcastInfo ? `${podcastTitleText}, ` : ''
    } ${episodeTitleText}, ${pubDateText}, ${timeLabelText}`

    const podcastId = podcast?.id
    const episodeId = item?.id
    const isNewUnplayedEpisode = !!(podcastId && episodeId && newEpisodesCount?.[podcastId]?.data?.[episodeId])

    const innerTopView = (
      <RNView accessible={false} importantForAccessibility='no-hide-descendants' style={styles.innerTopView}>
        {!!imageUrl && !hideImage && (
          <FastImage
            isAddByRSSPodcast={!!podcast?.addByRSSPodcastFeedUrl}
            isSmall
            source={imageUrl}
            styles={styles.image}
            valueTags={podcast?.value}
          />
        )}
        <RNView accessible={false} style={styles.textWrapper}>
          {showPodcastInfo && podcastTitle && (
            <Text
              accessible={false}
              fontSizeLargestScale={PV.Fonts.largeSizes.sm}
              isSecondary
              numberOfLines={1}
              style={styles.podcastTitle}
              testID={`${testID}_podcast_title`}>
              {podcastTitleText}
            </Text>
          )}
          {title && (
            <Text
              accessible={false}
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              numberOfLines={2}
              style={titleStyle}
              testID={`${testID}_title`}>
              {episodeTitleText}
            </Text>
          )}
          <RNView style={styles.textWrapperBottomRow}>
            <Text
              accessible={false}
              fontSizeLargestScale={PV.Fonts.largeSizes.sm}
              isSecondary
              style={styles.pubDate}
              testID={`${testID}_pub_date`}>
              {pubDateText}
            </Text>
          </RNView>
        </RNView>
        {isNewUnplayedEpisode && <NewContentBadge isNewUnplayedContent={isNewUnplayedEpisode} />}
      </RNView>
    )

    const descriptionStyle = hideImage ? [styles.description, { paddingLeft: 0 }] : styles.description

    const bottomText = (
      <Text
        accessible={false}
        fontSizeLargestScale={PV.Fonts.largeSizes.md}
        importantForAccessibility='no-hide-descendants'
        isSecondary
        numberOfLines={2}
        style={descriptionStyle}
        testID={`${testID}_description`}>
        {summaryText}
      </Text>
    )

    return (
      <RNView>
        {(!shouldHideCompleted || !!liveItem) && (
          <RNView>
            <Pressable
              accessible={screenReaderEnabled}
              accessibilityHint={translate('ARIA HINT - tap to show options for this episode')}
              accessibilityLabel={accessibilityLabel}
              importantForAccessibility={screenReaderEnabled ? 'yes' : 'no-hide-descendants'}
              onPress={screenReaderEnabled ? handleMorePress : null}
              style={styles.wrapper}>
              <RNView accessible={false} importantForAccessibility='no-hide-descendants' style={styles.wrapperTop}>
                {handleNavigationPress && !screenReaderEnabled ? (
                  <Pressable
                    accessible={false}
                    importantForAccessibility='no-hide-descendants'
                    {...(!screenReaderEnabled ? { onPress: handleNavigationPress } : {})}
                    style={{ flex: 1 }}
                    {...(testID ? { testID: `${testID}_top_view_nav`.prependTestId() } : {})}>
                    {innerTopView}
                  </Pressable>
                ) : (
                  innerTopView
                )}
                {!liveItem && (
                  <DownloadOrDeleteButton
                    isDownloaded={isDownloaded}
                    isDownloading={isDownloading}
                    onPressDelete={() => handleDeletePress(item)}
                    onPressDownload={() => handleDownloadPress(item)}
                    testID={testID}
                  />
                )}
              </RNView>
              {handleNavigationPress && !screenReaderEnabled ? (
                <Pressable
                  accessible={false}
                  importantForAccessibility='no-hide-descendants'
                  {...(!screenReaderEnabled ? { onPress: handleNavigationPress } : {})}
                  {...(testID ? { testID: `${testID}_bottom_view_nav`.prependTestId() } : {})}>
                  <RNView>{PV.Fonts.fontScale.largest !== fontScaleMode && bottomText}</RNView>
                </Pressable>
              ) : (
                bottomText
              )}
              <View style={styles.timeRemainingWrapper}>
                <TimeRemainingWidget
                  episodeCompleted={episodeCompleted}
                  handleMorePress={handleMorePress}
                  item={item}
                  itemType='episode'
                  mediaFileDuration={mediaFileDuration}
                  navigation={navigation}
                  testID={testID}
                  timeLabel={timeLabel}
                  userPlaybackPosition={userPlaybackPosition}
                />
              </View>
            </Pressable>
            {!hideDivider && <Divider style={{ marginHorizontal: 10 }} />}
          </RNView>
        )}
      </RNView>
    )
  }
}

const styles = StyleSheet.create({
  description: {
    fontSize: PV.Fonts.sizes.sm,
    color: PV.Colors.grayLighter,
    marginTop: 12
  },
  image: {
    flex: 0,
    height: images.medium.height,
    marginRight: 12,
    width: images.medium.width
  },
  innerTopView: {
    flex: 1,
    flexDirection: 'row',
    marginRight: 4
  },
  podcastTitle: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold,
    justifyContent: 'flex-start'
  },
  pubDate: {
    color: PV.Colors.skyLight,
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    fontWeight: PV.Fonts.weights.semibold,
    marginRight: 10,
    marginTop: 3
  },
  textWrapper: {
    flex: 1
  },
  textWrapperBottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  timeRemainingWrapper: {
    marginTop: 15
  },
  title: {
    fontSize: PV.Fonts.sizes.xxl,
    fontWeight: PV.Fonts.weights.thin
  },
  wrapper: {
    paddingBottom: 14,
    paddingHorizontal: 8,
    paddingTop: 16
  },
  wrapperTop: {
    flexDirection: 'row',
    alignItems: 'center'
  }
})
