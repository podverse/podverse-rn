import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

type Props = {}

type State = {}

export class ClipsScreen extends React.Component<Props, State> {
  render() {
    return (
      <View style={styles.view}>
        <Text>Clips</Text>
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
