import AsyncStorage from '@react-native-community/async-storage'
import RNSecureKeyStore from 'react-native-secure-key-store'
import React from 'reactn'
import { ActivityIndicator, Divider, FlatList, PodcastTableCell, TableSectionSelectors,
  View } from '../components'
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
  isLoading: boolean
  isLoadingMore: boolean
  podcasts: any[]
  queryFrom: string | null
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
      isLoading: true,
      isLoadingMore: false,
      podcasts: [...PV.FlatList.endOfListItems],
      queryFrom: _subscribedKey,
      querySort: _alphabeticalKey,
      selectedCategory: null,
      selectedSubCategory: null,
      subCategoryItems: []
    }
  }

  async componentDidMount() {
    const { navigation } = this.props
    let { podcasts } = this.state

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
          podcasts = subscribedPodcasts.concat(podcasts)
        }
      }
    } catch (error) {
      console.log(error.message)
    }

    this.setState({
      isLoading: false,
      podcasts
    })
  }

  _querySubscribedPodcasts = async () => {
    const results = await getSubscribedPodcasts(this.global.session.userInfo.subscribedPodcastIds || [])
    return [...results[0], ...PV.FlatList.endOfListItems]
  }

  _queryAllPodcasts = async (sort: string) => {
    const results = await getPodcasts({ sort }, this.global.settings.nsfwMode)
    return [...results[0], ...PV.FlatList.endOfListItems]
  }

  _queryPodcastsByCategory = async (categoryId: string | null) => {
    const results = await getPodcasts({
      sort: this.state.querySort,
      categories: categoryId
    }, this.global.settings.nsfwMode)
    return [...results[0], ...PV.FlatList.endOfListItems]
  }

  selectLeftItem = async (selectedKey: string) => {
    if (!selectedKey) {
      this.setState({ queryFrom: null })
      return
    }

    this.setState({
      endOfResultsReached: false,
      isLoading: true,
      queryFrom: selectedKey
    }, async () => {
      const newState = {
        isLoading: false
      } as any

      const { selectedCategory, selectedSubCategory } = this.state

      if (selectedKey === _subscribedKey) {
        newState.podcasts = await this._querySubscribedPodcasts()
      } else if (selectedKey === _allPodcastsKey) {
        newState.querySort = _alphabeticalKey
        newState.podcasts = await this._queryAllPodcasts(_alphabeticalKey)
      } else if (selectedKey === _categoryKey) {
        if (selectedSubCategory || selectedCategory) {
          newState.podcasts = await this._queryPodcastsByCategory(selectedSubCategory || selectedCategory)
          newState.selectedSubCategory = _allCategoriesKey
        } else {
          const results = await getTopLevelCategories()
          newState.categoryItems = generateCategoryItems(results[0])
          newState.podcasts = this._queryAllPodcasts(_topPastWeek)
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
      const newState = { isLoading: false } as any

      if (queryFrom === _allPodcastsKey) {
        const results = await getPodcasts({ sort: selectedKey }, nsfwMode)
        newState.podcasts = results[0]
      } else if (queryFrom === _categoryKey) {
        const results = await getPodcasts({
          categories: selectedSubCategory || selectedCategory,
          sort: selectedKey
        }, nsfwMode)
        newState.podcasts = results[0]
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
      const newState = { isLoading: false } as any

      if (selectedKey !== _allCategoriesKey && !isSubCategory) {
        const category = await getCategoryById(selectedKey) as any
        newState.subCategoryItems = generateCategoryItems(category.categories)
        newState.selectedSubCategory = _allCategoriesKey
      }

      const results = await getPodcasts({
        ...(selectedKey === _allCategoriesKey ? {} : { categories: selectedKey }),
        sort: querySort
      }, nsfwMode)
      newState.podcasts = results[0]

      this.setState(newState)
    })
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

  _onEndReached = ({ distanceFromEnd }) => {
    if (this.state.queryFrom !== _subscribedKey && !this.state.endOfResultsReached) {
      if (distanceFromEnd > -1) {
        this.setState({ isLoadingMore: true })
        setTimeout(() => {
          this.setState({
            endOfResultsReached: true,
            isLoadingMore: false
          })
        }, 1500)
      }
    }
  }

  render() {
    const { navigation } = this.props
    const { categoryItems, endOfResultsReached, podcasts, queryFrom, isLoading, isLoadingMore, querySort,
      selectedCategory, selectedSubCategory, subCategoryItems } = this.state
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
          !isLoading && podcasts &&
            <FlatList
              data={podcasts}
              endOfResultsReached={endOfResultsReached}
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

const generateCategoryItems = (categories: any[]) => {
  const items = []

  if (categories && categories.length > 0) {
    for (const category of categories) {
      items.push({
        label: category.title,
        value: category.id
      })
    }
  }

  return items
}

const styles = {
  view: {
    flex: 1
  }
}
