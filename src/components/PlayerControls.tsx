import { StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React from 'reactn'
import { PV } from '../resources'
import { playerJumpBackward, playerJumpForward, PVTrackPlayer } from '../services/player'
import { loadLastFromHistory, loadNextFromQueue, setContinousPlaybackMode, setPlaybackSpeed, togglePlay
  } from '../state/actions/player'
import { playerStyles } from '../styles'
import { ActivityIndicator, Icon, PlayerProgressBar, Text } from './'

type Props = {
  navigation: any
}

type State = {
  progressValue: number
  shouldContinuouslyPlay: boolean
}

export class PlayerControls extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props)

    this.state = {
      progressValue: 0,
      shouldContinuouslyPlay: this.global.player.shouldContinuouslyPlay
    }
  }

  _adjustSpeed = async () => {
    const { playbackRate } = this.global.player
    const index = PV.Player.speeds.indexOf(playbackRate)

    let newSpeed
    if (PV.Player.speeds.length - 1 === index) {
      newSpeed = PV.Player.speeds[0]
    } else {
      newSpeed = PV.Player.speeds[index + 1]
    }

    await setPlaybackSpeed(newSpeed, this.global)
  }

  _playerJumpBackward = async () => {
    const progressValue = await playerJumpBackward(PV.Player.jumpSeconds)
    this.setState({ progressValue })
  }

  _playerJumpForward = async () => {
    const progressValue = await playerJumpForward(PV.Player.jumpSeconds)
    this.setState({ progressValue })
  }

  _toggleContinuousPlaybackMode = async () => {
    const shouldContinuouslyPlay = await setContinousPlaybackMode(
      !this.global.player.shouldContinuouslyPlay, this.global
    )
    this.setState({ shouldContinuouslyPlay })
  }

  render() {
    const { progressValue } = this.state
    const { globalTheme, player, screenPlayer, session } = this.global
    const { nowPlayingItem, playbackRate, playbackState, shouldContinuouslyPlay } = player
    const { isLoading } = screenPlayer
    const { historyItems = [], queueItems = [] } = session.userInfo
    const hasHistoryItem = historyItems.length > 0
    const hasQueueItem = queueItems.length > 0

    return (
      <View style={[styles.wrapper, globalTheme.player]}>
        <View style={styles.progressWrapper}>
          <PlayerProgressBar
            {...(nowPlayingItem && nowPlayingItem.clipEndTime ? { clipEndTime: nowPlayingItem.clipEndTime } : {})}
            {...(nowPlayingItem && nowPlayingItem.clipStartTime ? { clipStartTime: nowPlayingItem.clipStartTime } : {})}
            globalTheme={globalTheme}
            isLoading={isLoading}
            value={progressValue} />
        </View>
        <View style={styles.middleRow}>
          <TouchableOpacity
            disabled={!hasHistoryItem}
            onPress={() => loadLastFromHistory()}
            style={hasHistoryItem ? playerStyles.icon : playerStyles.iconDisabled}>
            <Icon
              name='step-backward'
              size={32} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this._playerJumpBackward}
            style={playerStyles.icon}>
            <Icon
              name='undo-alt'
              size={32} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => togglePlay(this.global)}
            style={playerStyles.iconLarge}>
            {
              (!isLoading && playbackState !== PVTrackPlayer.STATE_BUFFERING) &&
                <Icon
                  name={playbackState === PVTrackPlayer.STATE_PLAYING ? 'pause-circle' : 'play-circle'}
                  size={48} />
            }
            {
              (isLoading || playbackState === PVTrackPlayer.STATE_BUFFERING) &&
                <ActivityIndicator />
            }
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this._playerJumpForward}
            style={playerStyles.icon}>
            <Icon
              name='redo-alt'
              size={32} />
          </TouchableOpacity>
          <TouchableOpacity
            disabled={!hasQueueItem}
            onPress={async () => {
              const playbackState = await PVTrackPlayer.getState()
              const shouldPlay = playbackState === PVTrackPlayer.STATE_PLAYING
              loadNextFromQueue(shouldPlay)
            }}
            style={hasQueueItem ? playerStyles.icon : playerStyles.iconDisabled}>
            <Icon
              name='step-forward'
              size={32} />
          </TouchableOpacity>
        </View>
        <View style={styles.bottomRow}>
          <TouchableWithoutFeedback onPress={this._adjustSpeed}>
            <Text style={[styles.bottomButton, styles.bottomRowText]}>{`${playbackRate}X`}</Text>
          </TouchableWithoutFeedback>
          <Icon
            name='infinity'
            onPress={this._toggleContinuousPlaybackMode}
            size={24}
            style={[styles.bottomButton, shouldContinuouslyPlay ? globalTheme.buttonActive : {}]} />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  bottomButton: {
    paddingVertical: 4,
    textAlign: 'center',
    width: 54
  },
  bottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 48,
    justifyContent: 'space-around'
  },
  bottomRowText: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  },
  middleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 60,
    justifyContent: 'space-around'
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
    height: 52,
    paddingTop: 5
  },
  wrapper: {
    borderTopWidth: 1
  }
})
