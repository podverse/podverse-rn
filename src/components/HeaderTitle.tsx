import { Platform, StyleSheet, Text, View } from 'react-native'
import React from 'reactn'
import { PV } from '../resources'
import { darkTheme } from '../styles'

type Props = {
  color?: string
  textRef?: any
  title: string
}

export const HeaderTitle = (props: Props) => {
  const { color, textRef, title } = props
  const textStyle = [styles.text, darkTheme.text]

  if (color) {
    textStyle.push({ color })
  }

  return (
    <View>
      <View style={styles.wrapper}>
        <Text
          allowFontScaling={false}
          ref={textRef}
          style={textStyle}>
          {title}
          </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    color: PV.Colors.white,
    fontSize: Platform.OS === 'ios' ? PV.Fonts.sizes.xl : PV.Fonts.sizes.md,
    fontWeight: 'bold'
  },
  wrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 44,
    marginHorizontal: 16
  }
})
