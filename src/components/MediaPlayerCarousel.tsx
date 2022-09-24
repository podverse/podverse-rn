import { Dimensions, StyleSheet } from 'react-native'
import Dots from 'react-native-dots-pagination'
import React from 'reactn'
import ConfettiCannon from 'react-native-confetti-cannon'
import ReactNativeHapticFeedback from 'react-native-haptic-feedback'
import { checkIfHasSupportedCommentTag } from 'podverse-shared'
import { PV } from '../resources'
import { translate } from '../lib/i18n'
import { audioCheckIfIsPlaying } from '../services/playerAudio'
import { sendBoost, v4vGetPluralCurrencyUnit } from '../services/v4v/v4v'
import { getBoostagramItemValueTags, v4vGetActiveProviderInfo } from '../state/actions/v4v/v4v'
import { toggleValueStreaming } from '../state/actions/valueTag'
import { MediaPlayerCarouselComments } from './MediaPlayerCarouselComments'
import {
  ActivityIndicator,
  DropdownButtonSelect,
  Icon,
  MediaPlayerCarouselChapters,
  MediaPlayerCarouselChatRoom,
  MediaPlayerCarouselClips,
  MediaPlayerCarouselShowNotes,
  MediaPlayerCarouselTranscripts,
  MediaPlayerCarouselViewer,
  PressableWithOpacity,
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
const _chatRoomKey = '_chatRoomKey'
const _clipsKey = '_clipsKey'
const _commentsKey = '_commentsKey'
const _transcriptKey = '_transcriptKey'

const accessibilityNowPlayingInfo = {
  label: translate('Episode Summary'),
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
      (async () => {
        const { nowPlayingItem } = this.global.player
        await sendBoost(nowPlayingItem)
        this.setState(
          {
            boostIsSending: false,
            boostWasSent: true
          },
          () => {
            this.explosion && this.explosion.start()
            setTimeout(() => {
              this.setState({ boostWasSent: false })
            }, 4000)
          }
        )
      })()
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
    const hasClips = !episode?.liveItem
    const hasComments = !!checkIfHasSupportedCommentTag(episode)
    const hasTranscript = !!parsedTranscript
    const hasChat = !!episode?.liveItem?.chatIRCURL
    const items = accessibilitySelectorItems(hasChapters, hasComments, hasTranscript, hasChat, hasClips)
    const accessibilityItemSelected = items.find((x) => x.value === selectedKey)
    this.setState({ accessibilityItemSelected })
  }

  _handleBoostagramPress = () => {
    const { navigation } = this.props
    navigation.navigate({
      routeName: PV.RouteNames.V4VBoostagramPlayerScreen,
      params: {
        showBackButton: true
      }
    })
  }

  render() {
    const { navigation } = this.props
    const { accessibilityItemSelected, activeIndex, boostIsSending, boostWasSent, explosionOrigin } = this.state
    const { parsedTranscript, player, screenReaderEnabled, session } = this.global
    const { episode, nowPlayingItem, playbackState } = player
    const hasChapters = episode?.chaptersUrl
    const hasClips = !episode?.liveItem
    const hasComments = !!checkIfHasSupportedCommentTag(episode)
    const hasTranscript = !!parsedTranscript
    const hasChat = !!episode?.liveItem?.chatIRCURL

    const { activeProvider, activeProviderSettings } = 
      v4vGetActiveProviderInfo(getBoostagramItemValueTags(nowPlayingItem))
    const { boostAmount, streamingAmount } = activeProviderSettings || {}
    const { streamingValueOn } = session.v4v

    const isPlaying = audioCheckIfIsPlaying(playbackState)

    let itemCount = 2
    if (hasChapters) itemCount++
    if (hasClips) itemCount++
    if (hasComments) itemCount++
    if (hasTranscript) itemCount++
    if (hasChat) itemCount++

    const satStreamText = streamingValueOn ? translate('Stream On') : translate('Stream Off')

    const boostText = boostWasSent ? translate('Boost Sent').toUpperCase() : translate('Boost').toUpperCase()

    const streamingButtonMainTextStyles = streamingValueOn
      ? [styles.boostButtonMainText, { color: PV.Colors.green }]
      : [styles.boostButtonMainText]

    const streamingButtonSubTextStyles = streamingValueOn
      ? [styles.boostButtonSubText, { color: PV.Colors.green }]
      : [styles.boostButtonSubText]

    const hasValueInfo =
      nowPlayingItem?.episodeValue?.length > 0 ||
      nowPlayingItem?.podcastValue?.length > 0

    const carouselComponents = mediaPlayerCarouselComponents(
      this._handlePressClipInfo,
      screenWidth,
      navigation,
      hasChapters,
      hasChat,
      hasClips,
      hasComments,
      hasTranscript,
      screenReaderEnabled,
      accessibilityItemSelected?.value || null
    )

    return (
      <View style={styles.wrapper} transparent>
        {screenReaderEnabled && (
          <>
            <DropdownButtonSelect
              accessibilityHint={translate('ARIA HINT - This is the now playing info selector')}
              items={accessibilitySelectorItems(hasChapters, hasComments, hasTranscript, hasChat, hasClips)}
              label={accessibilityItemSelected?.label}
              onValueChange={this._handleAccessibilitySelectChange}
              placeholder={placeholderItem}
              testID={testIDPrefix}
              value={accessibilityItemSelected?.value || null}
              wrapperStyle={styles.accessibilitySelectWrapper}
            />
            {carouselComponents}
          </>
        )}
        {!screenReaderEnabled && (
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
            <View accessible={false} importantForAccessibility='no-hide-descendants'>
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
        )}
        {!!activeProvider && hasValueInfo && (
          <View style={styles.boostButtonsContainer}>
            {/* <PressableWithOpacity
              onPress={this._toggleSatStreaming}
              style={styles.boostButton}
              testID={'stream_button'.prependTestId()}>
              <Text style={streamingButtonMainTextStyles} testID='stream_button_text_1'>
                {satStreamText.toUpperCase()}
              </Text>
              <Text style={streamingButtonSubTextStyles} testID='stream_button_text_2'>
                {`${streamingAmount} ${v4vGetPluralCurrencyUnitPerMinute(activeProvider.unit)}`}
              </Text>
              {streamingValueOn && isPlaying && (
                <ActivityIndicator size={15} styles={{ position: 'absolute', right: 20 }} testID={testIDPrefix} />
              )}
            </PressableWithOpacity> */}
            <PressableWithOpacity
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
                      {`${boostAmount} ${v4vGetPluralCurrencyUnit(activeProvider.unit)}`}
                    </Text>
                  )}
                </>
              )}
            </PressableWithOpacity>
            <PressableWithOpacity
              onPress={this._handleBoostagramPress}
              style={styles.boostagramButton}
              testID={'boostagram_button'.prependTestId()}>
              <Text style={styles.boostagramButtonMainText} testID='boost_button_text_1'>
                {translate('Boostagram').toUpperCase()}
              </Text>
              <Icon
                accessibilityLabel={translate('Boostagram')}
                accessibilityRole='button'
                name='comment-alt'
                size={17}
                testID={`${testIDPrefix}_boostagram_button`}
              />
            </PressableWithOpacity>
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

const accessibilitySelectorItems = (
  hasChapters: boolean,
  hasComments: boolean,
  hasTranscript: boolean,
  hasChat: boolean,
  hasClips: boolean
) => {
  const items = [
    accessibilityNowPlayingInfo,
    {
      label: translate('Episode Summary'),
      value: _episodeSummaryKey
    }
  ]

  if (hasChapters) {
    items.push({
      label: translate('Chapters'),
      value: _chaptersKey
    })
  }

  if (hasClips) {
    items.push({
      label: translate('Clips'),
      value: _clipsKey
    })
  }

  if (hasComments) {
    items.push({
      label: translate('Comments'),
      value: _commentsKey
    })
  }

  if (hasTranscript) {
    items.push({
      label: translate('Transcript'),
      value: _transcriptKey
    })
  }

  if (hasChat) {
    items.push({
      label: translate('Chat Room'),
      value: _chatRoomKey
    })
  }

  return items
}

const mediaPlayerCarouselComponents = (
  handlePressClipInfo: any,
  screenWidth: number,
  navigation: any,
  hasChapters: boolean,
  hasChat: boolean,
  hasClips: boolean,
  hasComments: boolean,
  hasTranscript: boolean,
  screenReaderEnabled: boolean,
  accessibilityItemSelectedValue?: string | null
) => {
  return (
    <>
      {screenReaderEnabled ? (
        <>
          {(accessibilityItemSelectedValue === _nowPlayingInfoKey || !accessibilityItemSelectedValue) && (
            <MediaPlayerCarouselViewer
              handlePressClipInfo={handlePressClipInfo}
              navigation={navigation}
              width={screenWidth}
            />
          )}
          {accessibilityItemSelectedValue === _episodeSummaryKey && (
            <MediaPlayerCarouselShowNotes navigation={navigation} width={screenWidth} />
          )}
          {accessibilityItemSelectedValue === _chaptersKey && (
            <MediaPlayerCarouselChapters navigation={navigation} width={screenWidth} />
          )}
          {accessibilityItemSelectedValue === _clipsKey && (
            <MediaPlayerCarouselClips navigation={navigation} width={screenWidth} />
          )}
          {accessibilityItemSelectedValue === _commentsKey && (
            <MediaPlayerCarouselComments navigation={navigation} width={screenWidth} />
          )}
          {accessibilityItemSelectedValue === _transcriptKey && <MediaPlayerCarouselTranscripts width={screenWidth} />}
          {accessibilityItemSelectedValue === _chatRoomKey && 
            <MediaPlayerCarouselChatRoom navigation={navigation} width={screenWidth} />}
        </>
      ) : (
        <>
          <MediaPlayerCarouselViewer
            handlePressClipInfo={handlePressClipInfo}
            navigation={navigation}
            width={screenWidth}
          />
          <MediaPlayerCarouselShowNotes navigation={navigation} width={screenWidth} />
          {hasChapters && <MediaPlayerCarouselChapters navigation={navigation} width={screenWidth} />}
          {hasClips && <MediaPlayerCarouselClips navigation={navigation} width={screenWidth} />}
          {hasComments && <MediaPlayerCarouselComments navigation={navigation} width={screenWidth} />}
          {hasTranscript && <MediaPlayerCarouselTranscripts width={screenWidth} />}
          {hasChat && <MediaPlayerCarouselChatRoom navigation={navigation} width={screenWidth} />}
        </>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  accessibilitySelectWrapper: {
    justifyContent: 'center',
    marginVertical: 8
  },
  boostButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8
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
    borderWidth: 2,
    maxWidth: '50%'
  },
  boostagramButton: {
    flex: 1,
    flexDirection: 'row',
    margin: 10,
    height: 50,
    borderRadius: 35,
    backgroundColor: PV.Colors.velvet,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: PV.Colors.brandBlueLight,
    borderWidth: 2,
    maxWidth: '50%'
  },
  boostButtonMainText: {
    fontSize: PV.Fonts.sizes.sm
  },
  boostagramButtonMainText: {
    fontSize: PV.Fonts.sizes.sm,
    marginRight: 8
  },
  boostButtonSubText: {
    fontSize: PV.Fonts.sizes.xs
  },
  wrapper: {
    flex: 1
  }
})
