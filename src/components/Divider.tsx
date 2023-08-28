import React from 'react'
import { View, StyleProp, ViewStyle } from 'react-native'
import { useGlobal } from 'reactn'

type DividerProps = {
  children?: React.ReactNode[] | React.ReactNode | undefined
  optional?: boolean
  style?: StyleProp<ViewStyle>
}

export const Divider = (props: DividerProps) => {
  const { optional } = props
  const [globalTheme] = useGlobal('globalTheme')
  const [hideDividersInLists] = useGlobal('hideDividersInLists')

  if (hideDividersInLists && optional) {
    return null
  }

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
