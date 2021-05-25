import { Alert, Keyboard, StyleSheet } from 'react-native'
import React from 'reactn'
import { SwitchWithText, TextInput, View } from '../components'
import { translate } from '../lib/i18n'
import { testProps } from '../lib/utility'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { removeLNPayWallet, toggleLNPayFeature } from '../state/actions/lnpay'
import {
  MINIMUM_BOOST_PAYMENT,
  MINIMUM_STREAMING_PAYMENT,
  updateGlobalBoostAmount,
  updateGlobalStreamingAmount
} from '../state/actions/valueTag'

type Props = {
  navigation: any
}

type State = {
  localBoostAmount: string
  localStreamingAmount: string
}

const testIDPrefix = 'crypto_setup_screen'

export class CryptoSetupScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    
    this.state = {
      localBoostAmount: '0',
      localStreamingAmount: '0'
    }
  }

  static navigationOptions = () => ({
    title: translate('Crypto Setup')
  })

  componentDidMount() {
    const { boostAmount, streamingAmount } = this.global.session.valueTagSettings.lightningNetwork.globalSettings

    this.setState({
      localBoostAmount: boostAmount.toString(),
      localStreamingAmount: streamingAmount.toString()
    })

    trackPageView('/crypto-setup', 'Crypto Setup Screen')
  }

  _showLNPaySetup = async (toggle: boolean) => {
    if (toggle) {
      this.props.navigation.navigate(PV.RouteNames.LNPaySignupScreen)
    } else {
      await removeLNPayWallet()
      toggleLNPayFeature(false)
      Alert.alert(translate('LN Pay Wallet Removed'), translate('All LNPay data have been deleted from this device'))
    }
  }

  render() {
    const { localBoostAmount, localStreamingAmount } = this.state
    const { session } = this.global
    const { valueTagSettings } = session
    const { lightningNetwork } = valueTagSettings
    const { lnpayEnabled } = lightningNetwork

    return (
      <View style={styles.content} {...testProps(`${testIDPrefix}_view`)}>
            <View style={styles.itemWrapper}>
              <SwitchWithText
                onValueChange={this._showLNPaySetup}
                subText={translate('Enable Lightning Pay switch description')}
                testID={`${testIDPrefix}_lnpay_mode`}
                text={translate(`Enable LN Pay`)}
                value={lnpayEnabled}
              />
              {lnpayEnabled && (
                <TextInput
                  alwaysShowEyebrow
                  eyebrowTitle={translate('Boost Amount')}
                  keyboardType='numeric'
                  onBlur={() => {
                    const { localBoostAmount } = this.state
                    if (Number(localBoostAmount) && Number(localBoostAmount) > MINIMUM_BOOST_PAYMENT) {
                      updateGlobalBoostAmount(Number(localBoostAmount))
                    } else {
                      updateGlobalBoostAmount(MINIMUM_BOOST_PAYMENT)
                      this.setState({ localBoostAmount: MINIMUM_BOOST_PAYMENT.toString() })
                    }
                  }}
                  onSubmitEditing={() => Keyboard.dismiss()}
                  onChangeText={(newText: string) => {
                    this.setState({ localBoostAmount: newText })
                  }}
                  testID={`${testIDPrefix}_boost_amount_text_input`}
                  value={`${localBoostAmount}`}
                  wrapperStyle={styles.textInputWrapper}
                />
              )}
              {lnpayEnabled && (
                <TextInput
                  alwaysShowEyebrow
                  eyebrowTitle={translate('Streaming Amount')}
                  keyboardType='numeric'
                  onBlur={() => {
                    const { localStreamingAmount } = this.state
                    if (
                      Number(localStreamingAmount)
                      && Number(localStreamingAmount) > MINIMUM_STREAMING_PAYMENT) {
                      updateGlobalStreamingAmount(Number(localStreamingAmount))
                    } else {
                      updateGlobalStreamingAmount(MINIMUM_STREAMING_PAYMENT)
                      this.setState({ localStreamingAmount: MINIMUM_STREAMING_PAYMENT.toString() })
                    }
                  }}
                  onChangeText={(newText: string) => {
                    this.setState({ localStreamingAmount: newText })
                  }}
                  onSubmitEditing={() => Keyboard.dismiss()}
                  testID={`${testIDPrefix}_streaming_amount_text_input`}
                  value={`${localStreamingAmount}`}
                  wrapperStyle={styles.textInputWrapper}
                />
              )}
            </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    flex: 1,
    paddingTop:20,
    paddingHorizontal:15
  },
  itemWrapper: {
    marginBottom: 24
  },
  text: {
    fontSize: PV.Fonts.sizes.xxl
  },
  textInputWrapper: {
    marginVertical: 20
  }
})
