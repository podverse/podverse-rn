import React from 'react'
import { Text } from 'react-native'

type Props = {
  children?: any
  globalTheme?: any
  style?: any
}

export const PVText = (props: Props) => {
  return <Text {...props} style={[props.style, props.globalTheme]}>{props.children}</Text>
}
