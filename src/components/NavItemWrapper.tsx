import React from 'react'
import { TouchableWithoutFeedback, View } from 'react-native'
import { navHeader } from '../styles'

type Props = {
  children: any
  handlePress: any
}

export const NavItemWrapper = (props: Props) => {
  const { children, handlePress } = props

  return (
    <View style={navHeader.buttonWrapper}>
      <TouchableWithoutFeedback
        hitSlop={{
          bottom: 12,
          left: 12,
          right: 12,
          top: 12
        }}
        onPress={handlePress}>
        {children}
      </TouchableWithoutFeedback>
    </View>
  )
}
