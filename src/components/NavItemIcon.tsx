import React from 'reactn'
import { PV } from '../resources'
import { navHeader } from '../styles'
import { Icon } from './'

type Props = {
  name: string
  color?: string
  solid?: boolean
}

export const NavItemIcon = (props: Props) => {
  const { name, color = PV.Colors.white, solid } = props

  return (
    <Icon
      color={color}
      name={name}
      size={PV.Icons.NAV}
      solid={solid}
      style={navHeader.buttonIcon} />
  )
}
