import React from 'react'
import { StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { PV } from '../resources'
import { Text, View } from './'

type Props = {
  name?: string
  onPress?: any
}

export const ProfileTableCell = (props: Props) => {
  const { name, onPress } = props

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.wrapper}>
        <Text style={styles.name}>{name || 'anonymous'}</Text>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  name: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.semibold
  },
  wrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 50,
    paddingLeft: 8,
    paddingRight: 8
  }
})
