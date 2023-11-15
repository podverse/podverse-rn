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
  children?: string
  fontSizeLargerScale?: number
  fontSizeLargestScale?: number
  importantForAccessibility?: ImportantForAccessibility
  isNowPlaying?: boolean
  isSecondary?: boolean
  numberOfLines?: number
  onPress?: any
  selectable?: boolean
  style?: any
  testID: string
}

export const PVText = (props: Props) => {
  const {
    accessible,
    accessibilityHint,
    accessibilityLabel,
    accessibilityRole,
    allowFontScaling,
    children,
    fontSizeLargerScale,
    fontSizeLargestScale,
    importantForAccessibility,
    isNowPlaying,
    isSecondary,
    numberOfLines,
    onPress,
    selectable,
    style,
    testID
  } = props
  const [globalTheme] = useGlobal('globalTheme')
  const [fontScaleMode] = useGlobal('fontScaleMode')
  const [censorNSFWText] = useGlobal('censorNSFWText')
  const globalThemeText = isSecondary
    ? globalTheme.textSecondary
    : isNowPlaying
    ? globalTheme.textNowPlaying
    : globalTheme.text

  const textStyle = [globalThemeText, style]
  if (fontScaleMode === PV.Fonts.fontScale.larger && fontSizeLargerScale) {
    textStyle.push({ fontSize: fontSizeLargerScale })
  } else if (fontScaleMode === PV.Fonts.fontScale.largest && fontSizeLargestScale) {
    textStyle.push({ fontSize: fontSizeLargestScale })
  }

  const isValidTextNode = typeof children === 'string'

  return isValidTextNode ? (
    <Text
      accessible={accessible}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      allowFontScaling={allowFontScaling}
      importantForAccessibility={importantForAccessibility}
      numberOfLines={numberOfLines}
      onPress={onPress}
      selectable={selectable}
      style={textStyle}
      {...(testID ? { testID: testID.prependTestId() } : {})}>
      {children.toString().sanitize(censorNSFWText)}
    </Text>
  ) : null
}
