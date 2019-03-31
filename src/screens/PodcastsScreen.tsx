import AsyncStorage from '@react-native-community/async-storage'
import { FlatList } from 'react-native-gesture-handler'
import RNSecureKeyStore from 'react-native-secure-key-store'
import React from 'reactn'
import { ActivityIndicator, Divider, PodcastTableCell, TableSectionSelectors, View } from '../components'
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
  isLoading: boolean
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
      isLoading: true,
      podcasts: [],
      queryFrom: _subscribedKey,
      querySort: _alphabeticalKey,
      selectedCategory: null,
      selectedSubCategory: null,
      subCategoryItems: []
    }
  }

  async componentDidMount() {
    const { navigation } = this.props

    try {
      const appHasLaunched = await AsyncStorage.getItem(PV.Keys.APP_HAS_LAUNCHED)
      if (!appHasLaunched) {
        AsyncStorage.setItem(PV.Keys.APP_HAS_LAUNCHED, 'true')
        navigation.navigate(PV.RouteNames.Onboarding)
      } else {
        const userToken = await RNSecureKeyStore.get('BEARER_TOKEN')
        if (userToken) {
          await getAuthUserInfo()
        }
      }
    } catch (error) {
      console.log(error.message)
    }

    this.setState({ isLoading: false })
  }

  selectLeftItem = async (selectedKey: string) => {
    if (!selectedKey) {
      this.setState({ queryFrom: null })
      return
    }

    const { settings } = this.global
    const { nsfwMode } = settings
    const { selectedCategory, selectedSubCategory } = this.state

    this.setState({
      isLoading: true,
      queryFrom: selectedKey
    })

    let podcasts = []
    const newState = {
      isLoading: false
    } as any

    if (selectedKey === _subscribedKey) {
      const { session } = this.global
      const { subscribedPodcastIds } = session.userInfo
      newState.podcasts = await getSubscribedPodcasts(subscribedPodcastIds || [])
    } else if (selectedKey === _allPodcastsKey) {
      const querySort = _alphabeticalKey
      podcasts = await getPodcasts({ sort: querySort }, nsfwMode)
      newState.podcasts = podcasts[0]
      newState.querySort = querySort
    } else if (selectedKey === _categoryKey) {
      if (selectedSubCategory || selectedCategory) {
        const querySort = this.state.querySort
        podcasts = await getPodcasts({
          sort: querySort,
          categories: selectedSubCategory || selectedCategory
        }, nsfwMode)
        newState.podcasts = podcasts[0]
      } else {
        const querySort = _topPastWeek
        const categories = await getTopLevelCategories()
        newState.categoryItems = generateCategoryItems(categories[0])
        podcasts = await getPodcasts({ sort: querySort }, nsfwMode)
        newState.podcasts = podcasts[0]
        newState.querySort = querySort
      }
    }

    this.setState(newState)
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
      isLoading: true,
      querySort: selectedKey
    })

    let podcasts = []
    const newState = { isLoading: false } as any

    if (queryFrom === _allPodcastsKey) {
      podcasts = await getPodcasts({ sort: selectedKey }, nsfwMode)
      newState.podcasts = podcasts[0]
    } else if (queryFrom === _categoryKey) {
      podcasts = await getPodcasts({
        categories: selectedSubCategory || selectedCategory,
        sort: selectedKey
      }, nsfwMode)
      newState.podcasts = podcasts[0]
    }

    this.setState(newState)
  }

  _selectCategory = async (selectedKey: string, isSubCategory?: boolean) => {
    if (!selectedKey) {
      this.setState({
        ...(isSubCategory ? { selectedCategory: _allCategoriesKey } : { selectedSubCategory: _allCategoriesKey }) as any
      })
      return
    }

    const { settings } = this.global
    const { nsfwMode } = settings
    const { querySort } = this.state

    this.setState({
      isLoading: true,
      ...(isSubCategory ? { selectedSubCategory: selectedKey } : { selectedCategory: selectedKey }) as any,
      ...(!isSubCategory ? { subCategoryItems: [] } : {})
    })

    let podcasts = []
    const newState = { isLoading: false } as any

    if (!isSubCategory) {
      const category = await getCategoryById(selectedKey)
      newState.subCategoryItems = generateCategoryItems(category.categories)
      newState.selectedSubCategory = _allCategoriesKey
    }

    podcasts = await getPodcasts({
      ...(selectedKey === _allCategoriesKey ? {} : { categories: selectedKey }),
      sort: querySort
    }, nsfwMode)
    newState.podcasts = podcasts[0]

    this.setState(newState)
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

  render() {
    const { navigation } = this.props
    const { categoryItems, queryFrom, isLoading, querySort, selectedCategory, selectedSubCategory,
      subCategoryItems } = this.state
    const { globalTheme, session, showPlayer, subscribedPodcasts = [] } = this.global
    const { userInfo = {}, isLoggedIn = false } = session
    const { name = '' } = userInfo

    let podcasts = []
    if (queryFrom === _subscribedKey) {
      podcasts = subscribedPodcasts
    } else if (queryFrom === _allPodcastsKey || queryFrom === _categoryKey) {
      podcasts = this.state.podcasts
    }

    return (
      <View style={styles.view}>
        <TableSectionSelectors
          handleSelectLeftItem={this.selectLeftItem}
          handleSelectRightItem={this.selectRightItem}
          leftItems={leftItems}
          rightItems={queryFrom === _subscribedKey ? [] : rightItems}
          selectedLeftItemKey={queryFrom}
          selectedRightItemKey={querySort} />

        {
          queryFrom === _categoryKey && categoryItems &&
            <TableSectionSelectors
              handleSelectLeftItem={(x: string) => this._selectCategory(x)}
              handleSelectRightItem={(x: string) => this._selectCategory(x, true)}
              leftItems={categoryItems}
              rightItems={subCategoryItems}
              selectedLeftItemKey={selectedCategory || _allCategoriesKey}
              selectedRightItemKey={selectedSubCategory || _allCategoriesKey} />
        }
        {
          isLoading &&
            <ActivityIndicator />
        }
        {
          !isLoading &&
            <FlatList
              data={podcasts}
              ItemSeparatorComponent={() => <Divider noMargin={true} />}
              keyExtractor={(item) => item.id}
              renderItem={this._renderPodcastItem}
              style={{ flex: 1 }} />
        }
      </View>
    )
  }
}

const styles = {
  view: {
    flex: 1
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
  const combinedItems = [
    {
      label: 'All',
      value: _allCategoriesKey
    }
  ]

  for (const category of categories) {
    combinedItems.push({
      label: category.title,
      value: category.id
    })
  }

  if (combinedItems.length > 1) {
    return combinedItems
  } else {
    return []
  }
}
