import React from 'react'
import { AccessibilityRole, View } from 'react-native'
import { navHeader } from '../styles'
import { PressableWithOpacity } from '.'

type Props = {
  accessibilityHint?: string
  accessibilityLabel?: string
  accessibilityRole?: AccessibilityRole
  children: any
  handlePress: any
  testID: string
}

export const NavItemWrapper = (props: Props) => {
  const { accessibilityHint, accessibilityLabel, accessibilityRole, children, handlePress, testID } = props

  return (
    <View style={navHeader.buttonWrapper}>
      <PressableWithOpacity
        {...(!!accessibilityHint ? { accessibilityHint } : {})}
        {...(!!accessibilityLabel ? { accessibilityLabel } : {})}
        {...(!!accessibilityRole ? { accessibilityRole } : {})}
        hitSlop={{
          bottom: 12,
          left: 12,
          right: 12,
          top: 12
        }}
        onPress={handlePress}
        {...(testID ? { testID: testID.prependTestId() } : {})}>
        {children}
      </PressableWithOpacity>
    </View>
  )
}
