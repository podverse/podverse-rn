import { StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import React from 'reactn'
import { NavDismissIcon, View } from '../components'
import { trackPageView } from '../services/tracking'
import { v4vAlbyGenerateOAuthUrl } from '../services/v4v/providers/alby'

type Props = {
  navigation: any
}

type State = {
  url: string
}

const testIDPrefix = 'v4v_providers_alby_login_screen'

export class V4VProvidersAlbyLoginScreen extends React.Component<Props, State> {
  constructor(props) {
    super(props)

    this.state = {
      url: ''
    }
  }

  static navigationOptions = ({ navigation }) => ({
    title: 'Alby',
    headerLeft: () => <NavDismissIcon handlePress={navigation.dismiss} testID={testIDPrefix} />
  })

  async componentDidMount() {
    const oauthUrl = await v4vAlbyGenerateOAuthUrl()
    this.setState({ url: oauthUrl })

    trackPageView('/value-for-value/providers/alby/login', 'Value for Value - Providers - Alby - Login')
  }

  render() {
    const { url } = this.state

    return (
      <View style={styles.wrapper}>
        <WebView source={{ uri: url }} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  }
})
