import React from 'react'
import { StyleSheet } from 'react-native'
import { Text, View } from '../components'

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
