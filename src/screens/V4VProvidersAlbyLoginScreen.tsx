import { StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import React from 'reactn'
import { View } from '../components'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { _v4v_env_ } from '../services/v4v'

type Props = {
  navigation: any
}

export class V4VProvidersAlbyLoginScreen extends React.Component<Props> {
  constructor(props) {
    super(props)
  }

  static navigationOptions = () => ({
    title: 'Alby'
  })

  componentDidMount() {
    trackPageView('/value-for-value/providers/alby/login', 'Value for Value - Providers - Alby - Login')
  }

  render() {
    const uri = PV.V4V.providers.alby.api[_v4v_env_].oauthUrl

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
