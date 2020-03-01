import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { Icon, Text } from './'

type Props = {
  centerText?: boolean
  containerStyles?: any
  handleClosePress?: any
  title?: string
}

export const TableSectionHeader = (props: Props) => {
  const [globalTheme] = useGlobal('globalTheme')
  const { centerText, containerStyles, handleClosePress, title } = props

  const textStyle = centerText ?
    [styles.text, globalTheme.tableSectionHeaderText, { textAlign: 'center' }] :
    [styles.text, globalTheme.tableSectionHeaderText]

  return (
    <View style={containerStyles}>
      <View style={[styles.header, globalTheme.tableSectionHeader]}>
        <Text
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          style={textStyle}>
          {title}
        </Text>
        {handleClosePress && (
          <Icon
            name='times'
            onPress={handleClosePress}
            size={24}
            style={styles.icon}
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: PV.Table.sectionHeader.height,
    paddingHorizontal: 8
  },
  icon: {
    flex: 0,
    paddingHorizontal: 8
  },
  text: {
    flex: 1,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  }
})
