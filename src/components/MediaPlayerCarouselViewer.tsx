import { Dimensions, StyleSheet } from 'react-native'
import React from 'reactn'
import { PV } from '../resources'
import { navHeader } from '../styles'
import { ActivityIndicator, FastImage, Text, View } from './'

type Props = {
  navigation?: any
  width: number
}

type State = {}

const screenHeight = Dimensions.get('screen').height
const screenWidth = Dimensions.get('screen').width

const scrollHeight =
  screenHeight - (navHeader.headerHeight.paddingTop + PV.Player.playerControls.height + PV.Player.pagination.height)

const scrollHeightMinusText =
  scrollHeight - (PV.Player.carouselTextBottomWrapper.height + PV.Player.carouselTextTopWrapper.height)

const imagePadding = 64
const imageHeightAvailable =
  scrollHeightMinusText < screenWidth - imagePadding ? scrollHeightMinusText - imagePadding : screenWidth - imagePadding

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
    const { clipId, clipTitle, podcastImageUrl } = nowPlayingItem

    return (
      <View style={[styles.outerWrapper, { width }]} transparent={true}>
        <View style={styles.innerWrapper} transparent={true}>
          <View style={styles.carouselTextBottomWrapper} transparent={true}>
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
  carouselTextToprapper: {
    flex: 0,
    height: PV.Player.carouselTextTopWrapper.height
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
