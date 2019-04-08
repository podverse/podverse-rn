import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { useGlobal } from 'reactn'

type Props = {
  onPress: any,
  styles?: any
}

export const SwipeRowBack = (props: Props) => {
  const { onPress, styles } = props
  const [globalTheme] = useGlobal('globalTheme')
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles, s.swipeRowBack, globalTheme.swipeRowBack]}>
      <Text>Remove</Text>
    </TouchableOpacity>
  )
}

const s = {
  swipeRowBack: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    flex: 1,
    paddingRight: 8,
    justifyContent: 'center'
  }
}
