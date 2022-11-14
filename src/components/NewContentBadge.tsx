import React from 'reactn'
import { View } from 'react-native'
import { Badge } from 'react-native-elements'
import { PV } from '../resources'

type Props = {
  count?: number
  isNewUnplayedContent?: boolean
  isPodcastTableCell?: boolean
  isTabletGridView?: boolean
}

export const NewContentBadge = (props: Props) => {
  const { count, isNewUnplayedContent, isPodcastTableCell, isTabletGridView } = props

  const hasCount = count && count > 0

  if (!hasCount && !isNewUnplayedContent) return null

  let viewStyle = {} as any
  let size = isTabletGridView ? 36 : 23
  const fontSize = isTabletGridView ? PV.Fonts.sizes.lg : PV.Fonts.sizes.tiny
  let backgroundColor = PV.Colors.ink
  const borderColor = PV.Colors.skyLight

  if (isPodcastTableCell) {
    viewStyle = {
      position: 'absolute',
      bottom: 1,
      right: 1,
      zIndex: 1000000,
      flex: 1,
      alignItems: 'flex-end',
      marginRight: 8,
      marginTop: -3
    }
  } else if (isNewUnplayedContent) {
    size = 15
    backgroundColor = PV.Colors.skyLight
    viewStyle = {
      alignItems: 'center',
      flex: 0,
      justifyContent: 'center',
      marginLeft: 4
    }
  } else {
    viewStyle = {
      position: 'absolute',
      bottom: 1,
      right: 1,
      zIndex: 1000000
    }
  }

  return (
    <View style={viewStyle}>
      <Badge
        badgeStyle={{
          borderRadius: 100,
          borderWidth: 1,
          borderColor,
          backgroundColor,
          minWidth: size,
          minHeight: size
        }}
        textStyle={{
          fontSize,
          color: PV.Colors.white,
          marginTop: 0,
          paddingHorizontal: 4
        }}
        status={'error'}
        {...(count && !isNewUnplayedContent ? { value: count.toString() } : {})}
      />
    </View>
  )
}
