import React, { useGlobal } from 'reactn'
import { PV } from '../resources'
import { navHeader } from '../styles'
import { Icon } from './'

type Props = {
  name: string
}

export const NavItemIcon = (props: Props) => {
  const { name } = props
  const [globalTheme] = useGlobal('globalTheme')

  return <Icon color={globalTheme.text.color} name={name} size={PV.Icons.NAV} style={navHeader.buttonIcon} />
}
