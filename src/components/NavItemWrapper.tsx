import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { navHeader } from '../styles'

type Props = {
  children: any
  handlePress: any
  testID: string
}

export const NavItemWrapper = (props: Props) => {
  const { children, handlePress, testID } = props

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
        {...(testID ? { testID } : {})}>
        {children}
      </TouchableOpacity>
    </View>
  )
}
