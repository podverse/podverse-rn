import { StyleSheet, TouchableWithoutFeedback, View as RNView } from 'react-native'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { readableClipTime, readableDate, testProps } from '../lib/utility'
import { PV } from '../resources'
import { FastImage, IndicatorDownload, MoreButton, Text, View } from './'

type Props = {
  downloadedEpisodeIds?: any
  downloadsActive?: any
  endTime?: number
  episodeId: string
  episodePubDate?: string
  episodeTitle?: string
  handleMorePress?: any
  handleNavigationPress?: any
  hasZebraStripe?: boolean
  hideImage?: boolean
  podcastImageUrl?: string
  podcastTitle?: string
  showEpisodeInfo?: boolean
  showPodcastTitle?: boolean
  startTime: number
  testID: string
  title?: string
  transparent?: boolean
  zebraStripeIndex?: number
}

export class ClipTableCell extends React.PureComponent<Props> {
  render() {
    const {
      endTime,
      episodeId,
      episodePubDate = '',
      episodeTitle = translate('untitled episode'),
      handleMorePress,
      handleNavigationPress,
      hasZebraStripe,
      hideImage,
      podcastImageUrl,
      podcastTitle = translate('untitled podcast'),
      showEpisodeInfo,
      showPodcastTitle,
      startTime,
      testID,
      title = translate('untitled clip'),
      transparent
    } = this.props
    const clipTime = readableClipTime(startTime, endTime)
    const { downloadedEpisodeIds, downloadsActive, fontScaleMode } = this.global
    const isDownloading = downloadsActive[episodeId]
    const isDownloaded = downloadedEpisodeIds[episodeId]

    const innerTopView = (
      <React.Fragment>
        {(showEpisodeInfo || showPodcastTitle) && (
          <RNView style={styles.innerTopView}>
            <TouchableWithoutFeedback
              onPress={handleNavigationPress}
              {...(testID ? testProps(`${testID}_top_view_nav`) : {})}>
              <RNView style={{ flex: 1, flexDirection: 'row' }}>
                {!!podcastImageUrl && <FastImage isSmall={true} source={podcastImageUrl} styles={styles.image} />}
                <RNView style={styles.textWrapper}>
                  {showPodcastTitle && (
                    <Text
                      fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                      isSecondary={true}
                      numberOfLines={1}
                      style={styles.podcastTitle}
                      testID={`${testID}_podcast_title`}>
                      {podcastTitle.trim()}
                    </Text>
                  )}
                  {PV.Fonts.fontScale.largest !== fontScaleMode && (
                    <Text numberOfLines={1} style={styles.episodeTitle} testID={`${testID}_episode_title`}>
                      {episodeTitle.trim()}
                    </Text>
                  )}
                  <RNView style={styles.textWrapperBottomRow}>
                    <Text
                      fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                      isSecondary={true}
                      numberOfLines={1}
                      style={styles.episodePubDate}
                      testID={`${testID}_episode_pub_date`}>
                      {readableDate(episodePubDate)}
                    </Text>
                    {isDownloaded && <IndicatorDownload />}
                  </RNView>
                </RNView>
              </RNView>
            </TouchableWithoutFeedback>
            <MoreButton
              handleShowMore={handleMorePress}
              height={hideImage ? 44 : 64}
              isLoading={isDownloading}
              testID={testID}
            />
          </RNView>
        )}
      </React.Fragment>
    )

    const bottomText = (
      <RNView style={styles.wrapperBottom}>
        <RNView style={styles.wrapperBottomTextWrapper}>
          <Text
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            numberOfLines={4}
            style={styles.title}
            testID={`${testID}_title`}>
            {title}
          </Text>
          <Text
            fontSizeLargestScale={PV.Fonts.largeSizes.sm}
            isSecondary={true}
            numberOfLines={1}
            style={styles.clipTime}
            testID={`${testID}_time`}>
            {clipTime}
          </Text>
        </RNView>
        {!showEpisodeInfo && handleMorePress && (
          <MoreButton handleShowMore={handleMorePress} height={44} testID={testID} />
        )}
      </RNView>
    )

    return (
      <View hasZebraStripe={hasZebraStripe} style={styles.wrapper} transparent={transparent}>
        {showEpisodeInfo && <RNView style={styles.wrapperTop}>{innerTopView}</RNView>}
        {handleNavigationPress ? (
          <TouchableWithoutFeedback
            onPress={handleNavigationPress}
            {...(testID ? testProps(`${testID}_bottom_view_nav`) : {})}>
            {bottomText}
          </TouchableWithoutFeedback>
        ) : (
          bottomText
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  buttonView: {
    flex: 0
  },
  clipTime: {
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    justifyContent: 'flex-end',
    marginTop: 6
  },
  episodePubDate: {
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    marginTop: 2
  },
  episodeTitle: {
    fontSize: PV.Fonts.sizes.xl
  },
  image: {
    flex: 0,
    height: 64,
    marginRight: 12,
    width: 64
  },
  innerTopView: {
    flex: 1,
    flexDirection: 'row',
    marginRight: 4
  },
  playlistClipTitle: {
    fontSize: PV.Fonts.sizes.md,
    fontWeight: PV.Fonts.weights.bold
  },
  podcastTitle: {
    flex: 0,
    fontSize: PV.Fonts.sizes.md,
    justifyContent: 'flex-start'
  },
  textWrapper: {
    flex: 1,
    marginRight: 4
  },
  textWrapperBottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  title: {
    flex: 0,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  },
  wrapper: {
    paddingLeft: 8,
    paddingRight: 4,
    paddingVertical: 16
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
