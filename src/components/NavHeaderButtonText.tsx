import React from 'react'
import { Text, View } from 'react-native'
import { getGlobal } from 'reactn'
import { PV } from '../resources'
import { navHeader } from '../styles'

type Props = {
  style?: any
  text: string
}

export const NavHeaderButtonText = (props: Props) => {
  const { fontScaleMode } = getGlobal()

  const buttonTextStyle = [navHeader.buttonText]
  if (fontScaleMode === PV.Fonts.fontScale.larger) {
    buttonTextStyle.push({ fontSize: PV.Fonts.largeSizes.xl })
  } else if (fontScaleMode === PV.Fonts.fontScale.largest) {
    buttonTextStyle.push({ fontSize: PV.Fonts.largeSizes.tiny })
  }

  return (
    <View style={[navHeader.buttonWrapper, props.style]}>
      <Text style={buttonTextStyle}>{props.text}</Text>
    </View>
  )
}
