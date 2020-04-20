import React from 'react'
import { GlobalTheme } from '../../src/resources/Interfaces'
import { darkTheme } from '../../src/styles'
import { PV } from '../resources'
import { NavItemIcon, NavItemWrapper } from './'

type Props = {
  navigation: any
  showBackButton?: boolean
  globalTheme: GlobalTheme
}

export const NavQueueIcon = (props: Props) => {
  const { navigation, showBackButton } = props

  const handlePress = () => {
    navigation.navigate({ routeName: PV.RouteNames.QueueScreen, params: { showBackButton } })
  }

  let color = darkTheme.text.color
  if (props.globalTheme) {
    color = props.globalTheme?.text?.color
  }

  return (
    <NavItemWrapper handlePress={handlePress}>
      <NavItemIcon name='list' color={color} />
      {/*<Image
        source={PV.Images.QUEUE}
        style={[navHeader.buttonIcon, { tintColor: '#fff', width: PV.Icons.NAV, height: PV.Icons.NAV }]}
      />*/}
    </NavItemWrapper>
  )
}
