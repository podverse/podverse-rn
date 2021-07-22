import { StyleSheet, View as RNView } from 'react-native'
import React from 'reactn'
import { Button, HTMLScrollView, SafeAreaView, Text, View } from '../components'
import { translate } from '../lib/i18n'
import { testProps } from '../lib/utility'
import { PV } from '../resources'
import PVEventEmitter from '../services/eventEmitter'
import { trackPageView } from '../services/tracking'
import { setTrackingEnabled } from '../state/actions/tracking'

type Props = {
  navigation?: any
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

export class TrackingConsentScreen extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
  }

  static navigationOptions = () => {
    return {
      title: null,
      headerLeft: null,
      headerRight: () => <RNView />
    }
  }

  componentDidMount() {
    trackPageView('/tracking-consent-screen', 'Tracking Consent Screen')
  }

  _enableTracking = async () => {
    const { navigation } = this.props
    navigation.dismiss()
    await setTrackingEnabled(true)
    PVEventEmitter.emit(PV.Events.TRACKING_TERMS_ACKNOWLEDGED)
  }

  _disableTracking = async () => {
    const { navigation } = this.props
    navigation.dismiss()
    await setTrackingEnabled(false)
    PVEventEmitter.emit(PV.Events.TRACKING_TERMS_ACKNOWLEDGED)
  }

  render() {
    return (
      <SafeAreaView {...testProps(`${testIDPrefix}_view`)}>
        <View style={styles.view}>
          <Text
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            style={styles.header}>
            {translate('Enable Tracking')}
          </Text>
          <HTMLScrollView
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            html={trackingTermsAndConditions}
            style={styles.scrollView}
          />
          <Button
            onPress={this._enableTracking}
            testID={`${testIDPrefix}_yes_enable_tracking`}
            text={translate('Yes enable tracking')}
            wrapperStyles={styles.button}
          />
          <Button
            isTransparent
            onPress={this._disableTracking}
            testID={`${testIDPrefix}_no_thanks`}
            text={translate('No thanks')}
            wrapperStyles={styles.button}
          />
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
