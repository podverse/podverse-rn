import React from 'react'
import { StyleSheet, View } from 'react-native'
import { PV } from '../resources'
import { Text } from './'

type Props = {
  label: string
  testID: string
  text: string
  wrapperStyle?: any
}

export const TextRow = (props: Props) => {
  const {
    label,
    testID,
    text,
    wrapperStyle = {}
  } = props

  return (
    <View style={[styles.textRow, wrapperStyle]}>
      <Text
        fontSizeLargestScale={PV.Fonts.largeSizes.md}
        style={styles.label}
        testID={`${testID}_label`}>
        {label}{' '}
      </Text>
      <Text
        fontSizeLargestScale={PV.Fonts.largeSizes.md}
        style={styles.text}
        testID={`${testID}_text`}>
        {text}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  label: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  },
  text: {
    fontSize: PV.Fonts.sizes.xl
  },
  textRow: {
    flexDirection: 'row',
    marginBottom: 4
  }
})
