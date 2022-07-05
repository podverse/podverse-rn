import debounce from 'lodash/debounce'
import { checkIfVideoFileOrVideoLiveType } from 'podverse-shared'
import { StyleSheet, View, Image, ImageSourcePropType } from 'react-native'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import {
  playerCheckIfStateIsBuffering,
  playerCheckIfStateIsPlaying,
  playerJumpBackward,
  playerJumpForward,
  playerPlayNextFromQueue,
  playerHandleSeekTo
} from '../services/player'
import {
  playerLoadNowPlayingItem,
  playerPlayNextChapterOrQueueItem,
  playerPlayPreviousChapterOrReturnToBeginningOfTrack,
  playerSetPlaybackSpeed,
  playerTogglePlay
} from '../state/actions/player'
import { loadChapterPlaybackInfo } from '../state/actions/playerChapters'
import { darkTheme, iconStyles, playerStyles } from '../styles'
import { PlayerMoreActionSheet } from './PlayerMoreActionSheet'
import {
  ActivityIndicator,
  Icon,
  PlayerLiveButton,
  PlayerProgressBar,
  PressableWithOpacity,
  Text,
  View as PVView
} from './'

type Props = {
  navigation: any
}

type State = {
  progressValue: number
  showPlayerMoreActionSheet: boolean
}

const debouncedPlayerJumpBackward = debounce(loadChapterPlaybackInfo, 500, {
  leading: true,
  trailing: true
})

const debouncedPlayerJumpForward = debounce(loadChapterPlaybackInfo, 500, {
  leading: true,
  trailing: true
})

const testIDPrefix = 'player_controls'

export class PlayerControls extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      progressValue: 0,
      showPlayerMoreActionSheet: false
    }
  }

  _adjustSpeed = async () => {
    const { playbackRate } = this.global.player
    const speeds = await PV.Player.speeds()
    const index = speeds.indexOf(playbackRate)

    let newSpeed
    if (speeds.length - 1 === index) {
      newSpeed = speeds[0]
    } else {
      newSpeed = speeds[index + 1]
    }

    await playerSetPlaybackSpeed(newSpeed)
  }

  _navToStopWatchScreen = () => {
    const { navigation } = this.props
    navigation.navigate(PV.RouteNames.SleepTimerScreen)
  }

  _playerJumpBackward = async () => {
    const { jumpBackwardsTime } = this.global
    const progressValue = await playerJumpBackward(jumpBackwardsTime)
    this.setState({ progressValue })
    debouncedPlayerJumpBackward()
  }

  _playerJumpForward = async () => {
    const { jumpForwardsTime } = this.global
    const progressValue = await playerJumpForward(jumpForwardsTime)
    this.setState({ progressValue })
    debouncedPlayerJumpForward()
  }

  _hidePlayerMoreActionSheet = () => {
    this.setState({ showPlayerMoreActionSheet: false })
  }

  _showPlayerMoreActionSheet = () => {
    this.setState({
      showPlayerMoreActionSheet: true
    })
  }

  _renderPlayerControlIcon = (source: ImageSourcePropType, testID: string, disabled?: boolean) => {
    const disabledStyle: { tintColor?: string } = {}
    if (disabled) {
      disabledStyle.tintColor = PV.Colors.grayDark
    }
    return (
      <PVView style={styles.iconContainer} transparent testID={testID}>
        <Image source={source} resizeMode='contain' style={[styles.icon, disabledStyle]} />
      </PVView>
    )
  }

  render() {
    const { navigation } = this.props
    const { progressValue, showPlayerMoreActionSheet } = this.state
    const {
      currentChapter,
      currentChapters,
      currentChaptersStartTimePositions,
      globalTheme,
      jumpBackwardsTime,
      jumpForwardsTime,
      player,
      screenPlayer,
      session
    } = this.global
    const { backupDuration, hidePlaybackSpeedButton, playbackRate, playbackState } = player
    const { userInfo } = session
    const { queueItems } = userInfo
    const { isLoading } = screenPlayer
    const hasErrored = playbackState === PV.Player.errorState
    const hitSlop = {
      bottom: 8,
      left: 8,
      right: 8,
      top: 8
    }

    const isLastChapter =
      currentChapter &&
      currentChapters.length > 1 &&
      currentChapters[currentChapters.length - 1] &&
      currentChapters[currentChapters.length - 1].id === currentChapter.id

    const noNextQueueItem = currentChapter ? queueItems?.length === 0 && isLastChapter : queueItems?.length === 0

    // nowPlayingItem will be undefined when loading from a deep link
    let { nowPlayingItem } = player
    nowPlayingItem = nowPlayingItem || {}
    const { liveItem } = nowPlayingItem

    let playButtonIcon = <Icon name='play' size={20} testID={`${testIDPrefix}_play_button`} />
    let playButtonAdjust = { paddingLeft: 2 } as any
    let playButtonAccessibilityHint = translate('ARIA HINT - resume playing')
    let playButtonAccessibilityLabel = translate('Play')

    if (hasErrored) {
      playButtonIcon = (
        <Icon
          color={globalTheme === darkTheme ? iconStyles.lightRed.color : iconStyles.darkRed.color}
          name={'exclamation-triangle'}
          size={35}
          testID={`${testIDPrefix}_error`}
        />
      )
      playButtonAdjust = { paddingBottom: 8 } as any
    } else if (playerCheckIfStateIsPlaying(playbackState)) {
      playButtonIcon = <Icon name='pause' size={20} testID={`${testIDPrefix}_pause_button`} />
      playButtonAdjust = {}
      playButtonAccessibilityHint = translate('ARIA HINT - pause playback')
      playButtonAccessibilityLabel = translate('Pause')
    } else if (playerCheckIfStateIsBuffering(playbackState)) {
      playButtonIcon = <ActivityIndicator testID={testIDPrefix} />
      playButtonAdjust = { paddingLeft: 2, paddingTop: 2 }
      playButtonAccessibilityHint = ''
      playButtonAccessibilityLabel = translate('Episode is loading')
    }

    let { clipEndTime, clipStartTime } = nowPlayingItem
    if (!clipStartTime && currentChapter?.startTime) {
      clipStartTime = currentChapter?.startTime
      clipEndTime = currentChapter?.endTime
    }

    const jumpBackAccessibilityLabel = `${translate('Jump back')} ${jumpBackwardsTime} ${translate('seconds')}`
    const jumpForwardAccessibilityLabel = `${translate('Jump forward')} ${jumpForwardsTime} ${translate('seconds')}`

    const previousButtonAccessibilityLabel =
      currentChapters && currentChapters.length > 1
        ? translate('Go to previous chapter')
        : translate('Return to beginning of episode')

    const nextButtonAccessibilityLabel =
      currentChapters && currentChapters.length > 1
        ? translate('Go to next chapter')
        : translate('Skip to next item in your queue')

    const isVideo = checkIfVideoFileOrVideoLiveType(nowPlayingItem?.episodeMediaType)

    return (
      <View style={[styles.wrapper, globalTheme.player]}>
        <View style={styles.progressWrapper}>
          <PlayerProgressBar
            backupDuration={backupDuration}
            clipEndTime={clipEndTime}
            clipStartTime={clipStartTime}
            currentChaptersStartTimePositions={currentChaptersStartTimePositions}
            globalTheme={globalTheme}
            isLiveItem={!!liveItem}
            isLoading={isLoading}
            value={progressValue}
          />
        </View>
        <View style={styles.playerControlsMiddleRow}>
          <View style={styles.playerControlsMiddleRowTop}>
            {!isVideo && !liveItem && (
              <PressableWithOpacity
                accessibilityLabel={previousButtonAccessibilityLabel}
                accessibilityRole='button'
                onLongPress={() => playerHandleSeekTo(0)}
                onPress={playerPlayPreviousChapterOrReturnToBeginningOfTrack}
                style={[playerStyles.icon, { flexDirection: 'row' }]}>
                {this._renderPlayerControlIcon(PV.Images.PREV_TRACK, `${testIDPrefix}_previous_track`)}
              </PressableWithOpacity>
            )}
            {!liveItem && (
              <PressableWithOpacity
                accessibilityLabel={jumpBackAccessibilityLabel}
                accessibilityRole='button'
                onPress={this._playerJumpBackward}
                style={playerStyles.icon}>
                {this._renderPlayerControlIcon(PV.Images.JUMP_BACKWARDS, `${testIDPrefix}_jump_backward`)}
                <View importantForAccessibility='no-hide-descendants' style={styles.skipTimeTextWrapper}>
                  <Text style={styles.skipTimeText}>{jumpBackwardsTime}</Text>
                </View>
              </PressableWithOpacity>
            )}
            <PressableWithOpacity
              accessibilityHint={playButtonAccessibilityHint}
              accessibilityLabel={playButtonAccessibilityLabel}
              onPress={playerTogglePlay}>
              <View importantForAccessibility='no-hide-descendants' style={[playerStyles.playButton, playButtonAdjust]}>
                {playButtonIcon}
              </View>
            </PressableWithOpacity>
            {!liveItem && (
              <PressableWithOpacity
                accessibilityLabel={jumpForwardAccessibilityLabel}
                accessibilityRole='button'
                onPress={this._playerJumpForward}
                style={playerStyles.icon}>
                {this._renderPlayerControlIcon(PV.Images.JUMP_AHEAD, `${testIDPrefix}_step_forward`)}
                <View importantForAccessibility='no-hide-descendants' style={styles.skipTimeTextWrapper}>
                  <Text style={styles.skipTimeText}>{jumpForwardsTime}</Text>
                </View>
              </PressableWithOpacity>
            )}
            {!isVideo && !liveItem && (
              <PressableWithOpacity
                accessibilityLabel={nextButtonAccessibilityLabel}
                accessibilityRole='button'
                onLongPress={playerPlayNextFromQueue}
                onPress={playerPlayNextChapterOrQueueItem}
                disabled={noNextQueueItem}
                style={[playerStyles.icon, { flexDirection: 'row' }]}>
                {this._renderPlayerControlIcon(PV.Images.NEXT_TRACK, `${testIDPrefix}_skip_track`, noNextQueueItem)}
              </PressableWithOpacity>
            )}
          </View>
        </View>
        <View style={styles.playerControlsBottomRow}>
          <PressableWithOpacity
            accessibilityHint={translate('ARIA HINT - go to the sleep timer screen')}
            accessibilityLabel={translate('Sleep Timer')}
            accessibilityRole='button'
            hitSlop={hitSlop}
            onPress={this._navToStopWatchScreen}>
            <View style={styles.playerControlsBottomButton}>
              <Icon name='moon' size={20} solid testID={`${testIDPrefix}_sleep_timer`} />
            </View>
          </PressableWithOpacity>
          {!liveItem && !hidePlaybackSpeedButton && (
            <PressableWithOpacity
              accessibilityHint={translate('ARIA HINT - current playback speed')}
              accessibilityLabel={`${playbackRate}X`}
              accessibilityRole='button'
              hitSlop={hitSlop}
              onPress={this._adjustSpeed}>
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                style={[styles.playerControlsBottomButton, styles.playerControlsBottomRowText]}
                testID={`${testIDPrefix}_playback_rate`}>
                {`${playbackRate}X`}
              </Text>
            </PressableWithOpacity>
          )}
          {!!liveItem && <PlayerLiveButton />}
          <PressableWithOpacity
            accessibilityHint={translate('ARIA HINT - show more player screen options')}
            accessibilityLabel={translate('More player options')}
            accessibilityRole='button'
            hitSlop={hitSlop}
            onPress={this._showPlayerMoreActionSheet}>
            <View accessible={false} style={styles.playerControlsBottomButton}>
              <Icon name='ellipsis-h' size={24} testID={`${testIDPrefix}_more`} />
            </View>
          </PressableWithOpacity>
        </View>
        <PlayerMoreActionSheet
          handleDismiss={this._hidePlayerMoreActionSheet}
          navigation={navigation}
          showModal={showPlayerMoreActionSheet}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  playerControlsBottomButton: {
    alignItems: 'center',
    minHeight: 32,
    paddingVertical: 4,
    textAlign: 'center',
    minWidth: 54
  },
  playerControlsBottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: PV.Player.styles.bottomRow.height,
    justifyContent: 'space-evenly',
    marginHorizontal: 15,
    marginTop: 10
  },
  playerControlsBottomRowText: {
    fontSize: PV.Fonts.sizes.md,
    fontWeight: PV.Fonts.weights.bold
  },
  playerControlsMiddleRow: {
    marginTop: 2
  },
  playerControlsMiddleRowTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 2
  },
  progressWrapper: {
    marginTop: 5
  },
  skipButtonText: {
    fontSize: 12,
    width: '100%',
    position: 'absolute',
    bottom: -5,
    textAlign: 'center'
  },
  skipTimeTextWrapper: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center'
  },
  skipTimeText: {
    fontSize: 14
  },
  speed: {
    alignItems: 'center',
    paddingVertical: 4,
    width: 54
  },
  topRow: {
    minHeight: 52,
    paddingTop: 5
  },
  wrapper: {
    borderTopWidth: 1
  },
  iconContainer: {
    width: 45,
    height: 45
  },
  icon: {
    tintColor: PV.Colors.white,
    width: '100%',
    height: '100%'
  }
})
