import React from 'react'
import { translate } from '../../src/lib/i18n'
import { GlobalTheme } from '../../src/resources/Interfaces'
import { darkTheme } from '../../src/styles'
import { NavItemIcon, NavItemWrapper } from '.'

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
    <NavItemWrapper
      accessibilityHint={translate('ARIA HINT - dismiss this screen')}
      accessibilityLabel={translate('Back')}
      accessibilityRole='button'
      handlePress={handlePress}
      testID={`${testID}_nav_dismiss_icon`}>
      <NavItemIcon name='chevron-down' color={color} />
    </NavItemWrapper>
  )
}
