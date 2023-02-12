import qs from 'qs'
import { StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import React from 'reactn'
import { NavDismissIcon, View } from '../components'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { v4vAlbyCheckConnectDeepLink, v4vAlbyGenerateOAuthUrl } from '../services/v4v/providers/alby'
import { v4vAlbyHandleConnect } from '../state/actions/v4v/providers/alby'

type Props = {
  navigation: any
}

type State = {
  url: string
}

const testIDPrefix = 'v4v_providers_alby_login_screen'

export class V4VProvidersAlbyLoginScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super()

    this.state = {
      url: ''
    }

    const options = this.navigationOptions(props)
    props.navigation.setOptions(options)
  }

  navigationOptions = ({ navigation }) => ({
    title: 'Alby',
    headerLeft: () => <NavDismissIcon handlePress={navigation.dismiss} testID={testIDPrefix} />
  })

  async componentDidMount() {
    const oauthUrl = await v4vAlbyGenerateOAuthUrl()
    this.setState({ url: oauthUrl })

    trackPageView('/value-for-value/providers/alby/login', 'Value for Value - Providers - Alby - Login')
  }

  _onShouldStartLoadWithRequest = (request: any) => {
    // This is mostly duplicated in PodcastsScreen deep links.
    const route = request.url.replace(/.*?:\/\//g, '')
    const splitPath = route.split('/')
    const domain = splitPath[0] ? splitPath[0] : ''
    const urlParams: { code?: string } = qs.parse(splitPath[splitPath.length - 1].split('?')[1])

    // NOTE: HandleConnect is in two places due to iOS webview issue.
    // https://github.com/react-native-webview/react-native-webview/issues/2681
    if (v4vAlbyCheckConnectDeepLink(domain) && urlParams?.code) {
      v4vAlbyHandleConnect(this.props.navigation, urlParams.code)
    } else {
      return true
    }

    return false
  }

  render() {
    const { url } = this.state

    return (
      <View style={styles.wrapper}>
        <WebView
          dataDetectorTypes='all'
          overScrollMode='never'
          originWhitelist={['https://*', `${PV.DeepLinks.prefix}*`]}
          onShouldStartLoadWithRequest={this._onShouldStartLoadWithRequest}
          removeClippedSubviews
          source={{ uri: url }}
          style={{ opacity: 0.99 }}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  }
})
