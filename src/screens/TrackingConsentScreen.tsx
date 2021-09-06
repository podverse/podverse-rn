import { Linking, Platform, StyleSheet, View as RNView } from 'react-native'
import { getTrackingStatus } from 'react-native-tracking-transparency'
import React from 'reactn'
import { Button, HTMLScrollView, SafeAreaView, Text, View } from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import PVEventEmitter from '../services/eventEmitter'
import { trackPageView } from '../services/tracking'
import { setTrackingEnabled } from '../state/actions/tracking'

type Props = {
  iOSIsInitialPrompt?: boolean
  navigation?: any
}

type State = {
  iOSAlreadyDetermined: boolean
}

const testIDPrefix = 'tracking_consent_screen'

const trackingTermsAndConditions =
`
<h6>
${translate('trackingTermsText1')}
</h6>
<h6>
${translate('trackingTermsText2')}
</h6>
<h6>
${translate('trackingTermsText3')}
</h6>
<h6>
${translate('trackingTermsText4')}
</h6>
<h6>
${translate('trackingTermsText5')}
</h6>
`

export class TrackingConsentScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      iOSAlreadyDetermined: false
    }
  }

  static navigationOptions = () => {
    return {
      title: null,
      headerLeft: null,
      headerRight: () => <RNView />
    }
  }

  async componentDidMount() {
    if (Platform.OS === 'ios') {
      const trackingStatus = await getTrackingStatus()
      if (trackingStatus !== 'not-determined') {
        this.setState({ iOSAlreadyDetermined: true })
      }
    }
    trackPageView('/tracking-consent-screen', 'Tracking Consent Screen')
  }

  _enableTracking = async () => {
    if (Platform.OS === 'ios') {
      const trackingStatus = await getTrackingStatus()
      if (trackingStatus === 'not-determined') {
        await setTrackingEnabled()
      }
    } else {
      await setTrackingEnabled(true)
    }

    const { navigation } = this.props
    navigation.dismiss()
    PVEventEmitter.emit(PV.Keys.TRACKING_TERMS_ACKNOWLEDGED)
  }

  _disableTracking = async () => {    
    if (Platform.OS !== 'ios') {
      await setTrackingEnabled(false)
    }

    const { navigation } = this.props
    navigation.dismiss()
    PVEventEmitter.emit(PV.Keys.TRACKING_TERMS_ACKNOWLEDGED)
  }

  _goToSettings = () => {
    Linking.openSettings()
  }

  _handleDismiss = () => {
    const { navigation } = this.props
    navigation.dismiss()
  }

  render() {
    const { iOSAlreadyDetermined } = this.state

    let topButtonText = ''
    const isIOSInitialPrompt = Platform.OS === 'ios' && !iOSAlreadyDetermined
    if (iOSAlreadyDetermined) {
      topButtonText = translate('Go to Settings')
    } else if (Platform.OS === 'ios') {
      topButtonText = translate('Next')
    } else {
      topButtonText = translate('Yes enable tracking')
    }

    return (
      <SafeAreaView testID={`${testIDPrefix}_view`}>
        <View style={styles.view}>
          <View accessible style={{ flex: 1 }}>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              style={styles.header}>
              {translate('Analytics Tracking')}
            </Text>
            <HTMLScrollView
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              html={trackingTermsAndConditions}
              style={styles.scrollView}
            />
          </View>
          <Button
            accessible
            accessibilityLabel={topButtonText}
            onPress={iOSAlreadyDetermined ? this._goToSettings : this._enableTracking}
            testID={`${testIDPrefix}_top_button`}
            text={topButtonText}
            wrapperStyles={styles.button}
          />
          {
            !isIOSInitialPrompt && (
              <Button
                accessible
                accessibilityLabel={iOSAlreadyDetermined ? translate('Back') : translate('No thanks')}
                isTransparent
                onPress={iOSAlreadyDetermined ? this._handleDismiss : this._disableTracking}
                testID={`${testIDPrefix}_bottom_button`}
                text={iOSAlreadyDetermined ? translate('Back') : translate('No thanks')}
                wrapperStyles={styles.button}
              />
            )
          }
        </View>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  button: {
    marginVertical: 16,
    borderRadius: 8
  },
  header: {
    fontSize: PV.Fonts.sizes.xxxl,
    fontWeight: PV.Fonts.weights.bold,
    textAlign: 'center'
  },
  scrollView: {
    paddingVertical: 16
  },
  view: {
    flex: 1,
    marginBottom: 32,
    marginHorizontal: 16
  }
})
