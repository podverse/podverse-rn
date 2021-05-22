import AsyncStorage from '@react-native-community/async-storage'
import { StyleSheet, SafeAreaView, ScrollView } from 'react-native'
import { CheckBox } from 'react-native-elements'
import React from 'reactn'
import { Button, Text } from '../components'
import { translate } from '../lib/i18n'
import { testProps } from '../lib/utility'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'

type Props = any
type State = {
  checkboxSelected: boolean
}

const testIDPrefix = 'crypto_consent_screen'

export class CryptoConsentScreen extends React.Component<Props, State> {
  constructor() {
    super()
    this.state = {
      checkboxSelected: false
    }
  }

  static navigationOptions = ({}) => {
    return {
      headerRight: null,
      title: null
    }
  }

  componentDidMount() {
    trackPageView('/crypto-consent', 'Crypto Consent Screen')
  }

  _acceptAgreement = async () => {
    await AsyncStorage.setItem(PV.Keys.USER_CONSENT_CRYPTO_TERMS, "true")
    this.props.navigation.navigate(PV.RouteNames.CryptoSetupScreen)
  }

  _declineAgreement() {
    this.props.navigation.dismiss()
  }

  render() {
    return (
      <SafeAreaView style={styles.content} {...testProps(`${testIDPrefix}_view`)}>
        <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.title}>
        {translate("crypto_consent_title")}
        </Text>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollviewContent}>
          <Text style={[styles.text, styles.attentionText]}>
          {translate("crypto_consent_text_1")}
          </Text>
          <Text style={styles.text}>
          {translate("crypto_consent_text_2")}
          </Text>
          <Text style={styles.text}>
          {translate("crypto_consent_text_3")}
          </Text>
          <Text style={styles.text}>
          {translate("crypto_consent_text_4")}
          </Text>
        </ScrollView>
        <CheckBox
          size={50}
          checked={this.state.checkboxSelected}
          onPress={() => {
            this.setState({ checkboxSelected: !this.state.checkboxSelected })
          }}
          title={translate("crypto_consent_checkbox_text")}
          containerStyle={{ backgroundColor: PV.Colors.ink, borderWidth: 0 }}
          textStyle={{ color: PV.Colors.white, fontSize: PV.Fonts.sizes.lg }}
        />
        <Button
          onPress={() => this._acceptAgreement()}
          disabled={!this.state.checkboxSelected}
          testID={`${testIDPrefix}_next`}
          text={translate('I Accept')}
          wrapperStyles={styles.nextButton}
        />
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
  nextButton: {
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginBottom: 20,
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
