import debounce from 'lodash/debounce'
import React from 'reactn'
import { ActionSheet, ActivityIndicator, Divider, EpisodeTableCell, FlatList, SearchBar,
  TableSectionSelectors, View } from '../components'
import { convertToNowPlayingItem } from '../lib/NowPlayingItem'
import { decodeHTMLString, removeHTMLFromString } from '../lib/utility'
import { PV } from '../resources'
import { getEpisodes } from '../services/episode'
import { core } from '../styles'

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
  searchBarText: string
  selectedItem?: any
  showActionSheet: boolean
}

export class EpisodesScreen extends React.Component<Props, State> {

  static navigationOptions = {
    title: 'Episodes'
  }

  constructor(props: Props) {
    super(props)
    this.state = {
      endOfResultsReached: false,
      flatListData: [],
      isLoading: true,
      isLoadingMore: false,
      queryFrom: _allPodcastsKey,
      queryPage: 1,
      querySort: _mostRecentKey,
      searchBarText: '',
      showActionSheet: false
    }

    this._handleSearchBarTextQuery = debounce(this._handleSearchBarTextQuery, 1000)
  }

  async componentDidMount() {
    const { queryFrom } = this.state
    const newState = await this._queryEpisodeData(queryFrom)
    this.setState(newState)
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
      const newState = await this._queryEpisodeData(selectedKey)
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
      const newState = await this._queryEpisodeData(selectedKey)
      this.setState(newState)
    })
  }

  _onEndReached = ({ distanceFromEnd }) => {
    const { endOfResultsReached, isLoadingMore, queryFrom, queryPage = 1 } = this.state
    if (!endOfResultsReached && !isLoadingMore) {
      if (distanceFromEnd > -1) {
        this.setState({
          isLoadingMore: true,
          queryPage: queryPage + 1
        }, async () => {
          const newState = await this._queryEpisodeData(queryFrom, { queryPage: this.state.queryPage })
          this.setState(newState)
        })
      }
    }
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
    return new Promise((resolve, reject) => {
      this.setState({ showActionSheet: false }, resolve)
    })
  }

  _handleMorePress = (selectedItem: any) => {
    this.setState({
      selectedItem,
      showActionSheet: true
    })
  }

  _renderEpisodeItem = ({ item }) => {
    let description = removeHTMLFromString(item.description)
    description = decodeHTMLString(description)

    return (
      <EpisodeTableCell
          key={item.id}
          description={description}
          handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(item, null, null))}
          handleNavigationPress={() => this.props.navigation.navigate(
            PV.RouteNames.EpisodeScreen, { episode: item }
          )}
          moreButtonAlignToTop={true}
          podcastImageUrl={item.podcast_imageUrl}
          podcastTitle={item.podcast_title}
          pubDate={item.pubDate}
          title={item.title} />
    )
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
      this._handleSearchBarTextQuery(queryFrom, { searchTitle: text })
    })
  }

  _handleSearchBarTextQuery = async (queryFrom: string | null, queryOptions: any) => {
    const state = await this._queryEpisodeData(queryFrom, { searchAllFieldsText: queryOptions.searchAllFieldsText })
    this.setState(state)
  }

  render() {
    const { flatListData, queryFrom, isLoading, isLoadingMore, querySort, selectedItem,
      showActionSheet } = this.state
    const { navigation } = this.props

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
          !isLoading && flatListData &&
            <FlatList
              data={flatListData}
              disableLeftSwipe={queryFrom !== _subscribedKey}
              extraData={flatListData}
              isLoadingMore={isLoadingMore}
              ItemSeparatorComponent={this._ItemSeparatorComponent}
              ListHeaderComponent={this._ListHeaderComponent}
              onEndReached={this._onEndReached}
              renderItem={this._renderEpisodeItem} />
        }
        <ActionSheet
          handleCancelPress={this._handleCancelPress}
          items={PV.ActionSheet.media.moreButtons(
            selectedItem, this.global.session.isLoggedIn, this.global, navigation, this._handleCancelPress
          )}
          showModal={showActionSheet} />
      </View>
    )
  }

  _queryEpisodeData = async (filterKey: string | null, queryOptions: {
    queryPage?: number, searchAllFieldsText?: string
  } = {}) => {
    const newState = {
      isLoading: false,
      isLoadingMore: false
    } as State
    const { flatListData, queryFrom, querySort } = this.state
    const podcastId = this.global.session.userInfo.subscribedPodcastIds
    const nsfwMode = this.global.settings.nsfwMode
    const { queryPage, searchAllFieldsText } = queryOptions

    if (filterKey === _subscribedKey) {
      const results = await getEpisodes({
        sort: querySort,
        page: queryPage,
        podcastId,
        ...(searchAllFieldsText ? { searchAllFieldsText } : {}),
        includePodcast: true
      }, this.global.settings.nsfwMode)
      newState.flatListData = [...flatListData, ...results[0]]
      newState.endOfResultsReached = newState.flatListData.length >= results[1]
    } else if (filterKey === _allPodcastsKey) {
      const { searchBarText: searchAllFieldsText } = this.state
      const results = await getEpisodes({
        sort: querySort,
        page: queryPage,
        ...(searchAllFieldsText ? { searchAllFieldsText } : {}),
        includePodcast: true
      }, this.global.settings.nsfwMode)
      newState.flatListData = [...flatListData, ...results[0]]
      newState.endOfResultsReached = newState.flatListData.length >= results[1]
    } else if (rightItems.some((option) => option.value === filterKey)) {
      const results = await getEpisodes({
        ...(queryFrom === _subscribedKey ? { podcastId } : {}),
        sort: filterKey,
        ...(searchAllFieldsText ? { searchAllFieldsText } : {}),
        includePodcast: true
      }, nsfwMode)
      newState.flatListData = results[0]
      newState.endOfResultsReached = newState.flatListData.length >= results[1]
    }

    return newState
  }
}

const _subscribedKey = 'subscribed'
const _allPodcastsKey = 'allPodcasts'
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
}
