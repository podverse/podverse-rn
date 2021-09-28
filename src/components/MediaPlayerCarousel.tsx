import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native'
import Config from 'react-native-config'
import Dots from 'react-native-dots-pagination'
import React from 'reactn'
import ConfettiCannon from 'react-native-confetti-cannon'
import ReactNativeHapticFeedback from 'react-native-haptic-feedback'
import { State as RNTPState } from 'react-native-track-player'
import { PV } from '../resources'
import { translate } from '../lib/i18n'
import { sendBoost } from '../lib/valueTagHelpers'

import { toggleValueStreaming } from '../state/actions/valueTag'

import {
  ActivityIndicator,
  DropdownButtonSelect,
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
  navigation: any
}

type State = {
  accessibilityItemSelected: any
  activeIndex: number
  boostIsSending: boolean
  boostWasSent: boolean
  explosionOrigin: number
}

const screenWidth = Dimensions.get('screen').width

const testIDPrefix = 'media_player_carousel'

const _nowPlayingInfoKey = '_nowPlayingInfoKey'
const _episodeSummaryKey = '_episodeSummaryKey'
const _chaptersKey = '_chaptersKey'
const _clipsKey = '_clipsKey'
const _transcriptKey = '_transcriptKey'

const accessibilityNowPlayingInfo = {
  label: translate('Now Playing Info'),
  value: _nowPlayingInfoKey
}

export class MediaPlayerCarousel extends React.PureComponent<Props, State> {
  carousel: any
  scrollView: any
  handlePressClipInfo: any
  explosion: ConfettiCannon | null

  constructor(props) {
    super(props)

    this.state = {
      accessibilityItemSelected: accessibilityNowPlayingInfo,
      activeIndex: 0,
      boostIsSending: false,
      boostWasSent: false,
      explosionOrigin: 0
    }
  }

  componentDidMount() {
    const { activeIndex } = this.state
    const animated = false
    this.scrollToActiveIndex(activeIndex, animated)
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
    const animated = true
    this.scrollToActiveIndex(1, animated)
  }

  _attemptBoost = () => {
    ReactNativeHapticFeedback.trigger('impactHeavy', PV.Haptic.options)
    this.setState({ boostIsSending: true }, () => {
      this.explosion && this.explosion.start()
      const { podcastValueFinal } = this.global
      const { nowPlayingItem } = this.global.player
      sendBoost(nowPlayingItem, podcastValueFinal)
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
    ReactNativeHapticFeedback.trigger('impactHeavy', PV.Haptic.options)
    toggleValueStreaming()
  }

  _handleAccessibilitySelectChange = (selectedKey: string) => {
    const { parsedTranscript, player } = this.global
    const { episode } = player
    const hasChapters = episode?.chaptersUrl
    const hasTranscript = !!parsedTranscript
    const items = accessibilitySelectorItems(hasChapters, hasTranscript)
    const accessibilityItemSelected = items.find((x) => x.value === selectedKey)
    this.setState({ accessibilityItemSelected })
  }

  render() {
    const { navigation } = this.props
    const { accessibilityItemSelected, activeIndex, boostIsSending, boostWasSent, explosionOrigin } = this.state
    const { parsedTranscript, player, podcastValueFinal, screenReaderEnabled } = this.global
    const { episode, nowPlayingItem, playbackState } = player
    const hasChapters = episode?.chaptersUrl
    const hasTranscript = !!parsedTranscript
    const { lightningNetwork, streamingEnabled } = this.global.session?.valueTagSettings || {}
    const { lnpay } = lightningNetwork || {}
    const { globalSettings, lnpayEnabled } = lnpay || {}
    const { boostAmount, streamingAmount } = globalSettings || {}
    const isPlaying = playbackState === RNTPState.Playing


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

    const hasValueInfo =
      !!Config.ENABLE_VALUE_TAG_TRANSACTIONS && (
        podcastValueFinal?.length > 0
        || nowPlayingItem?.episodeValue?.length > 0
        || nowPlayingItem?.podcastValue?.length > 0
      )

    const carouselComponents = mediaPlayerCarouselComponents(
      this._handlePressClipInfo,
      screenWidth,
      navigation,
      hasChapters,
      hasTranscript,
      screenReaderEnabled,
      accessibilityItemSelected?.value || null
    )

    return (
      <View style={styles.wrapper} transparent>
        {
          screenReaderEnabled && (
            <>
              <DropdownButtonSelect
                accessibilityHint={translate('ARIA HINT - This is the now playing info selector')}
                items={accessibilitySelectorItems(hasChapters, hasTranscript)}
                label={accessibilityItemSelected?.label}
                onValueChange={this._handleAccessibilitySelectChange}
                placeholder={placeholderItem}
                testID={testIDPrefix}
                value={accessibilityItemSelected?.value || null}
                wrapperStyle={styles.accessibilitySelectWrapper}
              />
              {carouselComponents}
            </>
          )
        }
        {
          !screenReaderEnabled && (
            <>
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
                {carouselComponents}
              </ScrollView>
              <View
                accessible={false}
                importantForAccessibility='no-hide-descendants'>
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
              </View>
            </>
          )
        }
        {!!Config.ENABLE_VALUE_TAG_TRANSACTIONS && lnpayEnabled && hasValueInfo && (
          <View style={styles.boostButtonsContainer}>
            <TouchableOpacity
              onPress={this._toggleSatStreaming}
              style={styles.boostButton}
              testID={'stream_button'.prependTestId()}>
              <Text style={streamingButtonMainTextStyles} testID='stream_button_text_1'>
                {satStreamText.toUpperCase()}
              </Text>
              <Text style={streamingButtonSubTextStyles} testID='stream_button_text_2'>
                {streamingAmount} {translate('sats / min')}
              </Text>
              {streamingEnabled && isPlaying && (
                <ActivityIndicator
                  size={15}
                  styles={{ position: 'absolute', right: 20 }}
                  testID={testIDPrefix} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              disabled={boostIsSending || boostWasSent}
              onLayout={(event) => {
                this.setState({ explosionOrigin: event.nativeEvent.layout.y })
              }}
              onPress={this._attemptBoost}
              style={styles.boostButton}
              testID={'boost_button'.prependTestId()}>
              {boostIsSending ? (
                <ActivityIndicator testID={testIDPrefix} />
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
        {
          <ConfettiCannon
            count={200}
            explosionSpeed={500}
            origin={{ x: Dimensions.get('screen').width, y: explosionOrigin }}
            autoStart={false}
            ref={(ref) => (this.explosion = ref)}
            fadeOut
          />
        }
      </View>
    )
  }
}

const placeholderItem = {
  label: translate('Select'),
  value: null
}

const accessibilitySelectorItems = (hasChapters: boolean, hasTranscript: boolean) => {
  const items = [
    accessibilityNowPlayingInfo,
    {
      label: translate('Episode Summary'),
      value: _episodeSummaryKey
    }
  ]

  if (hasChapters) {
    items.push(    {
      label: translate('Chapters'),
      value: _chaptersKey
    })
  }

  items.push(    {
    label: translate('Clips'),
    value: _clipsKey
  })

  if (hasTranscript) {
    items.push(    {
      label: translate('Chapters'),
      value: _transcriptKey
    })
  }

  return items
}

const mediaPlayerCarouselComponents = (
  handlePressClipInfo: any,
  screenWidth: number,
  navigation: any,
  hasChapters: boolean,
  hasTranscript: boolean,
  screenReaderEnabled: boolean,
  accessibilityItemSelectedValue?: string | null
) => {
  let finalSelectedValue = accessibilityItemSelectedValue
  if (
    finalSelectedValue === _chaptersKey && !hasChapters
    || finalSelectedValue === _transcriptKey && !hasTranscript
  ) {
    finalSelectedValue = _nowPlayingInfoKey
  }

  return (
    <>
      {
        screenReaderEnabled
          ? (
            <>
              {
                (accessibilityItemSelectedValue === _nowPlayingInfoKey || !accessibilityItemSelectedValue) &&
                  <MediaPlayerCarouselViewer handlePressClipInfo={handlePressClipInfo} width={screenWidth} />
              }
              {
                accessibilityItemSelectedValue === _episodeSummaryKey &&
                  <MediaPlayerCarouselShowNotes navigation={navigation} width={screenWidth} />
              }
              {
                accessibilityItemSelectedValue === _chaptersKey &&
                  <MediaPlayerCarouselChapters navigation={navigation} width={screenWidth} />
              }
              {
                accessibilityItemSelectedValue === _clipsKey &&
                  <MediaPlayerCarouselClips navigation={navigation} width={screenWidth} />
              }
              {
                accessibilityItemSelectedValue === _transcriptKey &&
                  <MediaPlayerCarouselTranscripts width={screenWidth} />
              }
            </>
          )
          : (
            <>
              <MediaPlayerCarouselViewer handlePressClipInfo={handlePressClipInfo} width={screenWidth} />
              <MediaPlayerCarouselShowNotes navigation={navigation} width={screenWidth} />
              {hasChapters && <MediaPlayerCarouselChapters navigation={navigation} width={screenWidth} />}
              <MediaPlayerCarouselClips navigation={navigation} width={screenWidth} />
              {hasTranscript && <MediaPlayerCarouselTranscripts width={screenWidth} />}
            </>
          )
      }
    </>
  )
}


const styles = StyleSheet.create({
  accessibilitySelectWrapper: {
    justifyContent: 'center',
    marginVertical: 8
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
  },
  wrapper: {
    flex: 1
  }
})
