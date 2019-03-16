import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

type Props = {}

type State = {}

export class ClipsListScreen extends React.Component<Props, State> {
  render() {
    return (
      <View style={styles.view}>
        <Text>Clips List</Text>
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
