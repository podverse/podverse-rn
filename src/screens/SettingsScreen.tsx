/* eslint-disable max-len */
import AsyncStorage from '@react-native-community/async-storage'
import { StyleSheet } from 'react-native'
import Config from 'react-native-config'
import React from 'reactn'
import {
  Divider,
  ScrollView,
  SwitchWithText,
  TableCell,
  Text,
  View
} from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { setOfflineModeEnabled } from '../state/actions/settings'
import { core, table } from '../styles'

type Props = {
  navigation: any
}

type State = {
  offlineModeEnabled: any
  showDeleteDownloadedEpisodesDialog?: boolean
}

const testIDPrefix = 'settings_screen'

export class SettingsScreen extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    const { offlineModeEnabled } = this.global

    this.state = {
      offlineModeEnabled
    }
  }

  static navigationOptions = () => ({
    title: translate('Settings')
  })

  async componentDidMount() {
    const offlineModeEnabled = await AsyncStorage.getItem(PV.Keys.OFFLINE_MODE_ENABLED)
    this.setState({ offlineModeEnabled })
    trackPageView('/settings', 'Settings Screen')
  }

  _handleToggleOfflineMode = () => {
    const { offlineModeEnabled } = this.state
    this.setState({ offlineModeEnabled: !offlineModeEnabled }, () => {
      setOfflineModeEnabled(!offlineModeEnabled)
    })
    this.setGlobal({ offlineModeEnabled: !offlineModeEnabled })
  }

  render() {
    const { navigation } = this.props
    const { offlineModeEnabled } = this.state
    const {
      globalTheme,
      session
    } = this.global
    const { isLoggedIn } = session

    return (
      <ScrollView
        contentContainerStyle={styles.scrollViewContentContainer}
        style={styles.wrapper}
        testID={`${testIDPrefix}_view`}>
        <View>
          <View style={core.itemWrapper}>
            <SwitchWithText
              accessibilityHint={translate('Offline mode can save battery life and improve performance')}
              accessibilityLabel={translate('Offline Mode')}
              onValueChange={this._handleToggleOfflineMode}
              subText={translate('Offline mode can save battery life and improve performance')}
              testID={`${testIDPrefix}_offline_mode`}
              text={translate('Offline Mode')}
              value={!!offlineModeEnabled}
            />
          </View>
          <Divider />
          <TableCell
            accessibilityLabel={translate('Tracking')}
            includeDivider
            onPress={() => navigation.navigate(PV.RouteNames.SettingsScreenTracking)}
            testIDPrefix={`${testIDPrefix}_tracking`}
            testIDSuffix=''>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              style={[table.cellText, globalTheme.tableCellTextPrimary]}>
              {translate('Tracking')}
            </Text>
          </TableCell>
          <TableCell
            accessibilityLabel={translate('Player')}
            includeDivider
            onPress={() => navigation.navigate(PV.RouteNames.SettingsScreenPlayer)}
            testIDPrefix={`${testIDPrefix}_player`}
            testIDSuffix=''>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              style={[table.cellText, globalTheme.tableCellTextPrimary]}>
              {translate('Player')}
            </Text>
          </TableCell>
          <TableCell
            accessibilityLabel={translate('Downloads / History')}
            includeDivider
            onPress={() => navigation.navigate(PV.RouteNames.SettingsScreenDownloadsHistory)}
            testIDPrefix={`${testIDPrefix}_downloads_history`}
            testIDSuffix=''>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              style={[table.cellText, globalTheme.tableCellTextPrimary]}>
              {translate('Downloads / History')}
            </Text>
          </TableCell>
          <TableCell
            accessibilityLabel={translate('Design')}
            includeDivider
            onPress={() => navigation.navigate(PV.RouteNames.SettingsScreenDesign)}
            testIDPrefix={`${testIDPrefix}_design`}
            testIDSuffix=''>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              style={[table.cellText, globalTheme.tableCellTextPrimary]}>
              {translate('Design')}
            </Text>
          </TableCell>
          {isLoggedIn && (
            <TableCell
              accessibilityLabel={translate('Account')}
              includeDivider
              onPress={() => navigation.navigate(PV.RouteNames.SettingsScreenAccount)}
              testIDPrefix={`${testIDPrefix}_account`}
              testIDSuffix=''>
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.md}
                style={[table.cellText, globalTheme.tableCellTextPrimary]}>
                {translate('Account')}
              </Text>
            </TableCell>
          )}
          {!Config.DISABLE_CUSTOM_DOMAINS && (
            <TableCell
              accessibilityLabel={translate('Advanced')}
              includeDivider
              onPress={() => navigation.navigate(PV.RouteNames.SettingsScreenAdvanced)}
              testIDPrefix={`${testIDPrefix}_advanced`}
              testIDSuffix=''>
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.md}
                style={[table.cellText, globalTheme.tableCellTextPrimary]}>
                {translate('Advanced')}
              </Text>
            </TableCell>
          )}
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  activityIndicator: {
    paddingTop: 40
  },
  scrollViewContentContainer: {
    paddingBottom: 48
  },
  textInputWrapper: {
    marginVertical: 20
  },
  wrapper: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 12
  }
})
