/* eslint-disable max-len */
import AsyncStorage from '@react-native-community/async-storage'
import { NativeModules, Platform, StyleSheet } from 'react-native'
import React from 'reactn'
import RNPickerSelect from 'react-native-picker-select'
import { debugLogger } from '../lib/logger'
import { Icon, NumberSelectorWithText, ScrollView, SwitchWithText, Text, View } from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { core, darkTheme, hidePickerIconOnAndroidTransparent } from '../styles'
import Config from 'react-native-config'

const { PVUnifiedPushModule } = NativeModules

type Props = {
  navigation: any
}

type State = {
  distributor: string
  availableDistributors: string[]
  upNoficiationsEnabled: string
}

const testIDPrefix = 'settings_screen_notifications'

export class SettingsScreenNotifications extends React.Component<Props, State> {
  publicKey: string
  authKey: string

  constructor(props: Props) {
    super(props)

    this.state = {
      distributor: '',
      availableDistributors: [],
      upNoficiationsEnabled: ''
    }
  }

  static navigationOptions = () => ({
    title: translate('Notifications')
  })

  async componentDidMount() {
    const upNoficiationsEnabled = await AsyncStorage.getItem(PV.Keys.NOTIFICATIONS_UNIFIED_PUSH_ENABLED)
    let distributor = ''
    let availableDistributors: string[] = []

    if (Platform.OS === 'android' && Config.RELEASE_TYPE === 'F-Droid') {
      distributor = await PVUnifiedPushModule.getCurrentDistributor()
      debugLogger(`Current UnifiedPush distributor: ${distributor}`)

      availableDistributors = await PVUnifiedPushModule.getUPDistributors()

      debugLogger(`Available UnifiedPush distributors: ${availableDistributors}`)
      debugLogger(`length of UnifiedPush distributors: ${availableDistributors.length}`)

      if (availableDistributors.length === 0) {
        debugLogger('No UnifiedPush available')
      }

      const keys = await PVUnifiedPushModule.getUPPushKeys()

      // TODO: Send keys to server
      this.publicKey = keys.publicKey
      this.authKey = keys.authKey
    }

    this.setState({
      availableDistributors,
      distributor,
      upNoficiationsEnabled: upNoficiationsEnabled ?? ''
    })

    trackPageView('/settings-notifications', 'Settings Screen Notifications')
  }

  _toggleNoficiationsEnabled = (upNoficiationsEnabled: string) => {
    this.setState({ distributor: '', upNoficiationsEnabled }, () => {
      (async () => {
        if (upNoficiationsEnabled) {
          await AsyncStorage.setItem(PV.Keys.NOTIFICATIONS_UNIFIED_PUSH_ENABLED, 'TRUE')
        } else {
          await AsyncStorage.removeItem(PV.Keys.NOTIFICATIONS_UNIFIED_PUSH_ENABLED)

          debugLogger('Unregistering UnifiedPush')
          await PVUnifiedPushModule.unregister()
        }
      })()
    })
  }


  _setUPDistributor = (newDistributor: string) => {
    // TODO: Investigate getting called twice in a row because I don't know react
    const { distributor } = this.state
    if (newDistributor && newDistributor !== distributor) {
      this.setState({ distributor: newDistributor }, () => {
        (async () => {
          debugLogger(`Setting UnifiedPush distributor: ${newDistributor}`)
          await PVUnifiedPushModule.setUPDistributor(newDistributor)

          debugLogger(`UnifiedPush publicKey: ${this.publicKey}`)
          debugLogger(`UnifiedPush authKey: ${this.authKey}`)
        })()
      })
    }
  }

  render() {
    const { availableDistributors, distributor, upNoficiationsEnabled } = this.state
    const { globalTheme } = this.global
    const isDarkMode = globalTheme === darkTheme

    const distributorItems = availableDistributors.map(d => ({
      label: d,
      value: d
    }))

    return (
      <ScrollView
        contentContainerStyle={styles.scrollViewContentContainer}
        style={styles.wrapper}
        testID={`${testIDPrefix}_view`}>
        <View style={core.itemWrapper}>
          <SwitchWithText
            accessibilityLabel={translate('Enable UnifiedPush Notifications')}
            onValueChange={this._toggleNoficiationsEnabled}
            testID={`${testIDPrefix}_enable_unifiedpush_notifications`}
            text={translate('Enable UnifiedPush Notifications')}
            value={upNoficiationsEnabled}
          />
        </View>
        <View style={core.itemWrapperReducedHeight}>
          <RNPickerSelect
            disabled={!upNoficiationsEnabled}
            fixAndroidTouchableBug
            items={distributorItems}
            onValueChange={this._setUPDistributor}
            placeholder={placeholderItem}
            style={hidePickerIconOnAndroidTransparent(isDarkMode)}
            useNativeAndroidPickerStyle={false}
            value={distributor}/>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  scrollViewContentContainer: {
    paddingBottom: 48
  },
  wrapper: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 12
  }
})

const placeholderItem = {
  label: 'Select a distributor',
  value: ''
}
