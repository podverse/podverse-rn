import AsyncStorage from '@react-native-community/async-storage'
import React, { useEffect, useState } from 'react'
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
  selectedLeftItemKey: string | null
  selectedRightItemKey?: string | null
  screenName: string
  isBottomBar?: boolean
}

export const TableSectionSelectors = (props: Props) => {
  const { fontScaleMode, globalTheme } = getGlobal()
  const isDarkMode = globalTheme === darkTheme
  const [leftItems, setLeftItems] = useState([])
  const [rightItems, setRightItems] = useState([])

  const {
    handleSelectLeftItem,
    handleSelectRightItem,
    hidePickers,
    selectedLeftItemKey,
    selectedRightItemKey,
    screenName,
    isBottomBar = false
  } = props

  useEffect(() => {
    let leftItems = []
    let rightItems = []

    if (!isBottomBar) {
      leftItems = PV.FilterOptions.typeItems.filter((type: string) => {
        return PV.FilterOptions.screenFilters[screenName].type.includes(type.value)
      })

      rightItems = PV.FilterOptions.sortItems.filter((sortKey: string) => {
        return PV.FilterOptions.screenFilters[screenName].sort.includes(sortKey.value)
      })
    } else {
      // Bottom bar
      const newleftItems = PV.FilterOptions.screenFilters[screenName].sublist

      // add more categories
      AsyncStorage.getItem('CATEGORIES_LIST')
        .then((listString = '') => {
          const categories = JSON.parse(listString).map((category) => {
            return {
              label: category.title,
              value: category.id,
              ...category
            }
          })
          setLeftItems([...newleftItems, ...categories])
        })
        .catch((err) => {
          console.log('Bottom Selection Bar error: ', err)
        })
    }

    setLeftItems(leftItems)
    setRightItems(rightItems)
  }, [])

  useEffect(() => {
    let rightItems = []
    if (PV.FilterOptions.screenFilters[screenName].hideSort.includes(selectedLeftItemKey)) {
      setRightItems(rightItems)
    } else {
      if (!isBottomBar) {
        rightItems = PV.FilterOptions.sortItems.filter((sortKey: string) => {
          return PV.FilterOptions.screenFilters[screenName].sort.includes(sortKey.value)
        })
      } else {
        if (leftItems.length > 0) {
          const selectedCategory = leftItems.find((category) => category.value === selectedLeftItemKey)
          if (selectedCategory && selectedCategory.categories) {
            rightItems = selectedCategory.categories.map((subCat) => {
              return {
                label: subCat.title,
                value: subCat.id,
                ...subCat
              }
            })
            rightItems.unshift(...PV.FilterOptions.screenFilters[screenName].sublist)
          }
        }
      }

      setRightItems(rightItems)
    }
  }, [selectedLeftItemKey])

  const selectedLeftItem = leftItems.find((x) => x.value === selectedLeftItemKey) || {}
  const selectedRightItem = rightItems.find((x) => x.value === selectedRightItemKey) || {}
  const wrapperStyle =
    PV.Fonts.fontScale.largest === fontScaleMode
      ? [styles.tableSectionHeaderInner, { flexDirection: 'column' }]
      : [styles.tableSectionHeaderInner]

  return (
    <View>
      <View style={[styles.tableSectionHeader, globalTheme.tableSectionHeader]}>
        {!hidePickers && leftItems && leftItems.length > 0 && (
          <View style={wrapperStyle}>
            <RNPickerSelect
              items={leftItems}
              onValueChange={handleSelectLeftItem}
              placeholder={defaultPlaceholder}
              style={hidePickerIconOnAndroidSectionSelector(isDarkMode)}
              useNativeAndroidPickerStyle={false}
              value={selectedLeftItemKey}>
              <View style={styles.tableSectionHeaderButton}>
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.md}
                  numberOfLines={1}
                  style={[styles.tableSectionHeaderTextLeft, globalTheme.tableSectionHeaderText]}>
                  {selectedLeftItem.label}
                </Text>
                <Icon
                  name='angle-down'
                  size={14}
                  style={[styles.tableSectionHeaderIconLeft, globalTheme.tableSectionHeaderIcon]}
                />
              </View>
            </RNPickerSelect>
            {selectedLeftItemKey && rightItems.length > 1 && (
              <RNPickerSelect
                items={rightItems}
                onValueChange={handleSelectRightItem}
                placeholder={defaultPlaceholder}
                style={hidePickerIconOnAndroidSectionSelector(isDarkMode)}
                useNativeAndroidPickerStyle={false}
                value={selectedRightItemKey}>
                <View style={styles.tableSectionHeaderButton}>
                  <Text
                    fontSizeLargestScale={PV.Fonts.largeSizes.md}
                    numberOfLines={1}
                    style={[styles.tableSectionHeaderTextRight, globalTheme.tableSectionHeaderText]}>
                    {selectedRightItem.label}
                  </Text>
                  <Icon
                    name='angle-down'
                    size={14}
                    style={[styles.tableSectionHeaderIconRight, globalTheme.tableSectionHeaderIcon]}
                  />
                </View>
              </RNPickerSelect>
            )}
            {rightItems.length === 1 && selectedRightItemKey !== PV.Filters._allCategoriesKey && (
              <View style={styles.tableSectionHeaderButton}>
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.md}
                  numberOfLines={1}
                  style={[styles.tableSectionHeaderTextRight, globalTheme.tableSectionHeaderText]}>
                  {selectedRightItem.label}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  )
}

const defaultPlaceholder = {
  label: 'Select an item',
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
    paddingRight: 8
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
    fontSize: PV.Fonts.sizes.xl,
    paddingRight: 8
  }
}
