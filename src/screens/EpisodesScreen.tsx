import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { PV } from '../resources'
import { button, core } from '../styles'

type Props = {
  navigation?: any
}

type State = {}

export class EpisodesScreen extends React.Component<Props, State> {

  static navigationOptions = {
    title: 'Episodes'
  }

  render() {
    return (
      <View style={core.view}>
        <Text style={core.text}>Episodes</Text>
        <TouchableOpacity
          onPress={() => this.props.navigation.navigate(PV.RouteNames.EpisodeScreen)}
          style={button.primaryWrapper}>
          <Text style={button.primaryText}>Go to Episode</Text>
        </TouchableOpacity>
      </View>
    )
  }
}
