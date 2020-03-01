import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { getGlobal } from 'reactn'
import { PV } from '../resources'
import { navHeader } from '../styles'

type Props = {
  disabled?: boolean
  handlePress: any
  style?: any
  text: string
}

export const NavHeaderButtonText = (props: Props) => {
  const { disabled, handlePress } = props
  const { fontScaleMode } = getGlobal()

  const buttonTextStyle = [navHeader.buttonText]
  if (fontScaleMode === PV.Fonts.fontScale.larger) {
    buttonTextStyle.push({ fontSize: PV.Fonts.largeSizes.xl })
  } else if (fontScaleMode === PV.Fonts.fontScale.largest) {
    buttonTextStyle.push({ fontSize: PV.Fonts.largeSizes.md })
  }

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={handlePress}>
      <View style={[navHeader.buttonWrapper, props.style]}>
        <Text style={buttonTextStyle}>{props.text}</Text>
      </View>
    </TouchableOpacity>
  )
}
