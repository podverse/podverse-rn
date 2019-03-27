import { TouchableOpacity } from 'react-native'
import React from 'reactn'
import { Text, View } from '../components'
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
    const { globalTheme } = this.global

    return (
      <View style={core.view}>
        <Text style={globalTheme.text}>Episodes</Text>
        <TouchableOpacity
          onPress={() => this.props.navigation.navigate(PV.RouteNames.EpisodeScreen)}
          style={[button.primaryWrapper, globalTheme.buttonPrimaryWrapper]}>
          <Text style={globalTheme.buttonPrimaryText}>Go to Episode</Text>
        </TouchableOpacity>
      </View>
    )
  }
}
