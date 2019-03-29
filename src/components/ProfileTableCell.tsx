import React from 'react'
import { StyleSheet } from 'react-native'
import { PV } from '../resources'
import { Text, View } from './'

type Props = {
  title?: string
}

export const ProfileTableCell = (props: Props) => {
  const { title } = props

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold
  },
  wrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 50,
    paddingLeft: 8,
    paddingRight: 8
  }
})
