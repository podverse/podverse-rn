import { Episode, generateAuthorsText } from 'podverse-shared'
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
  showArtist?: boolean
  testID: string
}

export class TrackTableCell extends React.PureComponent<Props> {
  render() {
    const {
      episode,
      handleMorePress,
      handlePlayPress,
      hideImage = true,
      showArtist,
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
    const authorNames = generateAuthorsText(podcast?.authors)
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
            {showArtist && (<Text numberOfLines={1} style={styles.subText}>{authorNames}</Text>)}
          </RNView>          
          {!!episodeDownloaded && (
            <IndicatorDownload style={styles.autoDownloadIcon} />
          )}
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
    alignItems: 'center'
  },
  pressablePlayWrapper: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10
  },
  text: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.semibold,
    marginVertical: 1
  },
  subText: {
    fontSize: PV.Fonts.sizes.xs,
    color: PV.Colors.skyLight,
    fontWeight: PV.Fonts.weights.thin,
    marginVertical: 1
  },
  textWrapper: {
    alignItems: 'flex-start',
    flex: 1,
    justifyContent: 'flex-start'
  }
})
