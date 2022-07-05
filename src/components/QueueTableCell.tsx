import { LiveItem } from 'podverse-shared'
import { Pressable, StyleSheet, View as RNView } from 'react-native'
import React from 'reactn'
import { translate } from '../lib/i18n'
import {
  generateEpisodeAccessibilityText,
  getTimeLabelText,
  prefixClipLabel,
  readableClipTime,
  readableDate
} from '../lib/utility'
import { PV } from '../resources'
import { button, images } from '../styles'
import { TimeRemainingWidget } from './TimeRemainingWidget'
import { FastImage, Icon, Text, View } from '.'

type Props = {
  clipEndTime?: number
  clipStartTime?: number
  clipTitle?: string
  drag?: any
  episodeDuration?: number
  episodeId?: string
  episodePubDate?: Date
  episodeTitle?: string
  handleRemovePress?: any
  hideBottomRow?: boolean
  hideDivider?: boolean
  isActive?: boolean
  isPlaylistScreen?: boolean
  liveItem?: LiveItem
  mediaFileDuration?: number
  onPress?: any
  podcastImageUrl?: string
  podcastTitle?: string
  showMoveButton?: boolean
  showRemoveButton?: boolean
  testID: string
  transparent?: boolean
  userPlaybackPosition?: number
}

export class QueueTableCell extends React.PureComponent<Props> {
  render() {
    const {
      clipEndTime,
      clipStartTime,
      drag,
      episodeDuration,
      episodeId,
      episodePubDate,
      episodeTitle = translate('Untitled Episode'),
      handleRemovePress,
      hideBottomRow,
      hideDivider,
      isActive,
      liveItem,
      mediaFileDuration,
      onPress,
      podcastImageUrl,
      podcastTitle = translate('Untitled Podcast'),
      showMoveButton,
      showRemoveButton,
      testID,
      transparent,
      userPlaybackPosition
    } = this.props

    const clipTitle = this.props.clipTitle || prefixClipLabel(episodeTitle)

    const viewStyle = isActive
      ? [styles.wrapper, styles.wrapperActive, hideDivider ? { borderBottomWidth: 0 } : {}]
      : [styles.wrapper, hideDivider ? { borderBottomWidth: 0 } : {}]

    const isClip = !!clipStartTime && !!clipTitle

    const podcastTitleText = podcastTitle.trim()
    const episodeTitleText = episodeTitle.trim()
    const finalPubDate = liveItem?.start ? liveItem.start : episodePubDate
    const pubDateText = readableDate(finalPubDate)

    // Episode progress bar related logic
    const { session } = this.global
    const { userInfo } = session
    const { historyItemsIndex } = userInfo

    const episodeCompleted =
      historyItemsIndex &&
      historyItemsIndex.episodes &&
      episodeId &&
      historyItemsIndex.episodes[episodeId] &&
      historyItemsIndex.episodes[episodeId].completed

    const timeLabel = getTimeLabelText(mediaFileDuration, episodeDuration, userPlaybackPosition)
    const timeLabelText = generateEpisodeAccessibilityText(episodeCompleted, timeLabel)

    // TODO: QueueTableCell is poorly written...we should probably pass in a whole NowPlayingItem
    // as a parameter, and then extract the values in the table cell, instead of passing in
    // all the fields as parameters individually.

    const episode = {
      duration: liveItem ? 0 : episodeDuration,
      id: episodeId,
      pubDate: finalPubDate,
      title: episodeTitle
    }

    // eslint-disable-next-line max-len
    const accessibilityLabel = `${!!podcastTitle ? `${podcastTitleText}, ` : ''} ${
      !!episodeTitle ? `${episodeTitleText}, ` : ''
    } ${!!finalPubDate ? `${pubDateText}` : ''} ${!isClip ? `, ${timeLabelText}` : `, ${clipTitle.trim()}`}`

    return (
      <View style={viewStyle} transparent={transparent} testID={testID}>
        <RNView style={styles.wrapperTop}>
          <Pressable
            accessibilityHint={
              isClip ? translate('ARIA HINT - tap to play this episode') : translate('ARIA HINT - tap play this clip')
            }
            accessibilityLabel={accessibilityLabel}
            accessibilityRole='none'
            onLongPress={drag}
            onPress={onPress}
            style={{ flex: 1 }}>
            <RNView style={styles.wrapperTappableInner}>
              <FastImage isSmall key={podcastImageUrl} source={podcastImageUrl} styles={styles.image} />
              <RNView style={styles.textWrapper}>
                {!!podcastTitle && (
                  <Text
                    fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                    isSecondary
                    numberOfLines={1}
                    style={styles.podcastTitle}
                    testID={`${testID}_podcast_title`}>
                    {podcastTitleText}
                  </Text>
                )}
                {!!episodeTitle && (
                  <Text
                    fontSizeLargestScale={PV.Fonts.largeSizes.md}
                    numberOfLines={2}
                    style={styles.episodeTitle}
                    testID={`${testID}_episode_title`}>
                    {episodeTitleText}
                  </Text>
                )}
                {!!finalPubDate && (
                  <Text
                    fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                    isSecondary
                    numberOfLines={1}
                    style={styles.episodePubDate}
                    testID={`${testID}_episode_pub_date`}>
                    {pubDateText}
                  </Text>
                )}
              </RNView>
              {!!showMoveButton && <Icon isSecondary name='arrows-alt-v' size={28} style={button.iconOnlyMedium} />}
            </RNView>
          </Pressable>
          {!!showRemoveButton && !!handleRemovePress && (
            <Icon
              accessibilityHint={translate('ARIA HINT - remove this item')}
              accessibilityLabel={translate('Remove')}
              accessibilityRole='button'
              name='times'
              onPress={handleRemovePress}
              size={28}
              style={button.iconOnlyMedium}
              testID={`${testID}_remove_button`}
            />
          )}
        </RNView>
        {!hideBottomRow && (
          <RNView style={styles.wrapperBottom}>
            {isClip && (
              <>
                <Text
                  accessible={false}
                  fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                  importantForAccessibility='no'
                  numberOfLines={1}
                  style={styles.clipTitle}
                  testID={`${testID}_bottom_text`}>
                  {clipTitle.trim()}
                </Text>
                {!!clipStartTime && (
                  <Text
                    accessible={false}
                    fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                    importantForAccessibility='no'
                    style={styles.clipTime}
                    testID={`${testID}_clip_time`}>
                    {readableClipTime(clipStartTime, clipEndTime)}
                  </Text>
                )}
              </>
            )}
            {!isClip && (
              <TimeRemainingWidget
                episodeCompleted={episodeCompleted}
                forceShowProgressBar
                hidePlayButton
                item={episode}
                itemType='episode'
                mediaFileDuration={mediaFileDuration}
                progressFullWidth
                testID={testID}
                timeLabel={timeLabel}
                userPlaybackPosition={userPlaybackPosition}
              />
            )}
          </RNView>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  clipTime: {
    fontSize: PV.Fonts.sizes.md,
    color: PV.Colors.skyLight,
    marginLeft: 4
  },
  clipTitle: {
    flex: 1,
    fontSize: PV.Fonts.sizes.md,
    fontWeight: PV.Fonts.weights.bold
  },
  episodePubDate: {
    fontSize: PV.Fonts.sizes.sm,
    fontWeight: PV.Fonts.weights.semibold,
    color: PV.Colors.skyLight,
    justifyContent: 'flex-end',
    marginTop: 3
  },
  episodeTitle: {
    fontSize: PV.Fonts.sizes.xxl,
    fontWeight: PV.Fonts.weights.thin
  },
  image: {
    flex: 0,
    height: images.medium.height,
    marginRight: 12,
    width: images.medium.width
  },
  podcastTitle: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold,
    justifyContent: 'flex-start'
  },
  textWrapper: {
    flex: 1,
    paddingRight: 8,
    justifyContent: 'center'
  },
  wrapper: {
    paddingHorizontal: 8,
    paddingTop: 14,
    paddingBottom: 10,
    marginHorizontal: 8,
    borderBottomColor: PV.Colors.gray,
    borderBottomWidth: 1
  },
  wrapperActive: {
    borderBottomWidth: 2,
    borderColor: PV.Colors.brandColor,
    borderBottomColor: PV.Colors.brandColor,
    borderWidth: 2,
    paddingHorizontal: 6,
    paddingVertical: 8
  },
  wrapperBottom: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 8
  },
  wrapperTappableInner: {
    flex: 0,
    flexDirection: 'row'
  },
  wrapperTop: {
    alignItems: 'center',
    flexDirection: 'row'
  }
})
