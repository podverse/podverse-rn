import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

type Props = {
  width: number
}

export const MediaPlayerCarouselViewer = (props: Props) => {
  const { width } = props
  const style = [styles.wrapper, { width }]

  return (
    <View style={[styles.wrapper, style]}>
      <Text style={styles.text}>456</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    color: 'white',
    flex: 0,
    fontSize: 32
  },
  wrapper: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  }
})
