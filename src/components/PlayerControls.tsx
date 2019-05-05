// import Slider from '@react-native-community/slider'
import { StyleSheet, View } from 'react-native'
import { Slider } from 'react-native-elements'
import React from 'reactn'
import { PV } from '../resources'
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
          <Icon
            name='step-backward'
            onPress={() => console.log('step-backward')}
            size={32}
            style={styles.icon} />
          <Icon
            name='undo-alt'
            onPress={() => console.log('jump back X seconds')}
            size={32}
            style={styles.icon} />
          <Icon
            name='play-circle'
            onPress={() => console.log('play')}
            size={52}
            style={styles.icon} />
          <Icon
            name='redo-alt'
            onPress={() => console.log('jump back X seconds')}
            size={32}
            style={styles.icon} />
          <Icon
            name='step-forward'
            onPress={() => console.log('step-backward')}
            size={32}
            style={styles.icon} />
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.bottomRowText}>1X</Text>
          <Icon
            brand={true}
            name='chromecast'
            onPress={() => console.log('jump back X seconds')}
            size={24}
            style={styles.icon} />
          <Icon
            name='infinity'
            onPress={() => console.log('step-backward')}
            size={24}
            style={styles.icon} />
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
    padding: 4
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
