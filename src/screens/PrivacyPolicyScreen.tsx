import { Alert, Linking, StyleSheet } from 'react-native'
import React from 'reactn'
import { HTMLScrollView, View } from '../components'
import { translate } from '../lib/i18n'
import { testProps } from '../lib/utility'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'

type Props = {}

type State = {}

export class PrivacyPolicyScreen extends React.Component<Props, State> {
  static navigationOptions = () => {
    return {
      title: translate('Privacy Policy')
    }
  }

  componentDidMount() {
    trackPageView('/privacy-policy', 'Privacy Policy Screen')
  }

  showLeavingAppAlert = (url: string) => {
    Alert.alert(PV.Alerts.LEAVING_APP.title, PV.Alerts.LEAVING_APP.message, [
      { text: 'Cancel' },
      { text: 'Yes', onPress: () => Linking.openURL(url) }
    ])
  }

  render() {
    return (
      <View style={styles.content} {...testProps('privacy_policy_screen_view')}>
        <HTMLScrollView fontSizeLargestScale={PV.Fonts.largeSizes.md} html={PV.HTML.privacyPolicy} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1
  }
})
