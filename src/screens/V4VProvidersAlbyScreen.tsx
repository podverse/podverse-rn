import { StyleSheet } from 'react-native'
import React from 'reactn'
import {
  ActivityIndicator,
  Divider,
  SafeAreaView,
  ScrollView,
  V4VWalletAbout,
  V4VWalletConnectButtons,
  V4VWalletInfo,
  V4VWalletSettings
} from '../components'
import { PV } from '../resources'
import { _albyKey } from '../resources/V4V'
import PVEventEmitter from '../services/eventEmitter'
import { trackPageView } from '../services/tracking'
import { v4vGetConnectedProvider } from '../state/actions/v4v/v4v'
import {
  v4vAlbyGetAccountInfo
} from '../state/actions/v4v/providers/alby'

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

  componentDidMount() {
    const { isLoadingWaitForEvent } = this.state

    PVEventEmitter.on(PV.Events.V4V_PROVIDERS_ALBY_CONNECTED, this._handleConnectedEvent)

    if (!isLoadingWaitForEvent) {
      this._handleInitialize()
    }

    trackPageView('/value-for-value/providers/alby', 'Value for Value - Providers - Alby')
  }

  componentWillUnmount() {
    PVEventEmitter.removeListener(PV.Events.V4V_PROVIDERS_ALBY_CONNECTED, this._handleConnectedEvent)
  }

  _handleInitialize = async () => {
    const callback = () => this.setState({ isLoading: false, isLoadingWaitForEvent: false })
    try {
      await v4vAlbyGetAccountInfo(callback)
    } catch (error) {
      console.log('_handleInitialize error', error)
      callback()
    }
  }

  _handleConnectedEvent = () => {
    this._handleInitialize()
  }

  _disconnectWalletCallback = () => {
    this.setState({ isLoading: false, isLoadingWaitForEvent: false })
  }
  
  render() {
    const { navigation } = this.props
    const { isLoading, isLoadingWaitForEvent } = this.state
    const { session } = this.global
    const { connected } = session.v4v.providers
    const provider = v4vGetConnectedProvider(connected, _albyKey)

    const isConnected = !!provider

    return (
      <SafeAreaView style={styles.content} testID={`${testIDPrefix}_view`.prependTestId()}>
        {!isLoading && !isLoadingWaitForEvent && (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollviewContent}>
            <>
              {provider && (
                <>
                  <V4VWalletInfo navigation={navigation} provider={provider} />
                  <Divider style={styles.dividerWithMargin} />
                  <V4VWalletSettings navigation={navigation} provider={provider} testID={testIDPrefix} />
                  <Divider />
                </>
              )}
              <V4VWalletConnectButtons
                disconnectCallback={this._disconnectWalletCallback}
                isConnected={isConnected}
                loginRouteName={PV.RouteNames.V4VProvidersAlbyLoginScreen}
                navigation={navigation}
                testID={testIDPrefix}
                v4vKey={_albyKey}
              />
              <V4VWalletAbout testID={testIDPrefix} v4vKey={_albyKey} />
            </>
          </ScrollView>
        )}
        {(isLoading || isLoadingWaitForEvent) && <ActivityIndicator fillSpace />}
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  attentionText: {
    fontWeight: PV.Fonts.weights.bold,
    color: PV.Colors.blueLighter
  },
  content: {
    flex: 1,
    backgroundColor: PV.Colors.ink
  },
  dividerWithMargin: {
    marginBottom: 36
  },
  scrollView: {
    flex: 1,
  },
  scrollviewContent: {
    paddingHorizontal: 20,
    paddingBottom: 36
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

