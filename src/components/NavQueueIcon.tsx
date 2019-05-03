import React from 'react'
import { PV } from '../resources'
import { navHeader } from '../styles'
import { Icon } from './'

type Props = {
  navigation: any
}

export const NavQueueIcon = (props: Props) => {
  const { navigation } = props

  return (
    <Icon
      color='#fff'
      name='th-list'
      onPress={() => navigation.navigate(PV.RouteNames.QueueScreen)}
      size={22}
      style={navHeader.buttonIcon} />
  )
}
