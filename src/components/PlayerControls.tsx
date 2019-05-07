import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'reactn'
import { PV } from '../resources'
import { playerJumpBackward, playerJumpForward, PVTrackPlayer, togglePlay } from '../services/player'
import { setPlaybackSpeed } from '../state/actions/player'
import { ActivityIndicator, Icon, PlayerProgressBar, Text } from './'

type Props = {
  navigation: any
}

type State = {
  progressValue: number
}

export class PlayerControls extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props)

    this.state = {
      progressValue: 0
    }
  }

  _adjustSpeed = async () => {
    const { playbackRate } = this.global.player
    const index = speeds.indexOf(playbackRate)
    let newSpeed
    if (speeds.length - 1 === index) {
      newSpeed = speeds[0]
    } else {
      newSpeed = speeds[index + 1]
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

  render() {
    const { progressValue } = this.state
    const { globalTheme, player } = this.global
    const { playbackRate, playbackState } = player

    return (
      <View style={[styles.wrapper, globalTheme.player]}>
        <PlayerProgressBar value={progressValue} />
        <View style={styles.middleRow}>
          <TouchableOpacity
            onPress={() => console.log('step backward')}
            style={styles.icon}>
            <Icon
              name='step-backward'
              size={32} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this._playerJumpBackward}
            style={styles.icon}>
            <Icon
              name='undo-alt'
              size={32} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={togglePlay}
            style={styles.iconLarge}>
            {
              playbackState !== PVTrackPlayer.STATE_BUFFERING &&
                <Icon
                  name={playbackState === PVTrackPlayer.STATE_PLAYING ? 'pause-circle' : 'play-circle'}
                  size={48} />
            }
            {
              playbackState === PVTrackPlayer.STATE_BUFFERING &&
                <ActivityIndicator />
            }
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this._playerJumpForward}
            style={styles.icon}>
            <Icon
              name='redo-alt'
              size={32} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => console.log('step-forward')}
            style={styles.icon}>
            <Icon
              name='step-forward'
              size={32} />
          </TouchableOpacity>
        </View>
        <View style={styles.bottomRow}>
          <TouchableOpacity
            onPress={this._adjustSpeed}
            style={styles.speed}>
            <Text style={styles.bottomRowText}>{`${playbackRate}X`}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => console.log('continuous play')}
            style={styles.icon}>
            <Icon
              name='infinity'
              size={24} />
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

const _speedOneHalfKey = 0.5
const _speedThreeQuartersKey = 0.75
const _speedNormalKey = 1.0
const _speedOneAndAQuarterKey = 1.25
const _speedOneAndAHalfKey = 1.5
const _speedDoubleKey = 2

const speeds = [
  _speedOneHalfKey,
  _speedThreeQuartersKey,
  _speedNormalKey,
  _speedOneAndAQuarterKey,
  _speedOneAndAHalfKey,
  _speedDoubleKey
]

const styles = StyleSheet.create({
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
  icon: {
    paddingHorizontal: 12,
    paddingVertical: 4
  },
  iconLarge: {
    minWidth: 74,
    paddingHorizontal: 12,
    paddingVertical: 4
  },
  middleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 60,
    justifyContent: 'space-around'
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
