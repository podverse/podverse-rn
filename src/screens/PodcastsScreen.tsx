import AsyncStorage from '@react-native-community/async-storage'
import debounce from 'lodash/debounce'
import { StyleSheet } from 'react-native'
import React from 'reactn'
import { ActivityIndicator, Divider, FlatList, PlayerEvents, PodcastTableCell, SearchBar, SwipeRowBack,
  TableSectionSelectors, View } from '../components'
import { alertIfNoNetworkConnection } from '../lib/network'
import { generateCategoryItems } from '../lib/utility'
import { PV } from '../resources'
import { getCategoryById, getTopLevelCategories } from '../services/category'
import { getPodcasts } from '../services/podcast'
import { getAuthUserInfo } from '../state/actions/auth'
import { initPlayerState, setNowPlayingItem } from '../state/actions/player'
import { getSubscribedPodcasts, toggleSubscribeToPodcast } from '../state/actions/podcast'
import { core } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  categoryItems: any[]
  endOfResultsReached: boolean
  flatListData: any[]
  isLoading: boolean
  isLoadingMore: boolean
  isRefreshing: boolean
  isUnsubscribing: boolean
  queryFrom: string | null
  queryPage: number
  querySort: string | null
  searchBarText: string
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
      flatListData: [],
      isLoading: true,
      isLoadingMore: false,
      isRefreshing: false,
      isUnsubscribing: false,
      queryFrom: _subscribedKey,
      queryPage: 1,
      querySort: _alphabeticalKey,
      searchBarText: '',
      selectedCategory: null,
      selectedSubCategory: null,
      subCategoryItems: []
    }

    this._handleSearchBarTextQuery = debounce(this._handleSearchBarTextQuery, 1000)
  }

  async componentDidMount() {
    const { navigation } = this.props
    const { flatListData } = this.state

    try {
      const appHasLaunched = await AsyncStorage.getItem(PV.Keys.APP_HAS_LAUNCHED)
      if (!appHasLaunched) {
        AsyncStorage.setItem(PV.Keys.APP_HAS_LAUNCHED, 'true')
        navigation.navigate(PV.RouteNames.Onboarding)
      } else {
        await this._initializeScreenData()
      }
    } catch (error) {
      if (error.name === PV.Errors.FREE_TRIAL_EXPIRED.name || error.name === PV.Errors.PREMIUM_MEMBERSHIP_EXPIRED.name) {
        // Since the expired user was logged out after the alert in getAuthUserInfo,
        // we initialiize the screen data again, this time as a local/logged-out user.
        await this._initializeScreenData()
      }
      console.log(error)
    }

    this.setState({
      flatListData,
      isLoading: false
    })
  }

  _initializeScreenData = async () => {
    await initPlayerState(this.global)
    await getAuthUserInfo()
    const { userInfo } = this.global.session
    await getSubscribedPodcasts(userInfo.subscribedPodcastIds || [])
    const nowPlayingItemString = await AsyncStorage.getItem(PV.Keys.NOW_PLAYING_ITEM)

    if (nowPlayingItemString) {
      await setNowPlayingItem(JSON.parse(nowPlayingItemString), this.global, true)
    }
  }

  selectLeftItem = async (selectedKey: string) => {
    if (!selectedKey) {
      this.setState({ queryFrom: null })
      return
    }

    this.setState({
      endOfResultsReached: false,
      flatListData: [],
      isLoading: true,
      queryFrom: selectedKey,
      queryPage: 1
    }, async () => {
      const newState = await this._queryData(selectedKey, this.state)
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
      flatListData: [],
      isLoading: true,
      querySort: selectedKey
    }, async () => {
      const newState = await this._queryData(selectedKey, this.state)

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
      const newState = await this._queryData(selectedKey, this.state, {}, { isSubCategory })

      this.setState(newState)
    })
  }

  _onEndReached = ({ distanceFromEnd }) => {
    const { endOfResultsReached, isLoadingMore, queryFrom, queryPage = 1 } = this.state
    if (queryFrom !== _subscribedKey && !endOfResultsReached && !isLoadingMore) {
      if (distanceFromEnd > -1) {
        this.setState({
          isLoadingMore: true
        }, async () => {
          const nextPage = queryPage + 1
          const newState = await this._queryData(queryFrom, this.state, { queryPage: nextPage })
          this.setState(newState)
        })
      }
    }
  }

  _onRefresh = () => {
    const { queryFrom } = this.state

    this.setState({
      isRefreshing: true
    }, async () => {
      const newState = await this._queryData(queryFrom, this.state, { queryPage: 1 })
      this.setState(newState)
    })
  }

  _ListHeaderComponent = () => {
    const { searchBarText } = this.state

    return (
      <View style={styles.ListHeaderComponent}>
        <SearchBar
          containerStyle={styles.ListHeaderComponent}
          inputContainerStyle={core.searchBar}
          onChangeText={this._handleSearchBarTextChange}
          onClear={this._handleSearchBarClear}
          value={searchBarText} />
      </View>
    )
  }

  _ItemSeparatorComponent = () => {
    return <Divider />
  }

  _renderPodcastItem = ({ item }) => {
    const downloadCount = item.episodes ? item.episodes.length : 0

    return (
      <PodcastTableCell
        key={item.id}
        autoDownloadOn={true}
        downloadCount={downloadCount}
        lastEpisodePubDate={item.lastEpisodePubDate}
        onPress={() => this.props.navigation.navigate(
          PV.RouteNames.PodcastScreen, { podcast: item }
        )}
        podcastImageUrl={item.imageUrl}
        podcastTitle={item.title} />
    )
  }

  _renderHiddenItem = ({ item }, rowMap) => (
    <SwipeRowBack
      isLoading={this.state.isUnsubscribing}
      onPress={() => this._handleHiddenItemPress(item.id, rowMap)} />
  )

  _handleHiddenItemPress = async (selectedId, rowMap) => {
    const wasAlerted = await alertIfNoNetworkConnection('unsubscribe from podcast')
    if (wasAlerted) return
    this.setState({ isUnsubscribing: true }, async () => {
      try {
        const { flatListData } = this.state
        await toggleSubscribeToPodcast(selectedId, this.global)
        const newFlatListData = flatListData.filter((x) => x.id !== selectedId)
        rowMap[selectedId].closeRow()
        this.setState({
          flatListData: newFlatListData,
          isUnsubscribing: true
        })
      } catch (error) {
        this.setState({ isUnsubscribing: true })
      }
    })
  }

  _handleSearchBarClear = (text: string) => {
    this.setState({ searchBarText: '' })
  }

  _handleSearchBarTextChange = (text: string) => {
    const { queryFrom } = this.state

    this.setState({
      flatListData: [],
      isLoadingMore: true,
      queryPage: 1,
      searchBarText: text
    }, async () => {
      this._handleSearchBarTextQuery(queryFrom, this.state, {}, { searchTitle: text })
    })
  }

  _handleSearchBarTextQuery = async (queryFrom: string | null, prevState: any, newState: any, queryOptions: any) => {
    const state = await this._queryData(queryFrom, prevState, newState, { searchTitle: queryOptions.searchTitle })
    this.setState(state)
  }

  render() {
    const { categoryItems, queryFrom, isLoading, isLoadingMore, isRefreshing, querySort,
      selectedCategory, selectedSubCategory, subCategoryItems } = this.state

    let flatListData = []
    if (queryFrom === _subscribedKey) {
      flatListData = this.global.subscribedPodcasts
    } else {
      flatListData = this.state.flatListData
    }

    return (
      <View style={styles.view}>
        <PlayerEvents />
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
              placeholderLeft={{ label: 'All', value: _allCategoriesKey }}
              placeholderRight={{ label: 'All', value: _allCategoriesKey }}
              rightItems={subCategoryItems}
              selectedLeftItemKey={selectedCategory}
              selectedRightItemKey={selectedSubCategory} />
        }
        {
          isLoading &&
            <ActivityIndicator />
        }
        {
          !isLoading && queryFrom && flatListData &&
            <FlatList
              data={flatListData}
              disableLeftSwipe={queryFrom !== _subscribedKey}
              extraData={flatListData}
              isLoadingMore={isLoadingMore}
              isRefreshing={isRefreshing}
              ItemSeparatorComponent={this._ItemSeparatorComponent}
              {...(queryFrom !== _subscribedKey ? { ListHeaderComponent: this._ListHeaderComponent } : {})}
              onEndReached={this._onEndReached}
              onRefresh={queryFrom === _subscribedKey ? this._onRefresh : null}
              renderHiddenItem={this._renderHiddenItem}
              renderItem={this._renderPodcastItem} />
        }
      </View>
    )
  }

  _querySubscribedPodcasts = async () => {
    const { session } = this.global
    const { userInfo } = session
    await getSubscribedPodcasts(userInfo.subscribedPodcastIds || [])
  }

  _queryAllPodcasts = async (sort: string | null, page: number = 1) => {
    const { searchBarText: searchTitle } = this.state
    const results = await getPodcasts({ sort, page, ...(searchTitle ? { searchTitle } : {}) }, this.global.settings.nsfwMode)
    return results
  }

  _queryPodcastsByCategory = async (categoryId: string | null, sort: string | null, page: number = 1) => {
    const { searchBarText: searchTitle } = this.state
    const results = await getPodcasts({
      categories: categoryId, sort, page,
      ...(searchTitle ? { searchTitle } : {})
    }, this.global.settings.nsfwMode)
    return results
  }

  _queryData = async (
    filterKey: string | null, prevState: State, nextState?: {},
    queryOptions: { isSubCategory?: boolean, searchTitle?: string } = {}) => {
    const newState = {
      isLoading: false,
      isLoadingMore: false,
      isRefreshing: false,
      ...nextState
    } as State

    const wasAlerted = await alertIfNoNetworkConnection('load podcasts')
    if (wasAlerted) return newState

    try {
      const { searchBarText: searchTitle, flatListData = [], querySort, selectedCategory,
        selectedSubCategory } = prevState
      const { settings } = this.global
      const { nsfwMode } = settings
      if (filterKey === _subscribedKey) {
        await getAuthUserInfo() // get the latest subscribedPodcastIds first
        await this._querySubscribedPodcasts()
      } else if (filterKey === _allPodcastsKey) {
        const results = await this._queryAllPodcasts(querySort, newState.queryPage)
        newState.flatListData = [...flatListData, ...results[0]]
        newState.endOfResultsReached = newState.flatListData.length >= results[1]
      } else if (filterKey === _categoryKey) {
        const { querySort, selectedCategory, selectedSubCategory } = prevState
        if (selectedSubCategory || selectedCategory) {
          const results = await this._queryPodcastsByCategory(selectedSubCategory || selectedCategory, querySort, newState.queryPage)
          newState.flatListData = [...flatListData, ...results[0]]
          newState.endOfResultsReached = newState.flatListData.length >= results[1]
          newState.selectedSubCategory = selectedSubCategory || _allCategoriesKey
        } else {
          const categoryResults = await getTopLevelCategories()
          const podcastResults = await this._queryAllPodcasts(querySort, newState.queryPage)
          newState.categoryItems = generateCategoryItems(categoryResults[0])
          newState.flatListData = [...flatListData, ...podcastResults[0]]
          newState.endOfResultsReached = newState.flatListData.length >= podcastResults[1]
        }
      } else if (rightItems.some((option) => option.value === filterKey)) {
        const results = await getPodcasts({
          ...(selectedSubCategory || selectedCategory ? { categories: selectedSubCategory || selectedCategory } : {}) as object,
          sort: filterKey, ...(searchTitle ? { searchTitle } : {})
        }, nsfwMode)
        newState.flatListData = results[0]
        newState.endOfResultsReached = newState.flatListData.length >= results[1]
      } else {
        const { isSubCategory } = queryOptions
        let categories
        if (isSubCategory) {
          categories = filterKey === _allCategoriesKey ? selectedCategory : filterKey
        } else if (filterKey === _allCategoriesKey) {
          newState.selectedCategory = _allCategoriesKey
        } else {
          categories = filterKey
          const category = await getCategoryById(filterKey || '')
          newState.subCategoryItems = generateCategoryItems(category.categories)
          newState.selectedSubCategory = _allCategoriesKey
        }

        const results = await getPodcasts({ categories, sort: querySort, ...(searchTitle ? { searchTitle } : {}) }, nsfwMode)
        newState.endOfResultsReached = results.length < 20
        newState.flatListData = results[0]
        newState.endOfResultsReached = newState.flatListData.length >= results[1]
      }

      return newState
    } catch (error) {
      return newState
    }
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

const styles = StyleSheet.create({
  ListHeaderComponent: {
    borderBottomWidth: 0,
    borderTopWidth: 0,
    flex: 0,
    height: PV.FlatList.searchBar.height,
    justifyContent: 'center'
  },
  view: {
    flex: 1
  }
})
