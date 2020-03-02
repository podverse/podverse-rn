import React from 'react'
import { Text } from 'react-native'
import { getGlobal } from 'reactn'
import { tabbar } from '../styles'

type Props = {
  title?: any
}

export const TabBarLabel = (props: Props) => {
  const { title } = props
  const { globalTheme } = getGlobal()

  return (
    <Text allowFontScaling={false} numberOfLines={1} style={[tabbar.label, globalTheme.tabbarLabel]}>
      {title}
    </Text>
  )
}
