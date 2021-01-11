import AsyncStorage from '@react-native-community/async-storage'
import { StyleSheet } from 'react-native'
import React from 'reactn'
import { NavDismissIcon, Text, View } from '../components'
import { convertFilterOptionsToI18N, translate } from '../lib/i18n'
import { safelyUnwrapNestedVariable, testProps } from '../lib/utility'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'

type Props = {
  navigation?: any
}

type State = {
  categoryItems: any[]
  filterItems: any[]
  sortItems: any[]
}

const testIDPrefix = 'filter_screen'

const filterAddByRSSSortItems = (screenName: string, isAddByRSSPodcastFeedUrl: boolean, isSortLimitQueries: boolean) =>
  PV.FilterOptions.sortItems.filter((sortKey: any) => {
    return isAddByRSSPodcastFeedUrl
      ? PV.FilterOptions.screenFilters[screenName].addByPodcastRSSFeedURLSort.includes(sortKey.value)
      : isSortLimitQueries
      ? PV.FilterOptions.screenFilters[screenName].sortLimitQueries.includes(sortKey.value)
      : PV.FilterOptions.screenFilters[screenName].sort.includes(sortKey.value)
  })

export class FilterScreen extends React.Component<Props, State> {
  static navigationOptions = ({ navigation }) => {
    return {
      title: translate('Filter'),
      headerLeft: <NavDismissIcon handlePress={navigation.dismiss} testID={testIDPrefix} />,
      headerRight: null
    }
  }

  constructor(props: Props) {
    super(props)
    const { navigation } = props

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

    trackPageView('/filter', 'Filter Screen')
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

  getFilterItems = async () => {
    const { navigation } = this.props
    const isAddByRSSPodcastFeedUrl = navigation.getParam('isAddByRSSPodcastFeedUrl')
    const screenName = navigation.getParam('screenName')
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
    const { navigation } = this.props
    const isAddByRSSPodcastFeedUrl = navigation.getParam('isAddByRSSPodcastFeedUrl')
    const isSortLimitQueries = navigation.getParam('isSortLimitQueries')
    const screenName = navigation.getParam('screenName')
    let sortItems = [] as any
    sortItems = filterAddByRSSSortItems(screenName, !!isAddByRSSPodcastFeedUrl, isSortLimitQueries)
    return convertFilterOptionsToI18N(sortItems)
  }

  render() {
    const { navigation } = this.props
    const screenName = navigation.getParam('screenName')
    const selectedCategoryItem = navigation.getParam('selectedCategoryItem')
    const selectedFilterItem = navigation.getParam('selectedFilterItem')
    const selectedSortItem = navigation.getParam('selectedSortItem')

    return (
      <View style={styles.view} {...testProps('filter_screen_view')}>
        <Text>hello world</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: 'flex-start'
  }
})
