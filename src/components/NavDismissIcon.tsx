import React from 'react'
import { View } from 'react-native'
import { Icon } from '.'
import { PV } from '../resources'
import { navHeader } from '../styles'

type Props = {
  onPress: any
}

export const NavDismissIcon = (props: Props) => {
  const { onPress } = props

  return (
    <View style={[navHeader.buttonWrapper]}>
      <Icon
        color='#fff'
        name='chevron-down'
        onPress={onPress}
        size={PV.Icons.NAV}
        style={navHeader.buttonIcon} />
    </View>
  )
}
