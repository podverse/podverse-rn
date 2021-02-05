import { StyleSheet, View as RNView } from 'react-native'
import React from 'reactn'
import { FastImage, Icon, Text, View } from '.'
import { translate } from '../lib/i18n'
import { readableClipTime, readableDate } from '../lib/utility'
import { PV } from '../resources'
import { button } from '../styles'

type Props = {
  clipEndTime?: number
  clipStartTime?: number
  clipTitle?: string
  episodePubDate?: string
  episodeTitle?: string
  handleRemovePress?: any
  hideBottomRow?: boolean
  podcastImageUrl?: string
  podcastTitle?: string
  showMoveButton?: boolean
  showRemoveButton?: boolean
  testID: string
  transparent?: boolean
  hideDivider?: boolean
}

export class QueueTableCell extends React.PureComponent<Props> {
  render() {
    const {
      clipEndTime,
      clipStartTime,
      clipTitle = translate('Untitled Clip'),
      episodePubDate = '',
      episodeTitle = translate('Untitled Episode'),
      handleRemovePress,
      hideBottomRow,
      podcastImageUrl,
      podcastTitle = translate('Untitled Podcast'),
      showMoveButton,
      showRemoveButton,
      testID,
      transparent,
      hideDivider
    } = this.props

    return (
      <View
        style={[styles.wrapper, hideDivider ? { borderBottomWidth: 0 } : {}]}
        transparent={transparent}
        testID={testID}>
        <RNView style={styles.wrapperTop}>
          <FastImage isSmall={true} key={podcastImageUrl} source={podcastImageUrl} styles={styles.image} />
          <RNView style={styles.textWrapper}>
            {!!podcastTitle && (
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                isSecondary={true}
                numberOfLines={1}
                style={styles.podcastTitle}
                testID={`${testID}_podcast_title`}>
                {podcastTitle.trim()}
              </Text>
            )}
            {!!episodeTitle && (
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.md}
                numberOfLines={1}
                style={styles.episodeTitle}
                testID={`${testID}_episode_title`}>
                {episodeTitle.trim()}
              </Text>
            )}
            {!!episodePubDate && (
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                isSecondary={true}
                numberOfLines={1}
                style={styles.episodePubDate}
                testID={`${testID}_episode_pub_date`}>
                {readableDate(episodePubDate)}
              </Text>
            )}
          </RNView>
          {!!showMoveButton && <Icon isSecondary={true} name='arrows-alt-v' size={28} style={button.iconOnlyMedium} />}
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
    paddingBottom: 8,
    paddingHorizontal: 8,
    paddingTop: 10,
    marginHorizontal: 8,
    borderBottomColor: PV.Colors.gray,
    borderBottomWidth: 1
  },
  wrapperBottom: {
    flexDirection: 'row',
    marginTop: 8
  },
  wrapperTop: {
    alignItems: 'center',
    flexDirection: 'row'
  }
})
