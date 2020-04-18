import React from 'react'
import { PV } from '../resources'
import { NavItemWrapper } from './'
import { DownloadsActiveBadge } from './DownloadsActiveBadge'
import { NavItemIcon } from './NavItemIcon'

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
      <NavItemIcon name='ellipsis-v' />
      <DownloadsActiveBadge />
    </NavItemWrapper>
  )
}
