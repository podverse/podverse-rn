import React from 'react'
import { NavItemIcon, NavItemWrapper } from '.'
import { GlobalTheme } from '../../src/resources/Interfaces'
import { darkTheme } from '../../src/styles'

type Props = {
  handlePress: any
  globalTheme?: GlobalTheme
  testID: string
}

export const NavDismissIcon = (props: Props) => {
  const { handlePress, testID } = props

  let color = darkTheme.text.color
  if (props.globalTheme) {
    color = props.globalTheme?.text?.color
  }
  return (
    <NavItemWrapper handlePress={handlePress} testID={`${testID}_nav_dismiss_icon`}>
      <NavItemIcon name='chevron-down' color={color} />
    </NavItemWrapper>
  )
}
