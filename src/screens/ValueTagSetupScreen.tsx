import { Alert, Keyboard, StyleSheet } from 'react-native'
import React from 'reactn'
import { SwitchWithText, Text, TextInput, TextRow, View } from '../components'
import { translate } from '../lib/i18n'
import { numberWithCommas } from '../lib/utility'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { removeLNPayWallet, toggleLNPayFeature, updateWalletInfo } from '../state/actions/lnpay'
import {
  MINIMUM_BOOST_PAYMENT,
  MINIMUM_STREAMING_PAYMENT,
  updateGlobalBoostAmount,
  updateGlobalStreamingAmount
} from '../state/actions/valueTag'
import { core } from '../styles'

type Props = {
  navigation: any
}

type State = {
  localBoostAmount: string
  localStreamingAmount: string
  walletSatsBalance?: number
  walletUserLabel: string
}

const testIDPrefix = 'value_tag_setup_screen'

export class ValueTagSetupScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    
    this.state = {
      localBoostAmount: '0',
      localStreamingAmount: '0',
      walletUserLabel: ''
    }
  }

  static navigationOptions = () => ({
    title: translate('Bitcoin Wallet')
  })

  componentDidMount() {
    const { boostAmount, streamingAmount } =
      this.global.session?.valueTagSettings?.lightningNetwork?.lnpay?.globalSettings || {}

    this.setState({
      localBoostAmount: boostAmount?.toString(),
      localStreamingAmount: streamingAmount?.toString()
    })

    updateWalletInfo()

    trackPageView('/bitcoin-wallet', 'Bitcoin Wallet')
  }

  _showLNPaySetup = async (toggle: boolean) => {
    if (toggle) {
      this.props.navigation.navigate(PV.RouteNames.LNPaySignupScreen)
    } else {
      await removeLNPayWallet()
      await toggleLNPayFeature(false)
      Alert.alert(translate('LNPay Wallet Removed'), translate('All LNPay data have been deleted from this device'))
    }
  }

  render() {
    const { localBoostAmount, localStreamingAmount } = this.state
    const { session } = this.global
    const { valueTagSettings } = session
    const { lightningNetwork } = valueTagSettings
    const { lnpayEnabled, walletSatsBalance, walletUserLabel } = lightningNetwork?.lnpay || {}

    const walletSatsBalanceText = numberWithCommas(walletSatsBalance) || 0

    return (
      <View
        style={styles.content}
        testID={`${testIDPrefix}_view`}>
        <View style={styles.itemWrapper}>
          <SwitchWithText
            onValueChange={this._showLNPaySetup}
            subText={lnpayEnabled ? '' : translate('Enable Lightning Pay switch description')}
            testID={`${testIDPrefix}_lnpay_mode`}
            text={translate(`Enable LNPay`)}
            value={lnpayEnabled}
            wrapperStyle={styles.switchWithTextWrapper}
          />
          {lnpayEnabled && (
            <View>
              <View style={styles.sectionWrapper}>
                <Text style={core.headerText}>{translate('LNPay Wallet')}</Text>
                <TextRow
                  label={`${translate('Balance')}: `}
                  testID={`${testIDPrefix}_balance`}
                  text={`${walletSatsBalanceText} ${translate('satoshis')}`} />
                <TextRow
                  label={`${translate('Name')}: `}
                  testID={`${testIDPrefix}_name`}
                  text={`${walletUserLabel ? walletUserLabel : '----'}`} />
              </View>
              <View style={styles.sectionWrapper}>
                <Text style={core.headerText}>{translate('LNPay Global Settings')}</Text>
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
              </View>
            </View>
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
    marginBottom: 0,
    width: '100%'
  },
  sectionWrapper: {
    marginBottom: 24
  },
  switchWithTextWrapper: {
    marginBottom: 28,
    marginTop: 8
  },
  text: {
    fontSize: PV.Fonts.sizes.xxl
  },
  textInputWrapper: {
    marginVertical: 0
  }
})
