import AsyncStorage from '@react-native-community/async-storage'
import { TouchableWithoutFeedback, View } from 'react-native'
import React from 'reactn'
import { convertFilterOptionsToI18N, translate } from '../lib/i18n'
import { safelyUnwrapNestedVariable } from '../lib/utility'
import { PV } from '../resources'
import { Icon, Text } from './'

type Props = {
  handleSelectCategoryItem?: any
  handleSelectCategorySubItem?: any
  handleSelectFilterItem?: any
  handleSelectSortItem?: any
  isAddByRSSPodcastFeedUrl?: boolean
  navigation: any
  selectedCategoryItemKey: string | null
  selectedCategorySubItemKey: string | null
  selectedFilterItemKey: string | null
  selectedSortItemKey?: string | null
  screenName: string
  shouldQueryIndexedData?: boolean
  testID: string
}

type State = {
  categoryItems: any[]
  filterItems: any[]
  sortItems: any[]
}

const filterAddByRSSSortItems = (
  screenName: string,
  isAddByRSSPodcastFeedUrl: boolean,
  shouldQueryIndexedData?: boolean
) =>
  PV.FilterOptions.sortItems.filter((sortKey: any) => {
    return isAddByRSSPodcastFeedUrl
      ? PV.FilterOptions.screenFilters[screenName].addByPodcastRSSFeedURLSort.includes(sortKey.value)
      : shouldQueryIndexedData
      ? PV.FilterOptions.screenFilters[screenName].sortLimitQueries.includes(sortKey.value)
      : PV.FilterOptions.screenFilters[screenName].sort.includes(sortKey.value)
  })

export class TableSectionSelectors extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {}
  }

  async componentDidMount() {
    const categoryItems = await this.getCategoryItems()
    const filterItems = await this.getFilterItems()
    const sortItems = await this.getSortItems()

    this.setState({
      categoryItems,
      filterItems,
      sortItems
    })
  }

  getCategoryItems = async () => {
    try {
      const categoryItemsString = await AsyncStorage.getItem('CATEGORIES_LIST')
      let categoryItems = []
      if (categoryItemsString) {
        categoryItems = JSON.parse(categoryItemsString).map((category: any) => {
          return {
            label: category.title,
            value: category.id,
            ...category
          }
        })
      }
      return categoryItems
    } catch (err) {
      console.log('Bottom Selection Bar error: ', err)
    }
  }

  getSubCategoriesForCategory = async () => {
    const { selectedCategoryItemKey } = this.props
    const { categoryItems } = this.state

    if (selectedCategoryItemKey) {
      const selectedCategory = categoryItems.find((category) => category.value === selectedCategoryItemKey)
      let subCategoryItems = []
      if (selectedCategory && selectedCategory.categories) {
        subCategoryItems = selectedCategory.categories.map((subCat: any) => {
          return {
            label: subCat.title,
            value: subCat.id,
            ...subCat
          }
        })
        subCategoryItems.sort((a: any, b: any) => {
          const textA = a.label.toUpperCase()
          const textB = b.label.toUpperCase()
          return textA < textB ? -1 : textA > textB ? 1 : 0
        })
      }
      return subCategoryItems
    }
  }

  getFilterItems = async () => {
    const { isAddByRSSPodcastFeedUrl, screenName } = this.props
    const isLoggedIn = safelyUnwrapNestedVariable(() => this.global.session.isLoggedIn, '')

    let filterItems = [] as any

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

    filterItems = convertFilterOptionsToI18N(filterItems)

    return filterItems
  }

  getSortItems = async () => {
    const { isAddByRSSPodcastFeedUrl, screenName, selectedFilterItemKey, shouldQueryIndexedData } = this.props
    const screen = PV.FilterOptions.screenFilters[screenName]

    let sortItems = [] as any
    sortItems = filterAddByRSSSortItems(screenName, !!isAddByRSSPodcastFeedUrl, shouldQueryIndexedData)

    if (screen.includeAlphabetical && screen.includeAlphabetical.includes(selectedFilterItemKey)) {
      sortItems.unshift(PV.FilterOptions.items.sortAlphabeticalItem)
    }

    if (screen.includeChronological && screen.includeChronological.includes(selectedFilterItemKey)) {
      sortItems.unshift(PV.FilterOptions.items.sortChronologicalItem)
    }

    return convertFilterOptionsToI18N(sortItems)
  }

  render() {
    const {
      handleSelectCategoryItem,
      handleSelectCategorySubItem,
      handleSelectFilterItem,
      handleSelectSortItem,
      isAddByRSSPodcastFeedUrl = false,
      screenName,
      selectedCategoryItemKey,
      selectedCategorySubItemKey,
      selectedFilterItemKey,
      selectedSortItemKey
    } = this.props
    const { globalTheme } = this.global
    const { categoryItems = [], filterItems = [], sortItems = [] } = this.state
    const selectedFilterItem = filterItems.find((x) => x.value === selectedFilterItemKey) || {}
    // const selectedSortItem = sortItems.find((x) => x.value === selectedSortItemKey) || {}

    return (
      <View style={[styles.tableSectionHeader, globalTheme.tableSectionHeader]}>
        <View style={styles.tableSectionHeaderTitleWrapper}>
          {selectedFilterItem && selectedFilterItem.label && (
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              numberOfLines={1}
              style={[styles.tableSectionHeaderTitleText, globalTheme.tableSectionHeaderText]}>
              {selectedFilterItem.label}
            </Text>
          )}
        </View>
        <TouchableWithoutFeedback
          onPress={() =>
            this.props.navigation.navigate(PV.RouteNames.FilterScreen, {
              categoryItems,
              filterItems,
              handleSelectCategoryItem,
              handleSelectCategorySubItem,
              handleSelectFilterItem,
              handleSelectSortItem,
              isAddByRSSPodcastFeedUrl,
              screenName,
              selectedCategoryItemKey,
              selectedCategorySubItemKey,
              selectedFilterItemKey,
              selectedSortItemKey,
              sortItems
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
