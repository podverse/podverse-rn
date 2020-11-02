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
  hasZebraStripe?: boolean
  hideBottomRow?: boolean
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
      clipTitle,
      episodePubDate,
      episodeTitle,
      handleRemovePress,
      hasZebraStripe,
      hideBottomRow,
      podcastImageUrl,
      podcastTitle,
      showMoveButton,
      showRemoveButton,
      testID,
      transparent
    } = this.props

    return (
      <View hasZebraStripe={hasZebraStripe} style={styles.wrapper} transparent={transparent} testID={testID}>
        <RNView style={styles.wrapperTop}>
          <FastImage isSmall={true} key={podcastImageUrl} source={podcastImageUrl} styles={styles.image} />
          <RNView style={styles.textWrapper}>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.sm}
              isSecondary={true}
              numberOfLines={1}
              style={styles.podcastTitle}
              testID={`${testID}_podcast_title`}>
              {podcastTitle || translate('untitled podcast')}
            </Text>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              numberOfLines={1}
              style={styles.episodeTitle}
              testID={`${testID}_episode_title`}>
              {episodeTitle || translate('untitled episode')}
            </Text>
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
          {showMoveButton && <Icon isSecondary={true} name='arrows-alt-v' size={28} style={button.iconOnlyMedium} />}
          {showRemoveButton && handleRemovePress && (
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
              {clipStartTime ? clipTitle || translate('untitled clip') : translate('Full Episode')}
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
    flex: 0,
    fontSize: PV.Fonts.sizes.md,
    marginLeft: 4
  },
  clipTitle: {
    flex: 1,
    fontSize: PV.Fonts.sizes.md
  },
  episodePubDate: {
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    justifyContent: 'flex-end',
    marginTop: 3
  },
  episodeTitle: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  },
  image: {
    flex: 0,
    height: 64,
    marginRight: 12,
    width: 64
  },
  podcastTitle: {
    flex: 0,
    fontSize: PV.Fonts.sizes.md,
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
    paddingTop: 10
  },
  wrapperBottom: {
    flexDirection: 'row',
    marginTop: 8
  },
  wrapperTop: {
    flexDirection: 'row'
  }
})
