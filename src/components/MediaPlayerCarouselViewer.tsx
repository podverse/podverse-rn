import { StyleSheet } from 'react-native'
import React from 'reactn'
import { readableClipTime } from '../lib/utility'
import { PV } from '../resources'
import { ActivityIndicator, FastImage, Text, View } from './'

type Props = {
  navigation?: any
  width: number
}

type State = {}

export class MediaPlayerCarouselViewer extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    const { width } = this.props
    const { player, screenPlayer } = this.global
    const { nowPlayingItem } = player
    const { isLoading } = screenPlayer
    const { clipEndTime, clipId, clipStartTime, clipTitle, podcastImageUrl } = nowPlayingItem

    return (
      <View style={[styles.outerWrapper, { width }]} transparent={true}>
        <View style={styles.innerWrapper} transparent={true}>
          <View transparent={true}>
            {isLoading && (
              <View style={styles.headerWrapper} transparent={true}>
                <ActivityIndicator />
              </View>
            )}
            {!isLoading && !!nowPlayingItem && (
              <View style={styles.headerWrapper} transparent={true}>
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.md}
                  numberOfLines={1}
                  style={styles.episodeTitle}
                  testID='media_player_carousel_viewer_episode_title'>
                  {nowPlayingItem.episodeTitle}
                </Text>
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                  isSecondary={true}
                  numberOfLines={1}
                  style={styles.podcastTitle}
                  testID='media_player_carousel_viewer_podcast_title'>
                  {nowPlayingItem.podcastTitle}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.imageWrapper} transparent={true}>
            <FastImage key={podcastImageUrl} source={podcastImageUrl} styles={styles.image} />
          </View>
          <View style={styles.textWrapper} transparent={true}>
            {clipId && (
              <View style={styles.clipWrapper} transparent={true}>
                <Text
                  numberOfLines={1}
                  style={styles.clipTitle}
                  testID='media_player_carousel_viewer_title'>{`${clipTitle}`}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  clipTime: {
    color: PV.Colors.skyLight,
    fontSize: PV.Fonts.sizes.xs,
    marginTop: 4
  },
  clipTitle: {
    fontSize: PV.Fonts.sizes.lg,
    paddingBottom: 4
  },
  clipWrapper: {},
  image: {
    height: '100%',
    width: '100%'
  },
  episodeTitle: {
    fontSize: PV.Fonts.sizes.xxl
  },
  headerWrapper: {
    flex: 0,
    height: 48
  },
  imageWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 14,
    paddingTop: 18
  },
  innerWrapper: {
    flex: 1,
    marginHorizontal: 8
  },
  outerWrapper: {
    flex: 1
  },
  podcastTitle: {
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    fontWeight: PV.Fonts.weights.bold,
    marginTop: 4
  },
  textWrapper: {
    flex: 0,
    height: 26
  }
})
