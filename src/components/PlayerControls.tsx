import { StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React from 'reactn'
import { PV } from '../resources'
import { checkIfPlayingFromHistory } from '../services/history'
import { playerJumpBackward, playerJumpForward, PVTrackPlayer, setPlaybackPosition } from '../services/player'
import { playNextFromQueue, setPlaybackSpeed, togglePlay } from '../state/actions/player'
import { darkTheme, iconStyles, playerStyles } from '../styles'
import { Icon, PlayerProgressBar, Text } from './'
import { PlayerMoreActionSheet } from './PlayerMoreActionSheet'

type Props = {
  navigation: any
}

type State = {
  progressValue: number
  showPlayerMoreActionSheet: boolean
}

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
    const progressValue = await playerJumpBackward(PV.Player.jumpSeconds)
    this.setState({ progressValue })
  }

  _playerJumpForward = async () => {
    const progressValue = await playerJumpForward(PV.Player.jumpSeconds)
    this.setState({ progressValue })
  }

  _hidePlayerMoreActionSheet = async () => {
    this.setState({ showPlayerMoreActionSheet: false })
  }

  _showPlayerMoreActionSheet = async () => {
    this.setState({
      showPlayerMoreActionSheet: true
    })
  }

  _returnToBeginningOfTrack = async () => {
    await setPlaybackPosition(0)
  }

  render() {
    const { navigation } = this.props
    const { progressValue, showPlayerMoreActionSheet } = this.state
    const { globalTheme, player, screenPlayer } = this.global
    const { nowPlayingItem, playbackRate, playbackState } = player
    const { isLoading } = screenPlayer
    const hasErrored = playbackState === PV.Player.errorState

    return (
      <View style={[styles.wrapper, globalTheme.player]}>
        <View style={styles.progressWrapper}>
          <PlayerProgressBar
            {...(nowPlayingItem && nowPlayingItem.clipEndTime ? { clipEndTime: nowPlayingItem.clipEndTime } : {})}
            {...(nowPlayingItem && nowPlayingItem.clipStartTime ? { clipStartTime: nowPlayingItem.clipStartTime } : {})}
            globalTheme={globalTheme}
            isLoading={isLoading}
            value={progressValue}
          />
        </View>
        <View style={styles.middleRow}>
          <TouchableOpacity onPress={this._returnToBeginningOfTrack} style={playerStyles.icon}>
            <Icon name='step-backward' size={36} />
          </TouchableOpacity>
          <TouchableOpacity onPress={this._playerJumpBackward} style={playerStyles.icon}>
            <Icon name='undo-alt' size={36} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => togglePlay(this.global)} style={playerStyles.iconLarge}>
            {hasErrored && (
              <Icon
                color={globalTheme === darkTheme ? iconStyles.lightRed.color : iconStyles.darkRed.color}
                name={'exclamation-triangle'}
                size={34}
              />
            )}
            {!hasErrored && (
              <Icon name={playbackState === PVTrackPlayer.STATE_PLAYING ? 'pause-circle' : 'play-circle'} size={52} />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={this._playerJumpForward} style={playerStyles.icon}>
            <Icon name='redo-alt' size={36} />
          </TouchableOpacity>
          <TouchableOpacity onPress={playNextFromQueue} style={playerStyles.icon}>
            <Icon name='step-forward' size={36} />
          </TouchableOpacity>
        </View>
        <View style={styles.bottomRow}>
          <TouchableOpacity
            hitSlop={{
              bottom: 4,
              left: 4,
              right: 4,
              top: 4
            }}
            onPress={this._navToStopWatchScreen}>
            <View style={styles.bottomButton}>
              <Icon name='stopwatch' size={20} />
            </View>
          </TouchableOpacity>
          <TouchableWithoutFeedback
            hitSlop={{
              bottom: 4,
              left: 4,
              right: 4,
              top: 4
            }}
            onPress={this._adjustSpeed}>
            <Text fontSizeLargestScale={PV.Fonts.largeSizes.sm} style={[styles.bottomButton, styles.bottomRowText]}>
              {`${playbackRate}X`}
            </Text>
          </TouchableWithoutFeedback>
          <TouchableOpacity
            hitSlop={{
              bottom: 4,
              left: 4,
              right: 4,
              top: 4
            }}
            onPress={this._showPlayerMoreActionSheet}>
            <View style={styles.bottomButton}>
              <Icon name='ellipsis-h' size={24} />
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
  bottomButton: {
    alignItems: 'center',
    minHeight: 32,
    paddingVertical: 4,
    textAlign: 'center',
    minWidth: 54
  },
  bottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: PV.Player.styles.bottomRow.height,
    justifyContent: 'space-around'
  },
  bottomRowText: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  },
  middleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 60,
    justifyContent: 'space-around',
    marginBottom: 4,
    marginTop: 2
  },
  progressWrapper: {
    marginBottom: 8
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
  }
})
