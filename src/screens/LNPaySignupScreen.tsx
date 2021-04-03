import { Linking, StyleSheet } from 'react-native'
import React from 'reactn'
import { createWallet } from '../services/lnpay'
import { Button, Divider, ScrollView, Text, TextInput, View } from '../components'
import { translate } from '../lib/i18n'
import { testProps } from '../lib/utility'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { saveLNPayWallet, toggleLNPayFeature } from '../state/actions/lnpay'

type Props = any

type State = {
  apiKey: string
  walletName: string
}

export class LNPaySignupScreen extends React.Component<Props, State> {
  constructor() {
    super()
    this.state = {
      apiKey: '',
      walletName: ''
    }
  }

  static navigationOptions = () => ({
    title: translate('LNPay Signup')
  })

  componentDidMount() {
    trackPageView('/lnpaysignup', 'LN Pay Signup')
  }

  _attemptCreateWallet = async () => {
    if (this.state.apiKey) {
      const newWallet = await createWallet(this.state.apiKey, this.state.walletName)

      await saveLNPayWallet({
        id: newWallet.id,
        publicKey: this.state.apiKey,
        access_keys: newWallet.access_keys
      })
      await toggleLNPayFeature(true)
      this.props.navigation.goBack()
    }
  }

  render() {
    const instructions = [
      translate('LNPayDescriptionText1'),
      translate('LNPayDescriptionText2'),
      translate('LNPayDescriptionText3')
    ]

    return (
      <View style={styles.content} {...testProps('lnpay_signup_screen_view')}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.text}>
            {instructions[0]}
            <Text style={this.global.globalTheme.link} onPress={() => Linking.openURL(PV.LNPay.DeveloperDashboardUrl)}>
              {PV.LNPay.DeveloperDashboardUrl}
            </Text>
          </Text>
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.text}>
            {'\n'}
            {instructions[1]}
          </Text>
          <Divider style={styles.divider} />
          <TextInput
            testID='ln_public_api_button'
            value={this.state.apiKey}
            onChangeText={(newText: string) => this.setState({ apiKey: newText })}
            wrapperStyle={{ marginTop: 10 }}
            placeholder={translate('Public API Key')}
            eyebrowTitle={translate('Public API Key')}
          />
          <TextInput
            testID='create_wallet_name_input'
            value={this.state.walletName}
            onChangeText={(newText: string) => this.setState({ walletName: newText })}
            wrapperStyle={{ marginTop: 10 }}
            placeholder={translate('Wallet Name (Optional)')}
            eyebrowTitle={translate('Wallet Name (Optional)')}
          />
          <Button
            testID='create_wallet_button'
            disabled={!this.state.apiKey}
            text={translate('Create Wallet')}
            wrapperStyles={{ marginBottom: 20 }}
            onPress={this._attemptCreateWallet}
          />
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.text}>
            {translate(`Disclaimer:`)}
            {'\n\n'}
            {instructions[2]}
          </Text>
          <Divider style={styles.divider} />
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1
  },
  copyLeftSymbol: {
    flex: 0,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    marginLeft: 8,
    transform: [{ rotateY: '180deg' }]
  },
  copyLeftText: {
    flex: 0,
    fontSize: PV.Fonts.sizes.xl
  },
  copyLeftWrapper: {
    flexDirection: 'row',
    marginBottom: 15
  },
  divider: {
    marginVertical: 24
  },
  scrollViewContent: {
    padding: 15
  },
  sectionTitle: {
    marginBottom: 15,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  },
  text: {
    fontSize: PV.Fonts.sizes.md
  }
})
