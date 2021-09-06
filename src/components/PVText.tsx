import React from 'react'
import { AccessibilityRole, Text } from 'react-native'
import { useGlobal } from 'reactn'
import { ImportantForAccessibility } from '../lib/accessibilityHelpers'
import { PV } from '../resources'

type Props = {
  accessible?: boolean
  accessibilityHint?: string
  accessibilityLabel?: string
  accessibilityRole?: AccessibilityRole
  allowFontScaling?: boolean
  children?: any
  fontSizeLargerScale?: number
  fontSizeLargestScale?: number
  importantForAccessibility?: ImportantForAccessibility
  isNowPlaying?: boolean
  isSecondary?: any
  numberOfLines?: number
  onPress?: any
  style?: any
  testID: string
}

export const PVText = (props: Props) => {
  const { fontSizeLargerScale, fontSizeLargestScale, isNowPlaying, isSecondary,
    testID } = props
  const [globalTheme] = useGlobal('globalTheme')
  const [fontScaleMode] = useGlobal('fontScaleMode')
  const [censorNSFWText] = useGlobal('censorNSFWText')
  const globalThemeText = isSecondary
  ? globalTheme.textSecondary
  : isNowPlaying
  ? globalTheme.textNowPlaying 
  : globalTheme.text

  const textStyle = [globalThemeText, props.style]
  if (fontScaleMode === PV.Fonts.fontScale.larger && fontSizeLargerScale) {
    textStyle.push({ fontSize: fontSizeLargerScale })
  } else if (fontScaleMode === PV.Fonts.fontScale.largest && fontSizeLargestScale) {
    textStyle.push({ fontSize: fontSizeLargestScale })
  }

  return (
    <Text
      {...props}
      style={textStyle}
      {...(testID ? { testID: testID.prependTestId() } : {})}>
      {typeof props.children === 'string' ? props.children?.sanitize(censorNSFWText) : props.children}
    </Text>
  )
}
