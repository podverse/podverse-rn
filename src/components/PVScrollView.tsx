import React from 'react'
import { ScrollView } from 'react-native'
import { useGlobal } from 'reactn'

export const PVScrollView = (props: any) => {
  const [globalTheme] = useGlobal('globalTheme')
  return (
    <ScrollView style={[props.style, globalTheme.view]}>{props.children}</ScrollView>
  )
}
