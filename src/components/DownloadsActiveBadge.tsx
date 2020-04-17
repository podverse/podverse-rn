import React from 'react'
import { View } from 'react-native'
import { Badge } from 'react-native-elements'
import { useGlobal } from 'reactn'
import { PV } from '../resources'

export const DownloadsActiveBadge = () => {
  const [downloadsActive] = useGlobal('downloadsActive')
  const [fontScaleMode] = useGlobal('fontScaleMode')
  let downloadsActiveCount = 0
  for (const id of Object.keys(downloadsActive)) {
    if (downloadsActive[id]) downloadsActiveCount++
  }

  return (
    <View
      style={{
        position: 'absolute',
        top: -5,
        left: -5,
        zIndex: 1000000
      }}>
      {downloadsActiveCount > 0 &&
        fontScaleMode !== PV.Fonts.fontScale.larger &&
        fontScaleMode !== PV.Fonts.fontScale.largest && (
          <Badge
            badgeStyle={{ borderWidth: 0 }}
            textStyle={{ fontSize: PV.Fonts.sizes.sm }}
            status={'error'}
            value={downloadsActiveCount}
          />
        )}
    </View>
  )
}
