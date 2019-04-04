import AsyncStorage from '@react-native-community/async-storage'
import RNSecureKeyStore from 'react-native-secure-key-store'
import React from 'reactn'
import { ActivityIndicator, Divider, FlatList, PodcastTableCell, TableSectionSelectors,
  View } from '../components'
import { generateCategoryItems, generateFlatListDataArray, insertInFlatListDataArray } from '../lib/utility'
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
      flatListData: generateFlatListDataArray([]),
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
          flatListData = subscribedPodcasts.concat(flatListData)
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
      queryPage: 1
    }, async () => {
      const newState = {
        isLoading: false
      } as State

      const { querySort, selectedCategory, selectedSubCategory } = this.state

      if (selectedKey === _subscribedKey) {
        const results = await this._querySubscribedPodcasts()
        newState.flatListData = generateFlatListDataArray(results[0], false)
      } else if (selectedKey === _allPodcastsKey) {
        newState.querySort = _alphabeticalKey
        const results = await this._queryAllPodcasts(_alphabeticalKey)
        newState.flatListData = generateFlatListDataArray(results[0])
        newState.endOfResultsReached = newState.flatListData.length >= results[1] + 2
      } else if (selectedKey === _categoryKey) {
        if (selectedSubCategory || selectedCategory) {
          const results = await this._queryPodcastsByCategory(selectedSubCategory || selectedCategory, querySort)
          newState.flatListData = generateFlatListDataArray(results[0])
          newState.endOfResultsReached = newState.flatListData.length >= results[1] + 2
          newState.selectedSubCategory = _allCategoriesKey
        } else {
          const categoryResults = await getTopLevelCategories()
          newState.categoryItems = generateCategoryItems(categoryResults[0])
          const podcastResults = await this._queryAllPodcasts(_topPastWeek)
          newState.flatListData = generateFlatListDataArray(podcastResults[0])
          newState.endOfResultsReached = newState.flatListData.length >= podcastResults[1] + 2
          newState.querySort = _topPastWeek
          newState.selectedCategory = _allCategoriesKey
        }
      }

      this.setState(newState)
    })
  }

  selectRightItem = async (selectedKey: string) => {
    if (!selectedKey) {
      this.setState({ querySort: null })
      return
    }

    const { settings } = this.global
    const { nsfwMode } = settings
    const { queryFrom, selectedCategory, selectedSubCategory } = this.state

    this.setState({
      endOfResultsReached: false,
      isLoading: true,
      querySort: selectedKey
    }, async () => {
      const newState = { isLoading: false } as State

      if (queryFrom === _allPodcastsKey) {
        const results = await getPodcasts({ sort: selectedKey }, nsfwMode)
        newState.flatListData = generateFlatListDataArray(results[0])
        newState.endOfResultsReached = newState.flatListData.length >= results[1] + 2
      } else if (queryFrom === _categoryKey) {
        const results = await getPodcasts({
          categories: selectedSubCategory || selectedCategory,
          sort: selectedKey
        }, nsfwMode)
        newState.flatListData = generateFlatListDataArray(results[0])
        newState.endOfResultsReached = newState.flatListData.length >= results[1] + 2
      }

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

    const { settings } = this.global
    const { nsfwMode } = settings
    const { querySort } = this.state

    this.setState({
      endOfResultsReached: false,
      isLoading: true,
      ...(isSubCategory ? { selectedSubCategory: selectedKey } : { selectedCategory: selectedKey }) as any,
      ...(!isSubCategory ? { subCategoryItems: [] } : {})
    }, async () => {
      const newState = { isLoading: false } as State

      if (selectedKey !== _allCategoriesKey && !isSubCategory) {
        const category = await getCategoryById(selectedKey) as any
        newState.subCategoryItems = generateCategoryItems(category.categories)
        newState.selectedSubCategory = _allCategoriesKey
      }

      const results = await getPodcasts({
        ...(selectedKey === _allCategoriesKey ? {} : { categories: selectedKey }),
        sort: querySort
      }, nsfwMode)
      newState.endOfResultsReached = results.length < 20
      newState.flatListData = generateFlatListDataArray(results[0])
      newState.endOfResultsReached = newState.flatListData.length >= results[1] + 2

      this.setState(newState)
    })
  }

  _onEndReached = ({ distanceFromEnd }) => {
    const { endOfResultsReached, flatListData, queryFrom, queryPage = 1, querySort } = this.state
    if (queryFrom !== _subscribedKey && !endOfResultsReached) {
      if (distanceFromEnd > -1) {
        this.setState({
          isLoadingMore: true
        }, async () => {
          const nextPage = queryPage + 1
          const newState = {
            isLoadingMore: false,
            queryPage: nextPage
          } as State

          const { selectedCategory, selectedSubCategory } = this.state
          if (queryFrom === _allPodcastsKey) {
            newState.querySort = _alphabeticalKey
            const results = await this._queryAllPodcasts(querySort, nextPage)
            newState.flatListData = insertInFlatListDataArray(flatListData, results[0])
            newState.endOfResultsReached = newState.flatListData.length >= results[1] + 2
          } else if (queryFrom === _categoryKey) {
            if (selectedSubCategory || selectedCategory) {
              const results = await this._queryPodcastsByCategory(
                selectedSubCategory || selectedCategory, querySort, nextPage
              )
              newState.flatListData = insertInFlatListDataArray(flatListData, results[0])
              newState.endOfResultsReached = newState.flatListData.length >= results[1] + 2
              newState.selectedSubCategory = _allCategoriesKey
            } else {
              const results = await this._queryAllPodcasts(querySort, nextPage)
              newState.flatListData = insertInFlatListDataArray(flatListData, results[0])
              newState.endOfResultsReached = newState.flatListData.length >= results[1] + 2
              newState.querySort = _topPastWeek
              newState.selectedCategory = _allCategoriesKey
            }
          }

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

  _ItemSeparatorComponent = (x: any) => {
    if (x.leadingItem.id === PV.FlatList.endOfResultsKey || x.leadingItem.id === PV.FlatList.isLoadingMoreKey) {
      return <View />
    } else {
      return <Divider noMargin={true} />
    }
  }

  _handleFilterInputTextChange = (text) => {
    console.log('hiiii', text)
    this.setState({
      filterInputText: text
    })
  }

  _handleGetItemLayout = (data, index) => {
    const { queryFrom } = this.state

  console.log(data, index)
    return {
      length: PV.Cells.podcast.wrapper.height + 1,
      offset: 0,
      index
    }
    // // Why does index sometimes === -1???
    // if (queryFrom === _subscribedKey) {
    //   return {
    //     length: PV.Cells.podcast.wrapper.height + 1,
    //     offset: 0,
    //     index
    //   }
    // } else {
    //   if (index === 0) {
    //     return {
    //       length: PV.FlatList.filterInput.height + 1,
    //       offset: 0,
    //       index
    //     }
    //   } else if (data.length <= (index + 2)) {
    //     const adjustedIndex = data.length === index + 1 ? index - 1 : index
    //     const offset =
    //       (PV.FlatList.filterInput.height + 1) +
    //       ((PV.Cells.podcast.wrapper.height + 1) * (adjustedIndex))
    //     return {
    //       length: PV.FlatList.filterInput.height + 1,
    //       offset,
    //       index
    //     }
    //   } else {
    //     return {
    //       length: PV.Cells.podcast.wrapper.height + 1,
    //       offset: 0,
    //       index
    //     }
    //   }
    // }
  }

  render() {
    const { navigation } = this.props
    const { categoryItems, endOfResultsReached, filterInputText, flatListData, queryFrom, isLoading,
      isLoadingMore, querySort, selectedCategory, selectedSubCategory, subCategoryItems } = this.state
    const { globalTheme, session, showPlayer, subscribedPodcasts = [] } = this.global
    const { userInfo = {}, isLoggedIn = false } = session
    const { name = '' } = userInfo

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
              endOfResultsReached={endOfResultsReached}
              filterInputText={filterInputText}
              handleFilterInputChangeText={this._handleFilterInputTextChange}
              handleGetItemLayout={this._handleGetItemLayout}
              initialScrollIndex={queryFrom === _subscribedKey ? 0 : 1}
              isLoadingMore={isLoadingMore}
              ItemSeparatorComponent={this._ItemSeparatorComponent}
              onEndReached={this._onEndReached}
              renderItem={this._renderPodcastItem} />
        }
      </View>
    )
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
