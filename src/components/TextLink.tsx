import React from 'react'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { PressableWithOpacity, Text } from '.'

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
  const {
    accessible = true,
    accessibilityHint,
    disabled,
    fontSizeLargerScale,
    fontSizeLargestScale,
    numberOfLines,
    onPress,
    style,
    testID,
    text
  } = props
  const [globalTheme] = useGlobal('globalTheme')
  const [fontScaleMode] = useGlobal('fontScaleMode')

  const textInputStyle = []
  if (fontScaleMode === PV.Fonts.fontScale.larger) {
    textInputStyle.push({ fontSize: fontSizeLargerScale })
  } else if (fontScaleMode === PV.Fonts.fontScale.largest) {
    textInputStyle.push({ fontSize: fontSizeLargestScale })
  }

  return (
    <PressableWithOpacity
      accessible={accessible}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={text}
      accessibilityRole='button'
      disabled={disabled}
      onPress={onPress}
      testID={testID ? testID.prependTestId() : ''}>
      <Text numberOfLines={numberOfLines} style={[globalTheme.link, textInputStyle, style]}>
        {text}
      </Text>
    </PressableWithOpacity>
  )
}
