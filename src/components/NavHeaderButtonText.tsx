import { TouchableOpacity } from 'react-native'
import React from 'reactn'
import { navHeader } from '../styles'
import { Text } from './'

type Props = {
  accessibilityHint?: string
  accessibilityLabel?: string
  color?: string
  disabled?: boolean
  handlePress: any
  style?: any
  testID: string
  text: string
}

export const NavHeaderButtonText = (props: Props) => {
  const { accessibilityHint, accessibilityLabel, color, disabled, handlePress,
    testID, text } = props

  const buttonTextStyle = [navHeader.buttonText]

  if (color) {
    buttonTextStyle.push({ color })
  }

  return (
    <TouchableOpacity
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={handlePress}
      testID={`${testID}_nav_header_button_text`.prependTestId()}>
      <Text allowFontScaling={false} style={buttonTextStyle} testID={`${testID}_text`}>
        {text}
      </Text>
    </TouchableOpacity>
  )
}
