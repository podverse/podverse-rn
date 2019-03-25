import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export class SettingsScreen extends React.Component {

  static navigationOptions = {
    title: 'Settings'
  }

  render() {
    return (
      <View style={styles.view}>
        <Text>Settings</Text>
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
