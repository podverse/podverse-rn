import React from 'react'
import { StyleSheet, Switch, View } from 'react-native'
import { getGlobal } from 'reactn'
import { PV } from '../resources'
import { Text } from './'

type Props = {
  onValueChange: any
  text: string
  value: boolean
}

export const SwitchWithText = (props: Props) => {
  const { onValueChange, text, value } = props
  const { fontScaleMode } = getGlobal()

  const textStyle = PV.Fonts.fontScale.largest === fontScaleMode ?
    [styles.text, { fontSize: 9 }] :
    [styles.text]

  return (
    <View style={styles.wrapper}>
      <Switch onValueChange={onValueChange} value={value} />
      <Text style={textStyle}>{text}</Text>
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
