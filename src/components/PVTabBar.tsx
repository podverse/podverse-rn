import React from 'react'
import { BottomTabBar } from 'react-navigation-tabs'
import { useGlobal } from 'reactn'
import { View } from '../components'
import { PV } from '../resources'
import { darkTheme } from '../styles'
import { MiniPlayer } from './MiniPlayer'

type Props = {
  navigation: any
}

export const PVTabBar = (props: Props) => {
  const { navigation } = props
  const [player] = useGlobal<any>('player')

  return (
    <View>
      {player && player.showMiniPlayer && player.nowPlayingItem && <MiniPlayer navigation={navigation} />}
      <BottomTabBar
        {...props}
        activeTintColor={PV.Colors.blueLighter}
        inactiveTintColor={PV.Colors.grayLight}
        labelStyle={{
          fontSize: PV.Fonts.sizes.tiny
        }}
        style={darkTheme.tabbar}
      />
    </View>
  )
}
