// import Slider from '@react-native-community/slider'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { Slider } from 'react-native-elements'
import React from 'reactn'
import { PV } from '../resources'
import { togglePlay } from '../services/player'
import { Icon, Text } from './'

type Props = {
  navigation: any
}

type State = {}

export class PlayerControls extends React.PureComponent<Props, State> {

  render() {
    const { globalTheme } = this.global

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
            onPress={togglePlay}
            style={styles.icon}>
            <Icon
              name='play-circle'
              size={48} />
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
          <TouchableOpacity
            onPress={() => console.log('speed press')}
            style={styles.icon}>
            <Text style={styles.bottomRowText}>1X</Text>
          </TouchableOpacity>
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
