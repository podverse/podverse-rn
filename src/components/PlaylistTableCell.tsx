import React from 'react'
import { StyleSheet } from 'react-native'
import { PV } from '../resources'
import { Text, View } from './'

type Props = {
  itemsTotal?: number
  title?: string
}

export const PlaylistTableCell = (props: Props) => {
  const { itemsTotal = 0, title } = props

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
      <Text
        isSecondary={true}
        style={styles.itemsTotal}>
        items: {itemsTotal}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  itemsTotal: {
    fontSize: PV.Fonts.sizes.md
  },
  title: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.semibold
  },
  wrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 50,
    justifyContent: 'space-between',
    paddingLeft: 8,
    paddingRight: 8
  }
})
