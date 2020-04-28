import React from 'react'
import { NavItemIcon, NavItemWrapper } from '.'
import { GlobalTheme } from '../../src/resources/Interfaces'
import { darkTheme } from '../../src/styles'

type Props = {
  handlePress: any
  globalTheme?: GlobalTheme
}

export const NavDismissIcon = (props: Props) => {
  const { handlePress } = props

  let color = darkTheme.text.color
  if (props.globalTheme) {
    color = props.globalTheme?.text?.color
  }
  return (
    <NavItemWrapper handlePress={handlePress} testId='nav_dismiss_icon'>
      <NavItemIcon name='chevron-down' color={color} />
    </NavItemWrapper>
  )
}
