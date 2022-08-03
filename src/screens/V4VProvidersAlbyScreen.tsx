import { Alert, Linking, StyleSheet } from 'react-native'
import React from 'reactn'
import { Button, SafeAreaView, ScrollView, Text } from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { _v4v_env_ } from '../services/v4v'

type Props = {
  navigation: any
}

const testIDPrefix = 'v4v_providers_alby_screen'

export class V4VProvidersAlbyScreen extends React.Component<Props> {
  constructor(props) {
    super(props)
  }

  static navigationOptions = ({ navigation }) => ({
    title: 'Alby'
  })

  componentDidMount() {
    trackPageView('/value-for-value/providers/alby', 'Value for Value - Providers - Alby')
  }

  _handleAboutPress = () => {
    Alert.alert(PV.Alerts.LEAVING_APP.title, PV.Alerts.LEAVING_APP.message, [
      { text: translate('Cancel') },
      { text: translate('Yes'), onPress: () => Linking.openURL(PV.V4V.providers.alby.api[_v4v_env_].aboutUrl) }
    ])
  }

  _connectWallet = () => {
    const { navigation } = this.props
    navigation.navigate(PV.RouteNames.V4VProvidersAlbyLoginScreen)
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
            onPress={this._connectWallet}
            testID={`${testIDPrefix}_connect_wallet`}
            text={translate('Connect Wallet')}
            wrapperStyles={styles.connectButton}
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
  title: {
    fontSize: PV.Fonts.sizes.xxl,
    fontWeight: PV.Fonts.weights.bold,
    textAlign: 'center',
    marginBottom: 20
  },
  attentionText: {
    fontWeight: PV.Fonts.weights.bold,
    color: PV.Colors.blueLighter
  },
  text: {
    fontSize: PV.Fonts.sizes.xl,
    marginTop: 10
  },
  connectButton: {
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 36,
    paddingVertical: 15,
    paddingHorizontal: 30,
    width: '90%'
  },
  cancelButton: {
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    width: '90%'
  }
})

