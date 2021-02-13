import React from 'react'
import { Image } from 'react-native'
import Config from 'react-native-config'
import { PV } from '../resources'
import { NavItemWrapper } from '.'

type Props = {
  navigation: any
}

export const NavSearchIcon = (props: Props) => {
  if (Config.DISABLE_SEARCH) return null

  const { navigation } = props

  const handlePress = () => {
    navigation.navigate(PV.RouteNames.SearchScreen)
  }

  return (
    <NavItemWrapper handlePress={handlePress} testID='nav_search_icon'>
      <Image
        source={PV.Images.SEARCH}
        resizeMode='contain'
        style={{ width: 28, height: 28, tintColor: 'white', paddingHorizontal: 20 }}
      />
    </NavItemWrapper>
  )
}
