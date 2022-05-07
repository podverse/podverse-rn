import React, {useGlobal, setGlobal} from 'reactn'
import Config from 'react-native-config'
import messaging from '@react-native-firebase/messaging'
import { updateUserLiveSubscriptions } from '../services/user'
import { darkTheme } from '../styles'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { NavItemIcon, NavItemWrapper } from '.'

type Props = {
  podcastId: string
  isEnabled: boolean
  onNotificationSelectionChanged: () => void
}

export const NavNotificationsIcon = (props: Props) => {
  if (Config.DISABLE_NOTIFICATIONS) return null
  const [globalTheme] = useGlobal("globalTheme")
  const [session] = useGlobal("session")
  const {
    podcastId,
    isEnabled,
    onNotificationSelectionChanged
  } = props

  const onEnableNotifications = async () => {
    try {
      const authStatus = await messaging().requestPermission()
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
    
      if (enabled) {
        const fcmToken = await messaging().getToken()
        await updateUserLiveSubscriptions({fcmToken, podcastId, subscribe: true})
        setGlobal({session: {...session, userInfo: {...session.userInfo, liveItemSubscriptions:[podcastId]}}})
        onNotificationSelectionChanged()
      }
    } catch (err) {
      console.log("Live item subscribing error: ", err)
    }
  }

  const onDisableNotifications = async () => {
    try {
      const fcmToken = await messaging().getToken()
      await updateUserLiveSubscriptions({fcmToken, podcastId, subscribe: false})
      setGlobal({session: {...session, userInfo: {...session.userInfo, liveItemSubscriptions:[]}}})
      onNotificationSelectionChanged()
    } catch (err) {
      console.log("Live item unsubscribing error: ", err)
    }
  }

  let color = darkTheme.text.color
  if (globalTheme) {
    color = isEnabled ? PV.Colors.yellow : globalTheme?.text?.color
  }

  return (
    <NavItemWrapper
      accessibilityHint={translate('ARIA HINT - Enable podcast notifications')}
      accessibilityLabel={translate('Enable Notifications')}
      accessibilityRole='button'
      handlePress={isEnabled ? onDisableNotifications : onEnableNotifications}
      testID='nav_notifications_icon'>
      <NavItemIcon name={isEnabled ? 'bell' : 'bell-slash'} solid color={color} />
    </NavItemWrapper>
  )
}
