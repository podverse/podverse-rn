import { TouchableOpacity } from 'react-native'
import React, { useGlobal } from 'reactn'
import { testProps } from '../lib/utility'
import { PV } from '../resources'
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
  const [fontScaleMode] = useGlobal('fontScaleMode')

  const buttonTextStyle = [navHeader.buttonText]
  if (fontScaleMode === PV.Fonts.fontScale.larger) {
    buttonTextStyle.push({ fontSize: PV.Fonts.largeSizes.sm })
  } else if (fontScaleMode === PV.Fonts.fontScale.largest) {
    buttonTextStyle.push({ fontSize: PV.Fonts.largeSizes.md })
  }

  if (color) {
    buttonTextStyle.push({ color })
  }

  return (
    <TouchableOpacity
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={handlePress}
      {...testProps(`${testID}_nav_header_button_text`)}>
      <Text style={buttonTextStyle} testID={`${testID}_text`}>
        {props.text}
      </Text>
    </TouchableOpacity>
  )
}
