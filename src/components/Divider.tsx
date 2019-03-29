import React from 'react'
import { View } from 'react-native'
import { useGlobal } from 'reactn'

export const Divider = (props: any) => {
  const [globalTheme] = useGlobal('globalTheme')
  let noMargin = {}
  if (props.noMargin) {
    noMargin = {
      marginBottom: 0,
      marginTop: 0
    }
  }
  return <View {...props} style={[styles.divider, props.style, noMargin, globalTheme.divider]}>{props.children}</View>
}

const styles = {
  divider: {
    height: 1,
    marginBottom: 10,
    marginTop: 10
  }
}
