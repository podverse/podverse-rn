import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { getGlobal } from 'reactn'
import { PV } from '../resources'

type Props = {
  children?: any
  disabled?: boolean
  fontSizeLargerScale?: number
  fontSizeLargestScale?: number
  numberOfLines?: number
  onPress?: any
  style?: any
}

export const TextLink = (props: Props) => {
  const { children, disabled, fontSizeLargerScale, fontSizeLargestScale, numberOfLines, onPress, style } = props
  const { fontScaleMode, globalTheme } = getGlobal()

  const textInputStyle = []
  if (fontScaleMode === PV.Fonts.fontScale.larger) {
    textInputStyle.push({ fontSize: fontSizeLargerScale })
  } else if (fontScaleMode === PV.Fonts.fontScale.largest) {
    textInputStyle.push({ fontSize: fontSizeLargestScale })
  }

  return (
    <TouchableOpacity disabled={disabled} onPress={onPress}>
      <Text numberOfLines={numberOfLines} style={[style, globalTheme.link, textInputStyle]}>
        {children}
      </Text>
    </TouchableOpacity>
  )
}
