import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { PV } from '../resources'

type Props = {
  navigation?: any
}

type State = {}

export class PodcastScreen extends React.Component<Props, State> {

  static navigationOptions = {
    title: 'Podcast'
  }

  render() {
    return (
      <View style={styles.view}>
        <Text>Podcast</Text>
        <TouchableOpacity
          onPress={() => this.props.navigation.navigate(PV.RouteNames.EpisodeScreen)}>
          <Text>Go to Episode</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
