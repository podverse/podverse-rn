import React from 'react'
import { BottomTabBar } from 'react-navigation-tabs'
import { useGlobal } from 'reactn'
import { GlobalTheme } from 'src/resources/Interfaces'
import { View } from '../components'
import { Player } from './Player'

type Props = {
}

export const PVTabBar = (props: Props) => {
  const [showPlayer] = useGlobal<boolean>('showPlayer')
  const [globalTheme] = useGlobal<GlobalTheme>('globalTheme')

  return (
    <View>
      {showPlayer && <Player />}
      <BottomTabBar {...props} style={globalTheme.tabbar} />
    </View>
  )
}
