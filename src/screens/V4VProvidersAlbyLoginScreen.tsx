import { StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import React from 'reactn'
import { NavDismissIcon, View } from '../components'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'

type Props = {
  navigation: any
}

export class V4VProvidersAlbyLoginScreen extends React.Component<Props> {
  constructor(props) {
    super(props)
  }

  static navigationOptions = ({ navigation }) => ({
    title: 'Alby',
    headerLeft: () => <NavDismissIcon handlePress={navigation.dismiss} />
  })

  componentDidMount() {
    trackPageView('/value-for-value/providers/alby/login', 'Value for Value - Providers - Alby - Login')
  }

  render() {
    const uri = PV.V4V.providerInfo.alby.dev.oauthUrl

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
