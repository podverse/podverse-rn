import AsyncStorage from '@react-native-community/async-storage'
import { View } from 'react-native'
import React from 'reactn'
import { convertFilterOptionsToI18N } from '../lib/i18n'
import { safelyUnwrapNestedVariable } from '../lib/utility'
import { PV } from '../resources'
import { DropdownButton, Text } from './'

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
  allCategories: any[]
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
    this.state = { allCategories: [] }
  }

  async componentDidMount() {
    const allCategories = await this.getCategoryItems()

    this.setState({
      allCategories
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
    const selectedFilterItem = PV.FilterOptions.typeItems.find((item) => item.value === selectedFilterItemKey)

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
        <DropdownButton
          onPress={() => {
            this.props.navigation.navigate(PV.RouteNames.FilterScreen, {
              screenName,
              selectedCategoryItemKey,
              selectedCategorySubItemKey,
              selectedSortItemKey,
              selectedFilterItemKey,
              allCategories: this.state.allCategories,
              handleSelectCategoryItem,
              handleSelectCategorySubItem,
              handleSelectFilterItem,
              handleSelectSortItem,
              isAddByRSSPodcastFeedUrl
            })
          }}
        />
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
