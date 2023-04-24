import React from 'react'
import { Alert, Linking } from 'react-native'
import { darkTheme } from '../../src/styles'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { GlobalTheme } from '../resources/Interfaces'
import { NavItemIcon, NavItemWrapper } from './'

type Props = {
  globalTheme: GlobalTheme
  linkUrl: string
}

// const _fileName = 'src/components/NavOfficialLink.tsx'

export const NavOfficialLinkIcon = (props: Props) => {
  const handleFollowLink = () => {
    Alert.alert(PV.Alerts.LEAVING_APP.title, PV.Alerts.LEAVING_APP.message, [
      { text: 'Cancel' },
      { text: 'Yes', onPress: () => Linking.openURL(props.linkUrl) }
    ])
  }

  let color = darkTheme.text.color
  if (props.globalTheme) {
    color = props.globalTheme?.text?.color
  }

  return (
    <NavItemWrapper
      accessibilityLabel={translate('Official webpage')}
      accessibilityRole='button'
      handlePress={handleFollowLink}
      testID='nav_official_link_icon'>
      <NavItemIcon name='globe' solid color={color} />
    </NavItemWrapper>
  )
}
