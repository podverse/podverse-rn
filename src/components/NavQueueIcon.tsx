import React from 'react'
import { PV } from '../resources'
import { navHeader } from '../styles'
import { Icon, NavItemWrapper } from './'

type Props = {
  navigation: any
  useThemeTextColor?: boolean
}

export const NavQueueIcon = (props: Props) => {
  const { navigation, useThemeTextColor } = props

  const handlePress = () => {
    navigation.navigate(PV.RouteNames.QueueScreen)
  }

  const color = useThemeTextColor ? '' : '#fff'
  return (
    <NavItemWrapper handlePress={handlePress}>
      <Icon color={color} name='list' size={PV.Icons.NAV} style={navHeader.buttonIcon} />
    </NavItemWrapper>
  )
}
