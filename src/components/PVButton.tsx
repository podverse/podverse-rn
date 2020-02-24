import React from 'react'
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native'
import { useGlobal } from 'reactn'
import { core } from '../styles'

type Props = {
  disabled?: boolean
  isLoading?: boolean
  isSuccess?: boolean
  isWarning?: boolean
  onPress: any
  text: string
  wrapperStyles: any
}

export const PVButton = (props: Props) => {
  const { disabled, isLoading, isSuccess, isWarning, onPress, text, wrapperStyles } = props
  const [globalTheme] = useGlobal('globalTheme')

  const disabledStyle = disabled ? globalTheme.buttonDisabledWrapper : null
  const disabledTextStyle = disabled ? globalTheme.buttonDisabledText : null
  const isSuccessStyle = isSuccess ? globalTheme.buttonSuccessWrapper : null
  const isSuccessTextStyle = isSuccess ? globalTheme.buttonSuccessText : null
  const isWarningStyle = isWarning ? globalTheme.buttonWarningWrapper : null
  const isWarningTextStyle = isWarning ? globalTheme.buttonWarningText : null

  return (
    <TouchableOpacity
      style={[core.button, globalTheme.buttonPrimaryWrapper, disabledStyle, wrapperStyles, isWarningStyle, isSuccessStyle]}
      disabled={disabled || isLoading}
      onPress={onPress}>
      {isLoading ? (
        <ActivityIndicator
          animating={true}
          color={globalTheme.buttonPrimaryText.color}
          size='small' />
      ) : (
        <Text style={[core.buttonText, globalTheme.buttonPrimaryText, disabledTextStyle, isWarningTextStyle, isSuccessTextStyle]}>
          {text}
        </Text>
      )}
    </TouchableOpacity>
  )
}
