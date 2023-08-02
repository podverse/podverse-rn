import AsyncStorage from '@react-native-community/async-storage'
import { StyleSheet, SafeAreaView, ScrollView } from 'react-native'
import { CheckBox } from 'react-native-elements'
import React from 'reactn'
import { Button, Text } from '../components'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'

type Props = any
type State = {
  checkboxSelected: boolean
}

const testIDPrefix = 'value_tag_consent_screen'

export class V4VConsentScreen extends React.Component<Props, State> {
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
    trackPageView('/value-for-value-consent', 'Value for Value - Consent Screen')
  }

  _handleSourceCodePress = () => {
    PV.Alerts.LEAVING_APP_ALERT(PV.URLs.appRepo)
  }

  _acceptAgreement = async () => {
    await AsyncStorage.setItem(PV.Keys.USER_CONSENT_VALUE_TAG_TERMS, 'true')
    this.props.navigation.navigate(PV.RouteNames.V4VProvidersScreen)
  }

  _declineAgreement() {
    this.props.navigation.dismiss()
  }

  render() {
    const { fontScaleMode } = this.global

    const switchOptionTextStyle =
      PV.Fonts.fontScale.largest === fontScaleMode
        ? [styles.switchOptionText, { fontSize: PV.Fonts.largeSizes.sm }]
        : [styles.switchOptionText]

    return (
      <SafeAreaView style={styles.content} testID={`${testIDPrefix}_view`.prependTestId()}>
        <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.title}>
          {'Terms and Conditions'}
        </Text>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollviewContent}>
          <Text style={styles.text}>
            {// eslint-disable-next-line max-len
            `This is an experimental feature, we are not responsible for lost, misdirected, or stolen funds, and you assume all responsibility for the risks associated with using this feature.`}
          </Text>
          <Text
            accessible
            accessibilityLabel={'Source Code'}
            accessibilityRole='button'
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            key={`${testIDPrefix}_source_code_button`}
            onPress={this._handleSourceCodePress}
            style={[switchOptionTextStyle, { width: '100%' }]}
            testID={`${testIDPrefix}_source_code_button`}>
            {'Source Code'}
          </Text>
        </ScrollView>
        <CheckBox
          checked={this.state.checkboxSelected}
          containerStyle={{ backgroundColor: PV.Colors.ink, borderWidth: 0 }}
          onPress={() => {
            this.setState({ checkboxSelected: !this.state.checkboxSelected })
          }}
          size={50}
          testID={`${testIDPrefix}_accept_check_box`.prependTestId()}
          title={`I have read and agree to the terms and conditions.`}
          textStyle={{ color: PV.Colors.white, fontSize: PV.Fonts.sizes.lg }}
        />
        <Button
          onPress={() => this._acceptAgreement()}
          disabled={!this.state.checkboxSelected}
          testID={`${testIDPrefix}_next`}
          text={'I Accept'}
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
  switchOptionText: {
    color: PV.Colors.skyLight,
    fontSize: PV.Fonts.sizes.xl,
    marginTop: 32,
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
