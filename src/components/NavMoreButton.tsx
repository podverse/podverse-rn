import React from 'react'
import { PV } from '../resources'
import { navHeader } from '../styles'
import { Icon, NavItemWrapper } from './'

type Props = {
  navigation: any
}

export const NavMoreButton = (props: Props) => {
  const { navigation } = props

  const handlePress = () => {
    navigation.navigate(PV.RouteNames.MoreScreen)
  }

  return (
    <NavItemWrapper handlePress={handlePress}>
      <Icon color='#fff' name='list' size={PV.Icons.NAV} style={navHeader.buttonIcon} />
    </NavItemWrapper>
  )
}
