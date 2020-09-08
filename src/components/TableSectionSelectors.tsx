import AsyncStorage from '@react-native-community/async-storage'
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import RNPickerSelect from 'react-native-picker-select'
import { useGlobal } from 'reactn'
import { convertFilterOptionsToI18N } from '../lib/i18n'
import { PV } from '../resources'
import { darkTheme, hidePickerIconOnAndroidSectionSelector } from '../styles'
import { Icon, Text } from './'

type Props = {
  handleSelectLeftItem?: any
  handleSelectRightItem?: any
  hidePickers?: boolean
  hideRightItemWhileLoading?: boolean
  includeChronological?: boolean
  isAddByRSSPodcastFeedUrl?: boolean
  isBottomBar?: boolean
  isCategories?: boolean
  isLoggedIn?: boolean
  isTransparent?: boolean
  selectedLeftItemKey: string | null
  selectedRightItemKey?: string | null
  screenName: string
}

export const TableSectionSelectors = (props: Props) => {
  const [globalTheme] = useGlobal('globalTheme')
  const [fontScaleMode] = useGlobal('fontScaleMode')
  const isDarkMode = globalTheme === darkTheme
  const [leftItems, setLeftItems] = useState([])
  const [rightItems, setRightItems] = useState([])

  const {
    handleSelectLeftItem,
    handleSelectRightItem,
    hidePickers,
    hideRightItemWhileLoading,
    includeChronological = false,
    isAddByRSSPodcastFeedUrl = false,
    isBottomBar = false,
    isCategories = false,
    isLoggedIn,
    isTransparent,
    selectedLeftItemKey,
    selectedRightItemKey,
    screenName
  } = props

  const handleInitialRender = () => {
    let leftItems = [] as any
    let rightItems = [] as any

    if (!isBottomBar) {
      leftItems = PV.FilterOptions.typeItems.filter((type: any) => {
        return isAddByRSSPodcastFeedUrl
          ? PV.FilterOptions.screenFilters[screenName].addByPodcastRSSFeedURLType.includes(type.value)
          : PV.FilterOptions.screenFilters[screenName].type.includes(type.value)
      })

      if (PV.FilterOptions.screenFilters[screenName].hideIfNotLoggedIn && !isLoggedIn) {
        leftItems = leftItems.filter((type: any) => {
          return !PV.FilterOptions.screenFilters[screenName].hideIfNotLoggedIn.includes(type.value)
        })
      }

      rightItems = PV.FilterOptions.sortItems.filter((sortKey: any) => {
        return PV.FilterOptions.screenFilters[screenName].sort.includes(sortKey.value)
      })
    } else {
      // Bottom bar
      const newleftItems = PV.FilterOptions.screenFilters[screenName].sublist

      if (isCategories) {
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
      } else {
        leftItems = newleftItems
      }
    }

    leftItems = convertFilterOptionsToI18N(leftItems)
    rightItems = convertFilterOptionsToI18N(rightItems)

    setLeftItems(leftItems)
    setRightItems(rightItems)
  }

  useEffect(() => {
    handleInitialRender()
  }, [])

  useEffect(() => {
    if (selectedLeftItemKey === PV.Filters._myClipsKey && !isLoggedIn) {
      handleSelectLeftItem(PV.Filters._subscribedKey)
    }
    handleInitialRender()
  }, [isLoggedIn])

  useEffect(() => {
    let rightItems = []
    const screen = PV.FilterOptions.screenFilters[screenName]
    if (!screen.hideSort.includes(selectedLeftItemKey)) {
      if (!isBottomBar) {
        rightItems = PV.FilterOptions.sortItems.filter((sortKey: any) => {
          return PV.FilterOptions.screenFilters[screenName].sort.includes(sortKey.value)
        })

        if (screen.includeAlphabetical && screen.includeAlphabetical.includes(selectedLeftItemKey)) {
          rightItems.unshift(PV.FilterOptions.items.sortAlphabeticalItem)
        }

        if (includeChronological) {
          rightItems.unshift(PV.FilterOptions.items.sortChronologicalItem)
        }

        rightItems = convertFilterOptionsToI18N(rightItems)
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
            rightItems.sort((a: any, b: any) => {
              const textA = a.label.toUpperCase()
              const textB = b.label.toUpperCase()
              return textA < textB ? -1 : textA > textB ? 1 : 0
            })

            // Add the all-categories filter to the beginning
            rightItems.unshift(...PV.FilterOptions.screenFilters[screenName].sublist)
          }
        }
      }
    }

    setRightItems(rightItems)
  }, [selectedLeftItemKey])

  const selectedLeftItem = leftItems.find((x) => x.value === selectedLeftItemKey) || {}
  const selectedRightItem = rightItems.find((x) => x.value === selectedRightItemKey) || {}
  const wrapperStyle =
    PV.Fonts.fontScale.largest === fontScaleMode
      ? [styles.tableSectionHeaderInner, { flexDirection: 'column' }]
      : [styles.tableSectionHeaderInner]
  const headerStyle = [styles.tableSectionHeader, globalTheme.tableSectionHeader]
  if (isTransparent) {
    headerStyle.push(globalTheme.tableSectionHeaderTransparent)
  }

  return (
    <View>
      <View style={headerStyle}>
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
            {!hideRightItemWhileLoading && selectedLeftItemKey && rightItems.length > 1 && (
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
            {!hideRightItemWhileLoading &&
              rightItems.length === 1 &&
              selectedRightItemKey !== PV.Filters._allCategoriesKey && (
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
