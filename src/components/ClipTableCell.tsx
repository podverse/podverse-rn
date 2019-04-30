import React from 'react'
import { Image, StyleSheet } from 'react-native'
import { readableClipTime, readableDate } from '../lib/utility'
import { PV } from '../resources'
import { button } from '../styles'
import { Icon, Text, View } from './'

type Props = {
  endTime?: number
  episodePubDate?: string
  episodeTitle?: string
  handleMorePress?: any
  podcastImageUrl?: string
  podcastTitle?: string
  startTime: number
  title?: string
}

export const ClipTableCell = (props: Props) => {
  const { endTime, episodePubDate, episodeTitle, handleMorePress, podcastImageUrl, podcastTitle,
    startTime, title = 'untitled clip' } = props

  const clipTime = readableClipTime(startTime, endTime)

  const showPodcastInfo = episodePubDate || episodeTitle || podcastImageUrl || podcastTitle

  const moreButton = (
    <View style={styles.buttonView}>
      <Icon
        name='ellipsis-h'
        onPress={handleMorePress}
        size={26}
        style={button.iconOnly} />
    </View>
  )

  return (
    <View style={styles.wrapper}>
      {
        !!showPodcastInfo &&
          <View style={styles.wrapperTop}>
            {
              !!podcastImageUrl &&
                <Image
                  source={{ uri: podcastImageUrl }}
                  style={styles.image} />
            }
            <View style={styles.textWrapper}>
              {
                !!podcastTitle &&
                  <Text
                    isSecondary={true}
                    numberOfLines={1}
                    style={styles.podcastTitle}>
                    {podcastTitle}
                  </Text>
              }
              {
                !!episodeTitle &&
                  <Text
                    numberOfLines={2}
                    style={styles.episodeTitle}>
                    {episodeTitle}
                  </Text>
              }
              {
                !!episodePubDate &&
                  <Text
                    isSecondary={true}
                    style={styles.bottomText}>
                    {readableDate(episodePubDate)}
                  </Text>
              }
            </View>
            {
              handleMorePress && moreButton
            }
          </View>
      }
      <View style={styles.wrapperBottom}>
        <View style={styles.wrapperBottomTextWrapper}>
          <Text
            numberOfLines={4}
            style={styles.title}>
            {title}
          </Text>
          <Text
            style={styles.clipTime}>
            {clipTime}
          </Text>
        </View>
        {
          !showPodcastInfo && handleMorePress && moreButton
        }
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  bottomText: {
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    justifyContent: 'flex-end',
    marginTop: 2
  },
  buttonView: {
    flex: 0
  },
  clipTime: {
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    justifyContent: 'flex-end',
    marginTop: 4
  },
  episodeTitle: {
    fontSize: PV.Fonts.sizes.md,
    fontWeight: PV.Fonts.weights.semibold,
    marginTop: 2
  },
  image: {
    flex: 0,
    height: 60,
    marginRight: 12,
    width: 60
  },
  podcastTitle: {
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    justifyContent: 'flex-start'
  },
  textWrapper: {
    flex: 1
  },
  title: {
    flex: 0,
    fontSize: PV.Fonts.sizes.md,
    fontWeight: PV.Fonts.weights.semibold
  },
  wrapper: {
    margin: 8
  },
  wrapperBottom: {
    flexDirection: 'row'
  },
  wrapperBottomTextWrapper: {
    flex: 1
  },
  wrapperTop: {
    flexDirection: 'row',
    marginBottom: 8
  }
})
