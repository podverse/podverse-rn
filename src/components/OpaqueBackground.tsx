import React from 'react'
import { ImageBackground, StyleSheet } from 'react-native'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { darkTheme } from '../styles'
import { View } from './'

type Props = {
  children?: any
  nowPlayingItem?: any
}

export const OpaqueBackground = (props: Props) => {
  const { children, nowPlayingItem } = props
  const [globalTheme] = useGlobal('globalTheme')

  const bgImageSource = nowPlayingItem && nowPlayingItem.podcastImageUrl ? { uri: nowPlayingItem.podcastImageUrl } : {}
  const backdropColor =
    globalTheme === darkTheme ? { backgroundColor: PV.Colors.blackOpaque } : { backgroundColor: PV.Colors.whiteOpaque }

  return (
    <ImageBackground blurRadius={50} source={bgImageSource} style={styles.imageBackground}>
      <View style={[styles.viewBackdrop, backdropColor]} transparent={true}>
        {children}
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  imageBackground: {
    flex: 1
  },
  viewBackdrop: {
    flex: 1
  }
})
