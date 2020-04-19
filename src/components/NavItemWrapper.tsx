import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { navHeader } from '../styles'

type Props = {
  children: any
  handlePress: any
}

export const NavItemWrapper = (props: Props) => {
  const { children, handlePress } = props

  return (
    <View style={navHeader.buttonWrapper}>
      <TouchableOpacity
        hitSlop={{
          bottom: 12,
          left: 12,
          right: 12,
          top: 12
        }}
        onPress={handlePress}>
        {children}
      </TouchableOpacity>
    </View>
  )
}
