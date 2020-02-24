import React from 'react'
import { StyleSheet } from 'react-native'
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
  hideBottomRow?: boolean
  podcastImageUrl?: string
  podcastTitle?: string
  showMoveButton?: boolean
  showRemoveButton?: boolean
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
      hideBottomRow,
      podcastImageUrl,
      podcastTitle,
      showMoveButton,
      showRemoveButton
    } = this.props

    return (
      <View style={styles.wrapper}>
        <View style={styles.wrapperTop}>
          <FastImage
            isSmall={true}
            key={podcastImageUrl}
            source={podcastImageUrl}
            styles={styles.image}
          />
          <View style={styles.textWrapper}>
            <Text
              isSecondary={true}
              numberOfLines={1}
              style={styles.podcastTitle}>
              {podcastTitle || 'untitled podcast'}
            </Text>
            <Text numberOfLines={1} style={styles.episodeTitle}>
              {episodeTitle || 'untitled episode'}
            </Text>
            {!!episodePubDate && (
              <Text
                isSecondary={true}
                numberOfLines={1}
                style={styles.episodePubDate}>
                {readableDate(episodePubDate)}
              </Text>
            )}
          </View>
          {showMoveButton && (
            <Icon name='bars' size={28} style={button.iconOnlyMedium} />
          )}
          {showRemoveButton && handleRemovePress && (
            <Icon
              name='times'
              onPress={handleRemovePress}
              size={28}
              style={button.iconOnlyMedium}
            />
          )}
        </View>
        {!hideBottomRow && (
          <View style={styles.wrapperBottom}>
            <Text numberOfLines={1} style={styles.clipTitle}>
              {clipStartTime ? (clipTitle || 'untitled clip') : 'Full Episode'}
            </Text>
            {!!clipStartTime && (
              <Text style={styles.clipTime}>
                {readableClipTime(clipStartTime, clipEndTime)}
              </Text>
            )}
          </View>
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
    fontWeight: PV.Fonts.weights.bold,
    marginTop: 2
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
    lineHeight: PV.Fonts.sizes.md,
    marginTop: 1
  },
  textWrapper: {
    flex: 1,
    paddingRight: 8
  },
  wrapper: {
    margin: 8,
    paddingTop: 2
  },
  wrapperBottom: {
    flexDirection: 'row',
    marginTop: 10
  },
  wrapperTop: {
    flexDirection: 'row'
  }
})
