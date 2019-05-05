// import Slider from '@react-native-community/slider'
import { ActivityIndicator, Image, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import { Slider } from 'react-native-elements'
import React from 'reactn'
import { Icon } from './'

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
      </View>
    )
  }

}

const styles = StyleSheet.create({
  bottomRow: {
    height: 40
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
