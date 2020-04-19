import React, { getGlobal } from 'reactn'
import { getMakeClipIsPublic, safelyUnwrapNestedVariable } from '../lib/utility'
import { PV } from '../resources'
import { NavItemIcon, NavItemWrapper } from './'

type Props = {
  getInitialProgressValue: any
  navigation: any
}

export const NavMakeClipIcon = (props: Props) => {
  const { getInitialProgressValue, navigation } = props

  const handlePress = async () => {
    const initialProgressValue = await getInitialProgressValue()
    const isPublic = await getMakeClipIsPublic()
    const { session } = getGlobal()
    const isLoggedIn = safelyUnwrapNestedVariable(() => session.isLoggedIn, '')

    navigation.navigate(PV.RouteNames.MakeClipScreen, {
      initialProgressValue,
      initialPrivacy: isPublic,
      isLoggedIn
    })
  }

  return (
    <NavItemWrapper handlePress={handlePress}>
      <NavItemIcon name='cut' />
    </NavItemWrapper>
  )
}
