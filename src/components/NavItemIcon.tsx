import React from 'reactn'
import { PV } from '../resources'
import { navHeader } from '../styles'
import { Icon } from './'

type Props = {
  name: string
  color?: string
}

export const NavItemIcon = (props: Props) => {
  const { name, color = PV.Colors.white } = props

  return <Icon color={color} name={name} size={PV.Icons.NAV} style={navHeader.buttonIcon} />
}
