import React from 'react'
import { BottomTabBar } from 'react-navigation-tabs'
import { useGlobal } from 'reactn'
import { View } from '../components'
import { GlobalTheme } from '../resources/Interfaces'
import { PlayerBar } from './PlayerBar'

type Props = {
  navigation: any
}

export const PVTabBar = (props: Props) => {
  const { navigation } = props
  const [player] = useGlobal<any>('player')
  const [globalTheme] = useGlobal<GlobalTheme>('globalTheme')

  return (
    <View>
      {
        player && player.showPlayerBar &&
          <PlayerBar navigation={navigation} />
      }
      <BottomTabBar {...props} style={globalTheme.tabbar} />
    </View>
  )
}
