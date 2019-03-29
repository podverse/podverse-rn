import React from 'react'
import { Text, View } from '../components'
import { core } from '../styles'

type Props = {
  navigation?: any
}

type State = {}

export class EpisodeScreen extends React.Component<Props, State> {

  static navigationOptions = {
    title: 'Episode'
  }

  render() {
    return (
      <View style={core.view}>
        <Text>Episode</Text>
      </View>
    )
  }
}
