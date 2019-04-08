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
  rightItems: any[]
  selectedLeftItemKey: string | null
  selectedRightItemKey?: string | null
}

export const TableSectionSelectors = (props: Props) => {
  const [globalTheme] = useGlobal('globalTheme')
  const { handleSelectLeftItem, handleSelectRightItem, leftItems = [], placeholderLeft, placeholderRight,
    rightItems = [], selectedLeftItemKey, selectedRightItemKey } = props

  const selectedLeftItem = leftItems.filter((x) => x.value === selectedLeftItemKey)[0] || {}
  const selectedRightItem = rightItems.filter((x) => x.value === selectedRightItemKey)[0] || {}

  return (
    <View>
      <Divider noMargin={true} />
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
          rightItems.length > 0 &&
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
      </View>
      <Divider noMargin={true} />
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
    flex: 1,
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
