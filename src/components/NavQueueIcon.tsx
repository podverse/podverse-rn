import React from 'react'
import { PV } from '../resources'
import { NavItemIcon, NavItemWrapper } from './'

type Props = {
  navigation: any
  showBackButton?: boolean
}

export const NavQueueIcon = (props: Props) => {
  const { navigation, showBackButton } = props

  const handlePress = () => {
    navigation.navigate({ routeName: PV.RouteNames.QueueScreen, params: { showBackButton } })
  }

  return (
    <NavItemWrapper handlePress={handlePress}>
      <NavItemIcon name='list' />
      {/*<Image
        source={PV.Images.QUEUE}
        style={[navHeader.buttonIcon, { tintColor: '#fff', width: PV.Icons.NAV, height: PV.Icons.NAV }]}
      />*/}
    </NavItemWrapper>
  )
}
