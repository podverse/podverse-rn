import { StyleSheet, TouchableWithoutFeedback, View as RNView } from 'react-native'
import React from 'reactn'
import { readableDate } from '../lib/utility'
import { PV } from '../resources'
import { FastImage, IndicatorDownload, Text, View } from './'

type Props = {
  autoDownloadSettings?: any
  downloadCount?: number
  downloadedPodcastEpisodeCounts?: any
  hasZebraStripe?: boolean
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
  render() {
    const {
      hasZebraStripe,
      id,
      lastEpisodePubDate,
      onPress,
      podcastAuthors,
      podcastCategories,
      podcastImageUrl = PV.Images.SQUARE_PLACEHOLDER,
      podcastTitle = 'untitled podcast',
      showAutoDownload,
      showDownloadCount
    } = this.props
    const { autoDownloadSettings, downloadedPodcastEpisodeCounts, fontScaleMode } = this.global

    let downloadCount = 0
    if (showDownloadCount && downloadedPodcastEpisodeCounts) {
      downloadCount = downloadedPodcastEpisodeCounts[id] || 0
    }

    let shouldAutoDownload = false
    if (showAutoDownload) {
      shouldAutoDownload = autoDownloadSettings[id]
    }

    const titleStyle = PV.Fonts.fontScale.largest === fontScaleMode ?
      [styles.title, { fontSize: PV.Fonts.largeSizes.lg }] :
      [styles.title]

    return (
      <TouchableWithoutFeedback onPress={onPress}>
        <View
          hasZebraStripe={hasZebraStripe}
          style={styles.wrapper}>
          <FastImage
            source={podcastImageUrl}
            styles={styles.image} />
          <RNView style={styles.textWrapper}>
            <RNView style={styles.titleWrapper}>
              <Text
                numberOfLines={([PV.Fonts.fontScale.larger, PV.Fonts.fontScale.largest].includes(fontScaleMode)) ? 1 : 2}
                style={titleStyle}>
                {podcastTitle}
              </Text>
            </RNView>
            {
              fontScaleMode !== PV.Fonts.fontScale.largest &&
                <>
                  <RNView style={styles.textWrapperRow}>
                    <RNView style={styles.textWrapperRowLeft}>
                      {!!podcastCategories && (
                        <Text
                          isSecondary={true}
                          numberOfLines={1}
                          style={styles.bottomText}>
                          {podcastCategories}
                        </Text>
                      )}
                    </RNView>
                  </RNView>
                  <RNView style={styles.textWrapperRow}>
                    {!!podcastAuthors && (
                      <RNView style={styles.textWrapperRowLeft}>
                        <Text
                          isSecondary={true}
                          numberOfLines={1}
                          style={styles.bottomText}>
                          {podcastAuthors}
                        </Text>
                      </RNView>
                    )}
                    {showDownloadCount && (
                      <RNView style={styles.textWrapperRowLeft}>
                        <Text
                          isSecondary={true}
                          numberOfLines={1}
                          style={styles.bottomText}>
                          {`${downloadCount} downloaded`}
                        </Text>
                        {showAutoDownload && shouldAutoDownload && (
                          <IndicatorDownload style={styles.autoDownloadIcon} />
                        )}
                      </RNView>
                    )}
                    {!!lastEpisodePubDate && (
                      <RNView style={styles.textWrapperRowRight}>
                        <Text
                          isSecondary={true}
                          numberOfLines={1}
                          style={styles.bottomText}>
                          {readableDate(lastEpisodePubDate)}
                        </Text>
                      </RNView>
                    )}
                  </RNView>
                </>
            }
          </RNView>
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

const styles = StyleSheet.create({
  autoDownloadIcon: {
    flex: 0,
    marginBottom: 4,
    marginTop: 0
  },
  bottomText: {
    flex: 0,
    fontSize: PV.Fonts.sizes.md
  },
  image: {
    flex: 0,
    height: PV.Table.cells.podcast.image.height,
    marginRight: 12,
    width: PV.Table.cells.podcast.image.width
  },
  textWrapperRow: {
    flex: 1,
    flexDirection: 'row'
  },
  textWrapperRowLeft: {
    alignItems: 'flex-end',
    flex: 1,
    flexDirection: 'row'
  },
  textWrapperRowRight: {
    alignItems: 'flex-end',
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginLeft: 4
  },
  textWrapper: {
    flex: 1,
    paddingRight: 8,
    paddingVertical: 8
  },
  title: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  },
  titleWrapper: {
    justifyContent: 'center',
    flex: 1
  },
  wrapper: {
    flexDirection: 'row'
  }
})
