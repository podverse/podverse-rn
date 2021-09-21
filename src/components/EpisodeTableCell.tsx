import { Pressable, StyleSheet, TouchableWithoutFeedback, View as RNView } from 'react-native'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { decodeHTMLString, getTimeLabelText, readableDate, removeHTMLFromString } from '../lib/utility'
import { PV } from '../resources'
import { images } from '../styles'
import { DownloadOrDeleteButton } from './DownloadOrDeleteButton'
import { TimeRemainingWidget } from './TimeRemainingWidget'
import { FastImage, Text, View } from './'

type Props = {
  handleDeletePress?: any
  handleDownloadPress?: any
  handleMorePress?: any
  handleNavigationPress?: any
  hideImage?: boolean
  item?: any
  mediaFileDuration?: number
  pubDate?: any
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
      hideImage,
      item,
      mediaFileDuration,
      showPodcastInfo,
      testID,
      userPlaybackPosition
    } = this.props

    const { episodeDuration, id, mediaUrl, pubDate = '', podcast = {} } = item
    let { description = '', title = '' } = item

    const podcastTitle = podcast.title || translate('Untitled Podcast')
    description = removeHTMLFromString(description)
    description = decodeHTMLString(description)
    description = description?.trim() || ''

    const { downloadedEpisodeIds, downloadsActive, fontScaleMode, screenReaderEnabled, session } = this.global
    const { userInfo } = session
    const { historyItemsIndex } = userInfo

    const isDownloading = downloadsActive[id]
    const isDownloaded = item.addByRSSPodcastFeedUrl ? downloadedEpisodeIds[mediaUrl] : downloadedEpisodeIds[id]

    const episodeCompleted = historyItemsIndex && historyItemsIndex.episodes && id
      && historyItemsIndex.episodes[id] && historyItemsIndex.episodes[id].completed

    const episodeDownloading = !!downloadsActive[id]

    if (!title) title = translate('Untitled Episode')

    const titleStyle = (podcastTitle ? styles.title : [styles.title, { marginTop: 0 }]) as any

    const imageUrl = podcast.shrunkImageUrl || podcast.imageUrl

    const podcastTitleText = podcastTitle.trim()
    const episodeTitleText = title.trim()
    const pubDateText = readableDate(pubDate)
    const timeLabel = getTimeLabelText(mediaFileDuration, episodeDuration, userPlaybackPosition)
    const timeLabelText = timeLabel ? timeLabel : translate('Unplayed episode')

    const accessibilityLabel =
      `${showPodcastInfo ? `${podcastTitleText}, ` : ''} ${episodeTitleText}, ${pubDateText}, ${timeLabelText}`

    const innerTopView = (
      <RNView
        accessible={false}
        importantForAccessibility='no-hide-descendants'
        style={styles.innerTopView}>
        {!!imageUrl && !hideImage && <FastImage isSmall source={imageUrl} styles={styles.image} />}
        <RNView
          style={styles.textWrapper}>
          {showPodcastInfo && podcastTitle && (
            <Text
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
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              numberOfLines={2}
              style={titleStyle}
              testID={`${testID}_title`}>
              {episodeTitleText}
            </Text>
          )}
          <RNView style={styles.textWrapperBottomRow}>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.sm}
              isSecondary
              style={styles.pubDate}
              testID={`${testID}_pub_date`}>
              {pubDateText}
            </Text>
          </RNView>
        </RNView>
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
        {description}
      </Text>
    )

    return (
      <Pressable
        accessible={screenReaderEnabled}
        accessibilityHint={translate('ARIA HINT - tap to show options for this episode')}
        accessibilityLabel={accessibilityLabel}
        importantForAccessibility={screenReaderEnabled ? 'yes' : 'no-hide-descendants'}
        onPress={handleMorePress}
        style={styles.wrapper}>
        <RNView
          accessible={false}
          importantForAccessibility='no-hide-descendants'
          style={styles.wrapperTop}>
          {(handleNavigationPress && !screenReaderEnabled) ? (
            <TouchableWithoutFeedback
              accessible={false}
              importantForAccessibility='no-hide-descendants'
              {...(!screenReaderEnabled ? { onPress: handleNavigationPress } : {})}
              {...(testID ? { testID: `${testID}_top_view_nav`.prependTestId() } : {})}>
              {innerTopView}
            </TouchableWithoutFeedback>
          ) : (
            innerTopView
          )}
          <DownloadOrDeleteButton
            isDownloaded={isDownloaded}
            isDownloading={isDownloading}
            onPressDelete={() => handleDeletePress(item)}
            onPressDownload={() => handleDownloadPress(item)}
            testID={testID} />
        </RNView>
        {(handleNavigationPress && !screenReaderEnabled) ? (
          <TouchableWithoutFeedback
            accessible={false}
            importantForAccessibility='no-hide-descendants'
            {...(!screenReaderEnabled ? { onPress: handleNavigationPress } : {})}
            {...(testID ? { testID: `${testID}_bottom_view_nav`.prependTestId() } : {})}>
            <RNView>{PV.Fonts.fontScale.largest !== fontScaleMode && bottomText}</RNView>
          </TouchableWithoutFeedback>
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
            testID={testID}
            timeLabel={timeLabel}
            userPlaybackPosition={userPlaybackPosition}
          />
        </View>
      </Pressable>
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
