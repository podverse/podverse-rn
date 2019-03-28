import React from 'react'
import { Text } from 'react-native'
import { useGlobal } from 'reactn'

type Props = {
  children?: any
  style?: any
}

export const PVText = (props: Props) => {
  const [globalTheme] = useGlobal('globalTheme')
  return <Text {...props} style={[props.style, globalTheme.text]}>{props.children}</Text>
}
