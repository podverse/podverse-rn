import React from 'reactn'
import { ActivityIndicator, ClipTableCell, Divider, FlatList, PlaylistTableCell,
  PodcastTableCell, TableSectionSelectors, View } from '../components'
import { generateAuthorsText, generateCategoriesText, readableDate } from '../lib/utility'
import { PV } from '../resources'
import { getPublicUser } from '../services/user'

type Props = {
  navigation?: any
}

type State = {
  endOfResultsReached: boolean
  flatListData: any[]
  isLoading: boolean
  isLoadingMore: boolean
  queryFrom: string | null
  queryPage: number
  querySort: string | null
  user?: any
}

export class ProfileScreen extends React.Component<Props, State> {

  static navigationOptions = {
    title: 'Profile'
  }

  constructor(props: Props) {
    super(props)
    this.state = {
      endOfResultsReached: false,
      flatListData: [],
      isLoading: true,
      isLoadingMore: false,
      queryFrom: _podcastsKey,
      queryPage: 1,
      querySort: _alphabeticalKey,
      user: props.navigation.getParam('user')
    }
  }

  async componentDidMount() {
    const { user } = this.state
    const newUser = await getPublicUser(user.id)
    this.setState({
      isLoading: false,
      user: newUser
    })
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
      const newState = await this._queryData(selectedKey, 1)
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
      const newState = await this._queryData(selectedKey, 1)

      this.setState(newState)
    })
  }

  _onEndReached = ({ distanceFromEnd }) => {
    const { endOfResultsReached, isLoadingMore, queryFrom, queryPage = 1 } = this.state
    if (!endOfResultsReached && !isLoadingMore) {
      if (distanceFromEnd > -1) {
        this.setState({
          isLoadingMore: true
        }, async () => {
          const newState = await this._queryData(queryFrom, queryPage + 1)
          this.setState(newState)
        })
      }
    }
  }

  _ItemSeparatorComponent = () => {
    return <Divider />
  }

  _handlePodcastPress = (podcast: any) => {
    console.log('podcast pressed')
  }

  _handleClipPress = (clip: any) => {
    console.log('clip pressed')
  }

  _handleClipMorePress = (clip: any) => {
    console.log('clip more pressed')
  }

  _handlePlaylistPress = (playlist: any) => {
    console.log('playlist pressed')
  }

  _renderItem = ({ item }) => {
    const { queryFrom } = this.state

    if (queryFrom === _podcastsKey) {
      return (
        <PodcastTableCell
          key={item.id}
          lastEpisodePubDate={item.lastEpisodePubDate}
          onPress={() => this._handlePodcastPress(item)}
          podcastAuthors={generateAuthorsText(item.authors)}
          podcastCategories={generateCategoriesText(item.categories)}
          podcastImageUrl={item.imageUrl}
          podcastTitle={item.title} />
      )
    } else if (queryFrom === _clipsKey) {
      return (
        <ClipTableCell
          key={item.id}
          endTime={item.endTime}
          episodePubDate={readableDate(item.episode.pubDate)}
          episodeTitle={item.episode.title}
          handleMorePress={() => this._handleClipMorePress(item)}
          podcastImageUrl={item.episode.podcast.imageUrl}
          podcastTitle={item.episode.podcast.title}
          startTime={item.startTime}
          title={item.title} />
      )
    } else {
      return (
        <PlaylistTableCell
          key={item.id}
          itemCount={item.itemCount}
          onPress={() => this.props.navigation.navigate(
            PV.RouteNames.PlaylistScreen, {
              playlist: item,
              navigationTitle: 'Playlist'
            }
          )}
          title={item.title} />
      )
    }
  }

  render() {
    const { flatListData, queryFrom, isLoading, isLoadingMore, querySort } = this.state

    return (
      <View style={styles.view}>
        <TableSectionSelectors
          handleSelectLeftItem={this.selectLeftItem}
          handleSelectRightItem={this.selectRightItem}
          leftItems={leftItems}
          rightItems={rightItems}
          selectedLeftItemKey={queryFrom}
          selectedRightItemKey={querySort} />
        {
          isLoading &&
          <ActivityIndicator />
        }
        {
          !isLoading && queryFrom && flatListData && flatListData.length > 0 &&
          <FlatList
            data={flatListData}
            disableLeftSwipe={true}
            extraData={flatListData}
            isLoadingMore={isLoadingMore}
            ItemSeparatorComponent={this._ItemSeparatorComponent}
            onEndReached={this._onEndReached}
            renderItem={this._renderItem} />
        }
      </View>
    )
  }

  _queryData = async (filterKey: string | null, page: number = 1) => {
    const newState = {
      isLoading: false,
      isLoadingMore: false,
      queryPage: page
    } as State

    const { searchBarText: searchTitle, flatListData = [], querySort, selectedCategory,
      selectedSubCategory } = prevState
    const { settings } = this.global
    const { nsfwMode } = settings
    if (filterKey === _subscribedKey) {
      const results = await this._querySubscribedPodcasts()
      newState.flatListData = results[0]
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
  }
}

const _podcastsKey = 'podcasts'
const _clipsKey = 'clips'
const _playlistsKey = 'playlists'
const _alphabeticalKey = 'alphabetical'
const _mostRecentKey = 'most-recent'
const _topPastDay = 'top-past-day'
const _topPastWeek = 'top-past-week'
const _topPastMonth = 'top-past-month'
const _topPastYear = 'top-past-year'

const leftItems = [
  {
    label: 'Podcasts',
    value: _podcastsKey
  },
  {
    label: 'Clips',
    value: _clipsKey
  },
  {
    label: 'Playlists',
    value: _playlistsKey
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
