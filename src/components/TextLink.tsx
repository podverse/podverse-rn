import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { useGlobal } from 'reactn'
import { PV } from '../resources'

type Props = {
  accessible?: boolean
  accessibilityHint?: string
  children?: any
  disabled?: boolean
  fontSizeLargerScale?: number
  fontSizeLargestScale?: number
  numberOfLines?: number
  onPress?: any
  style?: any
  testID: string
}

export const TextLink = (props: Props) => {
  const { accessible = true, accessibilityHint, children, disabled,
    fontSizeLargerScale, fontSizeLargestScale, numberOfLines, onPress, style } = props
  const [globalTheme] = useGlobal('globalTheme')
  const [fontScaleMode] = useGlobal('fontScaleMode')

  const textInputStyle = []
  if (fontScaleMode === PV.Fonts.fontScale.larger) {
    textInputStyle.push({ fontSize: fontSizeLargerScale })
  } else if (fontScaleMode === PV.Fonts.fontScale.largest) {
    textInputStyle.push({ fontSize: fontSizeLargestScale })
  }

  return (
    <TouchableOpacity
      accessible={accessible}
      accessibilityHint={accessibilityHint}
      accessibilityRole='button'
      disabled={disabled}
      onPress={onPress}>
      <Text
        numberOfLines={numberOfLines}
        style={[style, globalTheme.link, textInputStyle]}>
        {children}
      </Text>
    </TouchableOpacity>
  )
}
