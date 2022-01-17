import React, { useEffect, useState } from 'react'
import NetInfo from '@react-native-community/netinfo'
import { BottomTabBar } from 'react-navigation-tabs'
import { useGlobal } from 'reactn'
import { StyleSheet } from 'react-native'
import { Text, View } from '../components'
import { PV } from '../resources'
import { darkTheme } from '../styles'
import { translate } from '../lib/i18n'
import { MiniPlayer } from './MiniPlayer'

type Props = {
  navigation: any
}

export const PVTabBar = (props: Props) => {
  const { navigation } = props
  const [player] = useGlobal<any>('player')
  const [offlineModeEnabled] = useGlobal<any>('offlineModeEnabled')
  const [appOffline, setAppOffine] = useState(false)

  useEffect(() => {
    NetInfo.fetch().then((initialState) => {
      setAppOffine(!initialState.isConnected || !initialState.isInternetReachable)
    })

    const unsubscribe = NetInfo.addEventListener((state) => {
      setAppOffine(!state.isConnected || !state.isInternetReachable)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <View testID='tabbar'>
      {player && player.showMiniPlayer && player.nowPlayingItem && <MiniPlayer navigation={navigation} />}
      {(appOffline || offlineModeEnabled) && (
        <View testID='offline-banner' style={styles.offlineBanner}>
          <Text testID='offline-banner-text' style={styles.offlineBannerText}>
            {translate('OFFLINE MODE ENABLED')}
          </Text>
        </View>
      )}
      <BottomTabBar
        {...props}
        activeTintColor={PV.Colors.skyLight}
        inactiveTintColor={PV.Colors.white}
        style={darkTheme.tabbar}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  offlineBanner: {
    backgroundColor: PV.Colors.yellow,
    width: '100%',
    alignItems: 'center'
  },
  offlineBannerText: {
    fontWeight: PV.Fonts.weights.bold,
    color: PV.Colors.black
  }
})
