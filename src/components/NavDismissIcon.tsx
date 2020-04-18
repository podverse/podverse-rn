import React from 'react'
import { NavItemIcon, NavItemWrapper } from '.'

type Props = {
  handlePress: any
}

export const NavDismissIcon = (props: Props) => {
  const { handlePress } = props

  return (
    <NavItemWrapper handlePress={handlePress}>
      <NavItemIcon name='chevron-down' />
    </NavItemWrapper>
  )
}
