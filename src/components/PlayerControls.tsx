import debounce from 'lodash/debounce'
import { StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View, Image, ImageSourcePropType } from 'react-native'
import { State as RNTPState } from 'react-native-track-player'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import {
  checkIfStateIsBuffering,
  playerJumpBackward,
  playerJumpForward,
  setPlaybackPosition
} from '../services/player'
import { playNextFromQueue, setPlaybackSpeed, togglePlay } from '../state/actions/player'
import { loadChapterPlaybackInfo } from '../state/actions/playerChapters'
import { darkTheme, iconStyles, playerStyles } from '../styles'
import { PlayerMoreActionSheet } from './PlayerMoreActionSheet'
import { ActivityIndicator, Icon, PlayerProgressBar, Text, View as PVView } from './'

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

    await setPlaybackSpeed(newSpeed, this.global)
  }

  _navToStopWatchScreen = () => {
    const { navigation } = this.props
    navigation.navigate(PV.RouteNames.SleepTimerScreen)
  }

  _playerJumpBackward = async () => {
    const progressValue = await playerJumpBackward(PV.Player.jumpBackSeconds)
    this.setState({ progressValue })
    debouncedPlayerJumpBackward()
  }

  _playerJumpForward = async () => {
    const progressValue = await playerJumpForward(PV.Player.jumpSeconds)
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

  _returnToBeginningOfTrack = async () => {
    await setPlaybackPosition(0)
  }

  _renderPlayerControlIcon = (source: ImageSourcePropType, testID?: string) => {
    return (
      <PVView style={styles.iconContainer} transparent testID={testID}>
        <Image source={source} resizeMode='contain' style={styles.icon} />
      </PVView>
    )
  }

  render() {
    const { navigation } = this.props
    const { progressValue, showPlayerMoreActionSheet } = this.state
    const { globalTheme, player, screenPlayer } = this.global
    const { backupDuration, currentChapter, currentChapters, playbackRate, playbackState } = player
    const { isLoading } = screenPlayer
    const hasErrored = playbackState === PV.Player.errorState
    const hitSlop = {
      bottom: 8,
      left: 8,
      right: 8,
      top: 8
    }

    // nowPlayingItem will be undefined when loading from a deep link
    let { nowPlayingItem } = player
    nowPlayingItem = nowPlayingItem || {}

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
    } else if (playbackState === RNTPState.Playing) {
      playButtonIcon = <Icon name='pause' size={20} testID={`${testIDPrefix}_pause_button`} />
      playButtonAdjust = {}
      playButtonAccessibilityHint = translate('ARIA HINT - pause playback')
      playButtonAccessibilityLabel = translate('Pause')
    } else if (checkIfStateIsBuffering(playbackState)) {
      playButtonIcon = <ActivityIndicator testID={testIDPrefix} />
      playButtonAdjust = { paddingLeft: 2, paddingTop: 2 }
      playButtonAccessibilityHint = ''
      playButtonAccessibilityLabel = translate('Episode is loading')
    }

    let { clipEndTime, clipStartTime } = nowPlayingItem
    let hideClipIndicator = false
    if (!clipStartTime && currentChapter?.startTime) {
      clipStartTime = currentChapter?.startTime
      clipEndTime = currentChapter?.endTime
      if (currentChapters?.length <= 1) {
        hideClipIndicator = true
      }
    }

    const jumpBackAccessibilityLabel =
      `${translate(`Jump back`)} ${PV.Player.jumpBackSeconds} ${translate('seconds')}`
    const jumpForwardAccessibilityLabel =
      `${translate(`Jump forward`)} ${PV.Player.jumpSeconds} ${translate('seconds')}`

    return (
      <View style={[styles.wrapper, globalTheme.player]}>
        <View style={styles.progressWrapper}>
          <PlayerProgressBar
            backupDuration={backupDuration}
            clipEndTime={clipEndTime}
            clipStartTime={clipStartTime}
            globalTheme={globalTheme}
            hideClipIndicator={hideClipIndicator}
            isLoading={isLoading}
            value={progressValue}
          />
        </View>
        <View style={styles.playerControlsMiddleRow}>
          <View style={styles.playerControlsMiddleRowTop}>
            <TouchableOpacity
              accessibilityLabel={translate('Return to beginning of episode')}
              accessibilityRole='button'
              onPress={this._returnToBeginningOfTrack}
              style={[playerStyles.icon, { flexDirection: 'row' }]}>
              {this._renderPlayerControlIcon(PV.Images.PREV_TRACK, `${testIDPrefix}_previous_track`)}
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel={jumpBackAccessibilityLabel}
              accessibilityRole='button'
              onPress={this._playerJumpBackward}
              style={playerStyles.icon}>
              {this._renderPlayerControlIcon(PV.Images.JUMP_BACKWARDS, `${testIDPrefix}_jump_backward`)}
              <View style={styles.skipTimeTextWrapper}>
                <Text style={styles.skipTimeText}>{PV.Player.jumpBackSeconds}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityHint={playButtonAccessibilityHint}
              accessibilityLabel={playButtonAccessibilityLabel}
              onPress={togglePlay}>
              <View style={[playerStyles.playButton, playButtonAdjust]}>
                {playButtonIcon}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel={jumpForwardAccessibilityLabel}
              accessibilityRole='button'
              onPress={this._playerJumpForward}
              style={playerStyles.icon}>
              {this._renderPlayerControlIcon(PV.Images.JUMP_AHEAD, `${testIDPrefix}_step_forward`)}
              <View style={styles.skipTimeTextWrapper}>
                <Text style={styles.skipTimeText}>{PV.Player.jumpSeconds}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel={translate('Skip to next item in your queue')}
              accessibilityRole='button'
              onPress={playNextFromQueue}
              style={[playerStyles.icon, { flexDirection: 'row' }]}>
              {this._renderPlayerControlIcon(PV.Images.NEXT_TRACK, `${testIDPrefix}_skip_track`)}
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.playerControlsBottomRow}>
          <TouchableOpacity
            accessibilityHint={translate('ARIA HINT - go to the sleep timer screen')}
            accessibilityLabel={translate('Sleep Timer')}
            accessibilityRole='button'
            hitSlop={hitSlop}
            onPress={this._navToStopWatchScreen}>
            <View style={styles.playerControlsBottomButton}>
              <Icon name='moon' size={20} solid testID={`${testIDPrefix}_sleep_timer`} />
            </View>
          </TouchableOpacity>
          <TouchableWithoutFeedback
            accessibilityHint={translate('ARIA HINT - This is the current playback speed')}
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
          </TouchableWithoutFeedback>
          <TouchableOpacity
            accessibilityHint={translate('ARIA HINT - show more player screen options')}
            accessibilityLabel={translate('More player options')}
            accessibilityRole='button'
            hitSlop={hitSlop}
            onPress={this._showPlayerMoreActionSheet}>
            <View accessible={false} style={styles.playerControlsBottomButton}>
              <Icon name='ellipsis-h' size={24} testID={`${testIDPrefix}_more`} />
            </View>
          </TouchableOpacity>
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
