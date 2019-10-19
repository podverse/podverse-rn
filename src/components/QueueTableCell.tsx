import React from 'react'
import { StyleSheet } from 'react-native'
import FastImage from 'react-native-fast-image'
import { Icon, Text, View } from '.'
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
  render () {
    const { clipEndTime, clipStartTime, clipTitle = 'Untitled clip', episodePubDate,
      episodeTitle = 'Untilted episode', handleRemovePress, hideBottomRow, podcastImageUrl,
      podcastTitle = 'Untitled podcast', showMoveButton, showRemoveButton } = this.props

    return (
      <View style={styles.wrapper}>
        <View style={styles.wrapperTop}>
          <FastImage
            key={podcastImageUrl}
            source={{ uri: podcastImageUrl }}
            style={styles.image} />
          <View style={styles.textWrapper}>
            <Text
              isSecondary={true}
              numberOfLines={1}
              style={styles.podcastTitle}>
              {podcastTitle}
            </Text>
            <Text
              numberOfLines={1}
              style={styles.episodeTitle}>
              {episodeTitle}
            </Text>
            {
              !!episodePubDate &&
                <Text
                  isSecondary={true}
                  numberOfLines={1}
                  style={styles.episodePubDate}>
                  {readableDate(episodePubDate)}
                </Text>
            }
          </View>
          {
            showMoveButton &&
              <Icon
                name='bars'
                size={28}
                style={button.iconOnlyMedium} />
          }
          {
            showRemoveButton && handleRemovePress &&
              <Icon
                name='times'
                onPress={handleRemovePress}
                size={28}
                style={button.iconOnlyMedium} />
          }
        </View>
        {
          !hideBottomRow &&
            <View style={styles.wrapperBottom}>
              <Text
                numberOfLines={1}
                style={styles.clipTitle}>
                {clipStartTime ? clipTitle : 'Full Episode'}
              </Text>
              {
                !!clipStartTime &&
                  <Text
                    style={styles.clipTime}>
                    {readableClipTime(clipStartTime, clipEndTime)}
                  </Text>
              }
            </View>
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  clipTime: {
    flex: 0,
    fontSize: PV.Fonts.sizes.md,
    lineHeight: PV.Fonts.sizes.md + 2,
    marginLeft: 4
  },
  clipTitle: {
    flex: 1,
    fontSize: PV.Fonts.sizes.md,
    fontWeight: PV.Fonts.weights.semibold,
    lineHeight: PV.Fonts.sizes.md + 2
  },
  episodePubDate: {
    flex: 1,
    fontSize: PV.Fonts.sizes.sm,
    lineHeight: PV.Fonts.sizes.sm + 2,
    marginTop: 1
  },
  episodeTitle: {
    flex: 1,
    fontSize: PV.Fonts.sizes.md,
    lineHeight: PV.Fonts.sizes.md + 2
  },
  image: {
    flex: 0,
    height: 60,
    marginRight: 12,
    width: 60
  },
  podcastTitle: {
    flex: 1,
    fontSize: PV.Fonts.sizes.md,
    lineHeight: PV.Fonts.sizes.md + 2,
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
