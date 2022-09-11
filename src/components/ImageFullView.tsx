import React from 'react'
import { Modal, StyleSheet } from 'react-native'
import { setGlobal, useGlobal } from 'reactn'
import { FastImage, NavDismissIcon, SafeAreaView, View } from '.'

export const ImageFullView = () => {
  const [imageFullViewSourceUrl] = useGlobal('imageFullViewSourceUrl')
  const [imageFullViewShow] = useGlobal('imageFullViewShow')
  const [globalTheme] = useGlobal('globalTheme')

  if (!imageFullViewShow || !imageFullViewSourceUrl) return null

  return (
    <Modal animationType='slide' transparent visible={imageFullViewShow}>
      <SafeAreaView style={[styles.view, globalTheme.view]} testID='image_full_view'>
        <View style={styles.navDismissIcon}>
          <NavDismissIcon
            handlePress={() => {
              setGlobal({ imageFullViewShow: false })
            }}
            testID='image_full_view'
          />
        </View>
        <FastImage source={imageFullViewSourceUrl} styles={styles.image} />
      </SafeAreaView>
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
