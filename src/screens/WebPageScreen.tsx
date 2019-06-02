import { StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import React from 'reactn'
import { Icon, View } from '../components'
import { PV } from '../resources'
import { navHeader } from '../styles'

type Props = {
  navigation: any
}

type State = {
  uri: string
}

export class WebPageScreen extends React.Component<Props, State> {

  static navigationOptions = ({ navigation }) => (
    {
      title: '',
      headerLeft: () => (
        <Icon
          color='#fff'
          name='chevron-down'
          onPress={navigation.dismiss}
          size={PV.Icons.NAV}
          style={navHeader.buttonIcon} />
      )
    }
  )

  constructor(props) {
    super(props)

    this.state = {
      uri: this.props.navigation.getParam('uri')
    }
  }

  render() {
    const { uri } = this.state

    return (
      <View style={styles.wrapper}>
        <WebView source={{ uri }} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  }
})
