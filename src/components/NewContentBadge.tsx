import React from 'react'
import { View } from 'react-native'
import { Badge } from 'react-native-elements'
import { PV } from '../resources'

type Props = {
  count: number
  isPodcastTableCell?: boolean
}

export const NewContentBadge = (props: Props) => {
  const { count, isPodcastTableCell } = props

  const hasCount = count > 0

  if (!hasCount) return null

  let viewStyle = {
    position: 'absolute',
    bottom: 1,
    right: 1,
    zIndex: 1000000
  } as any

  if (isPodcastTableCell) {
    viewStyle = {
      flex: 1,
      alignItems: 'flex-end',
      marginRight: 8,
      marginTop: -3
    }
  }

  return (
    <View style={viewStyle}>
      <Badge
        badgeStyle={{
          borderRadius: 100,
          borderWidth: 1,
          borderColor: PV.Colors.skyLight,
          backgroundColor: PV.Colors.ink,
          minWidth: 23,
          minHeight: 23
        }}
        textStyle={{
          fontSize: PV.Fonts.sizes.tiny,
          color: PV.Colors.white,
          marginTop: 0,
          paddingHorizontal: 4
        }}
        status={'error'}
        {...(count ? { value: count.toString() } : {})}
      />
    </View>
  )
}
