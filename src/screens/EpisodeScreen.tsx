import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

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
