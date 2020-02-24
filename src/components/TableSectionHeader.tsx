import React from 'react'
import { View } from 'react-native'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { Icon, Text } from './'

type Props = {
  containerStyles?: any
  handleClosePress?: any
  title?: string
}

export const TableSectionHeader = (props: Props) => {
  const [globalTheme] = useGlobal('globalTheme')
  const { containerStyles, handleClosePress, title } = props

  return (
    <View style={containerStyles}>
      <View style={[styles.header, globalTheme.tableSectionHeader]}>
        <Text style={[styles.text, globalTheme.tableSectionHeaderText]}>
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

const styles = {
  header: {
    flexDirection: 'row',
    height: PV.Table.sectionHeader.height,
    paddingHorizontal: 8
  },
  icon: {
    flex: 0,
    lineHeight: 40,
    paddingHorizontal: 8
  },
  text: {
    flex: 1,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    lineHeight: PV.Table.sectionHeader.height
  }
}
