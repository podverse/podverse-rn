import React from 'react'
import { getMakeClipIsPublic } from '../lib/utility'
import { PV } from '../resources'
import { navHeader } from '../styles'
import { Icon, NavItemWrapper } from './'

type Props = {
  getInitialProgressValue: any
  navigation: any
}

export const NavMakeClipIcon = (props: Props) => {
  const { getInitialProgressValue, navigation } = props

  const handlePress = async () => {
    const initialProgressValue = await getInitialProgressValue()
    const isPublic = await getMakeClipIsPublic()
    navigation.navigate(PV.RouteNames.MakeClipScreen, {
      initialProgressValue,
      initialPrivacy: isPublic
    })
  }

  return (
    <NavItemWrapper
      handlePress={handlePress}>
      <Icon
        color='#fff'
        name='cut'
        size={PV.Icons.NAV}
        style={navHeader.buttonIcon} />
    </NavItemWrapper>

  )
}
