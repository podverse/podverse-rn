import { StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import React from 'reactn'
import { NavDismissIcon, View } from '../components'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { _v4v_env_ } from '../services/v4v/v4v'

type Props = {
  navigation: any
}

const testIDPrefix = 'v4v_providers_alby_login_screen'

export class V4VProvidersAlbyLoginScreen extends React.Component<Props> {
  constructor(props) {
    super(props)
  }

  static navigationOptions = ({ navigation }) => ({
    title: 'Alby',
    headerLeft: () => <NavDismissIcon handlePress={navigation.dismiss} testID={testIDPrefix} />
  })

  componentDidMount() {
    trackPageView('/value-for-value/providers/alby/login', 'Value for Value - Providers - Alby - Login')
  }

  render() {
    const uri = PV.V4V.providers.alby.env[_v4v_env_].oauthUrl

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
