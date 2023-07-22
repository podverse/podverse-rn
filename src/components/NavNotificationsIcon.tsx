import React from 'reactn'
import Config from 'react-native-config'
import { darkTheme } from '../styles'
import { errorLogger } from '../lib/logger'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { enableNotifications, notificationSubscribe, notificationUnsubscribe } from '../services/notifications'
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

const _fileName = 'src/components/NavNotificationsIcon.tsx'

export class NavNotificationsIcon extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      isLoading: false
    }
  }

  onEnableNotifications = async () => {
    const { onNotificationSelectionChanged, podcastId } = this.props
    this.setState({ isLoading: true })

    const handleNotificationSubscribed = async () => {
      await notificationSubscribe(podcastId)
      // update the session.userInfo.notifications state by calling getAuthUserInfo
      await getAuthUserInfo()
      onNotificationSelectionChanged({ isEnabled: true })
    }

    await enableNotifications(handleNotificationSubscribed)
    this.setState({ isLoading: false })
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
      errorLogger(_fileName, 'onDisableNotifications', err)
    }
    this.setState({ isLoading: false })
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
        accessibilityLabel={translate('Notifications')}
        accessibilityRole='button'
        handlePress={isEnabled ? this.onDisableNotifications : this.onEnableNotifications}
        testID='nav_notifications_icon'>
        {isLoading && <ActivityIndicator size={28} testID='nav_notification_loading' />}
        {!isLoading && <NavItemIcon name={isEnabled ? 'bell' : 'bell-slash'} solid color={color} />}
      </NavItemWrapper>
    )
  }
}
