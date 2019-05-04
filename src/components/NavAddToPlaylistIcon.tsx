import React from 'react'
import { PV } from '../resources'
import { navHeader } from '../styles'
import { Icon } from './'

type Props = {
  navigation: any
}

export const NavAddToPlaylistIcon = (props: Props) => {
  const { navigation } = props

  return (
    <Icon
      color='#fff'
      name='list'
      onPress={() => navigation.navigate(PV.RouteNames.PlaylistsAddToScreen)}
      size={22}
      style={navHeader.buttonIcon} />
  )
}
