import React from 'react'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
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
          <ActivityIndicator animating color={globalTheme.activityIndicatorAlternate.color} size='large' />
      ) : (
        <Text style={s.textWrapper}>{text}</Text>
      )}
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  swipeRowBack: {
    alignItems: 'flex-end',
    flex: 1,
    paddingRight: 10,
    justifyContent: 'center'
  },
  textWrapper: {
    textAlign: 'center',
    fontWeight: PV.Fonts.weights.semibold
  }
})
