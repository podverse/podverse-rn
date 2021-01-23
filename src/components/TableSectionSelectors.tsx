import { View } from 'react-native'
import React from 'reactn'
import { PV } from '../resources'
import { getFlatCategoryItems } from '../services/category'
import { DropdownButton, Text } from './'

type Props = {
  handleSelectCategoryItem?: any
  handleSelectCategorySubItem?: any
  handleSelectFilterItem?: any
  handleSelectSortItem?: any
  isAddByRSSPodcastFeedUrl?: boolean
  navigation: any
  screenName: string
  selectedCategoryItemKey: string | null
  selectedCategorySubItemKey: string | null
  selectedFilterItemKey: string | null
  selectedSortItemKey?: string | null
  shouldQueryIndexedData?: boolean
  testID: string
}

type State = {
  flatCategoryItems: any[]
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

    this.state = {
      flatCategoryItems: []
    }
  }

  async componentDidMount() {
    const flatCategoryItems = await getFlatCategoryItems()
    this.setState({ flatCategoryItems })
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
    const { flatCategoryItems } = this.state
    const { globalTheme } = this.global

    let selectedFilterLabel
    if (!selectedCategoryItemKey && !selectedCategorySubItemKey) {
      selectedFilterLabel = PV.FilterOptions.typeItems.find((item) => item.value === selectedFilterItemKey)
    } else if (selectedCategorySubItemKey) {
      selectedFilterLabel = flatCategoryItems.find(
        (item) => item.value === selectedCategorySubItemKey || item.id === selectedCategorySubItemKey
      )
    } else if (selectedCategoryItemKey) {
      selectedFilterLabel = flatCategoryItems.find(
        (item) => item.value === selectedCategoryItemKey || item.id === selectedCategoryItemKey
      )
    }

    return (
      <View style={[styles.tableSectionHeader, globalTheme.tableSectionHeader]}>
        <View style={styles.tableSectionHeaderTitleWrapper}>
          {!!selectedFilterLabel && (
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              numberOfLines={1}
              style={[styles.tableSectionHeaderTitleText, globalTheme.tableSectionHeaderText]}>
              {selectedFilterLabel.label || selectedFilterLabel.title}
            </Text>
          )}
        </View>
        <DropdownButton
          onPress={() => {
            this.props.navigation.navigate(PV.RouteNames.FilterScreen, {
              screenName,
              flatCategoryItems,
              selectedCategoryItemKey,
              selectedCategorySubItemKey,
              selectedSortItemKey,
              selectedFilterItemKey,
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
