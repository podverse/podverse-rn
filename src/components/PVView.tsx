import React from 'react'
import { View } from 'react-native'
import { useGlobal } from 'reactn'

export const PVView = (props: any) => {
  const [globalTheme] = useGlobal('globalTheme')
  return <View {...props} style={[globalTheme.view, props.style]}>{props.children}</View>
}
