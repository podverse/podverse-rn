import React from 'react'
import { ActivityIndicator } from 'react-native'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { core } from '../styles'
import { PressableWithOpacity, Text } from '.'

type Props = {
  accessibilityHint?: string
  accessibilityLabel?: string
  accessible?: boolean
  disabled?: boolean
  hasBorder?: boolean
  isDisabledStyle?: boolean
  isLoading?: boolean
  isPrimary?: boolean
  isSuccess?: boolean
  isTransparent?: boolean
  isWarning?: boolean
  onPress: any
  testID: string
  text: string
  wrapperStyles: any
}

export const PVButton = (props: Props) => {
  const {
    accessibilityHint,
    accessibilityLabel,
    accessible,
    disabled,
    hasBorder,
    isDisabledStyle,
    isLoading,
    isPrimary,
    isSuccess,
    isTransparent,
    isWarning,
    onPress,
    testID,
    text,
    wrapperStyles
  } = props
  const [globalTheme] = useGlobal('globalTheme')

  const disabledStyle = disabled || isDisabledStyle ? globalTheme.buttonDisabledWrapper : null
  const disabledTextStyle = disabled || isDisabledStyle ? globalTheme.buttonDisabledText : null
  const isPrimaryStyle = isPrimary ? globalTheme.buttonPrimaryWrapper : null
  const isPrimaryTextStyle = isPrimary ? globalTheme.buttonPrimaryText : null
  const isSuccessStyle = isSuccess ? globalTheme.buttonSuccessWrapper : null
  const isSuccessTextStyle = isSuccess ? globalTheme.buttonSuccessText : null
  const isWarningStyle = isWarning ? globalTheme.buttonWarningWrapper : null
  const isWarningTextStyle = isWarning ? globalTheme.buttonWarningText : null
  const isTransparentStyle = isTransparent || hasBorder ? globalTheme.buttonTransparentWrapper : null
  const hasBorderStyle = hasBorder ? core.buttonBorder : null

  return (
    <PressableWithOpacity
      accessible={accessible}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole='button'
      style={[
        core.button,
        globalTheme.buttonPrimaryWrapper,
        disabledStyle,
        isPrimaryStyle,
        isSuccessStyle,
        isWarningStyle,
        isTransparentStyle,
        hasBorderStyle,
        wrapperStyles
      ]}
      disabled={disabled || isLoading}
      onPress={onPress}
      {...(testID ? { testID: `${testID}_button`.prependTestId() } : {})}>
      {isLoading ? (
        <ActivityIndicator animating color={globalTheme.buttonPrimaryText.color} size='small' />
      ) : (
        <Text
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          importantForAccessibility='no'
          style={[
            core.buttonText,
            globalTheme.buttonPrimaryText,
            disabledTextStyle,
            hasBorderStyle,
            isPrimaryTextStyle,
            isSuccessTextStyle,
            isWarningTextStyle
          ]}>
          {text}
        </Text>
      )}
    </PressableWithOpacity>
  )
}
