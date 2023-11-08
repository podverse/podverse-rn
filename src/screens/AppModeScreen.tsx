/* eslint-disable max-len */
import AsyncStorage from '@react-native-community/async-storage'
import { StyleSheet } from 'react-native'
import React from 'reactn'
import { Icon, ScrollView, TableCell, Text, View } from '../components'
import { translate } from '../lib/i18n'
import PVEventEmitter from '../services/eventEmitter'
import { PV } from '../resources'
import { AppModes } from '../resources/AppMode'
import { trackPageView } from '../services/tracking'
import { table } from '../styles'

type Props = {
  navigation: any
}

const testIDPrefix = 'app_mode_screen'

export class AppModeScreen extends React.Component<Props> {
  static navigationOptions = () => ({
    title: translate('App Mode')
  })

  componentDidMount() {
    trackPageView('/app-mode', 'App Mode Screen')
  }

  _handleAppModeOnPress = (selectedKey: AppModes) => {
    this.setGlobal(
      {
        appMode: selectedKey
      },
      async () => {
        await AsyncStorage.setItem(PV.Keys.APP_MODE, selectedKey)
        PVEventEmitter.emit(PV.Events.APP_MODE_CHANGED)
      }
    )
  }

  render() {
    const { appMode, globalTheme } = this.global

    return (
      <ScrollView
        contentContainerStyle={styles.scrollViewContentContainer}
        style={styles.wrapper}
        testID={`${testIDPrefix}_view`}>
        <View>
          <TableCell
            accessibilityLabel={translate('Podcasts')}
            includeDivider
            onPress={() => this._handleAppModeOnPress(PV.AppMode.mixed)}
            testIDPrefix={`${testIDPrefix}_podcasts`}
            testIDSuffix=''>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              style={[table.cellText, globalTheme.tableCellTextPrimary]}>
              {translate('Podcasts')}
            </Text>
            {appMode === PV.AppMode.mixed && (
              <Icon name='check' size={24} style={styles.itemIcon} testID={`${testIDPrefix}_podcasts_check`} />
            )}
          </TableCell>
          <TableCell
            accessibilityLabel={translate('Music')}
            includeDivider
            onPress={() => this._handleAppModeOnPress(PV.AppMode.music)}
            testIDPrefix={`${testIDPrefix}_music`}
            testIDSuffix=''>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              style={[table.cellText, globalTheme.tableCellTextPrimary]}>
              {translate('Music')}
            </Text>
            {appMode === PV.AppMode.music && (
              <Icon name='check' size={24} style={styles.itemIcon} testID={`${testIDPrefix}_music_check`} />
            )}
          </TableCell>
          <TableCell
            accessibilityLabel={translate('Videos')}
            includeDivider
            onPress={() => this._handleAppModeOnPress(PV.AppMode.video)}
            testIDPrefix={`${testIDPrefix}_videos`}
            testIDSuffix=''>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              style={[table.cellText, globalTheme.tableCellTextPrimary]}>
              {translate('Videos')}
            </Text>
            {appMode === PV.AppMode.video && (
              <Icon name='check' size={24} style={styles.itemIcon} testID={`${testIDPrefix}_videos_check`} />
            )}
          </TableCell>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  activityIndicator: {
    paddingTop: 40
  },
  itemIcon: {
    marginLeft: 16,
    color: PV.Colors.brandBlueLight
  },
  scrollViewContentContainer: {
    paddingBottom: 48
  },
  wrapper: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 12
  }
})
