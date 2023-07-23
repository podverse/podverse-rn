/* eslint-disable max-len */
import { Alert, NativeModules, StyleSheet, View as RNView, NativeEventEmitter, EmitterSubscription } from 'react-native'
import React, { getGlobal } from 'reactn'
import RNPickerSelect from 'react-native-picker-select'
import { checkIfFDroidAppVersion } from '../lib/deviceDetection'
import { debugLogger } from '../lib/logger'
import { Icon, ScrollView, SwitchWithText, Text, View } from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { checkIfUPNotificationsEnabled, disableUPNotifications, enableUPNotifications, setUPDistributor } from '../services/notifications'
import { trackPageView } from '../services/tracking'
import { core, darkTheme, hidePickerIconOnAndroidTransparent } from '../styles'

const { PVUnifiedPushModule } = NativeModules

type Props = {
  navigation: any
}

type State = {
  distributor: string
  availableDistributors: string[]
  notificationsEnabled: boolean
  upNotificationsEnabled: boolean
}

const testIDPrefix = 'settings_screen_notifications'

export class SettingsScreenNotifications extends React.Component<Props, State> {
  pvNativeEventEmitter: NativeEventEmitter = new NativeEventEmitter(PVUnifiedPushModule)
  pvNativeEventSubscriptions: EmitterSubscription[] = []
  
  publicKey: string
  authKey: string

  constructor(props: Props) {
    super(props)

    this.state = {
      distributor: '',
      availableDistributors: [],
      notificationsEnabled: false,
      upNotificationsEnabled: false
    }
  }

  static navigationOptions = () => ({
    title: translate('Notifications')
  })

  async componentDidMount() {
    const upNotificationsEnabled = await checkIfUPNotificationsEnabled()
    let distributor = ''
    let availableDistributors: string[] = []

    if (checkIfFDroidAppVersion()) {
      distributor = await PVUnifiedPushModule.getCurrentDistributor()
      debugLogger(`Current UnifiedPush distributor: ${distributor}`)

      availableDistributors = await PVUnifiedPushModule.getUPDistributors()

      debugLogger(`Available UnifiedPush distributors: ${availableDistributors}`)
      debugLogger(`length of UnifiedPush distributors: ${availableDistributors.length}`)

      if (availableDistributors.length === 0) {
        debugLogger('No UnifiedPush available')
      }

      this.pvNativeEventSubscriptions.push(
        this.pvNativeEventEmitter.addListener('UnifiedPushNewEndpoint', ({instance, payload}) => { 
          (async () => {
            debugLogger(`Received UnifiedPush endpoint from ${instance}: ${payload.endpoint}`)
            await enableUPNotifications(payload.endpoint)
          })()
        })
      )
    }

    this.setState({
      availableDistributors,
      distributor,
      upNotificationsEnabled
    })

    trackPageView('/settings-notifications', 'Settings Screen Notifications')
  }

  componentWillUnmount() {
    this.pvNativeEventSubscriptions.forEach((subscription) => subscription.remove())
  }

  _toggleUPNotifications = (upNotificationsEnabled: boolean) => {
    const { session } = getGlobal()

    if (!session?.isLoggedIn) {
      Alert.alert(
        PV.Alerts.LOGIN_TO_ENABLE_PODCAST_NOTIFICATIONS.title,
        PV.Alerts.LOGIN_TO_ENABLE_PODCAST_NOTIFICATIONS.message
      )
    } else {
      this.setState({ distributor: '', upNotificationsEnabled }, () => {
        (async () => {
          if (upNotificationsEnabled) {
            // Do nothing except update component state.
            // It isn't until the user selects a distributor that we want to save
            // the info server and enable UP notifications locally.
          } else {
            await disableUPNotifications()
            debugLogger('Unregistering UnifiedPush')
            await PVUnifiedPushModule.unregister()
          }
        })()
      })
    }
  }

  _enableUPNotifications = (newDistributor: string) => {
    const { distributor } = this.state
    if (newDistributor && newDistributor !== distributor) {
      this.setState({ distributor: newDistributor }, () => {
        (async () => {
          debugLogger(`Setting UnifiedPush distributor: ${newDistributor}`)
          if (newDistributor) {
            await setUPDistributor(newDistributor)
          }
        })()
      })
    }
  }

  render() {
    const { availableDistributors, distributor, upNotificationsEnabled } = this.state
    const { globalTheme } = this.global
    const isDarkMode = globalTheme === darkTheme

    // TODO: There is a weird bug with RNPickerSelect onValueChange
    // that results in the handler being called twice on value change.
    // This affects all our RNPickerSelects, so we should probably write
    // a HOC to fix it, then use the HOC everywhere.
    // More info: https://github.com/lawnstarter/react-native-picker-select/issues/265
    const distributorItems = availableDistributors.map(d => ({
      label: d,
      value: d
    }))

    return (
      <ScrollView
        contentContainerStyle={styles.scrollViewContentContainer}
        style={styles.wrapper}
        testID={`${testIDPrefix}_view`}>
        {
          (checkIfFDroidAppVersion()) && (
            <>
              <View style={core.itemWrapper}>
                <SwitchWithText
                  accessibilityLabel={translate('Enable UnifiedPush notifications')}
                  onValueChange={this._toggleUPNotifications}
                  testID={`${testIDPrefix}_enable_unifiedpush_notifications`}
                  text={translate('Enable UnifiedPush notifications')}
                  value={upNotificationsEnabled}
                />
              </View>
              {
                upNotificationsEnabled && (
                  <View style={core.itemWrapperReducedHeight}>
                    <RNPickerSelect
                      disabled={!upNotificationsEnabled}
                      fixAndroidTouchableBug
                      items={distributorItems}
                      onValueChange={this._enableUPNotifications}
                      placeholder={placeholderItem}
                      style={hidePickerIconOnAndroidTransparent(isDarkMode)}
                      useNativeAndroidPickerStyle={false}
                      value={distributor}>
                      <RNView
                        accessible
                        accessibilityLabel={`${translate('Select a distributor')}`}
                        importantForAccessibility='yes'
                        style={[core.selectorWrapper, styles.pickerSelectInner]}>
                        <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={[core.pickerSelect, globalTheme.text]}>
                          {!!distributor ? distributor : placeholderItem.label}
                        </Text>
                        <Icon name='angle-down' size={14} style={[core.pickerSelectIcon, globalTheme.text]} />
                      </RNView>
                    </RNPickerSelect>
                    <View style={core.itemWrapper}>
                      <Text style={core.helperText}>{translate('Notifications UP help text')}</Text>
                    </View>
                  </View>
                )
              }
            </>
          )
        }
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  pickerSelectInner: {
    marginTop: 8,
    marginBottom: 20,
    marginHorizontal: 12,
    paddingHorizontal: 12
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

const placeholderItem = {
  label: translate('Select a distributor'),
  value: ''
}
