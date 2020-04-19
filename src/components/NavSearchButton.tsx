import React from 'react'
import { NavItemIcon, NavItemWrapper } from '.'
import { PV } from '../resources'

type Props = {
  navigation: any
}

export const NavSearchButton = (props: Props) => {
  const { navigation } = props

  const handlePress = () => {
    navigation.navigate(PV.RouteNames.SearchScreen)
  }

  return (
    <NavItemWrapper handlePress={handlePress}>
      <NavItemIcon name='search' />
    </NavItemWrapper>
  )
}
