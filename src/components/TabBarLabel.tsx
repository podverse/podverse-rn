
import React from 'react'
import { Text } from 'react-native'
import { getGlobal } from 'reactn'
import { PV } from '../resources'
import { tabbar } from '../styles'

type Props = {
  title?: any
}

export const TabBarLabel = (props: Props) => {
  const { title } = props
  const { fontScaleMode, globalTheme } = getGlobal()
  return (
    PV.Fonts.fontScale.largest !== fontScaleMode ?
      (
        <Text
          numberOfLines={1}
          style={[tabbar.label, globalTheme.tabbarLabel]}>
          {title}
        </Text>
      ) :
      <></>
  )
}
