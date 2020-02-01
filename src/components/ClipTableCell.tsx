import { StyleSheet, TouchableWithoutFeedback } from 'react-native'
import React from 'reactn'
import { readableClipTime, readableDate } from '../lib/utility'
import { PV } from '../resources'
import { button } from '../styles'
import { ActivityIndicator, FastImage, Icon, Text, View } from './'

type Props = {
  downloadedEpisodeIds?: any
  downloadsActive?: any
  endTime?: number
  episodeId: string
  episodePubDate?: string
  episodeTitle?: string
  handleMorePress?: any
  handleNavigationPress?: any
  podcastImageUrl?: string
  podcastTitle?: string
  startTime: number
  title?: string
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
      podcastImageUrl,
      podcastTitle,
      startTime,
      title = 'Untitled clip'
    } = this.props
    const clipTime = readableClipTime(startTime, endTime)
    const { downloadedEpisodeIds, downloadsActive } = this.global
    const isDownloading = downloadsActive[episodeId]
    const isDownloaded = downloadedEpisodeIds[episodeId]
    const showEpisodeInfo = !!episodePubDate || !!episodeTitle
    const showPodcastInfo = !!podcastImageUrl || !!podcastTitle

    const moreButton = (
      <Icon
        name='ellipsis-h'
        onPress={handleMorePress}
        size={32}
        style={showPodcastInfo ? button.iconOnlyMedium : button.iconOnlySmall}
      />
    )

    const innerTopView = (
      <View style={styles.innerTopView}>
        {!!podcastImageUrl && (
          <FastImage
            isSmall={true}
            source={podcastImageUrl}
            styles={styles.image} />
        )}
        <View style={styles.textWrapper}>
          {!!podcastTitle && (
            <Text
              isSecondary={true}
              numberOfLines={1}
              style={styles.podcastTitle}>
              {podcastTitle}
            </Text>
          )}
          {!!episodeTitle && (
            <Text numberOfLines={1} style={styles.episodeTitle}>
              {episodeTitle}
            </Text>
          )}
          <View style={styles.textWrapperBottomRow}>
            <Text isSecondary={true} style={styles.episodePubDate}>
              {readableDate(episodePubDate)}
            </Text>
            {isDownloaded && (
              <Icon
                isSecondary={true}
                name='download'
                size={13}
                style={styles.downloadedIcon}
              />
            )}
          </View>
        </View>
        {!isDownloading && handleMorePress && moreButton}
        {isDownloading && (
          <ActivityIndicator
            onPress={handleMorePress}
            styles={
              showPodcastInfo ? button.iconOnlyMedium : button.iconOnlySmall
            }
          />
        )}
      </View>
    )

    const bottomText = (
      <View style={styles.wrapperBottom}>
        <View style={styles.wrapperBottomTextWrapper}>
          <Text numberOfLines={4} style={styles.title}>
            {title}
          </Text>
          <Text isSecondary={true} style={styles.clipTime}>
            {clipTime}
          </Text>
        </View>
        {!showEpisodeInfo && handleMorePress && moreButton}
      </View>
    )

    return (
      <View style={styles.wrapper}>
        {!!showEpisodeInfo && (
          <View style={styles.wrapperTop}>
            {handleNavigationPress ? (
              <TouchableWithoutFeedback onPress={handleNavigationPress}>
                {innerTopView}
              </TouchableWithoutFeedback>
            ) : (
              innerTopView
            )}
          </View>
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
    fontSize: PV.Fonts.sizes.md,
    justifyContent: 'flex-end',
    lineHeight: PV.Fonts.sizes.md + 2,
    marginTop: 4
  },
  downloadedIcon: {
    flex: 0,
    marginLeft: 8,
    marginTop: 3
  },
  episodePubDate: {
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    justifyContent: 'flex-end',
    lineHeight: PV.Fonts.sizes.sm + 2,
    marginTop: 3
  },
  episodeTitle: {
    fontSize: PV.Fonts.sizes.md,
    lineHeight: PV.Fonts.sizes.md + 2,
    marginTop: 2
  },
  image: {
    flex: 0,
    height: 60,
    marginRight: 12,
    width: 60
  },
  innerTopView: {
    flex: 1,
    flexDirection: 'row',
    marginRight: 4
  },
  podcastTitle: {
    flex: 0,
    fontSize: PV.Fonts.sizes.md,
    justifyContent: 'flex-start',
    lineHeight: PV.Fonts.sizes.md + 2,
    marginTop: 1
  },
  textWrapper: {
    flex: 1
  },
  textWrapperBottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  title: {
    flex: 0,
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.semibold,
    lineHeight: PV.Fonts.sizes.lg + 2
  },
  wrapper: {
    paddingBottom: 12,
    paddingHorizontal: 8,
    paddingTop: 12
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
