import React from 'react'
import { Text, View } from '../components'
import { core } from '../styles'

type Props = {
  navigation?: any
}

type State = {}

export class PlaylistScreen extends React.Component<Props, State> {

  static navigationOptions = {
    title: 'Playlist'
  }

  render() {
    return (
      <View style={core.view}>
        <Text>Playlist</Text>
      </View>
    )
  }
}
