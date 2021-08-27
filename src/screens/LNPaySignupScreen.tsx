import { Linking, StyleSheet, Alert, Keyboard } from 'react-native'
import React from 'reactn'
import { createWallet, getWallet } from '../services/lnpay'
import { Button, Divider,  Text, TextInput, View, ScrollView } from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { LNWallet, saveLNPayWallet, toggleLNPayFeature, updateWalletInfo } from '../state/actions/lnpay'

type Props = any

type State = {
  apiKey: string
  isAddingWallet: boolean
  isKeyboardShowing: boolean
  walletName: string
  walletKey: string
  walletId: string
}

export class LNPaySignupScreen extends React.Component<Props, State> {
  scrollViewRef: typeof ScrollView | null = null

  constructor() {
    super()
    this.state = {
      apiKey: '',
      isAddingWallet: false,
      isKeyboardShowing: false,
      walletName: '',
      walletKey: '',
      walletId: ''
    }
  }

  static navigationOptions = () => ({
    title: translate('LNPay Signup').toUpperCase()
  })

  componentDidMount() {
    trackPageView('/lnpaysignup', 'LNPay Signup')
    Keyboard.addListener("keyboardDidShow", () => {
      this.setState({isKeyboardShowing: true})
    })
    Keyboard.addListener("keyboardDidHide", () => {
      this.setState({isKeyboardShowing: false})
    })
  }

  componentWillUnmount() {
    Keyboard.removeListener("keyboardDidShow", () => {
      this.setState({isKeyboardShowing: true})
    })
    Keyboard.removeListener("keyboardDidHide", () => {
      this.setState({isKeyboardShowing: false})
    })
  }

  _attemptCreateWallet = async () => {
    this.setState({ isAddingWallet: true })
    try {
      let newWallet = null
      if (this.state.apiKey) {
        if (this.state.walletId) {
          const potentialWallet: LNWallet = {
            id: this.state.walletId,
            publicKey: this.state.apiKey,
            access_keys: {
              'Wallet Admin': [this.state.walletKey]
            }
          }
          const existingWallet = await getWallet(potentialWallet)
          if (existingWallet) {
            newWallet = existingWallet
          }
        } else {
          newWallet = await createWallet(this.state.apiKey, this.state.walletName.trim())
        }

        if (newWallet) {
          await saveLNPayWallet({
            id: newWallet.id,
            publicKey: this.state.apiKey,
            access_keys: newWallet.access_keys
          })

          await toggleLNPayFeature(true)
          await updateWalletInfo()
          this.props.navigation.goBack()
        } else {
          throw new Error(
            'Wallet could not be saved locally. Please make sure the information you entered is correct and try again.'
          )
        }
      }
    } catch (err) {
      Alert.alert('LNPay Error', err.message)
    }
    this.setState({ isAddingWallet: false })
  }


  render() {
    const { isAddingWallet } = this.state

    const instructions = [
      translate('LNPayDescriptionText1'),
      translate('LNPayDescriptionText2'),
      translate('LNPayDescriptionText3')
    ]

    const extraPadding = this.state.isKeyboardShowing ? {paddingBottom: 180} : {}
    return (
      <View
        style={styles.content}
        testID='lnpay_signup_screen_view'>
          <ScrollView 
            contentContainerStyle={[styles.scrollViewContent, extraPadding]} 
            scrollViewRef={(ref) => this.scrollViewRef = ref}
          >
            <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.text}>
              {instructions[0]}
              <Text
                onPress={() => Linking.openURL(PV.URLs.lnpay.DeveloperDashboardUrl)}
                style={this.global.globalTheme.link}>
                {PV.URLs.lnpay.LoginUrl}
              </Text>
            </Text>
            <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.text}>
              {'\n'}
              {instructions[1]}
              <Text
                onPress={() => Linking.openURL(PV.URLs.lnpay.DeveloperDashboardUrl)}
                style={this.global.globalTheme.link}>
                {PV.URLs.lnpay.DeveloperDashboardUrl}
              </Text>
            </Text>
            <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.text}>
              {'\n'}
              {instructions[2]}
            </Text>
            <Divider style={styles.divider} />
            <TextInput
              testID='ln_public_api_button'
              value={this.state.apiKey}
              onChangeText={(newText: string) => this.setState({ apiKey: newText.trim() })}
              wrapperStyle={{ marginTop: 0 }}
              placeholder={translate('Public API Key')}
              eyebrowTitle={translate('Public API Key')}
              autoCorrect={false}
              onFocus={() => {
                setTimeout(() => {
                  this.scrollViewRef && this.scrollViewRef.scrollToEnd({ animated: true })
                }, 600)
              }}
            />
            {!this.state.walletId && (
              <TextInput
                testID='create_wallet_name_input'
                value={this.state.walletName}
                onChangeText={(newText: string) => this.setState({ walletName: newText })}
                wrapperStyle={{ marginTop: 10 }}
                placeholder={translate('Wallet Name (Optional)')}
                eyebrowTitle={translate('Wallet Name (Optional)')}
                autoCorrect={false}
                onFocus={() => {
                  setTimeout(() => {
                    this.scrollViewRef && this.scrollViewRef.scrollToEnd({ animated: true })
                  }, 600)
                }}
              />
            )}
            <Divider style={styles.divider} />
            <TextInput
              testID='import_wallet_id_input'
              value={this.state.walletId}
              onChangeText={(newText: string) => this.setState({ walletId: newText.trim() })}
              wrapperStyle={{ marginTop: 0 }}
              placeholder={translate('Wallet ID (For An Existing Wallet)')}
              eyebrowTitle={'Wallet Id'}
              autoCorrect={false}
              onFocus={() => {
                setTimeout(() => {
                  this.scrollViewRef && this.scrollViewRef.scrollToEnd({ animated: true })
                }, 600)
              }}
            />
            {!!this.state.walletId && (
              <TextInput
                testID='import_wallet_key_input'
                value={this.state.walletKey}
                onChangeText={(newText: string) => this.setState({ walletKey: newText.trim() })}
                wrapperStyle={{ marginTop: 10 }}
                placeholder={translate('Wallet Admin Key')}
                eyebrowTitle={translate('Wallet Admin Key')}
                onFocus={() => {
                  setTimeout(() => {
                    this.scrollViewRef && this.scrollViewRef.scrollToEnd({ animated: true })
                  }, 600)
                }}
              />
            )}
            <Button
              disabled={!this.state.apiKey || (!!this.state.walletId && !this.state.walletKey)}
              isLoading={isAddingWallet}
              onPress={this._attemptCreateWallet}
              testID='create_wallet_button'
              text={translate('Add Wallet')}
              wrapperStyles={{ marginBottom: 52 }}
            />
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
    marginVertical: 20
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
