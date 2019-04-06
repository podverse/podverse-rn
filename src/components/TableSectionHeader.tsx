import React from 'react'
import { View } from 'react-native'
import { useGlobal } from 'reactn'
import { Divider, Text } from '.'
import { PV } from '../resources'

type Props = {
  title?: string
}

export const TableSectionHeader = (props: Props) => {
  const [globalTheme] = useGlobal('globalTheme')
  const { title } = props

  return (
    <View>
      <Divider noMargin={true} />
      <View
        style={[styles.tableSectionHeader, globalTheme.tableSectionHeader]}>
        <Text style={[styles.tableSectionHeaderText, globalTheme.tableSectionHeaderText]}>
          {title}
        </Text>
      </View>
      <Divider noMargin={true} />
    </View>
  )
}

const styles = {
  tableSectionHeader: {
    height: PV.Table.sectionHeader.height,
    paddingLeft: 8,
    paddingRight: 8
  },
  tableSectionHeaderText: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    lineHeight: PV.Table.sectionHeader.height,
    paddingRight: 8
  }
}
