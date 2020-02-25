import React from 'react'
import { Text, View } from 'react-native'
import { navHeader } from '../styles'

type Props = {
  style?: any
  text: string
}

export const NavHeaderButtonText = (props: Props) => {
  return (
    <View style={[navHeader.buttonWrapper, props.style]}>
      <Text style={navHeader.buttonText}>{props.text}</Text>
    </View>
  )
}
