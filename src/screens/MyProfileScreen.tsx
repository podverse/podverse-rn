import React from 'react'
import { Text, View } from '../components'
import { core } from '../styles'

type Props = {
  navigation?: any
}

type State = {}

export class MyProfileScreen extends React.Component<Props, State> {

  static navigationOptions = {
    title: 'MyProfile'
  }

  render() {
    return (
      <View style={core.view}>
        <Text>MyProfile</Text>
      </View>
    )
  }
}
