import { StyleSheet, TouchableWithoutFeedback, View as RNView } from 'react-native'
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
  podcastTitle: string
  showAutoDownload?: boolean
  showDownloadCount?: boolean
  testID: string
}

export class PodcastTableCell extends React.PureComponent<Props> {
  render() {
    const {
      hasZebraStripe,
      id,
      lastEpisodePubDate,
      onPress,
      podcastImageUrl,
      podcastTitle = translate('untitled podcast'),
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

    const titleWrapperStyle =
      PV.Fonts.fontScale.largest === fontScaleMode ? [styles.titleWrapper, { flex: 1 }] : [styles.titleWraper]

    return (
      <TouchableWithoutFeedback onPress={onPress} {...(testID ? testProps(testID) : {})}>
        <View hasZebraStripe={hasZebraStripe} style={styles.wrapper}>
          <FastImage source={podcastImageUrl} styles={styles.image} />
          <RNView style={styles.textWrapper}>
            <RNView style={titleWrapperStyle}>
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.md}
                numberOfLines={
                  [PV.Fonts.fontScale.large, PV.Fonts.fontScale.larger, PV.Fonts.fontScale.largest].includes(
                    fontScaleMode
                  )
                    ? 1
                    : 2
                }
                style={styles.title}
                testID={`${testID}_title`}>
                {podcastTitle.trim()}
              </Text>
            </RNView>
            {fontScaleMode !== PV.Fonts.fontScale.largest && (
              <>
                <RNView style={styles.textWrapperRow}>
                  {showDownloadCount && (
                    <RNView style={styles.textWrapperRowLeft}>
                      <Text
                        isSecondary={true}
                        numberOfLines={1}
                        style={styles.bottomText}
                        testID={`${testID}_downloaded`}>
                        {`${downloadCount} ${translate('downloaded')}`}
                      </Text>
                      {showAutoDownload && shouldAutoDownload && <IndicatorDownload style={styles.autoDownloadIcon} />}
                    </RNView>
                  )}
                  {!!lastEpisodePubDate && (
                    <RNView style={styles.textWrapperRowRight}>
                      <Text
                        isSecondary={true}
                        numberOfLines={1}
                        style={styles.bottomText}
                        testID={`${testID}_last_pub_date`}>
                        {readableDate(lastEpisodePubDate)}
                      </Text>
                    </RNView>
                  )}
                </RNView>
              </>
            )}
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
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginLeft: 4
  },
  textWrapper: {
    flex: 1,
    paddingRight: 8,
    paddingVertical: 4
  },
  title: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  },
  titleWrapper: {
    justifyContent: 'center',
    flex: 0
  },
  wrapper: {
    flexDirection: 'row'
  }
})
