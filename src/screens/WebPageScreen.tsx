import { StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import React from 'reactn'
import { NavDismissIcon, View } from '../components'

type Props = {
  navigation: any
}

type State = {
  uri: string
}

export class WebPageScreen extends React.Component<Props, State> {
  static navigationOptions = ({ navigation }) => {
    return {
      title: '',
      headerLeft: () => <NavDismissIcon handlePress={navigation.dismiss} />
    }
  }

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
