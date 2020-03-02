import React from 'react'
import { StyleSheet, View as RNView } from 'react-native'
import { getGlobal } from 'reactn'
import { FastImage, Icon, Text, View } from '.'
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
}

export class QueueTableCell extends React.PureComponent<Props> {
  render() {
    const { fontScaleMode } = getGlobal()
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
      showRemoveButton
    } = this.props

    return (
      <View hasZebraStripe={hasZebraStripe} style={styles.wrapper}>
        <RNView style={styles.wrapperTop}>
          <FastImage isSmall={true} key={podcastImageUrl} source={podcastImageUrl} styles={styles.image} />
          <RNView style={styles.textWrapper}>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.sm}
              isSecondary={true}
              numberOfLines={1}
              style={styles.podcastTitle}>
              {podcastTitle || 'untitled podcast'}
            </Text>
            <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} numberOfLines={1} style={styles.episodeTitle}>
              {episodeTitle || 'untitled episode'}
            </Text>
            {!!episodePubDate && (
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                isSecondary={true}
                numberOfLines={1}
                style={styles.episodePubDate}>
                {readableDate(episodePubDate)}
              </Text>
            )}
          </RNView>
          {showMoveButton && <Icon isSecondary={true} name='arrows-alt-v' size={28} style={button.iconOnlyMedium} />}
          {showRemoveButton && handleRemovePress && (
            <Icon name='times' onPress={handleRemovePress} size={28} style={button.iconOnlyMedium} />
          )}
        </RNView>
        {!hideBottomRow && (
          <RNView style={styles.wrapperBottom}>
            <Text fontSizeLargestScale={PV.Fonts.largeSizes.sm} numberOfLines={1} style={styles.clipTitle}>
              {clipStartTime ? clipTitle || 'untitled clip' : 'Full Episode'}
            </Text>
            {!!clipStartTime && (
              <Text fontSizeLargestScale={PV.Fonts.largeSizes.sm} style={styles.clipTime}>
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
