import { Alert, Linking, StyleSheet, View as RNView } from 'react-native'
import React from 'reactn'
import packageJson from '../../package.json'
import { Divider, ScrollView, TableSectionSelectors, Text, View } from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'

type Props = any

export class TermsOfServiceScreen extends React.Component<Props> {
  static navigationOptions = () => ({
    title: translate('Terms of Service')
  })

  componentDidMount() {
    trackPageView('/terms', 'Terms of Service Screen')
  }

  showLeavingAppAlert = (url: string) => {
    Alert.alert(PV.Alerts.LEAVING_APP.title, PV.Alerts.LEAVING_APP.message, [
      { text: 'Cancel' },
      { text: 'Yes', onPress: () => Linking.openURL(url) }
    ])
  }

  render() {
    return (
      <View
        style={styles.content}
        testID='terms_of_service_screen_view'>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <TableSectionSelectors
            disableFilter
            selectedFilterLabel={translate('License')} />
          <RNView style={styles.copyLeftWrapper}>
            <Text
              onPress={() => this.showLeavingAppAlert('https://www.gnu.org/licenses/agpl-3.0.en.html')}
              style={styles.copyLeftText}>
              {translate('All brandName software is provided free and open source under the AGPLv3 license')}
            </Text>
          </RNView>
          <RNView style={styles.copyLeftWrapper}>
            <Text
              onPress={() => this.showLeavingAppAlert('https://www.gnu.org/licenses/agpl-3.0.en.html')}
              style={styles.copyLeftText}>
              copyleft
            </Text>
            <Text
              accessible={false}
              onPress={() => this.showLeavingAppAlert('https://www.gnu.org/licenses/agpl-3.0.en.html')}
              style={styles.copyLeftSymbol}>
              &copy;
            </Text>
          </RNView>
          <Divider style={styles.divider} />
          <TableSectionSelectors
            disableFilter
            selectedFilterLabel={translate('Terms of Service')} />
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.text}>
            {translate('TermsOfServiceScreenText1')}
            {'\n\n'}
            {translate('TermsOfServiceScreenText2')}
            {'\n\n'}
            {translate('TermsOfServiceScreenText3')}
            {'\n\n'}
            {translate('TermsOfServiceScreenText4')}
            {'\n\n'}
            {translate('TermsOfServiceScreenText5')}
            {'\n\n'}
            {translate('TermsOfServiceScreenText6')}
            {'\n\n'}
            {translate('TermsOfServicesScreenText7')}
          </Text>
          <Divider style={styles.divider} />
          <TableSectionSelectors
            disableFilter
            selectedFilterLabel={translate('Popularity Analytics')} />
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.text}>
            {translate('TermsOfServiceScreenMatomoTrackingText1')}
            {'\n\n'}
            {translate('TermsOfServiceScreenMatomoTrackingText2')}
            {'\n\n'}
            {translate('TermsOfServiceScreenMatomoTrackingText3')}
            {'\n\n'}
            {translate('TermsOfServiceScreenMatomoTrackingText4')}
            {'\n\n'}
            {translate('TermsOfServiceScreenMatomoTrackingText5')}
          </Text>
          <Divider style={styles.divider} />
          <TableSectionSelectors
            disableFilter
            selectedFilterLabel={translate('Third Party Libraries')} />
          {Object.keys(packageJson.dependencies).map((license) => (
            <Text key={license} style={styles.text}>
              {license}
            </Text>
          ))}
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
