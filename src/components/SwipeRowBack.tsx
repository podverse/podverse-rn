import React from 'react'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useGlobal } from 'reactn'
import { testProps } from '../lib/utility'

type Props = {
  isLoading?: boolean
  onPress: any
  styles?: any
  testID: string
  text?: string
}

export const SwipeRowBack = (props: Props) => {
  const { isLoading, onPress, styles, testID, text = 'Remove' } = props
  const [globalTheme] = useGlobal('globalTheme')

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles, s.swipeRowBack, globalTheme.swipeRowBack]}
      {...testProps(`${testID}_swipe_row_back`)}>
      {isLoading ? (
        <View style={s.textWrapper}>
          <ActivityIndicator animating={true} color={globalTheme.activityIndicatorAlternate.color} size='large' />
        </View>
      ) : (
        <Text style={s.textWrapper}>{text}</Text>
      )}
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  swipeRowBack: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    flex: 1,
    paddingRight: 8,
    justifyContent: 'center'
  },
  textWrapper: {
    textAlign: 'center',
    width: 82
  }
})
