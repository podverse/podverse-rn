import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { testProps } from '../lib/utility'
import { navHeader } from '../styles'

type Props = {
  children: any
  handlePress: any
  testId?: string
}

export const NavItemWrapper = (props: Props) => {
  const { children, handlePress, testId } = props

  return (
    <View style={navHeader.buttonWrapper}>
      <TouchableOpacity
        hitSlop={{
          bottom: 12,
          left: 12,
          right: 12,
          top: 12
        }}
        onPress={handlePress}
        {...(testId ? testProps(testId) : {})}>
        {children}
      </TouchableOpacity>
    </View>
  )
}
