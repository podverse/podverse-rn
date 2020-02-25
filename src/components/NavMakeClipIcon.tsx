import React from 'react'
import { View } from 'react-native'
import { getMakeClipIsPublic } from '../lib/utility'
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
    <View style={navHeader.buttonWrapper}>
      <Icon
        color='#fff'
        name='cut'
        onPress={async () => {
          const initialProgressValue = await getInitialProgressValue()
          const isPublic = await getMakeClipIsPublic()
          navigation.navigate(PV.RouteNames.MakeClipScreen, {
            initialProgressValue,
            initialPrivacy: isPublic
          })
        }}
        size={PV.Icons.NAV}
        style={navHeader.buttonIcon} />
    </View>
  )
}
