import React from 'react'
import { Image } from 'react-native'
import { PV } from '../resources'
import { navHeader } from '../styles'
import { NavItemWrapper } from './'
import { DownloadsActiveBadge } from './DownloadsActiveBadge'

type Props = {
  navigation: any
}

export const NavMoreButton = (props: Props) => {
  const { navigation } = props

  const handlePress = () => {
    navigation.navigate(PV.RouteNames.MoreScreen)
  }

  return (
    <NavItemWrapper handlePress={handlePress}>
      <Image
        source={PV.Images.MORE}
        style={[navHeader.buttonIcon, { tintColor: '#fff', transform: [{ rotate: '90deg' }] }]}
        resizeMode={'contain'}
      />
      <DownloadsActiveBadge />
    </NavItemWrapper>
  )
}
