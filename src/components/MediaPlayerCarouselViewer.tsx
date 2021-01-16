import { StyleSheet } from 'react-native'
import React from 'reactn'
import { readableClipTime } from '../lib/utility'
import { PV } from '../resources'
import { ActivityIndicator, FastImage, Text, View } from './'

type Props = {
  imageHeight: number
  imageWidth: number
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
    const { imageHeight, imageWidth, width } = this.props
    const { player, screenPlayer } = this.global
    const { currentChapter, nowPlayingItem } = player
    const { isLoading } = screenPlayer
    let { clipId, clipEndTime, clipStartTime, clipTitle, podcastImageUrl } = nowPlayingItem
    const imageStyle = [styles.image, { height: imageHeight, width: imageWidth }]
    let clipUrl = ''

    // If a clip is currently playing, then load the clip info.
    // Else if a chapter is currently playing, then load the chapter info.
    // Else just load the episode info.
    if (!clipId && currentChapter) {
      clipId = currentChapter.id
      clipEndTime = currentChapter.endTime
      clipUrl = currentChapter.linkUrl
      clipStartTime = currentChapter.startTime
      clipTitle = currentChapter.title
      podcastImageUrl = currentChapter.imageUrl || podcastImageUrl
    }

    return (
      <View style={[styles.outerWrapper, { width }]} transparent={true}>
        <View style={styles.innerWrapper} transparent={true}>
          <View style={styles.carouselTextTopWrapper} transparent={true}>
            {isLoading && <ActivityIndicator />}
            {!isLoading && !!nowPlayingItem && (
              <React.Fragment>
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
              </React.Fragment>
            )}
          </View>
          <View style={styles.imageWrapper} transparent={true}>
            <FastImage key={podcastImageUrl} source={podcastImageUrl} styles={imageStyle} />
          </View>
          <View style={styles.carouselTextBottomWrapper} transparent={true}>
            {clipId && (
              <View style={styles.clipWrapper} transparent={true}>
                <Text
                  numberOfLines={2}
                  style={styles.clipTitle}
                  testID='media_player_carousel_viewer_title'>{`${clipTitle}`}</Text>
                <Text style={styles.clipTime} testID='media_player_carousel_viewer_time'>
                  {readableClipTime(clipStartTime, clipEndTime)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  carouselTextBottomWrapper: {
    flex: 0,
    height: PV.Player.carouselTextBottomWrapper.height
  },
  carouselTextTopWrapper: {
    flex: 0,
    height: PV.Player.carouselTextTopWrapper.height
  },
  clipTime: {
    color: PV.Colors.skyLight,
    fontSize: PV.Fonts.sizes.sm,
    height: PV.Player.carouselTextSubBottomWrapper.height,
    marginTop: PV.Player.carouselTextSubBottomWrapper.marginTop,
    textAlign: 'center'
  },
  clipTitle: {
    fontSize: PV.Fonts.sizes.xl,
    paddingBottom: 4,
    textAlign: 'center'
  },
  clipWrapper: {},
  episodeTitle: {
    fontSize: PV.Fonts.sizes.xxl,
    textAlign: 'center'
  },
  image: {
    flex: 0
  },
  imageWrapper: {
    alignItems: 'center',
    flex: 0,
    justifyContent: 'center',
    padding: 16
  },
  innerWrapper: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 8
  },
  outerWrapper: {
    flex: 0
  },
  podcastTitle: {
    color: PV.Colors.skyDark,
    flex: 0,
    fontSize: PV.Fonts.sizes.md,
    fontWeight: PV.Fonts.weights.bold,
    marginTop: 2,
    textAlign: 'center'
  }
})
