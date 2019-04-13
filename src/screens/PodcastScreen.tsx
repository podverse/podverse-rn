import debounce from 'lodash/debounce'
import React from 'reactn'
import { ActionSheet, ActivityIndicator, ClipTableCell, Divider, EpisodeTableCell, FlatList,
  PodcastTableHeader, SearchBar, SwipeRowBack, TableSectionSelectors, Text, View } from '../components'
import { readableDate, removeHTMLFromString } from '../lib/utility'
import { PV } from '../resources'
import { getEpisodes } from '../services/episode'
import { getMediaRefs } from '../services/mediaRef'
import { getPodcast } from '../services/podcast'
import { core } from '../styles'

const { aboutKey, allEpisodesKey, clipsKey, downloadedKey, mostRecentKey, topPastDay, topPastMonth,
  topPastWeek, topPastYear } = PV.Filters

type Props = {
  navigation?: any
}

type State = {
  endOfResultsReached: boolean
  flatListData: any[]
  isLoading: boolean
  isLoadingMore: boolean
  isRefreshing: boolean
  isSearchScreen?: boolean
  podcast: any
  queryPage: number
  querySort: string | null
  searchBarText: string
  showActionSheet: boolean
  viewType: string | null
}

export class PodcastScreen extends React.Component<Props, State> {

  static navigationOptions = {
    title: 'Podcast'
  }

  constructor(props: Props) {
    super(props)

    const viewType = this.props.navigation.getParam('viewType') || allEpisodesKey

    this.state = {
      endOfResultsReached: false,
      searchBarText: '',
      flatListData: [], // TODO: initially load downloaded
      isLoading: viewType !== downloadedKey, // TODO: initially handle downloaded
      isLoadingMore: false,
      isRefreshing: false,
      podcast: props.navigation.getParam('podcast'),
      queryPage: 1,
      querySort: mostRecentKey,
      showActionSheet: false,
      viewType
    }

    this._handleSearchBarTextQuery = debounce(this._handleSearchBarTextQuery, 1000)
  }

  async componentDidMount() {
    const { podcast, viewType } = this.state

    if (viewType === allEpisodesKey) {
      const newState = await this._queryData(allEpisodesKey)
      this.setState(newState)
    } else if (viewType === clipsKey) {
      const newState = await this._queryData(clipsKey)
      this.setState(newState)
    } else if (viewType === aboutKey) {
      const newPodcast = await getPodcast(podcast.id)
      this.setState({
        isLoading: false,
        podcast: newPodcast
      })
    }
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
    const { endOfResultsReached, isLoadingMore, queryPage = 1, viewType } = this.state
    if (viewType !== downloadedKey && !endOfResultsReached && !isLoadingMore) {
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
    return <Divider />
  }

  _handleCancelPress = () => {
    this.setState({ showActionSheet: false })
  }

  _handleMorePress = () => {
    this.setState({ showActionSheet: true })
  }

  _renderItem = ({ item }) => {
    const { podcast, viewType } = this.state

    const episode = {
      ...item,
      podcast
    }
    const isSearchScreen = this.props.navigation.getParam('isSearchScreen')
    const screen = isSearchScreen ? PV.RouteNames.SearchEpisodeScreen : PV.RouteNames.EpisodeScreen

    if (viewType === downloadedKey) {
      return (
        <EpisodeTableCell
          key={item.id}
          description={removeHTMLFromString(item.description)}
          handleMorePress={this._handleMorePress}
          handleNavigationPress={() => this.props.navigation.navigate(screen, { episode })}
          pubDate={item.pubDate}
          title={item.title} />
      )
    } else if (viewType === allEpisodesKey) {
      return (
        <EpisodeTableCell
          key={item.id}
          description={removeHTMLFromString(item.description)}
          handleMorePress={this._handleMorePress}
          handleNavigationPress={() => this.props.navigation.navigate(screen, { episode })}
          pubDate={item.pubDate}
          title={item.title} />
      )
    } else {
      return (
        <ClipTableCell
          key={item.id}
          endTime={item.endTime}
          episodePubDate={readableDate(item.episode.pubDate)}
          episodeTitle={item.episode.title}
          handleMorePress={this._handleMorePress}
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
    const { flatListData, isLoading, isLoadingMore, isRefreshing, podcast, querySort, showActionSheet,
      viewType } = this.state
    const { globalTheme } = this.global

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
          rightItems={viewType && viewType !== aboutKey ? rightItems : []}
          selectedLeftItemKey={viewType}
          selectedRightItemKey={querySort} />
        {
          isLoading &&
            <ActivityIndicator />
        }
        {
          !isLoading && viewType !== aboutKey && flatListData && flatListData.length > 0 &&
            <FlatList
              data={flatListData}
              disableLeftSwipe={viewType !== downloadedKey}
              extraData={flatListData}
              {...(viewType === downloadedKey ? { handleHiddenItemPress: this._handleHiddenItemPress } : {})}
              isLoadingMore={isLoadingMore}
              isRefreshing={isRefreshing}
              ItemSeparatorComponent={this._ItemSeparatorComponent}
              {...(viewType === allEpisodesKey || viewType === clipsKey ? { ListHeaderComponent: this._ListHeaderComponent } : {})}
              onEndReached={this._onEndReached}
              renderHiddenItem={this._renderHiddenItem}
              renderItem={this._renderItem} />
        }
        {
          viewType === aboutKey &&
            <View style={styles.aboutView}>
              <Text style={styles.aboutViewText}>{podcast.description}</Text>
            </View>
        }
        <ActionSheet
          globalTheme={globalTheme}
          handleCancelPress={this._handleCancelPress}
          items={moreButtons}
          showModal={showActionSheet} />
      </View>
    )
  }

  _queryAllEpisodes = async (sort: string | null, page: number = 1) => {
    const { podcast, searchBarText: searchAllFieldsText } = this.state
    console.log('asdf', page)
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

  _queryData = async (filterKey: string | null, queryOptions: { queryPage?: number, searchAllFieldsText?: string } = {}) => {
    const { flatListData, podcast, querySort, viewType } = this.state
    const newState = {
      isLoading: false,
      isLoadingMore: false,
      isRefreshing: false
    } as State

    if (filterKey === downloadedKey) {
      console.log('retrieve downloaded from local storage')
      newState.flatListData = []
      newState.endOfResultsReached = true
    } else if (filterKey === allEpisodesKey) {
      const results = await this._queryAllEpisodes(querySort, queryOptions.queryPage)
      newState.flatListData = [...flatListData, ...results[0]]
      newState.endOfResultsReached = newState.flatListData.length >= results[1]
    } else if (filterKey === clipsKey) {
      const results = await this._queryClips(querySort, queryOptions.queryPage)
      newState.flatListData = [...flatListData, ...results[0]]
      newState.endOfResultsReached = newState.flatListData.length >= results[1]
    } else if (rightItems.some((option) => option.value === filterKey)) {
      let results = []
      if (viewType === downloadedKey) {
        console.log('retrieve downloaded from local storage')
      } else if (viewType === allEpisodesKey) {
        results = await this._queryAllEpisodes(querySort)
      } else if (viewType === clipsKey) {
        results = await this._queryClips(querySort)
      }

      newState.flatListData = [...flatListData, ...results[0]]
      newState.endOfResultsReached = newState.flatListData.length >= results[1]
    } else if (filterKey === aboutKey) {
      const newPodcast = await getPodcast(podcast.id)
      newState.podcast = newPodcast
    }

    newState.queryPage = queryOptions.queryPage || 1

    return newState
  }
}

const leftItems = [
  {
    label: 'Downloaded',
    value: downloadedKey
  },
  {
    label: 'All Episodes',
    value: allEpisodesKey
  },
  {
    label: 'Clips',
    value: clipsKey
  },
  {
    label: 'About',
    value: aboutKey
  }
]

const rightItems = [
  {
    label: 'most recent',
    value: mostRecentKey
  },
  {
    label: 'top - past day',
    value: topPastDay
  },
  {
    label: 'top - past week',
    value: topPastWeek
  },
  {
    label: 'top - past month',
    value: topPastMonth
  },
  {
    label: 'top - past year',
    value: topPastYear
  }
]

const moreButtons = [
  {
    key: 'stream',
    text: 'Stream',
    onPress: () => console.log('Stream')
  },
  {
    key: 'download',
    text: 'Download',
    onPress: () => console.log('Download')
  },
  {
    key: 'queueNext',
    text: 'Queue: Next',
    onPress: () => console.log('Queue: Next')
  },
  {
    key: 'queueLast',
    text: 'Queue: Last',
    onPress: () => console.log('Queue: Last')
  },
  {
    key: 'addToPlaylist',
    text: 'Add to Playlist',
    onPress: () => console.log('Add to Playlist')
  }
]

const styles = {
  aboutView: {
    margin: 8
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
