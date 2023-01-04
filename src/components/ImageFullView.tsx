import React from 'react'
import { Modal, StyleSheet } from 'react-native'
import { setGlobal, useGlobal } from 'reactn'
import { Directions, Gesture, GestureDetector, gestureHandlerRootHOC } from 'react-native-gesture-handler'
import { FastImage, NavDismissIcon, SafeAreaView, View } from '.'

export const ImageFullView = () => {
  const [imageFullViewSourceUrl] = useGlobal('imageFullViewSourceUrl')
  const [imageFullViewShow] = useGlobal('imageFullViewShow')
  const [globalTheme] = useGlobal('globalTheme')

  const dismissFullScreenImage = () => {
    setGlobal({ imageFullViewShow: false })
  }

  if (!imageFullViewShow || !imageFullViewSourceUrl) return null

  const GestureContentWrapper = gestureHandlerRootHOC(() => (
    <GestureDetector
      gesture={Gesture.Fling()
        .direction(Directions.DOWN)
        .onStart(dismissFullScreenImage)}>
      <GestureDetector
        gesture={Gesture.Fling()
          .direction(Directions.RIGHT)
          .onStart(dismissFullScreenImage)}>
        <SafeAreaView style={[styles.view, globalTheme.view]} testID='image_full_view'>
          <View style={styles.navDismissIcon}>
            <NavDismissIcon handlePress={dismissFullScreenImage} testID='image_full_view' />
          </View>
          <FastImage source={imageFullViewSourceUrl} styles={styles.image} />
        </SafeAreaView>
      </GestureDetector>
    </GestureDetector>
  )) as React.FC

  return (
    <Modal animationType='slide' transparent visible={imageFullViewShow} onRequestClose={dismissFullScreenImage}>
      <GestureContentWrapper />
    </Modal>
  )
}

const styles = StyleSheet.create({
  image: {
    height: '100%',
    width: '100%'
  },
  navDismissIcon: {
    position: 'absolute',
    left: 0,
    top: 52,
    zIndex: 101
  },
  view: {
    position: 'relative'
  }
})
