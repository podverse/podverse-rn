import React from 'react'
import { BottomTabBar } from 'react-navigation-tabs'
import { useGlobal } from 'reactn'
import { GlobalTheme } from 'src/resources/Interfaces'
import { View } from '../components'
import { Player } from './NowPlayingBar'

type Props = {}

export const PVTabBar = (props: Props) => {
  const [player] = useGlobal<any>('player')
  const [globalTheme] = useGlobal<GlobalTheme>('globalTheme')

  return (
    <View>
      {
        player && player.showPlayer && <Player />
      }
      <BottomTabBar {...props} style={globalTheme.tabbar} />
    </View>
  )
}
