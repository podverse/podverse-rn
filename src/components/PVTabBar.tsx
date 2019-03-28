import React from 'react'
import { BottomTabBar } from 'react-navigation-tabs'
import { useGlobal } from 'reactn'
import { View } from '../components'
import { Player } from './Player'

type Props = {
}

export const PVTabBar = (props: Props) => {
  const [showPlayer] = useGlobal('showPlayer')
  const [globalTheme] = useGlobal('globalTheme')

  return (
    <View>
      {showPlayer && <Player />}
      <BottomTabBar {...props} style={globalTheme.tabbar} />
    </View>
  )
}
