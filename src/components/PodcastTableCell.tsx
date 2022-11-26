import { LiveItemStatus, ValueTag } from 'podverse-shared'
import { Dimensions, Pressable, StyleSheet, View as RNView } from 'react-native'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { readableDate } from '../lib/utility'
import { PV } from '../resources'
import { FastImage, IndicatorDownload, LiveStatusBadge, NewContentBadge, Text, View } from './'

type Props = {
  addByRSSPodcastFeedUrl?: string
  downloadCount?: number
  downloadedPodcastEpisodeCounts?: any
  hasZebraStripe?: boolean
  id: string
  lastEpisodePubDate?: string
  latestLiveItemStatus?: LiveItemStatus
  onPress?: any
  podcastImageUrl?: string
  podcastTitle?: string
  showAutoDownload?: boolean
  showDownloadCount?: boolean
  testID: string
  valueTags: ValueTag[]
}

export class PodcastTableCell extends React.PureComponent<Props> {
  render() {
    const {
      addByRSSPodcastFeedUrl,
      id,
      lastEpisodePubDate,
      latestLiveItemStatus,
      onPress,
      podcastImageUrl,
      podcastTitle = translate('Untitled Podcast'),
      showAutoDownload,
      showDownloadCount,
      testID,
      valueTags
    } = this.props
    const {
      autoDownloadSettings,
      downloadedPodcastEpisodeCounts,
      fontScaleMode,
      hideNewEpisodesBadges,
      newEpisodesCount
    } = this.global

    let downloadCount = 0
    if (showDownloadCount && downloadedPodcastEpisodeCounts) {
      downloadCount = downloadedPodcastEpisodeCounts[id] || 0
    }

    let shouldAutoDownload = false
    if (showAutoDownload) {
      shouldAutoDownload = autoDownloadSettings[id]
    }

    const newContentCount = newEpisodesCount?.[id]?.count || 0

    let lastPubDate = ''
    if (lastEpisodePubDate) {
      lastPubDate = [PV.Fonts.fontScale.larger, PV.Fonts.fontScale.largest].includes(fontScaleMode)
        ? `${translate('Latest')}: ${readableDate(lastEpisodePubDate)}`
        : `${translate('Latest episode')}: ${readableDate(lastEpisodePubDate)}`
    }

    const trimmedPodcastTitle = podcastTitle.trim()
    const downloadCountText = `${downloadCount} ${translate('downloaded')}`

    const lastPubDateNode = (
      <Text
        fontSizeLargerScale={PV.Fonts.largeSizes.md}
        fontSizeLargestScale={PV.Fonts.largeSizes.sm}
        isSecondary
        numberOfLines={1}
        style={styles.latestEpisode}
        testID={`${testID}_last_pub_date`}>
        {lastPubDate}
      </Text>
    )

    const textWrapper = [
      styles.textWrapper,
      {
        maxWidth:
          Dimensions.get('window').width -
          (PV.Table.cells.podcast.image.width + PV.Table.cells.podcast.image.margin * 2) -
          10
      }
    ]

    const accessibilityLabel = `${trimmedPodcastTitle}, ${lastPubDate}, ${downloadCountText}`

    return (
      <Pressable
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        {...(testID ? { testID: testID.prependTestId() } : {})}>
        <View style={styles.wrapper}>
          <FastImage
            isAddByRSSPodcast={!!addByRSSPodcastFeedUrl}
            source={podcastImageUrl}
            styles={PV.Table.cells.podcast.image}
            valueTags={valueTags}
          />
          <RNView style={textWrapper}>
            <RNView style={styles.textWrapperInner}>
              {!!lastPubDate && fontScaleMode === PV.Fonts.fontScale.largest && lastPubDateNode}
              {podcastTitle && (
                <Text numberOfLines={1} style={styles.title} testID={`${testID}_title`}>
                  {trimmedPodcastTitle}
                </Text>
              )}
              {!!lastPubDate && fontScaleMode !== PV.Fonts.fontScale.largest && lastPubDateNode}
            </RNView>
            {fontScaleMode !== PV.Fonts.fontScale.largest && showDownloadCount && (
              <RNView style={styles.downloadContainer}>
                <Text
                  fontSizeLargerScale={PV.Fonts.largeSizes.md}
                  isSecondary
                  numberOfLines={1}
                  style={styles.downloadedItems}
                  testID={`${testID}_downloaded`}>
                  {downloadCountText}
                </Text>
                {showAutoDownload && shouldAutoDownload && <IndicatorDownload style={styles.autoDownloadIcon} />}
                {!hideNewEpisodesBadges && !!newContentCount && newContentCount > 0 && (
                  <NewContentBadge count={newContentCount} isPodcastTableCell />
                )}
              </RNView>
            )}
          </RNView>
          {latestLiveItemStatus === 'live' && <LiveStatusBadge testID={testID} />}
        </View>
      </Pressable>
    )
  }
}

const styles = StyleSheet.create({
  autoDownloadIcon: {
    marginLeft: 5,
    marginBottom: 2
  },
  latestEpisode: {
    color: PV.Colors.skyLight,
    fontSize: PV.Fonts.sizes.xs,
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
    flex: 1,
    justifyContent: 'center'
  },
  textWrapperInner: {
    flexDirection: 'column-reverse'
  },
  title: {
    fontSize: PV.Fonts.sizes.xl,
    marginVertical: 5
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center'
  }
})
