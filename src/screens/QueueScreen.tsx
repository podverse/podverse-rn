import React from 'react'
import { TouchableOpacity } from 'react-native'
import { Icon } from 'react-native-elements'
import { Text, View } from '../components'
import { PV } from '../resources'
import { core, navHeader } from '../styles'

type Props = {
  navigation?: any
}

type State = {}

export class QueueScreen extends React.Component<Props, State> {

  static navigationOptions = ({ navigation }) => ({
    title: 'Queue',
    headerLeft: (
      <TouchableOpacity
        onPress={navigation.dismiss}>
        <Icon
          color='#fff'
          iconStyle={styles.closeButton}
          name='angle-down'
          size={32}
          type='font-awesome'
          underlayColor={PV.Colors.brandColor} />
      </TouchableOpacity>
    ),
    headerRight: (
      <TouchableOpacity
        onPress={() => console.log('toggle edit mode')}>
        <Text style={navHeader.textButton}>Edit</Text>
      </TouchableOpacity>
    )
  })

  render() {
    return (
      <View style={core.view}>
        <Text>Queue</Text>
      </View>
    )
  }
}

const styles = {
  closeButton: {
    paddingLeft: 8,
    paddingRight: 16,
    paddingVertical: 8
  }
}
