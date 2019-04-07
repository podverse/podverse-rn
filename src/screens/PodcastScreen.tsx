import debounce from 'lodash/debounce'
import React from 'reactn'
import { ActivityIndicator, ClipTableCell, Divider, EpisodeTableCell, FlatList, PodcastTableHeader, SearchBar,
  SwipeRowBack, TableSectionSelectors, Text, View } from '../components'
import { removeHTMLFromString } from '../lib/utility'
import { PV } from '../resources'
import { getEpisodes } from '../services/episode'
import { getMediaRefs } from '../services/mediaRef'
import { getPodcast } from '../services/podcast'
import { core } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  endOfResultsReached: boolean
  flatListData: any[]
  isLoading: boolean
  isLoadingMore: boolean
  isRefreshing: boolean
  podcast: any
  queryPage: number
  querySort: string | null
  searchBarText: string
  viewType: string | null
}

export class PodcastScreen extends React.Component<Props, State> {

  static navigationOptions = {
    title: 'Podcast'
  }

  constructor(props: Props) {
    super(props)

    this.state = {
      endOfResultsReached: false,
      searchBarText: '',
      flatListData: [], // TODO: initially load downloaded
      isLoading: false, // TODO: initially handle downloaded
      isLoadingMore: false,
      isRefreshing: false,
      podcast: props.navigation.getParam('podcast'),
      queryPage: 1,
      querySort: _mostRecentKey,
      viewType: this.props.navigation.getParam('viewType') || _downloadedKey
    }

    this._handleSearchBarTextQuery = debounce(this._handleSearchBarTextQuery, 1000)
  }

  selectLeftItem = async (selectedKey: string) => {
    if (!selectedKey) {
      this.setState({ viewType: null })
      return
    }

    this.setState({
      endOfResultsReached: false,
      flatListData: [],
      isLoading: true,
      queryPage: 1,
      viewType: selectedKey
    }, async () => {
      const newState = await this._queryData(selectedKey)
      this.setState(newState)
    })
  }

  selectRightItem = async (selectedKey: string) => {
    if (!selectedKey) {
      this.setState({ querySort: null })
      return
    }

    this.setState({
      flatListData: [],
      endOfResultsReached: false,
      isLoading: true,
      querySort: selectedKey
    }, async () => {
      const newState = await this._queryData(selectedKey)
      this.setState(newState)
    })
  }

  _onEndReached = ({ distanceFromEnd }) => {
    const { endOfResultsReached, queryPage = 1, viewType } = this.state
    if (viewType !== _downloadedKey && !endOfResultsReached) {
      if (distanceFromEnd > -1) {
        this.setState({
          isLoadingMore: true
        }, async () => {
          const newState = await this._queryData(viewType, { queryPage: queryPage + 1 })
          this.setState(newState)
        })
      }
    }
  }

  _onRefresh = () => {
    const { viewType } = this.state

    this.setState({
      isRefreshing: true
    }, async () => {
      const newState = await this._queryData(viewType, { queryPage: 1 })
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
    return <Divider noMargin={true} />
  }

  _renderItem = ({ item }) => {
    const { viewType } = this.state

    if (viewType === _downloadedKey) {
      return (
        <EpisodeTableCell
          key={item.id}
          description={removeHTMLFromString(item.description)}
          handleMorePress={() => console.log('more press')}
          handleNavigationPress={() => console.log('navigation press')}
          pubDate={item.pubDate}
          title={item.title} />
      )
    } else if (viewType === _allEpisodesKey) {
      return (
        <EpisodeTableCell
          key={item.id}
          description={removeHTMLFromString(item.description)}
          handleMorePress={() => console.log('more press')}
          handleNavigationPress={() => console.log('navigation press')}
          pubDate={item.pubDate}
          title={item.title} />
      )
    } else {
      return (
        <ClipTableCell
          key={item.id}
          endTime={item.endTime}
          episodePubDate={item.episode.pubDate}
          episodeTitle={item.episode.title}
          handleMorePress={() => console.log('more press')}
          podcastImageUrl={item.episode.podcast.imageUrl}
          podcastTitle={item.episode.podcast.title}
          startTime={item.startTime}
          title={item.title} />
      )
    }
  }

  _renderHiddenItem = ({ item }, rowMap) => (
    <SwipeRowBack
      onPress={() => this._handleHiddenItemPress(item.id, rowMap)}
      styles={styles.swipeRowBack} />
  )

  _handleHiddenItemPress = async (selectedId, rowMap) => {
    // TODO: hidden item only appears for removing/deleting downloaded episodes
    console.log('handleHiddenItemPress')
    // rowMap[selectedId].closeRow()
    // const { flatListData } = this.state
    // await toggleSubscribeToPodcast(selectedId)
    // const newFlatListData = flatListData.filter((x) => x.id !== selectedId)
    // this.setState({ flatListData: newFlatListData })
  }

  _handleSearchBarTextChange = (text: string) => {
    const { viewType } = this.state

    this.setState({
      flatListData: [],
      isLoadingMore: true,
      queryPage: 1,
      searchBarText: text
    }, async () => {
      this._handleSearchBarTextQuery(viewType, { searchAllFieldsText: text })
    })
  }

  _handleSearchBarTextQuery = async (viewType: string | null, queryOptions: any) => {
    const state = await this._queryData(viewType, { searchAllFieldsText: queryOptions.searchAllFieldsText })
    this.setState(state)
  }

  _handleSearchBarClear = (text: string) => {
    this.setState({ searchBarText: '' })
  }

  render() {
    const { flatListData, isLoading, isLoadingMore, isRefreshing, podcast, querySort, viewType } = this.state

    return (
      <View style={styles.view}>
        <PodcastTableHeader
          autoDownloadOn={true}
          podcastImageUrl={podcast.imageUrl}
          podcastTitle={podcast.title} />
        <TableSectionSelectors
          handleSelectLeftItem={this.selectLeftItem}
          handleSelectRightItem={this.selectRightItem}
          leftItems={leftItems}
          rightItems={viewType && viewType !== _aboutKey ? rightItems : []}
          selectedLeftItemKey={viewType}
          selectedRightItemKey={querySort} />
        {
          isLoading &&
          <ActivityIndicator />
        }
        {
          !isLoading && viewType !== _aboutKey && flatListData &&
          <FlatList
            data={flatListData}
            disableLeftSwipe={viewType !== _downloadedKey}
            extraData={flatListData}
            {...(viewType === _downloadedKey ? { handleHiddenItemPress: this._handleHiddenItemPress } : {})}
            isLoadingMore={isLoadingMore}
            isRefreshing={isRefreshing}
            ItemSeparatorComponent={this._ItemSeparatorComponent}
            {...(viewType === _allEpisodesKey || viewType === _clipsKey ? { ListHeaderComponent: this._ListHeaderComponent } : {})}
            onEndReached={this._onEndReached}
            renderHiddenItem={this._renderHiddenItem}
            renderItem={this._renderItem} />
        }
        {
          viewType === _aboutKey &&
            <View style={styles.aboutView}>
              <Text style={styles.aboutViewText}>{podcast.description}</Text>
            </View>
        }
      </View>
    )
  }

  _queryAllEpisodes = async (sort: string | null, page: number = 1) => {
    const { podcast, searchBarText: searchAllFieldsText } = this.state
    const results = await getEpisodes({
      sort, page, podcastId: podcast.id, ...(searchAllFieldsText ? { searchAllFieldsText } : {})
    }, this.global.settings.nsfwMode)
    return results
  }

  _queryClips = async (sort: string | null, page: number = 1) => {
    const { podcast, searchBarText: searchAllFieldsText } = this.state
    const results = await getMediaRefs({
      sort, page, podcastId: podcast.id, ...(searchAllFieldsText ? { searchAllFieldsText } : {})
    }, this.global.settings.nsfwMode)
    return results
  }

  _queryData = async (filterKey: string | null, queryOptions: { searchAllFieldsText?: string } = {}) => {
    const { flatListData, podcast, queryPage, querySort, viewType } = this.state
    const newState = {
      isLoading: false,
      isLoadingMore: false,
      isRefreshing: false
    } as State

    if (filterKey === _downloadedKey) {
      console.log('retrieve downloaded from local storage')
      newState.flatListData = []
      newState.endOfResultsReached = true
    } else if (filterKey === _allEpisodesKey) {
      const results = await this._queryAllEpisodes(querySort, queryPage)
      newState.flatListData = [...flatListData, ...results[0]]
      newState.endOfResultsReached = newState.flatListData.length >= results[1]
    } else if (filterKey === _clipsKey) {
      const results = await this._queryClips(querySort, queryPage)
      newState.flatListData = [...flatListData, ...results[0]]
      newState.endOfResultsReached = newState.flatListData.length >= results[1]
    } else if (rightItems.some((option) => option.value === filterKey)) {
      let results = []
      if (viewType === _downloadedKey) {
        console.log('retrieve downloaded from local storage')
      } else if (viewType === _allEpisodesKey) {
        results = await this._queryAllEpisodes(querySort)
      } else if (viewType === _clipsKey) {
        results = await this._queryClips(querySort)
      }

      newState.flatListData = [...flatListData, ...results[0]]
      newState.endOfResultsReached = newState.flatListData.length >= results[1]
    } else if (filterKey === _aboutKey) {
      const newPodcast = await getPodcast(podcast.id)
      newState.podcast = newPodcast
    }

    return newState
  }
}

const _downloadedKey = 'downloaded'
const _allEpisodesKey = 'allEpisodes'
const _clipsKey = 'clips'
const _aboutKey = 'about'
const _mostRecentKey = 'most-recent'
const _topPastDay = 'top-past-day'
const _topPastWeek = 'top-past-week'
const _topPastMonth = 'top-past-month'
const _topPastYear = 'top-past-year'

const leftItems = [
  {
    label: 'Downloaded',
    value: _downloadedKey
  },
  {
    label: 'All Episodes',
    value: _allEpisodesKey
  },
  {
    label: 'Clips',
    value: _clipsKey
  },
  {
    label: 'About',
    value: _aboutKey
  }
]

const rightItems = [
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
  aboutView: {
    marginBottom: 12,
    marginLeft: 8,
    marginRight: 8,
    marginTop: 12
  },
  aboutViewText: {
    fontSize: PV.Fonts.sizes.lg
  },
  ListHeaderComponent: {
    borderBottomWidth: 0,
    borderTopWidth: 0,
    flex: 0,
    height: PV.FlatList.searchBar.height,
    justifyContent: 'center'
  },
  swipeRowBack: {
    marginBottom: 8,
    marginTop: 8
  },
  view: {
    flex: 1
  }
}
