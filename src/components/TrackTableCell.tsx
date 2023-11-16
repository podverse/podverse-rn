import { Episode } from 'podverse-shared'
import { StyleSheet, View as RNView, Pressable } from 'react-native'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { images } from '../styles'
import { FastImage, IndicatorDownload, MoreButton, Text } from '.'

type Props = {
  episode: Episode
  handleMorePress: any
  handlePlayPress: any
  hideImage?: boolean
  testID: string
}

export class TrackTableCell extends React.PureComponent<Props> {
  render() {
    const {
      episode,
      handleMorePress,
      handlePlayPress,
      hideImage = true,
      testID
    } = this.props

    const {
      downloadedEpisodeIds,
      downloadsActive,
      screenReaderEnabled
    } = this.global
    
    const { podcast } = episode
    const episodeId = episode.id
    const isAddByRSSPodcast = !!podcast?.addByRSSPodcastFeedUrl
    const imageUrl = podcast?.shrunkImageUrl || podcast?.imageUrl
    const valueTags = podcast?.value
    const trackTitle = episode.title || translate('Untitled Track')
    const accessibilityLabel = trackTitle
    const accessibilityHint = translate('ARIA HINT - tap to play this track')

    const episodeDownloaded = !!(episodeId && !!downloadedEpisodeIds[episodeId])
    const episodeDownloading = !!(episodeId && !!downloadsActive[episodeId])

    return (
      <RNView style={styles.outerWrapper}>
        <Pressable
          accessible={screenReaderEnabled}
          accessibilityHint={accessibilityHint}
          accessibilityLabel={accessibilityLabel}
          importantForAccessibility={screenReaderEnabled ? 'yes' : 'no-hide-descendants'}
          onPress={handlePlayPress}
          style={styles.pressablePlayWrapper}>
          {
            !hideImage && (
              <FastImage
                isAddByRSSPodcast={isAddByRSSPodcast}
                source={imageUrl}
                styles={styles.image}
                valueTags={valueTags}
              />
            )
          }
          <RNView style={styles.textWrapper}>
            <Text numberOfLines={1} style={styles.text}>{trackTitle}</Text>
            {episodeDownloaded && (
              <IndicatorDownload style={styles.autoDownloadIcon} />
            )}
          </RNView>
        </Pressable>
        <RNView style={styles.buttonWrapper}>
          {!!handleMorePress && (
            <MoreButton
              accessible={false}
              handleMorePress={handleMorePress}
              isLoading={episodeDownloading}
              testID={testID}
            />
          )}
        </RNView>
      </RNView>
    )
  }
}

const styles = StyleSheet.create({
  autoDownloadIcon: {
    marginLeft: 8,
    marginRight: 12,
    marginBottom: 3
  },
  buttonWrapper: {
    flexDirection: 'column'
  },
  image: {
    height: images.small.height,
    marginRight: 16,
    width: images.small.width
  },
  imageWrapper: {
    flexDirection: 'row'
  },
  outerWrapper: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8
  },
  pressablePlayWrapper: {
    flexDirection: 'row',
    flex: 1
  },
  text: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.semibold,
    flex: 1,
    lineHeight: images.small.height
  },
  textWrapper: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row'
  }
})
