import AsyncStorage from '@react-native-community/async-storage'
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
        const isPublicString = await AsyncStorage.getItem(
          PV.Keys.MAKE_CLIP_IS_PUBLIC
        )
        let isPublic = false
        if (isPublicString) {
          isPublic = JSON.parse(isPublicString)
        }
        navigation.navigate(PV.RouteNames.MakeClipScreen, {
          initialProgressValue,
          initialPrivacy: isPublic
        })
      }}
      size={PV.Icons.NAV}
      style={navHeader.buttonIcon}
    />
  )
}
