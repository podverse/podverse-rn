import React from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { ActivityIndicator } from '.'

type Props = {
  accessibilityLabel?: string
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
      accessible={false}
      importantForAccessibility='no'
      onPress={onPress}
      style={[styles, s.swipeRowBack, globalTheme.swipeRowBack]}
      testID={`${testID}_swipe_row_back`.prependTestId()}>
      {isLoading ? (
          <ActivityIndicator
            accessible={false}
            importantForAccessibility='no'
            size='large'
            testID={testID} />
      ) : (
        <Text
          accessible={false}
          importantForAccessibility='no'
          style={s.textWrapper}>
          {text}
        </Text>
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
