// import Slider from '@react-native-community/slider'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Slider } from 'react-native-elements'
import React from 'reactn'
import { PV } from '../resources'
import { PVTrackPlayer, togglePlay } from '../services/player'
import { setPlaybackSpeed } from '../state/actions/player'
import { ActionSheet, ActivityIndicator, Icon, Text } from './'

type Props = {
  navigation: any
}

type State = {
  showSpeedActionSheet?: boolean
}

export class PlayerControls extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props)

    this.state = {
      showSpeedActionSheet: false
    }
  }

  _hideSpeedActionSheet = () => {
    this.setState({ showSpeedActionSheet: false })
  }

  _showSpeedActionSheet = () => {
    this.setState({ showSpeedActionSheet: true })
  }

  render() {
    const { showSpeedActionSheet } = this.state
    const { globalTheme, player } = this.global
    const { playbackState } = player

    return (
      <View style={[styles.wrapper, globalTheme.player]}>
        <View style={styles.topRow}>
          <Slider
            minimumValue={0}
            maximumValue={1} />
        </View>
        <View style={styles.middleRow}>
          <TouchableOpacity
            onPress={() => console.log('step backward')}
            style={styles.icon}>
            <Icon
              name='step-backward'
              size={32} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => console.log('jump back X seconds')}
            style={styles.icon}>
            <Icon
              name='undo-alt'
              size={32} />
          </TouchableOpacity>
          <TouchableOpacity
            onLongPress={this._showSpeedActionSheet}
            onPress={togglePlay}
            style={styles.icon}>
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
            onPress={() => console.log('jump back X seconds')}
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
          {/* brand icons are broke in react-native-vector-icons ~6.4.0  */}
          {/* <TouchableOpacity
            onPress={() => console.log('chromecast')}
            style={styles.icon}>
            <Icon
              brand={true}
              name='chromecast'
              size={24} />
          </TouchableOpacity> */}
          <TouchableOpacity
            onPress={() => console.log('chromecast')}
            style={styles.icon}>
            <Icon
              brand={true}
              name='volume-up'
              size={24} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => console.log('speed press')}
            style={styles.icon}>
            <Text style={styles.bottomRowText}>1X</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => console.log('continuous play')}
            style={styles.icon}>
            <Icon
              name='infinity'
              size={24} />
          </TouchableOpacity>
        </View>
        <ActionSheet
          globalTheme={globalTheme}
          handleCancelPress={this._hideSpeedActionSheet}
          items={speedItems(this._hideSpeedActionSheet)}
          showModal={showSpeedActionSheet} />
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
const _speedCustomKey = 'custom speed'

const speedItems = (handleDismiss: any) => [
  {
    key: _speedOneHalfKey,
    text: _speedOneHalfKey,
    onPress: async () => {
      handleDismiss()
      await setPlaybackSpeed(_speedOneHalfKey)
    }
  },
  {
    key: _speedThreeQuartersKey,
    text: _speedThreeQuartersKey,
    onPress: async () => {
      handleDismiss()
      await setPlaybackSpeed(_speedThreeQuartersKey)
    }
  },
  {
    key: _speedNormalKey,
    text: _speedNormalKey,
    onPress: async () => {
      handleDismiss()
      await setPlaybackSpeed(_speedNormalKey)
    }
  },
  {
    key: _speedOneAndAQuarterKey,
    text: _speedOneAndAQuarterKey,
    onPress: async () => {
      handleDismiss()
      await setPlaybackSpeed(_speedOneAndAQuarterKey)
    }
  },
  {
    key: _speedOneAndAHalfKey,
    text: _speedOneAndAHalfKey,
    onPress: async () => {
      handleDismiss()
      await setPlaybackSpeed(_speedOneAndAHalfKey)
    }
  },
  {
    key: _speedDoubleKey,
    text: _speedDoubleKey,
    onPress: async () => {
      handleDismiss()
      await setPlaybackSpeed(_speedDoubleKey)
    }
  },
  {
    key: _speedCustomKey,
    text: _speedCustomKey,
    onPress: async () => {
      handleDismiss()
      console.log('show custom speed input alert')
    }
  }
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
  middleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 60,
    justifyContent: 'space-around'
  },
  topRow: {
    height: 52,
    paddingTop: 5
  },
  wrapper: {
    borderTopWidth: 1
  }
})
