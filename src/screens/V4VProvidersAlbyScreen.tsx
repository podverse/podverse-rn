import { Alert, Linking, StyleSheet } from 'react-native'
import React from 'reactn'
import { Button, SafeAreaView, ScrollView, Text } from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import PVEventEmitter from '../services/eventEmitter'
import { trackPageView } from '../services/tracking'
import { _v4v_env_ } from '../services/v4v/v4v'
import { v4vAlbyGetAccountSummary } from '../services/v4v/providers/alby'

type Props = {
  navigation: any
}

type State = {
  isLoading: boolean
  isLoadingWaitForEvent: boolean
}

const testIDPrefix = 'v4v_providers_alby_screen'

export class V4VProvidersAlbyScreen extends React.Component<Props, State> {
  constructor(props) {
    super(props)

    const isLoadingWaitForEvent = !!this.props.navigation.getParam('isLoadingWaitForEvent')
    
    this.state = {
      isLoading: true,
      isLoadingWaitForEvent
    }
  }

  static navigationOptions = () => ({
    title: 'Alby'
  })

  async componentDidMount() {
    PVEventEmitter.on(PV.Events.V4V_PROVIDERS_ALBY_CONNECTED, this._handleConnectedEvent)

    try {
      // const res = await v4vAlbyGetAccountSummary()
      // console.log('V4VProvidersAlbyScreen res', res)
    } catch (error) {
      console.log('componentDidMount', error)
    }

    this.setState({ isLoading: false })

    trackPageView('/value-for-value/providers/alby', 'Value for Value - Providers - Alby')
  }

  componentWillUnmount() {
    PVEventEmitter.removeListener(PV.Events.V4V_PROVIDERS_ALBY_CONNECTED, this._handleConnectedEvent)
  }

  _handleConnectedEvent = () => {
    this.setState({ isLoading: false, isLoadingWaitForEvent: false })
  }

  _handleAboutPress = () => {
    Alert.alert(PV.Alerts.LEAVING_APP.title, PV.Alerts.LEAVING_APP.message, [
      { text: translate('Cancel') },
      { text: translate('Yes'), onPress: () => Linking.openURL(PV.V4V.providers.alby.env[_v4v_env_].aboutUrl) }
    ])
  }

  _handleConnectWalletPress = () => {
    this.props.navigation.navigate(PV.RouteNames.V4VProvidersAlbyLoginScreen)
    // Alert.alert(PV.Alerts.LEAVING_APP.title, PV.Alerts.LEAVING_APP.message, [
    //   { text: translate('Cancel') },
    //   { text: translate('Yes'), onPress: () => Linking.openURL(PV.V4V.providers.alby.env[_v4v_env_].oauthUrl) }
    // ])
  }

  _handleDisconnectWalletPress = () => {
    console.log('disconnect wallet')
  }
  
  render() {
    const { fontScaleMode } = this.global

    const switchOptionTextStyle =
      PV.Fonts.fontScale.largest === fontScaleMode
        ? [styles.switchOptionText, { fontSize: PV.Fonts.largeSizes.sm }]
        : [styles.switchOptionText]

    return (
      <SafeAreaView style={styles.content} testID={`${testIDPrefix}_view`.prependTestId()}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollviewContent}>
          <Button
            onPress={this._handleConnectWalletPress}
            testID={`${testIDPrefix}_connect_wallet`}
            text={translate('Connect Wallet')}
            wrapperStyles={styles.button}
          />
          <Button
            onPress={this._handleDisconnectWalletPress}
            testID={`${testIDPrefix}_disconnect_wallet`}
            text={translate('Disconnect Wallet')}
            wrapperStyles={styles.button}
          />
          <Text
            accessible
            accessibilityLabel={translate('About')}
            accessibilityRole='button'
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            key={`${testIDPrefix}_about_button`}
            onPress={this._handleAboutPress}
            style={[switchOptionTextStyle, { width: '100%' }]}
            testID={`${testIDPrefix}_about_button`}>
            {translate('About')}
          </Text>
        </ScrollView>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  attentionText: {
    fontWeight: PV.Fonts.weights.bold,
    color: PV.Colors.blueLighter
  },
  button: {
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 36,
    paddingVertical: 15,
    paddingHorizontal: 30,
    width: '90%'
  },
  content: {
    flex: 1,
    backgroundColor: PV.Colors.ink
  },
  scrollView: {
    flex: 1
  },
  scrollviewContent: {
    paddingHorizontal: 20
  },
  switchOptionText: {
    color: PV.Colors.skyLight,
    fontSize: PV.Fonts.sizes.xxl,
    fontWeight: PV.Fonts.weights.bold,
    padding: 16,
    textAlign: 'center',
    textDecorationLine: 'underline'
  },
  text: {
    fontSize: PV.Fonts.sizes.xl,
    marginTop: 10
  },
  title: {
    fontSize: PV.Fonts.sizes.xxl,
    fontWeight: PV.Fonts.weights.bold,
    textAlign: 'center',
    marginBottom: 20
  }
})

