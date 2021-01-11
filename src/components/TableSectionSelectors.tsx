import AsyncStorage from '@react-native-community/async-storage'
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import RNPickerSelect from 'react-native-picker-select'
import { useGlobal } from 'reactn'
import { convertFilterOptionsToI18N, translate } from '../lib/i18n'
import { PV } from '../resources'
import { darkTheme, hidePickerIconOnAndroidSectionSelector } from '../styles'
import { Icon, Text } from './'

type Props = {
  handleSelectCategoryItem?: any
  handleSelectFilterItem?: any
  handleSelectSortItem?: any
  includeChronological?: boolean
  isAddByRSSPodcastFeedUrl?: boolean
  isBottomBar?: boolean
  isCategories?: boolean
  isLoggedIn?: boolean
  isSortLimitQueries?: boolean
  isTransparent?: boolean
  selectedFilterItemKey: string | null
  selectedSortItemKey?: string | null
  screenName: string
  testID: string
}

const filterAddByRSSSortItems = (screenName: string, isAddByRSSPodcastFeedUrl: boolean, isSortLimitQueries: boolean) =>
  PV.FilterOptions.sortItems.filter((sortKey: any) => {
    return isAddByRSSPodcastFeedUrl
      ? PV.FilterOptions.screenFilters[screenName].addByPodcastRSSFeedURLSort.includes(sortKey.value)
      : isSortLimitQueries
      ? PV.FilterOptions.screenFilters[screenName].sortLimitQueries.includes(sortKey.value)
      : PV.FilterOptions.screenFilters[screenName].sort.includes(sortKey.value)
  })

export const TableSectionSelectors = (props: Props) => {
  const [globalTheme] = useGlobal('globalTheme')
  const [fontScaleMode] = useGlobal('fontScaleMode')
  const isDarkMode = globalTheme === darkTheme
  const [filterItems, setFilterItems] = useState([])
  const [sortItems, setSortItems] = useState([])

  const {
    handleSelectFilterItem,
    handleSelectSortItem,
    includeChronological = false,
    isAddByRSSPodcastFeedUrl = false,
    isSortLimitQueries = false,
    isBottomBar = false,
    isCategories = false,
    isLoggedIn,
    isTransparent,
    selectedFilterItemKey,
    selectedSortItemKey,
    screenName,
    testID
  } = props

  const handleInitialRender = () => {
    let filterItems = [] as any
    let sortItems = [] as any

    if (!isBottomBar) {
      filterItems = PV.FilterOptions.typeItems.filter((type: any) => {
        return isAddByRSSPodcastFeedUrl
          ? PV.FilterOptions.screenFilters[screenName].addByPodcastRSSFeedURLType.includes(type.value)
          : PV.FilterOptions.screenFilters[screenName].type.includes(type.value)
      })

      if (PV.FilterOptions.screenFilters[screenName].hideIfNotLoggedIn && !isLoggedIn) {
        filterItems = filterItems.filter((type: any) => {
          return !PV.FilterOptions.screenFilters[screenName].hideIfNotLoggedIn.includes(type.value)
        })
      }

      sortItems = filterAddByRSSSortItems(screenName, !!isAddByRSSPodcastFeedUrl, isSortLimitQueries)
    } else {
      // Bottom bar
      const newFilterItems = PV.FilterOptions.screenFilters[screenName].sublist

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
            setFilterItems([...newFilterItems, ...categories])
          })
          .catch((err) => {
            console.log('Bottom Selection Bar error: ', err)
          })
      } else {
        filterItems = newFilterItems
      }
    }

    filterItems = convertFilterOptionsToI18N(filterItems)
    sortItems = convertFilterOptionsToI18N(sortItems)

    setFilterItems(filterItems)
    setSortItems(sortItems)
  }

  useEffect(() => {
    handleInitialRender()
  }, [])

  useEffect(() => {
    if (selectedFilterItemKey === PV.Filters._myClipsKey && !isLoggedIn) {
      handleSelectFilterItem(PV.Filters._subscribedKey)
    }
    handleInitialRender()
  }, [isLoggedIn])

  useEffect(() => {
    let sortItems = []
    const screen = PV.FilterOptions.screenFilters[screenName]
    if (!screen.hideSort.includes(selectedFilterItemKey)) {
      if (!isBottomBar) {
        sortItems = filterAddByRSSSortItems(screenName, !!isAddByRSSPodcastFeedUrl, isSortLimitQueries)

        if (screen.includeAlphabetical && screen.includeAlphabetical.includes(selectedFilterItemKey)) {
          sortItems.unshift(PV.FilterOptions.items.sortAlphabeticalItem)
        }

        if (includeChronological) {
          sortItems.unshift(PV.FilterOptions.items.sortChronologicalItem)
        }

        sortItems = convertFilterOptionsToI18N(sortItems)
      } else {
        if (filterItems.length > 0) {
          const selectedCategory = filterItems.find((category) => category.value === selectedFilterItemKey)
          if (selectedCategory && selectedCategory.categories) {
            sortItems = selectedCategory.categories.map((subCat) => {
              return {
                label: subCat.title,
                value: subCat.id,
                ...subCat
              }
            })
            sortItems.sort((a: any, b: any) => {
              const textA = a.label.toUpperCase()
              const textB = b.label.toUpperCase()
              return textA < textB ? -1 : textA > textB ? 1 : 0
            })

            // Add the all-categories filter to the beginning
            sortItems.unshift(...PV.FilterOptions.screenFilters[screenName].sublist)
          }
        }
      }
    }

    setSortItems(sortItems)
  }, [selectedFilterItemKey])

  const selectedFilterItem = filterItems.find((x) => x.value === selectedFilterItemKey) || {}
  const headerStyle = [styles.tableSectionHeader, globalTheme.tableSectionHeader]
  if (isTransparent) {
    headerStyle.push(globalTheme.tableSectionHeaderTransparent)
  }

  return (
    <View style={headerStyle}>
      <View style={styles.tableSectionHeaderTitleWrapper}>
        <Text
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          numberOfLines={1}
          style={[styles.tableSectionHeaderTitleText, globalTheme.tableSectionHeaderText]}>
          {selectedFilterItem.label}
        </Text>
      </View>
      <View style={styles.tableSectionHeaderButton}>
        <Text
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          numberOfLines={1}
          style={[styles.tableSectionHeaderFilterText, globalTheme.tableSectionHeaderText]}>
          {translate('Filter')}
        </Text>
        <Icon
          name='angle-down'
          size={14}
          style={[styles.tableSectionHeaderFilterIcon, globalTheme.tableSectionHeaderIcon]}
        />
      </View>
    </View>
  )
}

const styles = {
  tableSectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 12,
    minHeight: PV.Table.sectionHeader.height,
    paddingHorizontal: 8
  },
  tableSectionHeaderButton: {
    alignItems: 'center',
    borderColor: PV.Colors.brandBlueLight,
    borderRadius: 100,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    height: PV.Table.sectionHeader.height - 6,
    paddingHorizontal: 16
  },
  tableSectionHeaderFilterIcon: {
    flex: 0,
    fontSize: PV.Fonts.sizes.xl
  },
  tableSectionHeaderFilterText: {
    flex: 0,
    fontSize: PV.Fonts.sizes.md,
    fontWeight: PV.Fonts.weights.bold,
    paddingRight: 16
  },
  tableSectionHeaderTitleText: {
    flex: 0,
    fontSize: PV.Fonts.sizes.xxl,
    fontWeight: PV.Fonts.weights.bold
  },
  tableSectionHeaderTitleWrapper: {
    justifyContent: 'center',
    minHeight: PV.Table.sectionHeader.height
  },
  tableSectionHeaderSortTitleText: {
    flex: 0,
    fontSize: PV.Fonts.sizes.md
  },
  tableSectionHeaderSortTitleWrapper: {}
}
