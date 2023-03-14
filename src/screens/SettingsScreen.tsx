/* eslint-disable max-len */
import { StyleSheet } from 'react-native'
import Config from 'react-native-config'
import React from 'reactn'
import { ScrollView, TableCell, Text, View } from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { table } from '../styles'

type Props = {
  navigation: any
}

type State = {
  showDeleteDownloadedEpisodesDialog?: boolean
}

const testIDPrefix = 'settings_screen'

export class SettingsScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      showDeleteDownloadedEpisodesDialog: false
    }
  }

  static navigationOptions = () => ({
    title: translate('Settings')
  })

  componentDidMount() {
    trackPageView('/settings', 'Settings Screen')
  }

  render() {
    const { navigation } = this.props
    const { globalTheme, session } = this.global
    const { isLoggedIn } = session

    return (
      <ScrollView
        contentContainerStyle={styles.scrollViewContentContainer}
        style={styles.wrapper}
        testID={`${testIDPrefix}_view`}>
        <View>
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
            accessibilityLabel={translate('Other')}
            includeDivider
            onPress={() => navigation.navigate(PV.RouteNames.SettingsScreenOther)}
            testIDPrefix={`${testIDPrefix}_other`}
            testIDSuffix=''>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              style={[table.cellText, globalTheme.tableCellTextPrimary]}>
              {translate('Other')}
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
  wrapper: {
    flex: 1,
    paddingTop: 24
  }
})
