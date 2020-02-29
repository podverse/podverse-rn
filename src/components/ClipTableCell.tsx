import { StyleSheet, TouchableWithoutFeedback, View as RNView } from 'react-native'
import React from 'reactn'
import { readableClipTime, readableDate } from '../lib/utility'
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
  isPlaylistItem?: boolean
  podcastImageUrl?: string
  podcastTitle?: string
  startTime: number
  title?: string
  zebraStripeIndex?: number
}

export class ClipTableCell extends React.PureComponent<Props> {
  render() {
    const {
      endTime,
      episodeId,
      episodePubDate = '',
      episodeTitle,
      handleMorePress,
      handleNavigationPress,
      hasZebraStripe,
      hideImage,
      isPlaylistItem,
      podcastImageUrl,
      podcastTitle,
      startTime,
      title = 'untitled clip'
    } = this.props
    const clipTime = readableClipTime(startTime, endTime)
    const { downloadedEpisodeIds, downloadsActive, fontScaleMode } = this.global
    const isDownloading = downloadsActive[episodeId]
    const isDownloaded = downloadedEpisodeIds[episodeId]
    const showEpisodeInfo = !!episodePubDate || !!episodeTitle

    const innerTopView = (
      <RNView style={styles.innerTopView}>
        <TouchableWithoutFeedback onPress={handleNavigationPress}>
          <RNView style={{ flex: 1, flexDirection: 'row' }}>
            {!!podcastImageUrl && (
              <FastImage
                isSmall={true}
                source={podcastImageUrl}
                styles={styles.image} />
            )}
            <RNView style={styles.textWrapper}>
              {!!podcastTitle && (
                <Text
                  isSecondary={true}
                  numberOfLines={1}
                  style={styles.podcastTitle}>
                  {podcastTitle}
                </Text>
              )}
              {!!episodeTitle && PV.Fonts.fontScale.largest !== fontScaleMode && (
                <Text
                  numberOfLines={1}
                  style={styles.episodeTitle}>
                  {episodeTitle}
                </Text>
              )}
              <RNView style={styles.textWrapperBottomRow}>
                <Text
                  isSecondary={true}
                  numberOfLines={1}
                  style={styles.episodePubDate}>
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
          isLoading={isDownloading} />
      </RNView>
    )

    const bottomTextStyle = !isPlaylistItem ? styles.title : styles.playlistClipTitle

    const bottomText = (
      <RNView style={styles.wrapperBottom}>
        <RNView style={styles.wrapperBottomTextWrapper}>
          <Text
            numberOfLines={4}
            style={bottomTextStyle}>
            {title}
          </Text>
          <Text
            isSecondary={true}
            numberOfLines={1}
            style={styles.clipTime}>
            {clipTime}
          </Text>
        </RNView>
        {!showEpisodeInfo && handleMorePress &&
          <MoreButton
            handleShowMore={handleMorePress}
            height={44} />
        }
      </RNView>
    )

    return (
      <View
        hasZebraStripe={hasZebraStripe}
        style={styles.wrapper}>
        {!!showEpisodeInfo && (
          <RNView style={styles.wrapperTop}>
            {innerTopView}
          </RNView>
        )}
        {handleNavigationPress ? (
          <TouchableWithoutFeedback onPress={handleNavigationPress}>
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
    marginTop: 8
  },
  episodePubDate: {
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    lineHeight: PV.Fonts.sizes.sm,
    marginTop: 7
  },
  episodeTitle: {
    fontSize: PV.Fonts.sizes.xl,
    marginTop: 3
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
    justifyContent: 'flex-start',
    lineHeight: PV.Fonts.sizes.md,
    marginTop: 1
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
    fontWeight: PV.Fonts.weights.bold,
    lineHeight: PV.Fonts.sizes.xl + 2
  },
  wrapper: {
    paddingHorizontal: 8,
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
    marginBottom: 10
  }
})
