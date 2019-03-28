import React from 'react'
import { Text, View } from '../components'
import { core } from '../styles'

type Props = {
  navigation?: any
}

type State = {}

export class ClipsScreen extends React.Component<Props, State> {

  static navigationOptions = {
    title: 'Clips'
  }

  render() {
    return (
      <View style={core.view}>
        <Text>Clips</Text>
      </View>
    )
  }
}
