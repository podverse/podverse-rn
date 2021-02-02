import { Dimensions, StyleSheet, TouchableWithoutFeedback, View as RNView } from 'react-native'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { readableDate, testProps } from '../lib/utility'
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
  podcastImageUrl?: string
  podcastTitle?: string
  showAutoDownload?: boolean
  showDownloadCount?: boolean
  testID: string
}

export class PodcastTableCell extends React.PureComponent<Props> {
  render() {
    const {
      id,
      lastEpisodePubDate,
      onPress,
      podcastImageUrl,
      podcastTitle = translate('Untitled Podcast'),
      showAutoDownload,
      showDownloadCount,
      testID
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

    return (
      <TouchableWithoutFeedback onPress={onPress} {...(testID ? testProps(testID) : {})}>
        <View style={styles.wrapper}>
          <FastImage source={podcastImageUrl} styles={PV.Table.cells.podcast.image} />
          <RNView style={styles.textWrapper}>
            {!!lastEpisodePubDate && (
              <Text
                isSecondary={true}
                numberOfLines={1}
                style={styles.latestEpisode}
                testID={`${testID}_last_pub_date`}>
                {'Latest episode: '}
                {readableDate(lastEpisodePubDate)}
              </Text>
            )}
            {podcastTitle && (
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.md}
                numberOfLines={1}
                style={styles.title}
                testID={`${testID}_title`}>
                {podcastTitle.trim()}
              </Text>
            )}
            {fontScaleMode !== PV.Fonts.fontScale.largest && showDownloadCount && (
              <RNView style={styles.downloadContainer}>
                <Text
                  isSecondary={true}
                  numberOfLines={1}
                  style={styles.downloadedItems}
                  testID={`${testID}_downloaded`}>
                  {`${downloadCount} ${translate('downloaded')}`}
                </Text>
                {showAutoDownload && shouldAutoDownload && <IndicatorDownload style={styles.autoDownloadIcon} />}
              </RNView>
            )}
          </RNView>
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

const styles = StyleSheet.create({
  autoDownloadIcon: {
    marginLeft: 5,
    marginBottom: 2
  },
  latestEpisode: {
    fontSize: PV.Fonts.sizes.xs,
    color: PV.Colors.skyLight,
    fontWeight: PV.Fonts.weights.bold
  },
  downloadedItems: {
    fontSize: PV.Fonts.sizes.xs,
    color: PV.Colors.grayLighter
  },
  downloadContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  textWrapper: {
    justifyContent: 'center',
    maxWidth:
      Dimensions.get('screen').width -
      (PV.Table.cells.podcast.image.width + PV.Table.cells.podcast.image.margin * 2) -
      10
  },
  title: {
    fontSize: PV.Fonts.sizes.xl,
    marginVertical: 5
  },
  wrapper: {
    flexDirection: 'row'
  }
})
