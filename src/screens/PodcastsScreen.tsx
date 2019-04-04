import AsyncStorage from '@react-native-community/async-storage'
import RNSecureKeyStore from 'react-native-secure-key-store'
import React from 'reactn'
import { ActivityIndicator, Divider, FlatList, PodcastTableCell, TableSectionSelectors,
  View } from '../components'
import { generateCategoryItems } from '../lib/utility'
import { PV } from '../resources'
import { getCategoryById, getTopLevelCategories } from '../services/category'
import { getPodcasts } from '../services/podcast'
import { getAuthUserInfo } from '../state/actions/auth'
import { getSubscribedPodcasts } from '../state/actions/podcasts'

type Props = {
  navigation?: any
}

type State = {
  categoryItems: any[]
  endOfResultsReached: boolean
  filterInputText: string
  flatListData: any[]
  isLoading: boolean
  isLoadingMore: boolean
  queryFrom: string | null
  queryPage: number
  querySort: string | null
  selectedCategory: string | null
  selectedSubCategory: string | null
  subCategoryItems: any[]
}

export class PodcastsScreen extends React.Component<Props, State> {

  static navigationOptions = {
    title: 'Podcasts'
  }

  constructor(props: Props) {
    super(props)
    this.state = {
      categoryItems: [],
      endOfResultsReached: false,
      filterInputText: '',
      flatListData: [],
      isLoading: true,
      isLoadingMore: false,
      queryFrom: _subscribedKey,
      queryPage: 1,
      querySort: _alphabeticalKey,
      selectedCategory: null,
      selectedSubCategory: null,
      subCategoryItems: []
    }
  }

  async componentDidMount() {
    const { navigation } = this.props
    let { flatListData } = this.state

    try {
      const appHasLaunched = await AsyncStorage.getItem(PV.Keys.APP_HAS_LAUNCHED)
      if (!appHasLaunched) {
        AsyncStorage.setItem(PV.Keys.APP_HAS_LAUNCHED, 'true')
        navigation.navigate(PV.RouteNames.Onboarding)
      } else {
        const userToken = await RNSecureKeyStore.get('BEARER_TOKEN')
        if (userToken) {
          await getAuthUserInfo()
          const { subscribedPodcasts } = this.global
          flatListData = subscribedPodcasts
        }
      }
    } catch (error) {
      console.log(error.message)
    }

    this.setState({
      flatListData,
      isLoading: false
    })
  }

  _querySubscribedPodcasts = async () => {
    const results = await getSubscribedPodcasts(this.global.session.userInfo.subscribedPodcastIds || [])
    return results
  }

  _queryAllPodcasts = async (sort: string | null, page: number = 1) => {
    const results = await getPodcasts({ sort, page }, this.global.settings.nsfwMode)
    return results
  }

  _queryPodcastsByCategory = async (categoryId: string | null, sort: string | null, page: number = 1) => {
    const results = await getPodcasts({
      categories: categoryId,
      sort,
      page
    }, this.global.settings.nsfwMode)
    return results
  }

  selectLeftItem = async (selectedKey: string) => {
    if (!selectedKey) {
      this.setState({ queryFrom: null })
      return
    }

    this.setState({
      endOfResultsReached: false,
      isLoading: true,
      queryFrom: selectedKey,
      queryPage: 1,
      flatListData: []
    }, async () => {
      const newState = await this._queryPodcastData(selectedKey, this.state)
      this.setState(newState)
    })
  }

  selectRightItem = async (selectedKey: string) => {
    if (!selectedKey) {
      this.setState({ querySort: null })
      return
    }

    this.setState({
      endOfResultsReached: false,
      isLoading: true,
      querySort: selectedKey,
      flatListData: []
    }, async () => {
      const newState = await this._queryPodcastData(selectedKey, this.state)

      this.setState(newState)
    })
  }

  _selectCategory = async (selectedKey: string, isSubCategory?: boolean) => {
    if (!selectedKey) {
      this.setState({
        ...(isSubCategory ? { selectedSubCategory: null } : { selectedCategory: null }) as any
      })
      return
    }

    this.setState({
      endOfResultsReached: false,
      isLoading: true,
      ...(isSubCategory ? { selectedSubCategory: selectedKey } : { selectedCategory: selectedKey }) as any,
      ...(!isSubCategory ? { subCategoryItems: [] } : {}),
      flatListData: []
    }, async () => {
      const newState = await this._queryPodcastData(selectedKey, this.state, {}, { isSubCategory })

      this.setState(newState)
    })
  }

  _onEndReached = ({ distanceFromEnd }) => {
    const { endOfResultsReached, queryFrom, queryPage = 1 } = this.state
    if (queryFrom !== _subscribedKey && !endOfResultsReached) {
      if (distanceFromEnd > -1) {
        this.setState({
          isLoadingMore: true
        }, async () => {
          const nextPage = queryPage + 1
          const newState = await this._queryPodcastData(queryFrom, this.state, { queryPage: nextPage })
          this.setState(newState)
        })
      }
    }
  }

  _renderPodcastItem = ({ item }) => {
    const downloadCount = item.episodes ? item.episodes.length : 0

    return (
      <PodcastTableCell
        key={item.id}
        autoDownloadOn={true}
        downloadCount={downloadCount}
        handleNavigationPress={() => this.props.navigation.navigate(
          PV.RouteNames.PodcastScreen, { podcast: item }
        )}
        lastEpisodePubDate={item.lastEpisodePubDate}
        podcastImageUrl={item.imageUrl}
        podcastTitle={item.title} />
    )
  }

  _ItemSeparatorComponent = () => {
    return <Divider noMargin={true} />
  }

  _handleFilterInputTextChange = (text: string) => {
    this.setState({
      filterInputText: text
    })
  }

  render() {
    const { categoryItems, filterInputText, flatListData, queryFrom, isLoading,
      isLoadingMore, querySort, selectedCategory, selectedSubCategory, subCategoryItems } = this.state

    return (
      <View style={styles.view}>
        <TableSectionSelectors
          handleSelectLeftItem={this.selectLeftItem}
          handleSelectRightItem={this.selectRightItem}
          leftItems={leftItems}
          rightItems={!queryFrom || queryFrom === _subscribedKey ? [] : rightItems}
          selectedLeftItemKey={queryFrom}
          selectedRightItemKey={querySort} />
        {
          queryFrom === _categoryKey && categoryItems &&
            <TableSectionSelectors
              handleSelectLeftItem={(x: string) => this._selectCategory(x)}
              handleSelectRightItem={(x: string) => this._selectCategory(x, true)}
              leftItems={categoryItems}
              rightItems={subCategoryItems}
              selectedLeftItemKey={selectedCategory}
              selectedRightItemKey={selectedSubCategory} />
        }
        {
          isLoading &&
            <ActivityIndicator />
        }
        {
          !isLoading && flatListData &&
            <FlatList
              data={flatListData}
              extraData={flatListData}
              filterInputText={filterInputText}
              handleFilterInputChangeText={this._handleFilterInputTextChange}
              isLoadingMore={isLoadingMore}
              ItemSeparatorComponent={this._ItemSeparatorComponent}
              onEndReached={this._onEndReached}
              renderItem={this._renderPodcastItem} />
        }
      </View>
    )
  }

  _queryPodcastData = async (filterKey: string | null, prevState: State, nextState?: {}, queryOptions: {isSubCategory?: boolean} = {}) => {
    const newState = {
      isLoading: false,
      ...nextState
    } as State

    const { flatListData = [], querySort } = prevState
    const { settings } = this.global
    const { nsfwMode } = settings
    if (filterKey === _subscribedKey) {
      const results = await this._querySubscribedPodcasts()
      newState.flatListData = results[0]
    } else if (filterKey === _allPodcastsKey) {
      const results = await this._queryAllPodcasts(_alphabeticalKey, newState.queryPage)
      newState.querySort = _alphabeticalKey
      newState.flatListData = [...flatListData, ...results[0]]
      newState.endOfResultsReached = newState.flatListData.length >= results[1]
    } else if (filterKey === _categoryKey) {
      const { querySort, selectedCategory, selectedSubCategory } = prevState
      if (selectedSubCategory || selectedCategory) {
        const results = await this._queryPodcastsByCategory(selectedSubCategory || selectedCategory, querySort, newState.queryPage)
        newState.flatListData = [...flatListData, ...results[0]]
        newState.endOfResultsReached = newState.flatListData.length >= results[1]
        newState.selectedSubCategory = _allCategoriesKey
      } else {
        const categoryResults = await getTopLevelCategories()
        const podcastResults = await this._queryAllPodcasts(_topPastWeek, newState.queryPage)
        newState.categoryItems = generateCategoryItems(categoryResults[0])
        newState.flatListData = [...flatListData, ...podcastResults[0]]
        newState.endOfResultsReached = newState.flatListData.length >= podcastResults[1]
        newState.querySort = _topPastWeek
        newState.selectedCategory = _allCategoriesKey
      }
    } else if (rightItems.some((option) => option.value === filterKey)) {
      const { selectedCategory, selectedSubCategory } = prevState
      const results = await getPodcasts({
        ...(selectedSubCategory || selectedCategory ? { categories: selectedSubCategory || selectedCategory } : {}) as object,
        sort: filterKey
      }, nsfwMode)
      newState.flatListData = results[0]
      newState.endOfResultsReached = newState.flatListData.length >= results[1]
    } else {
      const { isSubCategory } = queryOptions
      if (!isSubCategory) {
        const category = await getCategoryById(filterKey || '')
        newState.subCategoryItems = generateCategoryItems(category.categories)
        newState.selectedSubCategory = _allCategoriesKey
      }

      const results = await getPodcasts({
        categories: filterKey,
        sort: querySort
      }, nsfwMode)
      newState.endOfResultsReached = results.length < 20
      newState.flatListData = results[0]
      newState.endOfResultsReached = newState.flatListData.length >= results[1]
    }

    return newState
  }
}

const _subscribedKey = 'subscribed'
const _allPodcastsKey = 'allPodcasts'
const _categoryKey = 'category'
const _allCategoriesKey = 'allCategories'
const _alphabeticalKey = 'alphabetical'
const _mostRecentKey = 'most-recent'
const _topPastDay = 'top-past-day'
const _topPastWeek = 'top-past-week'
const _topPastMonth = 'top-past-month'
const _topPastYear = 'top-past-year'

const leftItems = [
  {
    label: 'Subscribed',
    value: _subscribedKey
  },
  {
    label: 'All Podcasts',
    value: _allPodcastsKey
  },
  {
    label: 'Category',
    value: _categoryKey
  }
]

const rightItems = [
  {
    label: 'alphabetical',
    value: _alphabeticalKey
  },
  {
    label: 'most recent',
    value: _mostRecentKey
  },
  {
    label: 'top - past day',
    value: _topPastDay
  },
  {
    label: 'top - past week',
    value: _topPastWeek
  },
  {
    label: 'top - past month',
    value: _topPastMonth
  },
  {
    label: 'top - past year',
    value: _topPastYear
  }
]

const styles = {
  view: {
    flex: 1
  }
}
