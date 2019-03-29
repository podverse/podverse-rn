import React from 'react'
import { Image, StyleSheet, TouchableOpacity } from 'react-native'
import { readableClipTime } from '../lib/utility'
import { PV } from '../resources'
import { Text, View } from './'

type Props = {
  clipEndTime?: number
  clipStartTime: number
  clipTitle?: string
  episodePubDate?: string
  episodeTitle?: string
  handleMorePress?: any
  podcastImageUrl?: string
  podcastTitle: string
}

export const ClipTableCell = (props: Props) => {
  const { clipEndTime, clipStartTime, clipTitle = 'untitled clip', episodePubDate, episodeTitle,
    handleMorePress, podcastImageUrl, podcastTitle } = props

  const clipTime = readableClipTime(clipStartTime, clipEndTime)

  const showPodcastInfo = episodePubDate || episodeTitle || podcastImageUrl || podcastTitle

  return (
    <View>
      {
        showPodcastInfo &&
          <View style={styles.wrapperTop}>
            {
              podcastImageUrl &&
              <Image
                source={{ uri: podcastImageUrl }}
                style={styles.image} />
            }
            <View style={styles.textWrapper}>
              {
                podcastTitle &&
                <Text
                  isSecondary={true}
                  numberOfLines={1}
                  style={styles.podcastTitle}>
                  {podcastTitle}
                </Text>
              }
              {
                episodeTitle &&
                  <Text
                    numberOfLines={1}
                    style={styles.episodeTitle}>
                    {episodeTitle}
                  </Text>
              }
              {
                episodePubDate &&
                <Text
                  isSecondary={true}
                  style={styles.bottomText}>
                  {episodePubDate}
                </Text>
              }
            </View>
            {
              handleMorePress &&
              <View style={styles.buttonView}>
                <TouchableOpacity
                  style={styles.moreButton}>
                  <Image source={PV.Images.MORE} style={styles.moreButtonImage} resizeMode='contain' />
                </TouchableOpacity>
              </View>
            }
          </View>
      }
      <View style={styles.wrapperBottom}>
        <View style={styles.wrapperBottomTextWrapper}>
          <Text
            numberOfLines={4}
            style={styles.clipTitle}>
            {clipTitle}
          </Text>
          <Text
            style={styles.clipTime}>
            {clipTime}
          </Text>
        </View>
        {
          !showPodcastInfo && handleMorePress &&
            <View style={styles.buttonView}>
              <TouchableOpacity
                style={styles.moreButton}>
                <Image source={PV.Images.MORE} style={styles.moreButtonImage} resizeMode='contain' />
              </TouchableOpacity>
            </View>
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
    flex: 0,
    marginLeft: 8,
    marginRight: 8
  },
  clipTime: {
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    justifyContent: 'flex-end',
    marginTop: 4
  },
  clipTitle: {
    flex: 0,
    fontSize: PV.Fonts.sizes.md,
    fontWeight: PV.Fonts.weights.bold,
    justifyContent: 'flex-end',
    marginTop: 2
  },
  episodeTitle: {
    fontSize: PV.Fonts.sizes.md,
    fontWeight: PV.Fonts.weights.bold
  },
  image: {
    flex: 0,
    height: 60,
    marginLeft: 8,
    marginRight: 12,
    width: 60
  },
  moreButton: {
    flex: 0,
    marginBottom: 'auto',
    marginTop: 'auto'
  },
  moreButtonImage: {
    borderColor: 'white',
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    tintColor: 'white',
    width: 44
  },
  podcastTitle: {
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    justifyContent: 'flex-start'
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    paddingRight: 16
  },
  wrapperBottom: {
    flexDirection: 'row',
    marginLeft: 8,
    marginRight: 8
  },
  wrapperBottomTextWrapper: {
    flex: 1
  },
  wrapperTop: {
    flexDirection: 'row',
    marginBottom: 10
  }
})
