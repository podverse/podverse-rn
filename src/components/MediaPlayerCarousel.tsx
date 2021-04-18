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

import {
  ActivityIndicator,
  MediaPlayerCarouselChapters,
  MediaPlayerCarouselClips,
  MediaPlayerCarouselShowNotes,
  MediaPlayerCarouselViewer,
  ScrollView,
  Text,
  View
} from '.'

type Props = {
  hasChapters: boolean
  navigation: any
}

type State = {
  activeIndex: number
  boostPaymentLoading: boolean
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
      boostPaymentLoading: false,
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
    const defaultActiveIndex = hasChapters ? 2 : 1
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
    const { hasChapters } = this.props
    const lastActiveIndex = hasChapters ? 3 : 2
    const animated = true
    this.scrollToActiveIndex(lastActiveIndex, animated)
  }

  _attemptBoost = () => {
    ReactNativeHapticFeedback.trigger('impactHeavy', HapticOptions)
    this.explosion && this.explosion.start()
    this.setState({ boostPaymentLoading: true }, () => {
      (async () => {
        try {
          const { nowPlayingItem } = this.global.player

          const { errors, transactions } = await sendBoost(nowPlayingItem)

          this.setState({ boostPaymentLoading: false })
          this.setGlobal({
            bannerInfo: { show: true, description: translate('Boost Sent'), errors, transactions }
          })
        } catch (error) {
          Alert.alert(translate('Boost Pay Error'), error.message)
        }
      })()
    })
  }

  _toggleSatStreaming = () => {
    ReactNativeHapticFeedback.trigger('impactHeavy', HapticOptions)
    // TOGGLE SAT STREAM
  }

  render() {
    const { navigation } = this.props
    const { activeIndex } = this.state
    const { player } = this.global
    const { episode } = player
    const hasChapters = episode && episode.chaptersUrl
    const itemCount = hasChapters ? 4 : 3

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
        {this.global.session.lightningPayEnabled && (
          <View style={styles.boostButtonsContainer}>
            <TouchableOpacity style={styles.boostButton} onPress={this._toggleSatStreaming}>
              <Text testID='Boost Button'>{'Sat Stream Off'.toUpperCase()}</Text>
              <Text testID='Boost Button_text_2' style={{ fontSize: PV.Fonts.sizes.xs }}>
                10 sats / min
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onLayout={(event) => {
                this.setState({ explosionOrigin: event.nativeEvent.layout.y })
              }}
              disabled={this.state.boostPaymentLoading}
              style={styles.boostButton}
              onPress={this._attemptBoost}>
              {this.state.boostPaymentLoading ? (
                <ActivityIndicator />
              ) : (
                <>
                  <Text testID='boost_button_text_1'>{translate('Boost').toUpperCase()}</Text>
                  <Text testID='Boost Button_text_2' style={{ fontSize: PV.Fonts.sizes.xs }}>
                    {this.global.session.boostAmount} sats
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
        <ConfettiCannon
          count={200}
          explosionSpeed={500}
          origin={{ x: Dimensions.get('screen').width, y: this.state.explosionOrigin }}
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
  }
})
