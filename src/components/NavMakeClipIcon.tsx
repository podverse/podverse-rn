import React from 'react'
import { PV } from '../resources'
import { navHeader } from '../styles'
import { Icon } from './'

type Props = {
  getInitialProgressValue: any
  navigation: any
}

export const NavMakeClipIcon = (props: Props) => {
  const { getInitialProgressValue, navigation } = props

  return (
    <Icon
      color='#fff'
      name='cut'
      onPress={async () => {
        const initialProgressValue = await getInitialProgressValue()
        navigation.navigate(PV.RouteNames.MakeClipScreen, {
          initialProgressValue
        })
      }}
      size={PV.Icons.NAV}
      style={navHeader.buttonIcon}
    />
  )
}
