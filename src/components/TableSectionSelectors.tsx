import React, { useEffect, useState } from 'react'
import { TouchableWithoutFeedback, View } from 'react-native'
import { useGlobal } from 'reactn'
import { convertFilterOptionsToI18N, translate } from '../lib/i18n'
import { PV } from '../resources'
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
  navigation: any
  selectedCategoryItemKey: string | null
  selectedFilterItemKey: string | null
  selectedSortItemKey?: string | null
  screenName: string
  testID: string
}

export const TableSectionSelectors = (props: Props) => {
  const [globalTheme] = useGlobal('globalTheme')

  const {
    handleSelectCategoryItem,
    handleSelectFilterItem,
    handleSelectSortItem,
    includeChronological = false,
    isAddByRSSPodcastFeedUrl = false,
    isSortLimitQueries = false,
    isBottomBar = false,
    selectedCategoryItemKey,
    selectedFilterItemKey,
    selectedSortItemKey,
    screenName
  } = props

  useEffect(() => {
    const sortItems = []

    setSortItems(sortItems)
  }, [selectedFilterItemKey])

  return (
    <View style={[styles.tableSectionHeader, globalTheme.tableSectionHeader]}>
      <View style={styles.tableSectionHeaderTitleWrapper}>
        <Text
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          numberOfLines={1}
          style={[styles.tableSectionHeaderTitleText, globalTheme.tableSectionHeaderText]}>
          {selectedFilterItem.label}
        </Text>
      </View>
      <TouchableWithoutFeedback
        onPress={() =>
          props.navigation.navigate(PV.RouteNames.FilterScreen, {
            handleSelectCategoryItem,
            handleSelectFilterItem,
            handleSelectSortItem,
            selectedCategoryItemKey,
            selectedFilterItemKey,
            selectedSortItemKey
          })
        }>
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
      </TouchableWithoutFeedback>
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
