import React from 'react'
import Config from 'react-native-config'
import { NavItemIcon, NavItemWrapper } from '.'
import { PV } from '../resources'

type Props = {
  navigation: any
}

export const NavSearchIcon = (props: Props) => {
  if (Config.DISABLE_SEARCH === 'TRUE') return null

  const { navigation } = props

  const handlePress = () => {
    navigation.navigate(PV.RouteNames.SearchScreen)
  }

  return (
    <NavItemWrapper handlePress={handlePress} testId='nav_search_icon'>
      <NavItemIcon name='search' />
    </NavItemWrapper>
  )
}
