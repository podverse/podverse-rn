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
  constructor(props: Props) {
    super()

    props.navigation.setOptions({
      headerTitle: translate('App Mode')
    })
  }

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
            onPress={() => this._handleAppModeOnPress(PV.AppMode.podcasts)}
            testIDPrefix={`${testIDPrefix}_podcasts`}
            testIDSuffix=''>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              style={[table.cellText, globalTheme.tableCellTextPrimary]}>
              {translate('Podcasts')}
            </Text>
            {appMode === PV.AppMode.podcasts && (
              <Icon name='check' size={24} style={styles.itemIcon} testID={`${testIDPrefix}_podcasts_check`} />
            )}
          </TableCell>
          <TableCell
            accessibilityLabel={translate('Videos')}
            includeDivider
            onPress={() => this._handleAppModeOnPress(PV.AppMode.videos)}
            testIDPrefix={`${testIDPrefix}_videos`}
            testIDSuffix=''>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              style={[table.cellText, globalTheme.tableCellTextPrimary]}>
              {translate('Videos')}
            </Text>
            {appMode === PV.AppMode.videos && (
              <Icon name='check' size={24} style={styles.itemIcon} testID={`${testIDPrefix}_podcasts_check`} />
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
