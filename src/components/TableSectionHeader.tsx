import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { Icon, Text } from './'

type Props = {
  centerText?: boolean
  containerStyles?: any
  handleClosePress?: any
  includePadding?: boolean
  title?: string
}

export const TableSectionHeader = (props: Props) => {
  const [globalTheme] = useGlobal('globalTheme')
  const { centerText, containerStyles, handleClosePress, includePadding, title } = props

  const textStyle = centerText
    ? [styles.text, globalTheme.tableSectionHeaderText, { textAlign: 'center' }]
    : [styles.text, globalTheme.tableSectionHeaderText]

  const paddingStyle = includePadding ? { paddingHorizontal: 8 } : {}

  return (
    <View style={[styles.wrapper, paddingStyle, containerStyles]}>
      <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={[textStyle, styles.sectionHeaderText]}>
        {title}
      </Text>
      {handleClosePress && <Icon name='times' onPress={handleClosePress} size={24} style={styles.icon} />}
    </View>
  )
}

const styles = StyleSheet.create({
  icon: {
    flex: 0,
    paddingHorizontal: 8
  },
  text: {
    flex: 1,
    fontSize: PV.Fonts.sizes.xxl,
    fontWeight: PV.Fonts.weights.bold
  },
  sectionHeaderText: {
    color: PV.Colors.skyLight
  },
  wrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: PV.Table.sectionHeader.height,
    marginVertical: 4
  }
})
