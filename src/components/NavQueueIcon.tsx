import React from 'react'
import { Image } from 'react-native'
import { PV } from '../resources'
import { navHeader } from '../styles'
import { NavItemWrapper } from './'

type Props = {
  navigation: any
  useThemeTextColor?: boolean
  showBackButton?: boolean
}

export const NavQueueIcon = (props: Props) => {
  const { navigation, useThemeTextColor, showBackButton } = props

  const handlePress = () => {
    navigation.navigate({ routeName: PV.RouteNames.QueueScreen, params: { showBackButton } })
  }

  const color = useThemeTextColor ? '' : '#fff'
  return (
    <NavItemWrapper handlePress={handlePress}>
      <Image
        source={PV.Images.QUEUE}
        style={[navHeader.buttonIcon, { tintColor: '#fff', width: PV.Icons.NAV, height: PV.Icons.NAV }]}
      />
    </NavItemWrapper>
  )
}
