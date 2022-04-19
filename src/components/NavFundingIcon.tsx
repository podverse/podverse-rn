import React, { getGlobal } from 'reactn'
import { darkTheme } from '../../src/styles'
import { translate } from '../lib/i18n'
import { safelyUnwrapNestedVariable } from '../lib/utility'
import { PV } from '../resources'
import { NavItemIcon, NavItemWrapper } from './'

type Props = {
  globalTheme: any
  navigation: any
}

export const NavFundingIcon = (props: Props) => {
  const { globalTheme, navigation } = props

  const handlePress = () => {
    const { globalTheme, session } = getGlobal()
    const isLoggedIn = safelyUnwrapNestedVariable(() => session.isLoggedIn, false)

    navigation.navigate(PV.RouteNames.FundingScreen, {
      isLoggedIn,
      globalTheme
    })
  }

  let color = darkTheme.text.color
  if (globalTheme) {
    color = globalTheme?.text?.color
  }

  return (
    <NavItemWrapper
      accessibilityHint={translate('ARIA HINT - go to the funding information for this podcast')}
      accessibilityLabel={translate('Funding')}
      accessibilityRole='button'
      handlePress={handlePress}
      testID='nav_funding_icon'>
      <NavItemIcon name='donate' color={color} />
    </NavItemWrapper>
  )
}
