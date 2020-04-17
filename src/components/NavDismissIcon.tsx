import React from 'react'
import { Icon, NavItemWrapper } from '.'
import { PV } from '../resources'
import { navHeader } from '../styles'

type Props = {
  handlePress: any
  useThemeTextColor?: boolean
}

export const NavDismissIcon = (props: Props) => {
  const { handlePress, useThemeTextColor } = props
  const color = useThemeTextColor ? '' : '#fff'

  return (
    <NavItemWrapper handlePress={handlePress}>
      <Icon color={color} name='chevron-down' size={PV.Icons.NAV} style={navHeader.buttonIcon} />
    </NavItemWrapper>
  )
}
