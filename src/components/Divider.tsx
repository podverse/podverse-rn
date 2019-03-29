import React from 'react'
import { View } from 'react-native'
import { useGlobal } from 'reactn'

export const Divider = (props: any) => {
  const [globalTheme] = useGlobal('globalTheme')
  return <View {...props} style={[props.style, styles.divider, globalTheme.divider]}>{props.children}</View>
}

const styles = {
  divider: {
    height: 1,
    marginBottom: 10,
    marginTop: 10
  }
}
