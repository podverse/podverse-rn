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
        console.log('yep', initialProgressValue)
        navigation.navigate(PV.RouteNames.MakeClipScreen, { initialProgressValue })
      }}
      size={22}
      style={navHeader.buttonIcon} />
  )
}
