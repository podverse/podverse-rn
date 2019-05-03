import debounce from 'lodash/debounce'
import { View as RNView } from 'react-native'
import React from 'reactn'
import { ActionSheet, ActivityIndicator, ClipTableCell, Divider, EpisodeTableHeader, FlatList,
  NavQueueIcon, NavShareIcon, SearchBar, TableSectionSelectors, Text, View } from '../components'
import { convertToNowPlayingItem } from '../lib/NowPlayingItem'
import { removeHTMLFromString } from '../lib/utility'
import { PV } from '../resources'
import { getMediaRefs } from '../services/mediaRef'
import { core } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  endOfResultsReached: boolean
  episode: any
  flatListData: any[]
  isLoading: boolean
  isLoadingMore: boolean
  queryPage: number
  querySort: string | null
  searchBarText: string
  selectedItem?: any
  showActionSheet: boolean
  viewType: string | null
}

export class EpisodeScreen extends React.Component<Props, State> {

  static navigationOptions = ({ navigation }) => {
    const episode = navigation.getParam('episode')
    return {
      title: 'Episode',
      headerRight: (
        <RNView style={core.row}>
          <NavShareIcon url={PV.URLs.episode + episode.id} />
          <NavQueueIcon navigation={navigation} />
        </RNView>
      )
    } as NavigationScreenOptions
  }

  constructor(props: Props) {
    super(props)

    const viewType = this.props.navigation.getParam('viewType') || _clipsKey
    const episode = this.props.navigation.getParam('episode')

    this.state = {
      endOfResultsReached: false,
      episode,
      flatListData: [],
      isLoading: viewType === _clipsKey,
      isLoadingMore: false,
      queryPage: 1,
      querySort: _mostRecentKey,
      searchBarText: '',
      showActionSheet: false,
      viewType
    }

    this._handleSearchBarTextQuery = debounce(this._handleSearchBarTextQuery, 1000)
  }

  async componentDidMount() {
    const { viewType } = this.state

    if (viewType === _clipsKey) {
      const newState = await this._queryClipData(_clipsKey)
      this.setState(newState)
    }
  }

  selectLeftItem = async (selectedKey: string) => {
    if (!selectedKey) {
      this.setState({ viewType: null })
      return
    }

    this.setState({
      endOfResultsReached: selectedKey !== _clipsKey,
      flatListData: [],
      isLoading: selectedKey === _clipsKey,
      queryPage: 1,
      viewType: selectedKey
    }, async () => {
      if (selectedKey === _clipsKey) {
        const newState = await this._queryClipData(selectedKey)
        this.setState(newState)
      }
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
      const newState = await this._queryClipData(selectedKey)
      this.setState(newState)
    })
  }

  _onEndReached = ({ distanceFromEnd }) => {
    const { endOfResultsReached, isLoadingMore, queryPage = 1, viewType } = this.state
    if (viewType === _clipsKey && !endOfResultsReached && !isLoadingMore) {
      if (distanceFromEnd > -1) {
        this.setState({
          isLoadingMore: true
        }, async () => {
          const newState = await this._queryClipData(viewType, { queryPage: queryPage + 1 })
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

  _renderItem = ({ item }) => {
    const { episode } = this.state
    return (
      <ClipTableCell
        key={item.id}
        endTime={item.endTime}
        handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(item, episode, episode.podcast))}
        startTime={item.startTime}
        title={item.title} />
    )
  }

  _handleCancelPress = () => {
    this.setState({ showActionSheet: false })
  }

  _handleMorePress = (selectedItem: any) => {
    console.log(selectedItem)
    this.setState({
      selectedItem,
      showActionSheet: true
    })
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
    const state = await this._queryClipData(viewType, { searchAllFieldsText: queryOptions.searchAllFieldsText })
    this.setState(state)
  }

  _handleSearchBarClear = (text: string) => {
    this.setState({ searchBarText: '' })
  }

  render() {
    const { navigation } = this.props
    const { episode, flatListData, isLoading, isLoadingMore, querySort, selectedItem,
      showActionSheet, viewType } = this.state
    const { globalTheme } = this.global

    return (
      <View style={styles.view}>
        <EpisodeTableHeader
          handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(episode, null, episode.podcast))}
          podcastImageUrl={(episode.podcast && episode.podcast.imageUrl) || episode.podcast_imageUrl}
          pubDate={episode.pubDate}
          title={episode.title} />
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
              disableLeftSwipe={true}
              extraData={flatListData}
              isLoadingMore={isLoadingMore}
              ItemSeparatorComponent={this._ItemSeparatorComponent}
              {...(viewType === _clipsKey ? { ListHeaderComponent: this._ListHeaderComponent } : {})}
              onEndReached={this._onEndReached}
              renderItem={this._renderItem} />
        }
        {
          viewType === _aboutKey &&
            <View style={styles.aboutView}>
              <Text style={styles.aboutViewText}>{removeHTMLFromString(episode.description)}</Text>
            </View>
        }
        <ActionSheet
          globalTheme={globalTheme}
          handleCancelPress={this._handleCancelPress}
          items={PV.ActionSheet.media.moreButtons(
            selectedItem, this.global.session.isLoggedIn, this.global, navigation, this._handleCancelPress
          )}
          showModal={showActionSheet} />
      </View>
    )
  }

  _queryClipData = async (filterKey: string, queryOptions: {
    queryPage?: number, searchAllFieldsText?: string
  } = {}) => {
    const { episode, flatListData, querySort, searchBarText: searchAllFieldsText } = this.state
    const newState = {
      isLoading: false,
      isLoadingMore: false
    } as State

    if (rightItems.some((option) => option.value === filterKey)) {
      const results = await getMediaRefs({
        sort: filterKey,
        page: queryOptions.queryPage,
        episodeId: episode.id,
        ...(searchAllFieldsText ? { searchAllFieldsText } : {})
      }, this.global.settings.nsfwMode)

      newState.flatListData = [...flatListData, ...results[0]]
      newState.endOfResultsReached = newState.flatListData.length >= results[1]
    } else if (!filterKey) {
      newState.flatListData = []
      newState.endOfResultsReached = true
    } else {
      const results = await getMediaRefs({
        sort: querySort,
        page: queryOptions.queryPage,
        episodeId: episode.id,
        ...(searchAllFieldsText ? { searchAllFieldsText } : {})
      }, this.global.settings.nsfwMode)

      newState.flatListData = [...flatListData, ...results[0]]
      newState.endOfResultsReached = newState.flatListData.length >= results[1]
    }

    newState.queryPage = queryOptions.queryPage || 1

    return newState
  }
}

const _clipsKey = 'clips'
const _aboutKey = 'about'
const _mostRecentKey = 'most-recent'
const _topPastDay = 'top-past-day'
const _topPastWeek = 'top-past-week'
const _topPastMonth = 'top-past-month'
const _topPastYear = 'top-past-year'

const leftItems = [
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
  view: {
    flex: 1
  }
}
