import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export class FindScreen extends React.Component {
  render() {
    return (
      <View style={styles.view}>
        <Text>Find</Text>
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
