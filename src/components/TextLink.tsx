import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { useGlobal } from 'reactn'

type Props = {
  children?: any
  numberOfLines?: number
  onPress?: any
  style?: any
}

export const TextLink = (props: Props) => {
  const { children, numberOfLines, onPress, style } = props
  const [globalTheme] = useGlobal('globalTheme')

  return (
    <TouchableOpacity onPress={onPress}>
      <Text
        numberOfLines={numberOfLines}
        style={[style, globalTheme.link]}>
        {children}
      </Text>
    </TouchableOpacity>
  )
}
