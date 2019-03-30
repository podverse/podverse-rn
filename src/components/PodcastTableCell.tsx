import React from 'react'
import { Image, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { PV } from '../resources'
import { Text, View } from './'

type Props = {
  autoDownloadOn?: boolean
  downloadCount?: number
  handleNavigationPress?: any
  lastEpisodePubDate?: string
  podcastAuthors?: string
  podcastCategories?: string
  podcastImageUrl?: string
  podcastTitle: string
}

export const PodcastTableCell = (props: Props) => {
  const { autoDownloadOn, downloadCount, handleNavigationPress, lastEpisodePubDate, podcastAuthors,
    podcastCategories, podcastImageUrl = PV.Images.SQUARE_PLACEHOLDER,podcastTitle = 'untitled podcast'
    } = props

  return (
    <TouchableWithoutFeedback onPress={handleNavigationPress}>
      <View style={styles.wrapper}>
        <Image
          source={{ uri: podcastImageUrl }}
          style={styles.image} />
        <View style={styles.textWrapper}>
          <Text
            numberOfLines={3}
            style={styles.title}>{podcastTitle}</Text>
          <View style={styles.bottomTextWrapper}>
            <View style={styles.bottomTextWrapperLeft}>
              {
                podcastCategories &&
                  <Text
                    isSecondary={true}
                    style={styles.bottomText}>
                    {podcastCategories}
                  </Text>
              }
              {
                podcastAuthors &&
                  <Text
                    isSecondary={true}
                    style={styles.bottomText}>
                    {podcastAuthors}
                  </Text>
              }
              {
                downloadCount &&
                  <Text
                    isSecondary={true}
                    style={styles.bottomText}>
                    {`${downloadCount} downloaded`}
                  </Text>
              }
            </View>
            <View style={styles.bottomTextWrapperRight}>
              {
                autoDownloadOn &&
                  <Text
                    isSecondary={true}
                    style={styles.bottomText}>
                    Auto DL On
                  </Text>
              }
              {
                lastEpisodePubDate &&
                  <Text
                    isSecondary={true}
                    style={styles.bottomText}>
                    {lastEpisodePubDate}
                  </Text>
              }
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  bottomText: {
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    justifyContent: 'flex-end',
    marginTop: 2
  },
  bottomTextWrapper: {
    flex: 1,
    flexDirection: 'row'
  },
  bottomTextWrapperLeft: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  bottomTextWrapperRight: {
    alignItems: 'flex-end',
    flex: 1,
    justifyContent: 'flex-end'
  },
  image: {
    flex: 0,
    height: 92,
    marginRight: 12,
    width: 92
  },
  textWrapper: {
    flex: 1,
    paddingBottom: 5,
    paddingRight: 8,
    paddingTop: 6
  },
  title: {
    flex: 1,
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold
  },
  wrapper: {
    flexDirection: 'row'
  }
})
