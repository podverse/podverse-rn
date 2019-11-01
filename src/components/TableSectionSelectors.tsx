import React from 'react'
import { View } from 'react-native'
import RNPickerSelect from 'react-native-picker-select'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { darkTheme, hidePickerIconOnAndroidSectionSelector } from '../styles'
import { Divider, Icon, Text } from './'

type Props = {
  handleSelectLeftItem?: any
  handleSelectRightItem?: any
  hidePickers?: boolean
  leftItems: any[]
  placeholderLeft?: any
  placeholderRight?: any
  rightItems?: any[]
  selectedLeftItemKey: string | null
  selectedRightItemKey?: string | null
}

export const TableSectionSelectors = (props: Props) => {
  const [globalTheme] = useGlobal('globalTheme')
  const isDarkMode = globalTheme === darkTheme
  const {
    handleSelectLeftItem,
    handleSelectRightItem,
    hidePickers,
    leftItems = [],
    placeholderLeft,
    placeholderRight,
    rightItems = [],
    selectedLeftItemKey,
    selectedRightItemKey
  } = props

  const selectedLeftItem =
    leftItems.find((x) => x.value === selectedLeftItemKey) || {}
  const selectedRightItem =
    rightItems.find((x) => x.value === selectedRightItemKey) || {}

  return (
    <View>
      <Divider />
      <View style={[styles.tableSectionHeader, globalTheme.tableSectionHeader]}>
        {!hidePickers && (
          <View style={styles.tableSectionHeaderInner}>
            <RNPickerSelect
              items={leftItems}
              onValueChange={handleSelectLeftItem}
              placeholder={placeholderLeft || _placeholderDefault}
              style={hidePickerIconOnAndroidSectionSelector(isDarkMode)}
              useNativeAndroidPickerStyle={false}
              value={selectedLeftItemKey}>
              <View style={styles.tableSectionHeaderButton}>
                <Text
                  style={[
                    styles.tableSectionHeaderTextLeft,
                    globalTheme.tableSectionHeaderText
                  ]}>
                  {selectedLeftItem.label ||
                    (placeholderLeft && placeholderLeft.label) ||
                    _placeholderDefault.label}
                </Text>
                <Icon
                  name="angle-down"
                  size={14}
                  style={[
                    styles.tableSectionHeaderIconLeft,
                    globalTheme.tableSectionHeaderIcon
                  ]}
                />
              </View>
            </RNPickerSelect>
            {rightItems.length > 1 && (
              <RNPickerSelect
                items={rightItems}
                onValueChange={handleSelectRightItem}
                placeholder={placeholderRight || _placeholderDefault}
                style={hidePickerIconOnAndroidSectionSelector(isDarkMode)}
                useNativeAndroidPickerStyle={false}
                value={selectedRightItemKey}>
                <View style={styles.tableSectionHeaderButton}>
                  <Text
                    style={[
                      styles.tableSectionHeaderTextRight,
                      globalTheme.tableSectionHeaderText
                    ]}>
                    {selectedRightItem.label ||
                      (placeholderRight && placeholderRight.label) ||
                      _placeholderDefault.label}
                  </Text>
                  <Icon
                    name="angle-down"
                    size={14}
                    style={[
                      styles.tableSectionHeaderIconRight,
                      globalTheme.tableSectionHeaderIcon
                    ]}
                  />
                </View>
              </RNPickerSelect>
            )}
            {rightItems.length === 1 && (
              <View style={styles.tableSectionHeaderButton}>
                <Text
                  style={[
                    styles.tableSectionHeaderTextRight,
                    globalTheme.tableSectionHeaderText
                  ]}>
                  {selectedRightItem.label ||
                    (placeholderRight && placeholderRight.label) ||
                    _placeholderDefault.label}
                </Text>
              </View>
            )}
          </View>
        )}
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
    height: PV.Table.sectionHeader.height,
    paddingLeft: 8,
    paddingRight: 8
  },
  tableSectionHeaderButton: {
    flexDirection: 'row'
  },
  tableSectionHeaderIconLeft: {
    flex: 0,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    lineHeight: PV.Table.sectionHeader.height,
    paddingRight: 8
  },
  tableSectionHeaderIconRight: {
    flex: 0,
    fontSize: PV.Fonts.sizes.xl,
    lineHeight: PV.Table.sectionHeader.height,
    paddingLeft: 8
  },
  tableSectionHeaderInner: {
    alignItems: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  tableSectionHeaderTextLeft: {
    flex: 0,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    lineHeight: PV.Table.sectionHeader.height,
    paddingRight: 8
  },
  tableSectionHeaderTextRight: {
    flex: 0,
    fontSize: PV.Fonts.sizes.xl,
    lineHeight: PV.Table.sectionHeader.height,
    paddingLeft: 8
  }
}
