import React from 'react'
import { Text } from 'react-native'
import { tabbar } from '../styles'

type Props = {
  focused?: boolean
  title?: any
}

export const TabBarLabel = (props: Props) => {
  const { title } = props

  return (
    <Text
      allowFontScaling={false}
      numberOfLines={1}
      style={tabbar.labelLight}>
      {title}
    </Text>
  )
}
