import React from 'react'
import { Text } from 'react-native'
import { useGlobal } from 'reactn'

type Props = {
  children?: any
  isSecondary?: any
  numberOfLines?: number
  onPress?: any
  style?: any
}

export const PVText = (props: Props) => {
  const { isSecondary } = props
  const [globalTheme] = useGlobal('globalTheme')
  const globalThemeText = isSecondary ? globalTheme.textSecondary : globalTheme.text
  return <Text {...props} style={[globalThemeText, props.style]}>{props.children}</Text>
}
