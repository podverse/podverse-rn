import React from 'react'
import { BottomTabBar } from 'react-navigation-tabs'
import { useGlobal } from 'reactn'
import { SafeAreaView } from '../components'
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
    <SafeAreaView style={{ flex: 0 }} testID='tabbar'>
      {player && player.showMiniPlayer && <MiniPlayer navigation={navigation} />}
      <BottomTabBar
        {...props}
        activeTintColor={PV.Colors.skyLight}
        inactiveTintColor={PV.Colors.white}
        style={darkTheme.tabbar}
        labelPosition='below-icon'
      />
    </SafeAreaView>
  )
}
