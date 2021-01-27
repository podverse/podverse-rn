import { StyleSheet, TouchableWithoutFeedback, View as RNView } from 'react-native'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { decodeHTMLString, readableDate, removeHTMLFromString, testProps } from '../lib/utility'
import { PV } from '../resources'
import { FastImage, IndicatorDownload, Text, View } from './'
import { DownloadButton } from './DownloadButton'
import { TimeRemainingWidget } from './TimeRemainingWidget'

type Props = {
  handleMorePress?: any
  handleNavigationPress?: any
  handleDownloadPress?: any
  hideImage?: boolean
  item?: any
  mediaFileDuration?: number
  pubDate?: any
  showPodcastTitle?: boolean
  testID: string
  transparent?: boolean
  userPlaybackPosition?: number
}

export class EpisodeTableCell extends React.PureComponent<Props> {
  render() {
    const {
      handleMorePress,
      handleNavigationPress,
      handleDownloadPress,
      hideImage,
      item,
      mediaFileDuration,
      showPodcastTitle,
      testID,
      transparent,
      userPlaybackPosition
    } = this.props

    const { id, mediaUrl, pubDate = '', podcast = {} } = item
    let { description = '', title = '' } = item
    const { imageUrl = '' } = podcast
    const podcastTitle = podcast.title || translate('Untitled Podcast')
    description = removeHTMLFromString(description)
    description = decodeHTMLString(description)

    const { downloadedEpisodeIds, downloadsActive, fontScaleMode } = this.global

    const isDownloading = downloadsActive[id]
    const isDownloaded = item.addByRSSPodcastFeedUrl ? downloadedEpisodeIds[mediaUrl] : downloadedEpisodeIds[id]

    if (!title) title = translate('Untitled Episode')

    const titleStyle = (podcastTitle ? styles.title : [styles.title, { marginTop: 0 }]) as any

    const innerTopView = (
      <RNView style={styles.innerTopView}>
        {!!imageUrl && !hideImage && <FastImage isSmall={true} source={imageUrl} styles={styles.image} />}
        <RNView style={styles.textWrapper}>
          {showPodcastTitle && podcastTitle && (
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.sm}
              isSecondary={true}
              numberOfLines={1}
              style={styles.podcastTitle}
              testID={`${testID}_podcast_title`}>
              {podcastTitle.trim()}
            </Text>
          )}
          {title && (
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              numberOfLines={1}
              style={titleStyle}
              testID={`${testID}_title`}>
              {title.trim()}
            </Text>
          )}
          <RNView style={styles.textWrapperBottomRow}>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.sm}
              isSecondary={true}
              style={styles.pubDate}
              testID={`${testID}_pub_date`}>
              {readableDate(pubDate)}
            </Text>
            {isDownloaded && <IndicatorDownload />}
          </RNView>
        </RNView>
      </RNView>
    )

    const descriptionStyle = hideImage ? [styles.description, { paddingLeft: 0 }] : styles.description

    const bottomText = (
      <Text
        fontSizeLargestScale={PV.Fonts.largeSizes.md}
        isSecondary={true}
        numberOfLines={2}
        style={descriptionStyle}
        testID={`${testID}_description`}>
        {description.trim()}
      </Text>
    )

    const includeShowMore = !item.addByRSSPodcastFeedUrl

    return (
      <View style={styles.wrapper} transparent={transparent}>
        <RNView style={styles.wrapperTop}>
          {handleNavigationPress ? (
            <TouchableWithoutFeedback
              onPress={handleNavigationPress}
              {...(testID ? testProps(`${testID}_top_view_nav`) : {})}>
              {innerTopView}
            </TouchableWithoutFeedback>
          ) : (
            innerTopView
          )}
          {!isDownloaded && PV.Fonts.fontScale.largest !== fontScaleMode && (
            <DownloadButton testID={testID} isDownloading={isDownloading} onPress={() => handleDownloadPress(item)} />
          )}
        </RNView>
        {handleNavigationPress ? (
          <TouchableWithoutFeedback
            onPress={handleNavigationPress}
            {...(testID ? testProps(`${testID}_bottom_view_nav`) : {})}>
            <RNView>{PV.Fonts.fontScale.largest !== fontScaleMode && bottomText}</RNView>
          </TouchableWithoutFeedback>
        ) : (
          bottomText
        )}
        <TimeRemainingWidget
          {...(includeShowMore ? { handleMorePress } : {})}
          item={item}
          mediaFileDuration={mediaFileDuration}
          userPlaybackPosition={userPlaybackPosition}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  description: {
    fontSize: PV.Fonts.sizes.sm,
    color: PV.Colors.grayLighter,
    marginVertical: 15
  },
  image: {
    flex: 0,
    height: 64,
    marginRight: 12,
    width: 64
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
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    fontWeight: PV.Fonts.weights.semibold,
    color: PV.Colors.skyLight,
    marginTop: 3,
    marginRight: 10
  },
  textWrapper: {
    flex: 1
  },
  textWrapperBottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
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
    flexDirection: 'row'
  }
})
