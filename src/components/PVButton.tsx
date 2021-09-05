import React from 'react'
import { ActivityIndicator, TouchableOpacity } from 'react-native'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { core } from '../styles'
import { Text } from '.'

type Props = {
  accessibilityHint?: string
  accessibilityLabel?: string
  accessible?: boolean
  disabled?: boolean
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
  const { accessibilityHint, accessibilityLabel, accessible, disabled, isDisabledStyle, isLoading,
    isPrimary, isSuccess, isTransparent, isWarning, onPress, testID, text, wrapperStyles } = props
  const [globalTheme] = useGlobal('globalTheme')

  const disabledStyle = disabled || isDisabledStyle ? globalTheme.buttonDisabledWrapper : null
  const disabledTextStyle = disabled || isDisabledStyle ? globalTheme.buttonDisabledText : null
  const isPrimaryStyle = isPrimary ? globalTheme.buttonPrimaryWrapper : null
  const isPrimaryTextStyle = isPrimary ? globalTheme.buttonPrimaryText : null
  const isSuccessStyle = isSuccess ? globalTheme.buttonSuccessWrapper : null
  const isSuccessTextStyle = isSuccess ? globalTheme.buttonSuccessText : null
  const isWarningStyle = isWarning ? globalTheme.buttonWarningWrapper : null
  const isWarningTextStyle = isWarning ? globalTheme.buttonWarningText : null
  const isTransparentStyle = isTransparent ? globalTheme.buttonTransparentWrapper : null

  return (
    <TouchableOpacity
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
            isPrimaryTextStyle,
            isSuccessTextStyle,
            isWarningTextStyle
          ]}>
          {text}
        </Text>
      )}
    </TouchableOpacity>
  )
}
