import React from 'react'
import { Image, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { readableDate } from '../lib/utility'
import { PV } from '../resources'
import { Text, View } from './'

type Props = {
  autoDownloadOn?: boolean
  downloadCount?: number
  lastEpisodePubDate?: string
  onPress?: any
  podcastAuthors?: string
  podcastCategories?: string
  podcastImageUrl?: string
  podcastTitle: string
}

export const PodcastTableCell = (props: Props) => {
  const { autoDownloadOn, downloadCount, lastEpisodePubDate, onPress, podcastAuthors,
    podcastCategories, podcastImageUrl = PV.Images.SQUARE_PLACEHOLDER,podcastTitle = 'untitled podcast'
    } = props

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.wrapper}>
        <Image
          source={{ uri: podcastImageUrl }}
          style={styles.image} />
        <View style={styles.textWrapper}>
          <Text
            numberOfLines={3}
            style={styles.title}>
            {podcastTitle}
          </Text>
          <View style={styles.textWrapperRow}>
            {
              !!podcastCategories &&
                <View style={styles.textWrapperRowLeft}>
                  <Text
                    isSecondary={true}
                    numberOfLines={1}
                    style={styles.bottomText}>
                    {podcastCategories}
                  </Text>
                </View>
            }
            {
              autoDownloadOn &&
                <View style={styles.textWrapperRowRight}>
                  <Text
                    isSecondary={true}
                    style={styles.bottomText}>
                    Auto DL On
                  </Text>
                </View>
            }
          </View>
          <View style={styles.textWrapperRow}>
            {
              !!podcastAuthors &&
                <View style={styles.textWrapperRowLeft}>
                  <Text
                    isSecondary={true}
                    numberOfLines={1}
                    style={styles.bottomText}>
                    {podcastAuthors}
                  </Text>
                </View>
            }
            {
              !!downloadCount || downloadCount === 0 &&
                <View style={styles.textWrapperRowLeft}>
                  <Text
                    isSecondary={true}
                    style={styles.bottomText}>
                    {`${downloadCount} downloaded`}
                  </Text>
                </View>
            }
            {
              !!lastEpisodePubDate &&
                <View style={styles.textWrapperRowRight}>
                  <Text
                    isSecondary={true}
                    style={styles.bottomText}>
                    {readableDate(lastEpisodePubDate)}
                  </Text>
                </View>
            }
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
  textWrapperRow: {
    flex: 0,
    flexDirection: 'row'
  },
  textWrapperRowLeft: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  textWrapperRowRight: {
    alignItems: 'flex-end',
    flex: 1,
    justifyContent: 'flex-end'
  },
  image: {
    flex: 0,
    height: PV.Table.cells.podcast.image.height,
    marginRight: 12,
    width: PV.Table.cells.podcast.image.width
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
    fontWeight: PV.Fonts.weights.semibold
  },
  wrapper: {
    flexDirection: 'row'
  }
})
