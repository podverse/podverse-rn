import React from 'react'
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import { PV } from '../resources'

type Props = {
  getScrollToTopRef?: any
  title?: string
}

const scrollToTop = (getScrollToTopRef: any) => {
  if (getScrollToTopRef) {
    const ref = getScrollToTopRef()
    if (ref && ref.scrollTo) {
      ref.scrollTo({ x: 0, y: 0, animated: true })
    }
  }
}

export const HeaderScrollToTop = (props: Props) => {
  const { getScrollToTopRef, title } = props
  return (
    <TouchableWithoutFeedback onPress={() => scrollToTop(getScrollToTopRef)}>
      <View style={styles.wrapper}>
        <Text style={styles.text}>
          {title}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  text: {
    color: PV.Colors.white,
    fontSize: PV.Fonts.sizes.md,
    fontWeight: 'bold',
    height: 44,
    lineHeight: 44
  },
  wrapper: {
    flexDirection: 'row'
  }
})
