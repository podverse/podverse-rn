import { StyleSheet, View as RNView } from 'react-native'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { InitialState } from '../resources/Interfaces'
import { ScrollView, Text } from './'

type Props = {
  playbackState: InitialState['player']['playbackState']
}

const testIDPrefix = 'media_player_carousel_viewer'

export class MediaPlayerCarouselViewer extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  render() {
    const { playbackState } = this.props

    console.log('TEST2: MediaPlayerCarouselView has re-rendered due to player object change to the player.playbackState, but does not re-render from player.playbackRate changes.')
  
    return (
      <ScrollView scrollEnabled={false}>
        <RNView
          accessible
          accessibilityHint={translate('ARIA HINT - This is the now playing episode')}
          style={styles.carouselTextTopWrapper}>
            <Text>{`Playback state: ${playbackState}`}</Text>
        </RNView>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  outerWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  carouselTextTopWrapper: {
    justifyContent: 'flex-end',
    marginBottom: 12
  },
  carouselImageWrapper: {
    alignItems: 'center',
    height: '65%'
  },
  carouselChapterWrapper: {},
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  clipWrapper: {
    alignItems: 'center',
    marginTop: 12
  },
  clipTime: {
    color: PV.Colors.skyLight,
    fontSize: PV.Fonts.sizes.sm,
    minHeight: PV.Player.carouselTextSubBottomWrapper.height,
    marginTop: PV.Player.carouselTextSubBottomWrapper.marginTop,
    textAlign: 'center'
  },
  clipTitle: {
    fontSize: PV.Fonts.sizes.xxl,
    paddingBottom: 2,
    color: PV.Colors.white
  },
  episodeTitleWrapper: {
    alignItems: 'center'
  },
  episodeTitle: {
    fontSize: PV.Fonts.sizes.xxl
  },
  imageBorder: {
    borderColor: PV.Colors.brandBlueDarker,
    borderWidth: 5
  },
  podcastTitle: {
    color: PV.Colors.skyDark,
    fontSize: PV.Fonts.sizes.md,
    fontWeight: PV.Fonts.weights.bold,
    marginTop: 2,
    textAlign: 'center'
  }
})
