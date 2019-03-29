import { StyleSheet, View } from 'react-native'
import React from 'reactn'

export class Player extends React.PureComponent {
  render () {
    const { globalTheme } = this.global
    return <View style={[styles.player, globalTheme.player]}/>
  }
}

const styles = StyleSheet.create({
  player: {
    borderBottomWidth: 1,
    borderTopWidth: 1,
    height: 50,
    width: '100%'
  }
})
