import React from 'react'
import { StyleSheet } from 'react-native'
import { Text, View } from '../components'

export class EpisodeScreen extends React.Component {

  static navigationOptions = {
    title: 'Episode'
  }

  render() {
    return (
      <View style={styles.view}>
        <Text>Episode</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
