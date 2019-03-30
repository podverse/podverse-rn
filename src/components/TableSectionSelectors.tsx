import React from 'react'
import { View } from 'react-native'
import RNPickerSelect from 'react-native-picker-select'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { Divider, Text } from './'

type Props = {
  handleSelectLeftItem?: any
  handleSelectRightItem?: any
  leftItems?: any[]
  rightItems?: any[]
  selectedLeftItem?: string
  selectedRightItem?: string
}

export const TableSectionSelectors = (props: Props) => {
  const [globalTheme] = useGlobal('globalTheme')
  const { handleSelectLeftItem, handleSelectRightItem, leftItems = [], rightItems = [],
    selectedLeftItem, selectedRightItem } = props

  return (
    <View>
      <Divider noMargin={true} />
      <View
        style={[styles.tableSectionHeader, globalTheme.tableSectionHeader]}>
        <RNPickerSelect
          items={leftItems}
          onValueChange={handleSelectLeftItem}
          style={styles.tableSectionHeaderButton}
          value={selectedLeftItem}>
          <Text style={[styles.tableSectionHeaderTextLeft, globalTheme.tableSectionHeaderText]}>
            {selectedLeftItem} &#9662;
          </Text>
        </RNPickerSelect>
        <RNPickerSelect
          items={rightItems}
          onValueChange={handleSelectRightItem}
          style={styles.tableSectionHeaderButton}
          value={selectedRightItem}>
          <Text style={[styles.tableSectionHeaderTextRight, globalTheme.tableSectionHeaderText]}>
            {selectedRightItem} &#9662;
          </Text>
        </RNPickerSelect>
      </View>
      <Divider noMargin={true} />
    </View>
  )
}

const styles = {
  tableSectionHeader: {
    alignItems: 'stretch',
    flexDirection: 'row',
    height: 40,
    justifyContent: 'space-between',
    paddingLeft: 8,
    paddingRight: 8
  },
  tableSectionHeaderButton: {
    flex: 1,
    justifyContent: 'center'
  },
  tableSectionHeaderTextLeft: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    lineHeight: 40,
    paddingRight: 8
  },
  tableSectionHeaderTextRight: {
    fontSize: PV.Fonts.sizes.xl,
    lineHeight: 40,
    paddingLeft: 8
  }
}
