import { Dimensions, StyleSheet } from 'react-native'
import { Header } from 'react-navigation-stack'
import React from 'reactn'
import { readableClipTime } from '../lib/utility'
import { PV } from '../resources'
import { navHeader } from '../styles'
import { ActivityIndicator, FastImage, Text, View } from './'

type Props = {
  navigation?: any
  width: number
}

type State = {}

const screenHeight = Dimensions.get('screen').height

/*
  carouselTextBottomWrapper: {
    height: 52
  },
  carouselTextTopWrapper: {
    height: 48
  },
  playerControls: {
    height: 202
  },
  pagination: {
    height: 32
  }

  console.log('screenHeight', screenHeight)
  console.log('header height', Header.HEIGHT)
  console.log('scrollHeight', scrollHeight)
  console.log('scrollHeightAvailable', scrollHeightAvailable)
  console.log('imageHeightAvailable', imageHeightAvailable)

*/

const scrollHeight =
  screenHeight -
  (navHeader.headerHeight.paddingTop + Header.HEIGHT + PV.Player.pagination.height + PV.Player.playerControls.height)
const subBottomHeight = PV.Player.carouselTextSubBottomWrapper.height + PV.Player.carouselTextSubBottomWrapper.marginTop
const scrollHeightAvailable =
  scrollHeight -
  (PV.Player.carouselTextBottomWrapper.height + PV.Player.carouselTextTopWrapper.height + subBottomHeight)

// not sure why I need to do 64 when the padding is 16 on each side...
const imagePadding = 64
let imageHeightAvailable = scrollHeightAvailable - imagePadding
imageHeightAvailable = imageHeightAvailable > 340 ? 340 : imageHeightAvailable

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
    const { clipId, clipEndTime, clipStartTime, clipTitle, podcastImageUrl } = nowPlayingItem

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
            <FastImage key={podcastImageUrl} source={podcastImageUrl} styles={styles.image} />
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
    flex: 0,
    height: imageHeightAvailable,
    width: imageHeightAvailable
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
