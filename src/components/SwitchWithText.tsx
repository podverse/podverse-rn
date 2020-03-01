import React from 'react'
import { StyleSheet, Switch, View } from 'react-native'
import { PV } from '../resources'
import { Text } from './'

type Props = {
  onValueChange: any
  text: string
  value: boolean
}

export const SwitchWithText = (props: Props) => {
  const { onValueChange, text, value } = props

  return (
    <View style={styles.wrapper}>
      <Switch onValueChange={onValueChange} value={value} />
      <Text
        fontSizeLargestScale={PV.Fonts.largeSizes.md}
        style={styles.text}>
        {text}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    flex: 1,
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold,
    marginHorizontal: 12
  },
  wrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 12
  }
})
