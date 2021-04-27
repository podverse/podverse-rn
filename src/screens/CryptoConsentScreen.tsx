import { StyleSheet } from 'react-native'
import React from 'reactn'
import { Button, Text, View } from '../components'
import { translate } from '../lib/i18n'
import { testProps } from '../lib/utility'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'

type Props = any

const testIDPrefix = 'crypto_consent_screen'

export class CryptoConsentScreen extends React.Component<Props> {
  
  static navigationOptions = ({ navigation }) => {

    return {
      headerRight: null,
      title: null
    }
  }

  componentDidMount() {
    trackPageView('/crypto-consent', 'Crypto Consent Screen')
  }

  _acceptAgreement() {
    this.props.navigation.navigate(PV.RouteNames.CryptoSetupScreen)
  }

  _declineAgreement() {
    this.props.navigation.dismiss()
  }

  render() {
    return (
      <View style={styles.content} {...testProps(`${testIDPrefix}_view`)}>
        <Text
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          style={styles.text}>
          {'Crypto Consent Screen'}
        </Text>
        <Button
          onPress={() => this._acceptAgreement()}
          testID={`${testIDPrefix}_next`}
          text={translate('I Accept')}
          wrapperStyles={styles.nextButton} />
        <Button
          onPress={() => this._declineAgreement()}
          testID={`${testIDPrefix}_next`}
          text={translate('Cancel')}
          wrapperStyles={styles.cancelButton} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    fontSize: PV.Fonts.sizes.xxl
  },
  nextButton: {
    alignItems: 'center',
    alignSelf: 'center',
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

