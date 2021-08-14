import { StyleSheet, TouchableWithoutFeedback, View as RNView } from 'react-native'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { readableClipTime, readableDate } from '../lib/utility'
import { PV } from '../resources'
import { button } from '../styles'
import { FastImage, Icon, Text, View } from '.'

type Props = {
  clipEndTime?: number
  clipStartTime?: number
  clipTitle?: string
  drag?: any
  episodePubDate?: string
  episodeTitle?: string
  handleRemovePress?: any
  hideBottomRow?: boolean
  hideDivider?: boolean
  isActive?: boolean
  onPress?: any
  podcastImageUrl?: string
  podcastTitle?: string
  showMoveButton?: boolean
  showRemoveButton?: boolean
  testID: string
  transparent?: boolean
}

export class QueueTableCell extends React.PureComponent<Props> {
  render() {
    const {
      clipEndTime,
      clipStartTime,
      clipTitle = translate('Untitled Clip'),
      drag,
      episodePubDate = '',
      episodeTitle = translate('Untitled Episode'),
      handleRemovePress,
      hideBottomRow,
      hideDivider,
      isActive,
      onPress,
      podcastImageUrl,
      podcastTitle = translate('Untitled Podcast'),
      showMoveButton,
      showRemoveButton,
      testID,
      transparent
    } = this.props

    const viewStyle = isActive
      ? [styles.wrapper, styles.wrapperActive, hideDivider ? { borderBottomWidth: 0 } : {}]
      : [styles.wrapper, hideDivider ? { borderBottomWidth: 0 } : {}]

    return (
      <View
        style={viewStyle}
        transparent={transparent}
        testID={testID}>
        <RNView style={styles.wrapperTop}>
          <TouchableWithoutFeedback onLongPress={drag} onPress={onPress}>
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
                    {podcastTitle.trim()}
                  </Text>
                )}
                {!!episodeTitle && (
                  <Text
                    fontSizeLargestScale={PV.Fonts.largeSizes.md}
                    numberOfLines={2}
                    style={styles.episodeTitle}
                    testID={`${testID}_episode_title`}>
                    {episodeTitle.trim()}
                  </Text>
                )}
                {!!episodePubDate && (
                  <Text
                    fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                    isSecondary
                    numberOfLines={1}
                    style={styles.episodePubDate}
                    testID={`${testID}_episode_pub_date`}>
                    {readableDate(episodePubDate)}
                  </Text>
                )}
              </RNView>
              {!!showMoveButton && <Icon isSecondary name='arrows-alt-v' size={28} style={button.iconOnlyMedium} />}
            </RNView>
          </TouchableWithoutFeedback>
          {!!showRemoveButton && !!handleRemovePress && (
            <Icon
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
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.sm}
              numberOfLines={1}
              style={styles.clipTitle}
              testID={`${testID}_bottom_text`}>
              {!!clipStartTime && !!clipTitle ? clipTitle.trim() : translate('Full Episode')}
            </Text>
            {!!clipStartTime && (
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                style={styles.clipTime}
                testID={`${testID}_clip_time`}>
                {readableClipTime(clipStartTime, clipEndTime)}
              </Text>
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
    height: 64,
    marginRight: 12,
    width: 64
  },
  podcastTitle: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold,
    justifyContent: 'flex-start',
    marginTop: 1
  },
  textWrapper: {
    flex: 1,
    paddingRight: 8
  },
  wrapper: {
    paddingHorizontal: 8,
    paddingVertical: 10,
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
    flexDirection: 'row',
    marginTop: 8
  },
  wrapperTappableInner: {
    flex: 1,
    flexDirection: 'row'
  },
  wrapperTop: {
    alignItems: 'center',
    flexDirection: 'row'
  }
})
