import React from 'react'
import { Text, View } from '../components'
import { core } from '../styles'

type Props = {
  navigation?: any
}

type State = {}

export class ProfileScreen extends React.Component<Props, State> {

  static navigationOptions = {
    title: 'Profile'
  }

  render() {
    return (
      <View style={core.view}>
        <Text>Profile</Text>
      </View>
    )
  }
}
