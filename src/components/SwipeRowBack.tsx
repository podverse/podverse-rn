import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { useGlobal } from 'reactn'

type Props = {
  onPress: any
}

export const SwipeRowBack = (props: Props) => {
  const { onPress } = props
  const [globalTheme] = useGlobal('globalTheme')
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.swipeRowBack, globalTheme.swipeRowBack]}>
      <Text>Remove</Text>
    </TouchableOpacity>
  )
}

const styles = {
  swipeRowBack: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    flex: 1,
    paddingRight: 8,
    justifyContent: 'center'
  }
}
