import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { useGlobal } from 'reactn'

type Props = {
  children?: any
  disabled?: boolean
  numberOfLines?: number
  onPress?: any
  style?: any
}

export const TextLink = (props: Props) => {
  const { children, disabled, numberOfLines, onPress, style } = props
  const [globalTheme] = useGlobal('globalTheme')

  return (
    <TouchableOpacity disabled={disabled} onPress={onPress}>
      <Text numberOfLines={numberOfLines} style={[style, globalTheme.link]}>
        {children}
      </Text>
    </TouchableOpacity>
  )
}
