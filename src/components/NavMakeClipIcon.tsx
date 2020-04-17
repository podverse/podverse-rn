import React from 'react'
import { getMakeClipIsPublic } from '../lib/utility'
import { PV } from '../resources'
import { navHeader } from '../styles'
import { Icon, NavItemWrapper } from './'

type Props = {
  getInitialProgressValue: any
  navigation: any
  useThemeTextColor?: boolean
}

export const NavMakeClipIcon = (props: Props) => {
  const { getInitialProgressValue, navigation, useThemeTextColor } = props

  const handlePress = async () => {
    const initialProgressValue = await getInitialProgressValue()
    const isPublic = await getMakeClipIsPublic()
    navigation.navigate(PV.RouteNames.MakeClipScreen, {
      initialProgressValue,
      initialPrivacy: isPublic
    })
  }

  const color = useThemeTextColor ? '' : '#fff'

  return (
    <NavItemWrapper handlePress={handlePress}>
      <Icon color={color} name='cut' size={PV.Icons.NAV} style={navHeader.buttonIcon} />
    </NavItemWrapper>
  )
}
