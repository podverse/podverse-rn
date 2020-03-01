import React from 'react'
import { Icon, NavItemWrapper } from '.'
import { PV } from '../resources'
import { navHeader } from '../styles'

type Props = {
  handlePress: any
}

export const NavDismissIcon = (props: Props) => {
  const { handlePress } = props

  return (
    <NavItemWrapper handlePress={handlePress}>
      <Icon
        color='#fff'
        name='chevron-down'
        size={PV.Icons.NAV}
        style={navHeader.buttonIcon} />
    </NavItemWrapper>
  )
}
