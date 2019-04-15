import React from 'react'
import { StyleSheet } from 'react-native'
import { PV } from '../resources'
import { Text, View } from './'

type Props = {
  name?: string
}

export const ProfileTableCell = (props: Props) => {
  const { name } = props

  return (
    <View style={styles.wrapper}>
      <Text style={styles.name}>{name || 'anonymous'}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  name: {
    fontSize: PV.Fonts.sizes.lg,
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
