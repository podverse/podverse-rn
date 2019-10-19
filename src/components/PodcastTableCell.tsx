import { StyleSheet, TouchableWithoutFeedback } from 'react-native'
import FastImage from 'react-native-fast-image'
import React from 'reactn'
import { readableDate } from '../lib/utility'
import { PV } from '../resources'
import { Icon, Text, View } from './'

type Props = {
  autoDownloadSettings?: any
  downloadCount?: number
  downloadedPodcastEpisodeCounts?: any
  id: string
  lastEpisodePubDate?: string
  onPress?: any
  podcastAuthors?: string
  podcastCategories?: string
  podcastImageUrl?: string
  podcastTitle: string
  showAutoDownload?: boolean
  showDownloadCount?: boolean
}

export class PodcastTableCell extends React.PureComponent<Props> {

  render () {
    const { id, lastEpisodePubDate, onPress, podcastAuthors, podcastCategories, podcastImageUrl = PV.Images.SQUARE_PLACEHOLDER,
      podcastTitle = 'Untitled podcast', showAutoDownload, showDownloadCount } = this.props
    const { autoDownloadSettings, downloadedPodcastEpisodeCounts } = this.global

    let downloadCount = 0
    if (showDownloadCount && downloadedPodcastEpisodeCounts) {
      downloadCount = downloadedPodcastEpisodeCounts[id] || 0
    }

    let shouldAutoDownload = false
    if (showAutoDownload) {
      shouldAutoDownload = autoDownloadSettings[id]
    }

    return (
      <TouchableWithoutFeedback onPress={onPress}>
        <View style={styles.wrapper}>
          <FastImage
            source={{ uri: podcastImageUrl }}
            style={styles.image} />
          <View style={styles.textWrapper}>
            <Text
              numberOfLines={3}
              style={styles.title}>
              {podcastTitle}
            </Text>
            <View style={styles.textWrapperRow}>
              <View style={styles.textWrapperRowLeft}>
                {
                  !!podcastCategories &&
                      <Text
                        isSecondary={true}
                        numberOfLines={1}
                        style={styles.bottomText}>
                        {podcastCategories}
                      </Text>
                }
              </View>
              {
                showAutoDownload && shouldAutoDownload &&
                  <View style={styles.textWrapperRowRight}>
                    <Icon
                      isSecondary={true}
                      name='download'
                      size={13}
                      style={styles.autoDownloadIcon} />
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
                showDownloadCount &&
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
}

const styles = StyleSheet.create({
  autoDownloadIcon: {
    flex: 0,
  },
  bottomText: {
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    justifyContent: 'flex-end',
    lineHeight: PV.Fonts.sizes.sm + 2,
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
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginLeft: 4
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
    fontWeight: PV.Fonts.weights.semibold,
    lineHeight: PV.Fonts.sizes.lg + 2
  },
  wrapper: {
    flexDirection: 'row'
  }
})
