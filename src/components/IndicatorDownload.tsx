import React from 'react'
import { View } from 'react-native'
import { getGlobal } from 'reactn'
import { PV } from '../resources'
import { Icon } from '.'

type Props = {
  style?: any
}

export const IndicatorDownload = (props: Props) => {
  const { style } = props

  const { fontScaleMode } = getGlobal()
  let size = 12
  if (PV.Fonts.fontScale.large === fontScaleMode) {
    size = 14
  } else if (PV.Fonts.fontScale.larger === fontScaleMode || PV.Fonts.fontScale.largest === fontScaleMode) {
    size = 16
  }

  return (
    <View
      accessible={false}
      importantForAccessibility='no-hide-descendants'
      style={style}>
      <Icon
        accessible={false}
        isSecondary
        name='download'
        size={size} />
    </View>
  )
}
