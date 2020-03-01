import React from 'react'
import { Text } from 'react-native'
import { getGlobal } from 'reactn'
import { PV } from '../resources'

type Props = {
  children?: any
  fontSizeLargerScale?: number
  fontSizeLargestScale?: number
  isSecondary?: any
  numberOfLines?: number
  onPress?: any
  style?: any
}

export const PVText = (props: Props) => {
  const { fontSizeLargerScale, fontSizeLargestScale, isSecondary } = props
  const { fontScaleMode, globalTheme } = getGlobal()
  const globalThemeText = isSecondary
    ? globalTheme.textSecondary
    : globalTheme.text

  const textStyle = [globalThemeText, props.style]
  if (fontScaleMode === PV.Fonts.fontScale.larger) {
    textStyle.push({ fontSize: fontSizeLargerScale })
  } else if (fontScaleMode === PV.Fonts.fontScale.largest) {
    textStyle.push({ fontSize: fontSizeLargestScale })
  }

  return (
    <Text {...props} style={textStyle}>
      {props.children}
    </Text>
  )
}
