import React from 'react'
import { Text, View } from '../components'
import { core } from '../styles'

type Props = {
  navigation?: any
}

type State = {}

export class DownloadsScreen extends React.Component<Props, State> {

  static navigationOptions = {
    title: 'Downloads'
  }

  render() {

    return (
      <View style={core.view}>
        <Text>Downloads</Text>
      </View>
    )
  }
}
