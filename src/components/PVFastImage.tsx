import React from 'react'
import { View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { Icon } from '.'

type Props = {
  isSmall?: boolean
  pvKey?: string
  resizeMode?: any
  source?: string
  styles?: any
}

export const PVFastImage = (props: Props) => {
  const { isSmall, pvKey, resizeMode = 'contain', source, styles } = props

  return (
    <>
      {
        source ?
          <FastImage
            key={pvKey}
            resizeMode={resizeMode}
            source={{ uri: source }}
            style={styles} />
          :
          <View style={{
            ...styles,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon
              isSecondary={true}
              name='podcast'
              size={isSmall ? 32 : 36} />
          </View>
      }
    </>
  )
}
