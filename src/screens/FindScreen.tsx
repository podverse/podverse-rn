import React from 'react'
import { Text, View } from '../components'
import { core } from '../styles'

type Props = {
  navigation?: any
}

type State = {}

export class FindScreen extends React.Component<Props, State> {

  static navigationOptions = {
    title: 'Find'
  }

  render() {
    return (
      <View style={core.view}>
        <Text>Find</Text>
      </View>
    )
  }
}
