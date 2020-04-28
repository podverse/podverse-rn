import React, { getGlobal } from 'reactn'
import { GlobalTheme } from '../../src/resources/Interfaces'
import { darkTheme } from '../../src/styles'
import { getMakeClipIsPublic, safelyUnwrapNestedVariable } from '../lib/utility'
import { PV } from '../resources'
import { NavItemIcon, NavItemWrapper } from './'

type Props = {
  getInitialProgressValue: any
  navigation: any
  globalTheme: GlobalTheme
}

export const NavMakeClipIcon = (props: Props) => {
  const { getInitialProgressValue, navigation } = props

  const handlePress = async () => {
    const initialProgressValue = await getInitialProgressValue()
    const isPublic = await getMakeClipIsPublic()
    const { globalTheme, session } = getGlobal()
    const isLoggedIn = safelyUnwrapNestedVariable(() => session.isLoggedIn, false)

    navigation.navigate(PV.RouteNames.MakeClipScreen, {
      initialProgressValue,
      initialPrivacy: isPublic,
      isLoggedIn,
      globalTheme
    })
  }

  let color = darkTheme.text.color
  if (props.globalTheme) {
    color = props.globalTheme?.text?.color
  }

  return (
    <NavItemWrapper handlePress={handlePress} testId='nav_make_clip_icon'>
      <NavItemIcon name='cut' color={color} />
    </NavItemWrapper>
  )
}
