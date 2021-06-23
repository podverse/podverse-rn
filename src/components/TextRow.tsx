import React from 'react'
import { StyleSheet, View } from 'react-native'
import { PV } from '../resources'
import { Text } from './'

type Props = {
  label: string
  text: string
  wrapperStyle: any
}

export const TextRow = (props: Props) => {
  const {
    label,
    text,
    wrapperStyle
  } = props

  return (
    <View style={[styles.textRow, wrapperStyle]}>
      <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.label}>
        {label}{' '}
      </Text>
      <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.text}>
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
