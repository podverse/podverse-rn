import { TouchableOpacity } from 'react-native'
import React from 'reactn'
import { Text, View } from '../components'
import { PV } from '../resources'
import { button, core } from '../styles'

type Props = {
  navigation?: any
}

type State = {}

export class PodcastScreen extends React.Component<Props, State> {

  static navigationOptions = {
    title: 'Podcast'
  }

  render() {
    const { globalTheme } = this.global

    return (
      <View style={core.view}>
        <Text>Podcast</Text>
        <TouchableOpacity
          onPress={() => this.props.navigation.navigate(PV.RouteNames.EpisodeScreen)}
          style={[button.primaryWrapper, globalTheme.buttonPrimaryWrapper]}>
          <Text style={globalTheme.buttonPrimaryText}>Go to Episode</Text>
        </TouchableOpacity>
      </View>
    )
  }
}
