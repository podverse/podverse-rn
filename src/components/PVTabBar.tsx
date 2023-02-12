import React from 'react'
// import { BottomTabBar } from '@react-navigation/bottom-tabs'
import { useGlobal } from 'reactn'
import { SafeAreaView } from '../components'
import { MiniPlayer } from './MiniPlayer'

type Props = {
  navigation: any
}

export const PVTabBar = (props: Props) => {
  const { navigation } = props
  const [player] = useGlobal<any>('player')

  return (
    <SafeAreaView style={{ flex: 0 }} testID='tabbar'>
      {player && player.showMiniPlayer && player.nowPlayingItem && <MiniPlayer navigation={navigation} />}
      {/* <BottomTabBar {...props} /> */}
    </SafeAreaView>
  )
}
