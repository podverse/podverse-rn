import React from 'react'
import { Text, View } from '../components'
import { core } from '../styles'

type Props = {
  navigation?: any
}

type State = {}

export class PlaylistsScreen extends React.Component<Props, State> {

  static navigationOptions = {
    title: 'Playlists'
  }

  render() {
    return (
      <View style={core.view}>
        <Text>Playlists</Text>
      </View>
    )
  }
}
