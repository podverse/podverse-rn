import { Dimensions, Platform, StyleSheet } from 'react-native'
import React from 'reactn'
import ReactNativeHapticFeedback from 'react-native-haptic-feedback'
import { checkIfHasSupportedCommentTag, Episode, TranscriptRow } from 'podverse-shared'
import { PV } from '../resources'
import { InitialState } from '../resources/Interfaces'
import { translate } from '../lib/i18n'
import { playerCheckIfStateIsPlaying } from '../services/player'
import { v4vGetPluralCurrencyUnitPerMinute } from '../services/v4v/v4v'
import { getBoostagramItemValueTags, v4vGetActiveProviderInfo } from '../state/actions/v4v/v4v'
import { toggleValueStreaming } from '../state/actions/valueTag'
import { v4vAlbyHandleNavigation } from '../state/actions/v4v/providers/alby'
import { MediaPlayerCarouselComments } from './MediaPlayerCarouselComments'
import SwipeableContainer from './SwipeableContainer'
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
  isReady: boolean
  isReady2: boolean
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

const checkIfHasSummary = (episode: Episode) => {
  return episode?.podcast?.medium !== PV.Medium.music
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

  constructor(props) {
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
    const timeout2 = Platform.OS === 'android' ? 100 : 0

    setTimeout(() => {
      this.setState({ isReady: true })
      setTimeout(() => {
        this.setState({ isReady2: true })
      }, timeout2)
    }, timeout1)
  }

  scrollToActiveIndex = (activeIndex: number, animated: boolean) => {
    const { screenWidth } = this.global.screen
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
    const { screenWidth } = this.global.screen
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
    const { parsedTranscript, player } = this.global
    const { episode } = player
    const hasSummary = checkIfHasSummary(episode)
    const hasChapters = checkIfHasChapters(episode)
    const hasComments = !!checkIfHasSupportedCommentTag(episode)
    const hasTranscript = checkIfHasTranscript(parsedTranscript)
    const hasChat = checkIfHasChat(episode)
    const items = accessibilitySelectorItems(hasSummary, hasChapters, hasComments, hasTranscript, hasChat)
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
    const { accessibilityItemSelected, isReady, isReady2 } = this.state
    const { currentTocChapter, currentTocChapters, parsedTranscript, player, screen, screenPlayer,
      screenReaderEnabled, session } = this.global
    const { episode, nowPlayingItem, playbackState } = player
    const { screenWidth } = screen
    const hasSummary = checkIfHasSummary(episode)
    const hasChapters = checkIfHasChapters(episode)
    const hasComments = !!checkIfHasSupportedCommentTag(episode)
    const hasTranscript = checkIfHasTranscript(parsedTranscript)
    const hasChat = checkIfHasChat(episode)

    const { activeProvider, activeProviderSettings } = v4vGetActiveProviderInfo(
      getBoostagramItemValueTags(nowPlayingItem)
    )
    const { streamingAmount } = activeProviderSettings || {}
    const { streamingValueOn } = session.v4v

    const isPlaying = playerCheckIfStateIsPlaying(playbackState)

    let itemCount = 1
    let chaptersIndex = null
    let transcriptsIndex = null

    if (hasSummary) {
      itemCount++
    }
    if (hasChapters) {
      chaptersIndex = itemCount
      itemCount++
    }
    if (hasComments) itemCount++
    if (hasTranscript) {
      transcriptsIndex = itemCount
      itemCount++
    }
    if (hasChat) itemCount++

    const satStreamText = streamingValueOn ? translate('Stream On') : translate('Stream Off')

    const streamingButtonMainTextStyles = streamingValueOn
      ? [styles.boostButtonMainText, { fontWeight: '500' }]
      : [styles.boostButtonMainText]

    const streamingButtonSubTextStyles = streamingValueOn ? [styles.boostButtonSubText] : [styles.boostButtonSubText]

    const boostagramButtonText = !!session?.v4v?.valueTimeSplitIsActive
      ? translate('Time splits').toUpperCase()
      : translate('Boostagram').toUpperCase()

    const boostagramButtonMainTextStyles = !!session?.v4v?.valueTimeSplitIsActive
      ? [styles.boostagramButtonMainText, { color: PV.Colors.green }]
      : [styles.boostagramButtonMainText]

    const boostagramIconColor = !!session?.v4v?.valueTimeSplitIsActive ? 'green' : 'white'

    const boostagramIconName = !!session?.v4v?.valueTimeSplitIsActive ? 'clock' : 'comment-alt'

    const streamingIndicatorStyles =
      Platform.OS === 'ios'
        ? [styles.streamingIndicator, styles.streamingIndicatorIOS]
        : [styles.streamingIndicator, styles.streamingIndicatorAndroid]

    const streamingIndicatorSize = Platform.OS === 'ios' ? 15 : 20

    const hasValueInfo = nowPlayingItem?.episodeValue?.length > 0 || nowPlayingItem?.podcastValue?.length > 0

    const carouselComponents = mediaPlayerCarouselComponents({
      currentTocChapter,
      currentTocChapters,
      handlePressClipInfo: this._handlePressClipInfo,
      screenWidth,
      navigation,
      hasSummary,
      hasChapters,
      hasChat,
      hasComments,
      hasTranscript,
      screenReaderEnabled,
      player,
      screenPlayer,
      parsedTranscript: this.global.parsedTranscript || [],
      accessibilityItemSelectedValue: accessibilityItemSelected?.value || null,
      isReady,
      isReady2
    })

    return (
      <View style={styles.wrapper} transparent>
        {screenReaderEnabled && (
          <>
            <DropdownButtonSelect
              accessibilityHint={translate('ARIA HINT - This is the now playing info selector')}
              items={accessibilitySelectorItems(hasSummary, hasChapters, hasComments, hasTranscript, hasChat)}
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
          <SwipeableContainer
            chaptersIndex={chaptersIndex}
            transcriptsIndex={transcriptsIndex}
            totalChildren={itemCount}>
            {carouselComponents}
          </SwipeableContainer>
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
  hasSummary: boolean,
  hasChapters: boolean,
  hasComments: boolean,
  hasTranscript: boolean,
  hasChat: boolean
) => {
  const items = [accessibilityNowPlayingInfo]

  if (hasSummary) {
    items.push(  {
      label: translate('Episode Summary'),
      value: _episodeSummaryKey
    })
  }

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

type MPCComponents = {
  accessibilityItemSelectedValue?: string | null
  currentTocChapter?: InitialState['currentTocChapter']
  currentTocChapters: InitialState['currentTocChapters']
  handlePressClipInfo: any
  hasSummary: boolean
  hasChapters: boolean
  hasChat: boolean
  hasComments: boolean
  hasTranscript: boolean
  isReady?: boolean
  isReady2?: boolean
  navigation: any,
  parsedTranscript: TranscriptRow[]
  player: InitialState['player']
  screenPlayer: InitialState['screenPlayer']
  screenReaderEnabled: boolean
  screenWidth: number
}

const mediaPlayerCarouselComponents = ({
  accessibilityItemSelectedValue,
  currentTocChapter,
  currentTocChapters,
  handlePressClipInfo,
  hasChapters,
  hasChat,
  hasComments,
  hasSummary,
  hasTranscript,
  isReady,
  isReady2,
  navigation,
  parsedTranscript,
  player,
  screenPlayer,
  screenReaderEnabled,
  screenWidth
}: MPCComponents) => {
  const components = []
  if(screenReaderEnabled) {
    if(isReady && (accessibilityItemSelectedValue === _nowPlayingInfoKey || !accessibilityItemSelectedValue)) {
      components.push(
        <MediaPlayerCarouselViewer
          handlePressClipInfo={handlePressClipInfo}
          key='mpc_sr_viewer'
          navigation={navigation}
          width={screenWidth}
        />
      )
    }
    
    if(isReady2) {
      if(accessibilityItemSelectedValue === _episodeSummaryKey && hasSummary){
        components.push(
          <MediaPlayerCarouselShowNotes
            key='mpc_sr_show_notes'
            navigation={navigation}
            player={player}
            screenPlayer={screenPlayer}
            screenReaderEnabled={screenReaderEnabled}
            width={screenWidth}
          />
        )
      }
      if(accessibilityItemSelectedValue === _chaptersKey && hasChapters){
        components.push(
          <MediaPlayerCarouselChapters
            currentTocChapter={currentTocChapter}
            currentTocChapters={currentTocChapters}
            isLoading={screenPlayer?.isLoading}
            isLoadingMore={screenPlayer?.isLoadingMore}
            isQuerying={screenPlayer?.isQuerying}
            key='mpc_chapters'
            navigation={navigation}
            screenReaderEnabled={screenReaderEnabled}
            showMoreActionSheet={screenPlayer?.showMoreActionSheet}
            showNoInternetConnectionMessage={screenPlayer?.showNoInternetConnectionMessage}
            selectedItem={screenPlayer?.selectedItem}
            width={screenWidth}
          />
        )
      }
      if(accessibilityItemSelectedValue === _commentsKey && hasComments){
        components.push(
          <MediaPlayerCarouselComments
            key='mpc_sr_comments'
            navigation={navigation}
            width={screenWidth}
          />
        )
      }
      if(accessibilityItemSelectedValue === _transcriptKey && hasTranscript){
        components.push(
          <MediaPlayerCarouselTranscripts 
            key='mpc_sr_transcripts'
            isNowPlaying 
            parsedTranscript={parsedTranscript} 
            width={screenWidth} 
          />
        )
      }
      if(accessibilityItemSelectedValue === _chatRoomKey && hasChat){
        components.push(
          <MediaPlayerCarouselChatRoom
            key='mpc_sr_chat_room'
            navigation={navigation}
            width={screenWidth}
          />
        )
      }
    }
  } else {
    if(isReady) {
      components.push(
        <MediaPlayerCarouselViewer
          handlePressClipInfo={handlePressClipInfo}
          key='mpc_viewer'
          navigation={navigation}
          width={screenWidth}
        />
      )
    }

    if(isReady2) {
      if (hasSummary) {
        components.push(
          <MediaPlayerCarouselShowNotes
            key='mpc_show_notes'
            navigation={navigation}
            player={player}
            screenPlayer={screenPlayer}
            screenReaderEnabled={screenReaderEnabled}
            width={screenWidth}
          />
        )
      }
      
      if(hasChapters) {
        components.push(
          <MediaPlayerCarouselChapters
            currentTocChapter={currentTocChapter}
            currentTocChapters={currentTocChapters}
            isLoading={screenPlayer?.isLoading}
            isLoadingMore={screenPlayer?.isLoadingMore}
            isQuerying={screenPlayer?.isQuerying}
            key='mpc_chapters'
            navigation={navigation}
            screenReaderEnabled={screenReaderEnabled}
            showMoreActionSheet={screenPlayer?.showMoreActionSheet}
            showNoInternetConnectionMessage={screenPlayer?.showNoInternetConnectionMessage}
            selectedItem={screenPlayer?.selectedItem}
            width={screenWidth}
          />
        )
      }
      if(hasComments) {
        components.push(
          <MediaPlayerCarouselComments
            key='mpc_comments'
            navigation={navigation}
            width={screenWidth}
          />
        )
      }
      if(hasTranscript) {
        components.push(
          <MediaPlayerCarouselTranscripts 
            isNowPlaying 
            key='mpc_transcripts'
            parsedTranscript={parsedTranscript} 
            width={screenWidth} 
          />
        )
      }
      if(hasChat) {
        components.push(
          <MediaPlayerCarouselChatRoom
            key='mpc_chat_room'
            navigation={navigation}
            width={screenWidth}
          />
        )
      }
    }
  }

  return components
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
