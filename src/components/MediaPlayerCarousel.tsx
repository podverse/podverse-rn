import { Dimensions, StyleSheet, Alert, TouchableOpacity } from 'react-native'
import Dots from 'react-native-dots-pagination'
import React from 'reactn'
import ConfettiCannon from 'react-native-confetti-cannon'
import ReactNativeHapticFeedback from 'react-native-haptic-feedback'
import { PV } from '../resources'
import PVEventEmitter from '../services/eventEmitter'
import { translate } from '../lib/i18n'
import { sendBoost } from '../lib/valueTagHelpers'

const HapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false
}

import { toggleValueStreaming } from '../state/actions/valueTag'
import { PVTrackPlayer } from '../services/player'
import {
  ActivityIndicator,
  MediaPlayerCarouselChapters,
  MediaPlayerCarouselClips,
  MediaPlayerCarouselShowNotes,
  MediaPlayerCarouselTranscripts,
  MediaPlayerCarouselViewer,
  ScrollView,
  Text,
  View
} from '.'

type Props = {
  hasChapters: boolean
  hasTranscript: boolean
  navigation: any
}

type State = {
  activeIndex: number
  boostIsSending: boolean
  boostWasSent: boolean
  explosionOrigin: number
}

const screenWidth = Dimensions.get('screen').width

export class MediaPlayerCarousel extends React.PureComponent<Props, State> {
  carousel: any
  scrollView: any
  handlePressClipInfo: any
  explosion: ConfettiCannon | null

  constructor(props) {
    super(props)
    const defaultActiveIndex = props.hasChapters ? 2 : 1

    this.state = {
      activeIndex: defaultActiveIndex,
      boostIsSending: false,
      boostWasSent: false,
      explosionOrigin: 0
    }
  }

  componentDidMount() {
    const { activeIndex } = this.state
    const animated = false
    this.scrollToActiveIndex(activeIndex, animated)

    PVEventEmitter.on(PV.Events.UPDATE_PLAYER_STATE_FINISHED, this.scrollToDefaultActiveIndex)
  }

  componentWillUnmount() {
    PVEventEmitter.removeListener(PV.Events.UPDATE_PLAYER_STATE_FINISHED, this.scrollToDefaultActiveIndex)
  }

  scrollToDefaultActiveIndex = () => {
    const { player } = this.global
    const hasChapters = player?.episode?.chaptersUrl
    let defaultActiveIndex = 1
    if (hasChapters) defaultActiveIndex++

    const animated = false
    this.scrollToActiveIndex(defaultActiveIndex, animated)
  }

  scrollToActiveIndex = (activeIndex: number, animated: boolean) => {
    setTimeout(() => {
      this.scrollView &&
        this.scrollView.scrollTo({
          x: screenWidth * activeIndex,
          y: 0,
          animated
        })
      this.setState({ activeIndex })
    }, 0)
  }

  onScrollEnd = ({ nativeEvent }) => {
    const { contentOffset } = nativeEvent
    const activeIndex = Math.round(contentOffset.x / screenWidth)
    this.setState({ activeIndex })
  }

  _handlePressClipInfo = () => {
    const { hasChapters, hasTranscript } = this.props
    let lastActiveIndex = 2
    if (hasChapters) lastActiveIndex++
    if (hasTranscript) lastActiveIndex++

    const animated = true
    this.scrollToActiveIndex(lastActiveIndex, animated)
  }

  _attemptBoost = () => {
    ReactNativeHapticFeedback.trigger('impactHeavy', HapticOptions)
    this.setState({ boostIsSending: true }, () => {
      this.explosion && this.explosion.start()
      const { nowPlayingItem } = this.global.player
      sendBoost(nowPlayingItem)
      setTimeout(() => {
        this.setState(
          {
            boostIsSending: false,
            boostWasSent: true
          },
          () => {
            setTimeout(() => {
              this.setState({ boostWasSent: false })
            }, 4000)
          }
        )
      }, 1000)
    })
  }

  _toggleSatStreaming = () => {
    ReactNativeHapticFeedback.trigger('impactHeavy', HapticOptions)
    toggleValueStreaming()
  }

  render() {
    const { navigation } = this.props
    const { activeIndex, boostIsSending, boostWasSent, explosionOrigin } = this.state
    const { player } = this.global
    const { episode, playbackState } = player
    const hasChapters = episode?.chaptersUrl
    const hasTranscript = true
    const { lightningNetwork, streamingEnabled } = this.global.session.valueTagSettings
    const { globalSettings, lnpayEnabled } = lightningNetwork
    const { boostAmount, streamingAmount } = globalSettings
    const isPlaying = playbackState === PVTrackPlayer.STATE_PLAYING

    let itemCount = 3
    if (hasChapters) itemCount++
    if (hasTranscript) itemCount++

    const satStreamText = streamingEnabled ? translate('Stream On') : translate('Stream Off')

    const boostText = boostWasSent ? translate('Boost Sent').toUpperCase() : translate('Boost').toUpperCase()

    const streamingButtonMainTextStyles = streamingEnabled
      ? [styles.boostButtonMainText, { color: PV.Colors.green }]
      : [styles.boostButtonMainText]

    const streamingButtonSubTextStyles = streamingEnabled
      ? [styles.boostButtonSubText, { color: PV.Colors.green }]
      : [styles.boostButtonSubText]

    return (
      <View style={styles.wrapper} transparent>
        <ScrollView
          bounces={false}
          decelerationRate='fast'
          horizontal
          onMomentumScrollEnd={this.onScrollEnd}
          pagingEnabled={false}
          scrollViewRef={(ref: any) => (this.scrollView = ref)}
          showsHorizontalScrollIndicator={false}
          snapToInterval={screenWidth}
          snapToStart
          transparent>
          <MediaPlayerCarouselClips navigation={navigation} width={screenWidth} />
          {hasChapters && <MediaPlayerCarouselChapters navigation={navigation} width={screenWidth} />}
          <MediaPlayerCarouselViewer handlePressClipInfo={this._handlePressClipInfo} width={screenWidth} />
          <MediaPlayerCarouselShowNotes navigation={navigation} width={screenWidth} />
          {hasTranscript && <MediaPlayerCarouselTranscripts width={screenWidth} />}
        </ScrollView>
        <Dots
          active={activeIndex}
          activeColor={PV.Colors.skyDark}
          activeDotHeight={9}
          activeDotWidth={9}
          length={itemCount}
          paddingVertical={12}
          passiveColor={PV.Colors.grayLighter}
          passiveDotHeight={8}
          passiveDotWidth={8}
        />
        {lnpayEnabled && (
          <View style={styles.boostButtonsContainer}>
            <TouchableOpacity onPress={this._toggleSatStreaming} style={styles.boostButton}>
              <Text style={streamingButtonMainTextStyles} testID='stream_button_text_1'>
                {satStreamText.toUpperCase()}
              </Text>
              <Text style={streamingButtonSubTextStyles} testID='stream_button_text_2'>
                {streamingAmount} {translate('sats / min')}
              </Text>
              {streamingEnabled && isPlaying && (
                <ActivityIndicator size={15} styles={{ position: 'absolute', right: 20 }} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onLayout={(event) => {
                this.setState({ explosionOrigin: event.nativeEvent.layout.y })
              }}
              disabled={boostIsSending || boostWasSent}
              style={styles.boostButton}
              onPress={this._attemptBoost}>
              {boostIsSending ? (
                <ActivityIndicator />
              ) : (
                <>
                  <Text style={styles.boostButtonMainText} testID='boost_button_text_1'>
                    {boostText}
                  </Text>
                  {!boostWasSent && (
                    <Text style={styles.boostButtonSubText} testID='Boost Button_text_2'>
                      {boostAmount} {translate('sats')}
                    </Text>
                  )}
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
        <ConfettiCannon
          count={200}
          explosionSpeed={500}
          origin={{ x: Dimensions.get('screen').width, y: explosionOrigin }}
          autoStart={false}
          ref={(ref) => (this.explosion = ref)}
          fadeOut
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  },
  boostButtonsContainer: {
    flexDirection: 'row'
  },
  boostButton: {
    flex: 1,
    margin: 10,
    height: 50,
    borderRadius: 35,
    backgroundColor: PV.Colors.velvet,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: PV.Colors.brandBlueLight,
    borderWidth: 2
  },
  boostButtonMainText: {
    fontSize: PV.Fonts.sizes.sm
  },
  boostButtonSubText: {
    fontSize: PV.Fonts.sizes.xs
  }
})
