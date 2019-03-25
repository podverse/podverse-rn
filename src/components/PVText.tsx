import React from 'react'
import { Text } from 'react-native'
import { useGlobal } from 'reactn'

export const PVText = (props) => {
  const [globalTheme] = useGlobal('globalTheme')
  return <Text {...props} style={[props.style, globalTheme.text]}>{props.children}</Text>
}
