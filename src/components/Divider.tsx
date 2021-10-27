import React from 'react'
import { View, StyleProp, ViewStyle } from 'react-native'
import { useGlobal } from 'reactn'

type DividerProps = {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode[] | React.ReactNode | undefined;
}

export const Divider = (props: DividerProps) => {
  const [globalTheme] = useGlobal('globalTheme')
  return (
    <View {...props} style={[styles.divider, globalTheme.divider, props.style]}>
      {props.children}
    </View>
  )
}

const styles = {
  divider: {
    height: 1
  }
}
