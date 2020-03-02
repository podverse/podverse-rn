import React from 'react'
import { View } from 'react-native'
import RNPickerSelect from 'react-native-picker-select'
import { getGlobal } from 'reactn'
import { PV } from '../resources'
import { darkTheme, hidePickerIconOnAndroidSectionSelector } from '../styles'
import { Icon, Text } from './'

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
  const global = getGlobal()
  const { fontScaleMode, globalTheme } = global
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

  const selectedLeftItem = leftItems.find((x) => x.value === selectedLeftItemKey) || {}
  const selectedRightItem = rightItems.find((x) => x.value === selectedRightItemKey) || {}
  const wrapperStyle =
    PV.Fonts.fontScale.largest === fontScaleMode
      ? [styles.tableSectionHeaderInner, { flexDirection: 'column' }]
      : [styles.tableSectionHeaderInner]

  return (
    <View>
      <View style={[styles.tableSectionHeader, globalTheme.tableSectionHeader]}>
        {!hidePickers && (
          <View style={wrapperStyle}>
            <RNPickerSelect
              items={leftItems}
              onValueChange={handleSelectLeftItem}
              placeholder={placeholderLeft || _placeholderDefault}
              style={hidePickerIconOnAndroidSectionSelector(isDarkMode)}
              useNativeAndroidPickerStyle={false}
              value={selectedLeftItemKey}>
              <View style={styles.tableSectionHeaderButton}>
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.md}
                  numberOfLines={1}
                  style={[styles.tableSectionHeaderTextLeft, globalTheme.tableSectionHeaderText]}>
                  {selectedLeftItem.label || (placeholderLeft && placeholderLeft.label) || _placeholderDefault.label}
                </Text>
                <Icon
                  name='angle-down'
                  size={14}
                  style={[styles.tableSectionHeaderIconLeft, globalTheme.tableSectionHeaderIcon]}
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
                    fontSizeLargestScale={PV.Fonts.largeSizes.md}
                    numberOfLines={1}
                    style={[styles.tableSectionHeaderTextRight, globalTheme.tableSectionHeaderText]}>
                    {selectedRightItem.label ||
                      (placeholderRight && placeholderRight.label) ||
                      _placeholderDefault.label}
                  </Text>
                  <Icon
                    name='angle-down'
                    size={14}
                    style={[styles.tableSectionHeaderIconRight, globalTheme.tableSectionHeaderIcon]}
                  />
                </View>
              </RNPickerSelect>
            )}
            {rightItems.length === 1 && (
              <View style={styles.tableSectionHeaderButton}>
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.md}
                  numberOfLines={1}
                  style={[styles.tableSectionHeaderTextRight, globalTheme.tableSectionHeaderText]}>
                  {selectedRightItem.label || (placeholderRight && placeholderRight.label) || _placeholderDefault.label}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  )
}

const _placeholderDefault = {
  label: 'Select...',
  value: null
}

const styles = {
  tableSectionHeader: {
    minHeight: PV.Table.sectionHeader.height
  },
  tableSectionHeaderButton: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: PV.Table.sectionHeader.height
  },
  tableSectionHeaderIconLeft: {
    flex: 0,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    paddingHorizontal: 8
  },
  tableSectionHeaderIconRight: {
    flex: 0,
    fontSize: PV.Fonts.sizes.xl,
    paddingHorizontal: 8
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
    paddingLeft: 8
  },
  tableSectionHeaderTextRight: {
    flex: 0,
    fontSize: PV.Fonts.sizes.xl
  }
}
