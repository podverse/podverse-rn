import React from 'reactn'
import { Alert, Linking } from 'react-native'
import Config from 'react-native-config'
import messaging from '@react-native-firebase/messaging'
import { darkTheme } from '../styles'
import { errorLogger } from '../lib/debug'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { saveOrUpdateFCMDevice } from '../services/fcmDevices'
import { notificationSubscribe, notificationUnsubscribe } from '../services/notifications'
import { getAuthUserInfo } from '../state/actions/auth'
import { ActivityIndicator, NavItemIcon, NavItemWrapper } from '.'

type Props = {
  podcastId: string
  isEnabled: boolean
  onNotificationSelectionChanged: any
}

type State = {
  isLoading: boolean
}

export class NavNotificationsIcon extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      isLoading: false
    }
  }

  onEnableNotifications = async () => {
    const { onNotificationSelectionChanged, podcastId } = this.props
    const { session } = this.global

    if (!session?.isLoggedIn) {
      Alert.alert(
        PV.Alerts.LOGIN_TO_ENABLE_PODCAST_NOTIFICATIONS.title,
        PV.Alerts.LOGIN_TO_ENABLE_PODCAST_NOTIFICATIONS.message
      )
    } else {
      this.setState({ isLoading: true })
      try {
        const authStatus = await messaging().requestPermission()
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL
        if (enabled) {
          const fcmToken = await messaging().getToken()
          await saveOrUpdateFCMDevice(fcmToken)
          await notificationSubscribe(podcastId)
          // update the session.userInfo.notifications state by calling getAuthUserInfo
          await getAuthUserInfo()
          onNotificationSelectionChanged({ isEnabled: true })
        } else {
          this.requestPermissionsInSettings()
        }
      } catch (err) {
        errorLogger('onEnableNotifications error: ', err)
      }
      this.setState({ isLoading: false })
    }
  }

  onDisableNotifications = async () => {
    const { onNotificationSelectionChanged, podcastId } = this.props
    this.setState({ isLoading: true })
    try {
      await notificationUnsubscribe(podcastId)
      // update the session.userInfo.notifications state by calling getAuthUserInfo
      await getAuthUserInfo()
      onNotificationSelectionChanged({ isEnabled: false })
    } catch (err) {
      errorLogger('onDisableNotifications error: ', err)
    }
    this.setState({ isLoading: false })
  }

  requestPermissionsInSettings = () => {
    Alert.alert(PV.Alerts.ENABLE_NOTIFICATIONS_SETTINGS.title, PV.Alerts.ENABLE_NOTIFICATIONS_SETTINGS.message, [
      { text: translate('Cancel') },
      { text: translate('Go to Settings'), onPress: () => Linking.openSettings() }
    ])
  }

  render() {
    if (Config.DISABLE_NOTIFICATIONS) return null
    const { isEnabled } = this.props
    const { isLoading } = this.state
    const { globalTheme } = this.global

    let color = darkTheme.text.color
    if (globalTheme) {
      color = isEnabled ? PV.Colors.yellow : globalTheme?.text?.color
    }

    return (
      <NavItemWrapper
        accessibilityHint={translate('ARIA HINT - Enable podcast notifications')}
        accessibilityLabel={translate('Enable Notifications')}
        accessibilityRole='button'
        handlePress={isEnabled ? this.onDisableNotifications : this.onEnableNotifications}
        testID='nav_notifications_icon'>
        {isLoading && <ActivityIndicator size={28} testID='nav_notification_loading' />}
        {!isLoading && <NavItemIcon name={isEnabled ? 'bell' : 'bell-slash'} solid color={color} />}
      </NavItemWrapper>
    )
  }
}
