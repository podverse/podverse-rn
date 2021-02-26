import { TouchableOpacity } from 'react-native'
import React from 'reactn'
import { testProps } from '../lib/utility'
import { navHeader } from '../styles'
import { Text } from './'

type Props = {
  accessibilityLabel?: string
  color?: string
  disabled?: boolean
  handlePress: any
  style?: any
  testID: string
  text: string
}

export const NavHeaderButtonText = (props: Props) => {
  const { accessibilityLabel, color, disabled, handlePress, testID } = props

  const buttonTextStyle = [navHeader.buttonText]

  if (color) {
    buttonTextStyle.push({ color })
  }

  return (
    <TouchableOpacity
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={handlePress}
      {...testProps(`${testID}_nav_header_button_text`)}>
      <Text allowFontScaling={false} style={buttonTextStyle} testID={`${testID}_text`}>
        {props.text}
      </Text>
    </TouchableOpacity>
  )
}
