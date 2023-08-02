import React from 'react'
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
    PV.Alerts.LEAVING_APP_ALERT(props.linkUrl)
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
