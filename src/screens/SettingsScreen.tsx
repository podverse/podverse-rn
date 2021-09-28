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
          <TableCell
            accessibilityLabel={translate('Downloads')}
            includeDivider
            onPress={() => navigation.navigate(PV.RouteNames.SettingsScreenDownloads)}
            testIDPrefix={`${testIDPrefix}_downloads`}
            testIDSuffix=''>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              style={[table.cellText, globalTheme.tableCellTextPrimary]}>
              {translate('Downloads')}
            </Text>
          </TableCell>
          <TableCell
            accessibilityLabel={translate('History')}
            includeDivider
            onPress={() => navigation.navigate(PV.RouteNames.SettingsScreenHistory)}
            testIDPrefix={`${testIDPrefix}_history`}
            testIDSuffix=''>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              style={[table.cellText, globalTheme.tableCellTextPrimary]}>
              {translate('History')}
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
            accessibilityLabel={translate('Queue')}
            includeDivider
            onPress={() => navigation.navigate(PV.RouteNames.SettingsScreenQueue)}
            testIDPrefix={`${testIDPrefix}_queue`}
            testIDSuffix=''>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              style={[table.cellText, globalTheme.tableCellTextPrimary]}>
              {translate('Queue')}
            </Text>
          </TableCell>
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
            accessibilityLabel={translate('Visual Design')}
            includeDivider
            onPress={() => navigation.navigate(PV.RouteNames.SettingsScreenVisualDesign)}
            testIDPrefix={`${testIDPrefix}_visual_design`}
            testIDSuffix=''>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              style={[table.cellText, globalTheme.tableCellTextPrimary]}>
              {translate('Visual Design')}
            </Text>
          </TableCell>
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
