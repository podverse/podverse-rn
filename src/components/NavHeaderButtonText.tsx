import { TouchableOpacity } from 'react-native'
import React from 'reactn'
import { navHeader } from '../styles'
import { Text } from './'

type Props = {
  accessibilityHint?: string
  color?: string
  disabled?: boolean
  handlePress: any
  style?: any
  testID: string
  text: string
}

export const NavHeaderButtonText = (props: Props) => {
  const { accessibilityHint, color, disabled, handlePress, testID } = props

  const buttonTextStyle = [navHeader.buttonText]

  if (color) {
    buttonTextStyle.push({ color })
  }

  return (
    <TouchableOpacity
      accessibilityHint={accessibilityHint}
      disabled={disabled}
      onPress={handlePress}
      testID={`${testID}_nav_header_button_text`.prependTestId()}>
      <Text allowFontScaling={false} style={buttonTextStyle} testID={`${testID}_text`}>
        {props.text}
      </Text>
    </TouchableOpacity>
  )
}
