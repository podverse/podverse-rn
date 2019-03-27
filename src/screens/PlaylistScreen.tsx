import React from 'reactn'
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
    const { globalTheme } = this.global

    return (
      <View style={core.view}>
        <Text style={globalTheme.text}>Playlist</Text>
      </View>
    )
  }
}
