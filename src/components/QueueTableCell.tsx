import React from 'react'
import { Image, StyleSheet } from 'react-native'
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

export const QueueTableCell = (props: Props) => {
  const { clipEndTime, clipStartTime, clipTitle = 'untitled clip', episodePubDate,
    episodeTitle = 'untilted episode', handleRemovePress, hideBottomRow, podcastImageUrl,
    podcastTitle = 'untitled podcast', showMoveButton, showRemoveButton } = props

  return (
    <View style={styles.wrapper}>
      <View style={styles.wrapperTop}>
        <Image
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

const styles = StyleSheet.create({
  clipTime: {
    flex: 0,
    fontSize: PV.Fonts.sizes.md,
    marginLeft: 4
  },
  clipTitle: {
    flex: 1,
    fontSize: PV.Fonts.sizes.md,
    fontWeight: PV.Fonts.weights.bold
  },
  episodePubDate: {
    flex: 1,
    fontSize: PV.Fonts.sizes.sm
  },
  episodeTitle: {
    flex: 1,
    fontSize: PV.Fonts.sizes.md
  },
  image: {
    flex: 0,
    height: 60,
    marginRight: 12,
    width: 60
  },
  podcastTitle: {
    flex: 1,
    fontSize: PV.Fonts.sizes.md
  },
  textWrapper: {
    flex: 1,
    paddingRight: 8
  },
  wrapper: {
    margin: 8
  },
  wrapperBottom: {
    flexDirection: 'row',
    marginTop: 10
  },
  wrapperTop: {
    flexDirection: 'row'
  }
})
