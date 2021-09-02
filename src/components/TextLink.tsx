import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { useGlobal } from 'reactn'
import { PV } from '../resources'

type Props = {
  accessible?: boolean
  accessibilityHint?: string
  disabled?: boolean
  fontSizeLargerScale?: number
  fontSizeLargestScale?: number
  numberOfLines?: number
  onPress?: any
  style?: any
  testID: string
  text: string
}

export const TextLink = (props: Props) => {
  const { accessible = true, accessibilityHint, disabled, fontSizeLargerScale,
    fontSizeLargestScale, numberOfLines, onPress, style, testID, text } = props
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
      accessibilityLabel={text}
      accessibilityRole='button'
      disabled={disabled}
      onPress={onPress}
      testID={testID ? testID.prependTestId() : ''}>
      <Text
        numberOfLines={numberOfLines}
        style={[style, globalTheme.link, textInputStyle]}>
        {text}
      </Text>
    </TouchableOpacity>
  )
}
