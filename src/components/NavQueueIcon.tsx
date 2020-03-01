import React from 'react'
import { PV } from '../resources'
import { navHeader } from '../styles'
import { Icon, NavItemWrapper } from './'

type Props = {
  navigation: any
}

export const NavQueueIcon = (props: Props) => {
  const { navigation } = props

  const handlePress = () => {
    navigation.navigate(PV.RouteNames.QueueScreen)
  }

  return (
    <NavItemWrapper handlePress={handlePress}>
      <Icon
        color='#fff'
        name='list'
        size={PV.Icons.NAV}
        style={navHeader.buttonIcon} />
    </NavItemWrapper>
  )
}
