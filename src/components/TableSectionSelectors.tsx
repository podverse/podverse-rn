import React from 'react'
import { View } from 'react-native'
import RNPickerSelect from 'react-native-picker-select'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { Divider, Text } from './'

type Props = {
  handleSelectLeftItem?: any
  handleSelectRightItem?: any
  leftItems: any[]
  placeholderLeft?: any
  placeholderRight?: any
  rightItems?: any[]
  selectedLeftItemKey: string | null
  selectedRightItemKey?: string | null
}

export const TableSectionSelectors = (props: Props) => {
  const [globalTheme] = useGlobal('globalTheme')
  const { handleSelectLeftItem, handleSelectRightItem, leftItems = [], placeholderLeft, placeholderRight,
    rightItems = [], selectedLeftItemKey, selectedRightItemKey } = props

  const selectedLeftItem = leftItems.find((x) => x.value === selectedLeftItemKey) || {}
  const selectedRightItem = rightItems.find((x) => x.value === selectedRightItemKey) || {}

  return (
    <View>
      <Divider />
      <View
        style={[styles.tableSectionHeader, globalTheme.tableSectionHeader]}>
        <RNPickerSelect
          items={leftItems}
          onValueChange={handleSelectLeftItem}
          placeholder={placeholderLeft || _placeholderDefault}
          style={styles.tableSectionHeaderButton}
          value={selectedLeftItemKey}>
          <Text style={[styles.tableSectionHeaderTextLeft, globalTheme.tableSectionHeaderText]}>
            {selectedLeftItem.label || (placeholderLeft && placeholderLeft.label) || _placeholderDefault.label} &#9662;
          </Text>
        </RNPickerSelect>
        {
          rightItems.length > 1 &&
            <RNPickerSelect
              items={rightItems}
              onValueChange={handleSelectRightItem}
              placeholder={placeholderRight || _placeholderDefault}
              style={styles.tableSectionHeaderButton}
              value={selectedRightItemKey}>
              <Text style={[styles.tableSectionHeaderTextRight, globalTheme.tableSectionHeaderText]}>
                {selectedRightItem.label || (placeholderRight && placeholderRight.label) || _placeholderDefault.label} &#9662;
              </Text>
            </RNPickerSelect>

        }
        {
          rightItems.length === 1 &&
            <View style={styles.tableSectionHeaderButton}>
              <Text style={[styles.tableSectionHeaderTextRight, globalTheme.tableSectionHeaderText]}>
                {selectedRightItem.label || (placeholderRight && placeholderRight.label) || _placeholderDefault.label}
              </Text>
            </View>
        }
      </View>
      <Divider />
    </View>
  )
}

const _placeholderDefault = {
  label: 'Select...',
  value: null
}

const styles = {
  tableSectionHeader: {
    alignItems: 'stretch',
    flexDirection: 'row',
    height: PV.Table.sectionHeader.height,
    justifyContent: 'space-between',
    paddingLeft: 8,
    paddingRight: 8
  },
  tableSectionHeaderButton: {
    flex: 0,
    justifyContent: 'center'
  },
  tableSectionHeaderTextLeft: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    lineHeight: PV.Table.sectionHeader.height,
    paddingRight: 8
  },
  tableSectionHeaderTextRight: {
    fontSize: PV.Fonts.sizes.xl,
    lineHeight: PV.Table.sectionHeader.height,
    paddingLeft: 8
  }
}
