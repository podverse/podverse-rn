import { TouchableOpacity } from 'react-native'
import React, { getGlobal, useGlobal } from 'reactn'
import { PV } from '../resources'
import { navHeader } from '../styles'
import { Text } from './'

type Props = {
  disabled?: boolean
  handlePress: any
  style?: any
  text: string
}

export const NavHeaderButtonText = (props: Props) => {
  const { disabled, handlePress } = props
  const [fontScaleMode] = useGlobal('fontScaleMode')

  const buttonTextStyle = [navHeader.buttonText]
  if (fontScaleMode === PV.Fonts.fontScale.larger) {
    buttonTextStyle.push({ fontSize: PV.Fonts.largeSizes.xl })
  } else if (fontScaleMode === PV.Fonts.fontScale.largest) {
    buttonTextStyle.push({ fontSize: PV.Fonts.largeSizes.md })
  }

  return (
    <TouchableOpacity disabled={disabled} onPress={handlePress}>
      <Text style={buttonTextStyle}>{props.text}</Text>
    </TouchableOpacity>
  )
}
