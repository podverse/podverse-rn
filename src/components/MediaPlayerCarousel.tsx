import { Dimensions, Platform, StyleSheet } from 'react-native'
import Dots from 'react-native-dots-pagination'
import React from 'reactn'
import ReactNativeHapticFeedback from 'react-native-haptic-feedback'
import { checkIfHasSupportedCommentTag, Episode, TranscriptRow } from 'podverse-shared'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { GlobalTheme, InitialState } from '../resources/Interfaces'
import { playerCheckIfStateIsPlaying } from '../services/player'
import { v4vGetPluralCurrencyUnitPerMinute } from '../services/v4v/v4v'
import { getBoostagramItemValueTags, v4vGetActiveProviderInfo } from '../state/actions/v4v/v4v'
import { toggleValueStreaming } from '../state/actions/valueTag'
import { v4vAlbyHandleNavigation } from '../state/actions/v4v/providers/alby'
import { MediaPlayerCarouselComments } from './MediaPlayerCarouselComments'
import {
  ActivityIndicator,
  DropdownButtonSelect,
  Icon,
  MediaPlayerCarouselChapters,
  MediaPlayerCarouselChatRoom,
  MediaPlayerCarouselShowNotes,
  MediaPlayerCarouselTranscripts,
  MediaPlayerCarouselViewer,
  PressableWithOpacity,
  ScrollView,
  Text,
  View
} from '.'

type Props = {
  currentChapter: InitialState['currentChapter']
  currentChapters: InitialState['currentChapters']
  downloadsActive: InitialState['downloadsActive']
  downloadedEpisodeIds: InitialState['downloadedEpisodeIds']
  fontScaleMode: InitialState['fontScaleMode']
  globalTheme: GlobalTheme
  hasChapters: boolean
  isLoggedIn: InitialState['session']['isLoggedIn']
  navigation: any
  parsedTranscript: TranscriptRow[] | null
  player: InitialState['player']
  screen: InitialState['screen']
  screenPlayer: InitialState['screenPlayer']
  screenReaderEnabled: boolean
  streamingValueOn: InitialState['session']['v4v']['streamingValueOn']
  userId: InitialState['session']['userInfo']['id']
  valueTimeSplitIsActive: InitialState['session']['v4v']['valueTimeSplitIsActive']
}

type State = {
  accessibilityItemSelected: any
  activeIndex: number
  boostIsSending: boolean
  boostWasSent: boolean
  isReady: boolean
  isReady2: boolean
}

type MediaPlayerCarouselComponentsState = {
  accessibilityItemSelectedValue?: string | null
  currentChapter: InitialState['currentChapter']
  currentChapters: InitialState['currentChapters']
  downloadsActive: InitialState['downloadsActive']
  downloadedEpisodeIds: InitialState['downloadedEpisodeIds']
  fontScaleMode: InitialState['fontScaleMode']
  globalTheme: GlobalTheme
  handlePressClipInfo: any
  hasChapters: boolean
  hasChat: boolean
  hasComments: boolean
  hasTranscript: boolean
  isLoggedIn: InitialState['session']['isLoggedIn']
  isReady?: boolean
  isReady2?: boolean
  navigation: any
  parsedTranscript: TranscriptRow[]
  player: InitialState['player']
  screen: InitialState['screen']
  screenPlayer: InitialState['screenPlayer']
  screenReaderEnabled: boolean
  screenWidth: number
  userId: InitialState['session']['userInfo']['id']
}

const testIDPrefix = 'media_player_carousel'

const _nowPlayingInfoKey = '_nowPlayingInfoKey'
const _episodeSummaryKey = '_episodeSummaryKey'
const _chaptersKey = '_chaptersKey'
const _chatRoomKey = '_chatRoomKey'
const _commentsKey = '_commentsKey'
const _transcriptKey = '_transcriptKey'

const accessibilityNowPlayingInfo = {
  label: translate('Episode Summary'),
  value: _nowPlayingInfoKey
}

const checkIfHasChapters = (episode: Episode) => {
  return !!episode?.chaptersUrl
}

const checkIfHasTranscript = (parsedTranscript: any) => {
  return !!parsedTranscript
}

const checkIfHasChat = (episode: Episode) => {
  return episode && episode.liveItem && !!episode.liveItem.chatIRCURL
}

export class MediaPlayerCarousel extends React.PureComponent<Props, State> {
  carousel: any
  scrollView: any
  handlePressClipInfo: any

  constructor(props: Props) {
    super(props)

    this.state = {
      accessibilityItemSelected: accessibilityNowPlayingInfo,
      activeIndex: 0,
      boostIsSending: false,
      boostWasSent: false,
      isReady: false,
      isReady2: false
    }
  }

  componentDidMount() {
    const { activeIndex } = this.state
    const animated = false
    this.scrollToActiveIndex(activeIndex, animated)

    /*
    Add timeout to improve initial rendering time on Android.
    https://stackoverflow.com/questions/46127753/react-native-react-navigation-slow-transitions-when-nesting-navigators
  */
    const timeout1 = Platform.OS === 'android' ? 50 : 0
    const timeout2 = Platform.OS === 'android' ? 500 : 0

    setTimeout(() => {
      this.setState({ isReady: true })
      setTimeout(() => {
        this.setState({ isReady2: true })
      }, timeout2)
    }, timeout1)
  }

  scrollToActiveIndex = (activeIndex: number, animated: boolean) => {
    const { screenWidth } = this.props.screen
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
    const { screenWidth } = this.props.screen
    const { contentOffset } = nativeEvent
    const activeIndex = Math.round(contentOffset.x / screenWidth)
    this.setState({ activeIndex })
  }

  _handlePressClipInfo = () => {
    const animated = true
    this.scrollToActiveIndex(1, animated)
  }

  _toggleSatStreaming = async () => {
    ReactNativeHapticFeedback.trigger('impactHeavy', PV.Haptic.options)
    await toggleValueStreaming()
  }

  _handleSatStreamingLongPress = () => {
    const { navigation } = this.props
    navigation.dismiss()
    v4vAlbyHandleNavigation(navigation)
  }

  _handleAccessibilitySelectChange = (selectedKey: string) => {
    const { parsedTranscript, player } = this.props
    const { episode } = player
    const hasChapters = checkIfHasChapters(episode)
    const hasComments = !!checkIfHasSupportedCommentTag(episode)
    const hasTranscript = checkIfHasTranscript(parsedTranscript)
    const hasChat = checkIfHasChat(episode)
    const items = accessibilitySelectorItems(hasChapters, hasComments, hasTranscript, hasChat)
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
    const { currentChapter, currentChapters, downloadsActive, downloadedEpisodeIds,
      fontScaleMode, globalTheme, isLoggedIn, navigation, parsedTranscript, player, screen,
      screenPlayer, screenReaderEnabled, streamingValueOn, userId, valueTimeSplitIsActive } = this.props
    const { accessibilityItemSelected, activeIndex, isReady, isReady2 } = this.state
    const { episode, nowPlayingItem, playbackState } = player
    const { screenWidth } = screen
    const hasChapters = checkIfHasChapters(episode)
    const hasComments = !!checkIfHasSupportedCommentTag(episode)
    const hasTranscript = checkIfHasTranscript(parsedTranscript)
    const hasChat = checkIfHasChat(episode)

    const { activeProvider, activeProviderSettings } = v4vGetActiveProviderInfo(
      getBoostagramItemValueTags(nowPlayingItem)
    )
    const { streamingAmount } = activeProviderSettings || {}

    const isPlaying = playerCheckIfStateIsPlaying(playbackState)

    let itemCount = 2
    if (hasChapters) itemCount++
    if (hasComments) itemCount++
    if (hasTranscript) itemCount++
    if (hasChat) itemCount++

    const satStreamText = streamingValueOn ? translate('Stream On') : translate('Stream Off')

    const streamingButtonMainTextStyles = streamingValueOn
      ? [styles.boostButtonMainText, { fontWeight: '500' }]
      : [styles.boostButtonMainText]

    const streamingButtonSubTextStyles = streamingValueOn ? [styles.boostButtonSubText] : [styles.boostButtonSubText]

    const boostagramButtonText = !!valueTimeSplitIsActive
      ? translate('Time splits').toUpperCase()
      : translate('Boostagram').toUpperCase()

    const boostagramButtonMainTextStyles = !!valueTimeSplitIsActive
      ? [styles.boostagramButtonMainText, { color: PV.Colors.green }]
      : [styles.boostagramButtonMainText]

    const boostagramIconColor = !!valueTimeSplitIsActive ? 'green' : 'white'
    const boostagramIconName = !!valueTimeSplitIsActive ? 'clock' : 'comment-alt'

    const streamingIndicatorStyles =
      Platform.OS === 'ios'
        ? [styles.streamingIndicator, styles.streamingIndicatorIOS]
        : [styles.streamingIndicator, styles.streamingIndicatorAndroid]

    const streamingIndicatorSize = Platform.OS === 'ios' ? 15 : 20

    const hasValueInfo = nowPlayingItem?.episodeValue?.length > 0 || nowPlayingItem?.podcastValue?.length > 0

    const carouselComponents = mediaPlayerCarouselComponents({
      accessibilityItemSelectedValue: accessibilityItemSelected?.value || null,
      currentChapter,
      currentChapters,
      downloadsActive,
      downloadedEpisodeIds,
      fontScaleMode,
      globalTheme,
      handlePressClipInfo: this._handlePressClipInfo,
      navigation,
      hasChapters,
      hasChat,
      hasComments,
      hasTranscript,
      isLoggedIn,
      isReady,
      isReady2,
      parsedTranscript: parsedTranscript || [],
      player,
      screen,
      screenPlayer,
      screenReaderEnabled,
      screenWidth,
      userId
    })

    return (
      <View style={styles.wrapper} transparent>
        {screenReaderEnabled && (
          <>
            <DropdownButtonSelect
              accessibilityHint={translate('ARIA HINT - This is the now playing info selector')}
              items={accessibilitySelectorItems(hasChapters, hasComments, hasTranscript, hasChat)}
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
          <View style={styles.maxWidthWrapper}>
            <View style={styles.boostButtonsContainer}>
              <PressableWithOpacity
                onLongPress={this._handleSatStreamingLongPress}
                onPress={this._toggleSatStreaming}
                style={styles.boostButton}
                testID={'stream_button'.prependTestId()}>
                <View style={styles.boostButtonColumn}>
                  <Text style={streamingButtonMainTextStyles} testID='stream_button_text_1'>
                    {satStreamText.toUpperCase()}
                  </Text>
                  <Text style={streamingButtonSubTextStyles} testID='stream_button_text_2'>
                    {`${streamingAmount} ${v4vGetPluralCurrencyUnitPerMinute(activeProvider.unit)}`}
                  </Text>
                </View>
                {streamingValueOn && isPlaying && (
                  <ActivityIndicator
                    size={streamingIndicatorSize}
                    styles={streamingIndicatorStyles}
                    testID={testIDPrefix}
                  />
                )}
              </PressableWithOpacity>
              <PressableWithOpacity
                onPress={this._handleBoostagramPress}
                style={styles.boostagramButton}
                testID={'boostagram_button'.prependTestId()}>
                <Text style={boostagramButtonMainTextStyles} testID='boost_button_text_1'>
                  {boostagramButtonText}
                </Text>
                <Icon
                  accessibilityLabel={translate('Boostagram')}
                  accessibilityRole='button'
                  name={boostagramIconName}
                  size={17}
                  color={boostagramIconColor}
                  testID={`${testIDPrefix}_boostagram_button`}
                />
              </PressableWithOpacity>
            </View>
          </View>
        )}
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
  hasChat: boolean
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

// TODO: remove the need for this function or somehow improve it.
const mediaPlayerCarouselComponents = (x: MediaPlayerCarouselComponentsState) => {
  const { accessibilityItemSelectedValue, currentChapter, currentChapters, downloadsActive,
    downloadedEpisodeIds, fontScaleMode, globalTheme, handlePressClipInfo,
    hasChapters, hasChat, hasComments, hasTranscript, isLoggedIn, isReady, isReady2, navigation, parsedTranscript,
    player, screen, screenPlayer, screenReaderEnabled, screenWidth, userId } = x

  return (
    <>
      {screenReaderEnabled ? (
        <>
          {isReady && (accessibilityItemSelectedValue === _nowPlayingInfoKey || !accessibilityItemSelectedValue) && (
            <MediaPlayerCarouselViewer
              currentChapter={currentChapter}
              handlePressClipInfo={handlePressClipInfo}
              navigation={navigation}
              player={player}
              screen={screen}
              screenPlayer={screenPlayer}
              screenReaderEnabled={screenReaderEnabled}
              width={screenWidth}
            />
          )}
          {isReady2 && (
            <>
              {accessibilityItemSelectedValue === _episodeSummaryKey && (
                <MediaPlayerCarouselShowNotes
                  globalTheme={globalTheme}
                  isLoggedIn={isLoggedIn}
                  navigation={navigation}
                  player={player}
                  screenPlayer={screenPlayer}
                  screenReaderEnabled={screenReaderEnabled}
                  userId={userId}
                  width={screenWidth} />
              )}
              {accessibilityItemSelectedValue === _chaptersKey && hasChapters && (
                <MediaPlayerCarouselChapters
                  downloadsActive={downloadsActive}
                  downloadedEpisodeIds={downloadedEpisodeIds}
                  currentChapter={currentChapter}
                  currentChapters={currentChapters}
                  fontScaleMode={fontScaleMode}
                  navigation={navigation}
                  player={player}
                  screenPlayer={screenPlayer}
                  screenReaderEnabled={screenReaderEnabled}
                  width={screenWidth} />
              )}
              {accessibilityItemSelectedValue === _commentsKey && hasComments && (
                <MediaPlayerCarouselComments
                  navigation={navigation}
                  player={player}
                  width={screenWidth} />
              )}
              {accessibilityItemSelectedValue === _transcriptKey && hasTranscript && (
                <MediaPlayerCarouselTranscripts
                  isNowPlaying
                  parsedTranscript={parsedTranscript}
                  screen={screen}
                  screenReaderEnabled={screenReaderEnabled}
                  width={screenWidth} />
              )}
              {accessibilityItemSelectedValue === _chatRoomKey && hasChat && (
                <MediaPlayerCarouselChatRoom
                  navigation={navigation}
                  player={player}
                  width={screenWidth} />
              )}
            </>
          )}
        </>
      ) : (
        <>
          {isReady && (
            <MediaPlayerCarouselViewer
              currentChapter={currentChapter}
              handlePressClipInfo={handlePressClipInfo}
              navigation={navigation}
              player={player}
              screen={screen}
              screenPlayer={screenPlayer}
              screenReaderEnabled={screenReaderEnabled}
              width={screenWidth}
            />
          )}
          {isReady2 && (
            <>
              <MediaPlayerCarouselShowNotes
                globalTheme={globalTheme}
                isLoggedIn={isLoggedIn}
                navigation={navigation}
                player={player}
                screenPlayer={screenPlayer}
                screenReaderEnabled={screenReaderEnabled}
                userId={userId}
                width={screenWidth} />
              {hasChapters && (
                <MediaPlayerCarouselChapters
                  currentChapter={currentChapter}
                  currentChapters={currentChapters}
                  downloadsActive={downloadsActive}
                  downloadedEpisodeIds={downloadedEpisodeIds}
                  fontScaleMode={fontScaleMode}
                  navigation={navigation}
                  player={player}
                  screenPlayer={screenPlayer}
                  screenReaderEnabled={screenReaderEnabled}
                  width={screenWidth} />
              )}
              {hasComments && (
                <MediaPlayerCarouselComments
                  navigation={navigation}
                  player={player}
                  width={screenWidth} />
              )}
              {hasTranscript && (
                <MediaPlayerCarouselTranscripts
                  isNowPlaying
                  parsedTranscript={parsedTranscript}
                  screen={screen}
                  screenReaderEnabled={screenReaderEnabled}
                  width={screenWidth} />
              )}
              {hasChat && (
                <MediaPlayerCarouselChatRoom
                  navigation={navigation}
                  player={player}
                  width={screenWidth} />
              )}
            </>
          )}
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
    marginBottom: 8,
    maxWidth: PV.Player.playerControlsMaxWidth - 500
  },
  boostButton: {
    flex: 1,
    margin: 10,
    height: 50,
    borderRadius: 35,
    backgroundColor: PV.Colors.velvet,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderColor: PV.Colors.brandBlueLight,
    borderWidth: 2,
    maxWidth: '50%',
    position: 'relative'
  },
  boostButtonColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent'
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
    fontSize: PV.Fonts.sizes.sm,
    backgroundColor: 'transparent'
  },
  boostagramButtonMainText: {
    fontSize: PV.Fonts.sizes.sm,
    marginRight: 8
  },
  boostButtonSubText: {
    fontSize: PV.Fonts.sizes.xs,
    backgroundColor: 'transparent'
  },
  maxWidthWrapper: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  streamingIndicator: {
    position: 'absolute'
  },
  streamingIndicatorAndroid: {
    right: -34,
    top: -10
  },
  streamingIndicatorIOS: {
    right: -34,
    top: -7
  },
  wrapper: {
    flex: 1,
    minHeight:
      Dimensions.get('window').height > PV.Dimensions.preventKeyboardShrinkMinHeight.smallScreen.height
        ? 420
        : Dimensions.get('window').height > PV.Dimensions.preventKeyboardShrinkMinHeight.smallestScreen.height
        ? 250
        : 0
  }
})
