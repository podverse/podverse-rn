import debounce from 'lodash/debounce'
import { StyleSheet, View as RNView } from 'react-native'
import { NavigationScreenOptions } from 'react-navigation'
import React from 'reactn'
import { ActionSheet, ActivityIndicator, ClipTableCell, Divider, EpisodeTableHeader, FlatList, HTMLScrollView,
  NavQueueIcon, NavShareIcon, SearchBar, TableSectionSelectors, View } from '../components'
import { downloadEpisode } from '../lib/downloader'
import { alertIfNoNetworkConnection } from '../lib/network'
import { convertNowPlayingItemToEpisode, convertToNowPlayingItem } from '../lib/NowPlayingItem'
import { PV } from '../resources'
import { getEpisode } from '../services/episode'
import { getMediaRefs } from '../services/mediaRef'
import { core } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  endOfResultsReached: boolean
  episode?: any
  episodeId?: any
  flatListData: any[]
  flatListDataTotalCount: number | null
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
    const episodeId = navigation.getParam('episodeId')
    const episodeTitle = navigation.getParam('episodeTitle')
    const podcastTitle = navigation.getParam('podcastTitle')

    return {
      title: 'Episode',
      headerRight: (
        <RNView style={core.row}>
          <NavShareIcon
            endingText=' – shared using Podverse'
            episodeTitle={episodeTitle}
            podcastTitle={podcastTitle}
            url={PV.URLs.episode + episodeId} />
          <NavQueueIcon navigation={navigation} />
        </RNView>
      )
    } as NavigationScreenOptions
  }

  constructor(props: Props) {
    super(props)

    const viewType = this.props.navigation.getParam('viewType') || _showNotesKey
    const episode = this.props.navigation.getParam('episode')
    const episodeId = (episode && episode.id) || this.props.navigation.getParam('episodeId')

    if (!episode.podcast) {
      episode.podcast = {
        title: episode.podcast_title
      }
    }

    if (episode && episode.id) {
      this.props.navigation.setParams({
        episodeId: episode.id,
        episodeTitle: episode.title,
        podcastTitle: (episode.podcast && episode.podcast.title) || ''
      })
    }

    this.state = {
      endOfResultsReached: false,
      episode,
      episodeId,
      flatListData: [],
      flatListDataTotalCount: null,
      isLoading: viewType === _clipsKey,
      isLoadingMore: false,
      queryPage: 1,
      querySort: _mostRecentKey,
      searchBarText: '',
      showActionSheet: false,
      viewType
    }

    this._handleSearchBarTextQuery = debounce(this._handleSearchBarTextQuery, PV.SearchBar.textInputDebounceTime)
  }

  async componentDidMount() {
    this._initializePageData()
  }

  async _initializePageData() {
    const { episode, viewType } = this.state
    const episodeId = this.props.navigation.getParam('episodeId') || this.state.episodeId

    this.setState({
      endOfResultsReached: false,
      episodeId,
      flatListData: [],
      flatListDataTotalCount: null,
      isLoading: true,
      queryPage: 1
    }, async () => {
      let newState = {}
      let newEpisode: any

      try {
        newEpisode = await getEpisode(episodeId)
        if (viewType === _clipsKey) {
          newState = await this._queryData(_clipsKey)
        }

        newEpisode.description = (newEpisode.description && newEpisode.description.linkifyHtml()) || 'No summary available.'

        this.setState({
          ...newState,
          isLoading: false,
          episode: newEpisode
        })
      } catch (error) {
        this.setState({
          ...newState,
          isLoading: false,
          ...(newEpisode ? { episode: newEpisode } : { episode })
        })
      }
    })

  }

  selectLeftItem = async (selectedKey: string) => {
    if (!selectedKey) {
      this.setState({ viewType: null })
      return
    }

    this.setState({
      endOfResultsReached: selectedKey !== _clipsKey,
      flatListData: [],
      flatListDataTotalCount: null,
      isLoading: selectedKey === _clipsKey,
      queryPage: 1,
      viewType: selectedKey
    }, async () => {
      if (selectedKey === _clipsKey) {
        const newState = await this._queryData(selectedKey)
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
      flatListDataTotalCount: null,
      isLoading: true,
      queryPage: 1,
      querySort: selectedKey
    }, async () => {
      const newState = await this._queryData(selectedKey)
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
          const newState = await this._queryData(viewType, {
            queryPage: queryPage + 1,
            searchAllFieldsText: this.state.searchBarText
          })
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
        episodeId={episode.id}
        endTime={item.endTime}
        handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(item, episode, episode.podcast))}
        startTime={item.startTime}
        title={item.title} />
    )
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

  _handleSearchBarTextChange = (text: string) => {
    const { viewType } = this.state

    this.setState({
      isLoadingMore: true,
      searchBarText: text
    }, async () => {
      this._handleSearchBarTextQuery(viewType, { searchAllFieldsText: text })
    })
  }

  _handleSearchBarTextQuery = async (viewType: string | null, queryOptions: any) => {
    this.setState({
      flatListData: [],
      flatListDataTotalCount: null,
      queryPage: 1
    }, async () => {
      const state = await this._queryData(viewType, { searchAllFieldsText: queryOptions.searchAllFieldsText })
      this.setState(state)
    })
  }

  _handleSearchBarClear = (text: string) => {
    this.setState({ searchBarText: '' })
  }

  _handleDownloadPressed = () => {
    if (this.state.selectedItem) {
      const episode = convertNowPlayingItemToEpisode(this.state.selectedItem)
      downloadEpisode(episode, episode.podcast)
    }
  }

  render() {
    const { navigation } = this.props
    const { episode, flatListData, flatListDataTotalCount, isLoading, isLoadingMore, querySort, selectedItem,
      showActionSheet, viewType } = this.state
    const { downloadedEpisodeIds, downloadsActive } = this.global

    return (
      <View style={styles.view}>
        <EpisodeTableHeader
          downloadedEpisodeIds={downloadedEpisodeIds}
          downloadsActive={downloadsActive}
          handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(episode, null, episode.podcast))}
          id={episode && episode.id}
          isLoading={isLoading && !episode}
          isNotFound={!isLoading && !episode}
          podcastImageUrl={(episode && ((episode.podcast && episode.podcast.imageUrl) || episode.podcast_imageUrl))}
          pubDate={episode && episode.pubDate}
          title={episode && episode.title} />
        <TableSectionSelectors
          handleSelectLeftItem={this.selectLeftItem}
          handleSelectRightItem={this.selectRightItem}
          leftItems={leftItems}
          rightItems={viewType && viewType !== _showNotesKey ? rightItems : []}
          selectedLeftItemKey={viewType}
          selectedRightItemKey={querySort} />
        {
          isLoading && viewType !== _showNotesKey &&
            <ActivityIndicator />
        }
        {
          !isLoading && viewType !== _showNotesKey && flatListData &&
            <FlatList
              data={flatListData}
              dataTotalCount={flatListDataTotalCount}
              disableLeftSwipe={true}
              extraData={flatListData}
              isLoadingMore={isLoadingMore}
              ItemSeparatorComponent={this._ItemSeparatorComponent}
              {...(viewType === _clipsKey ? { ListHeaderComponent: this._ListHeaderComponent } : {})}
              onEndReached={this._onEndReached}
              renderItem={this._renderItem} />
        }
        {
          viewType === _showNotesKey && episode &&
            <HTMLScrollView
              html={episode.description}
              navigation={navigation} />
        }
        <ActionSheet
          handleCancelPress={this._handleCancelPress}
          items={() => PV.ActionSheet.media.moreButtons(
            selectedItem, navigation, this._handleCancelPress, this._handleDownloadPressed
          )}
          showModal={showActionSheet} />
      </View>
    )
  }

  _queryData = async (filterKey: string | null, queryOptions: {
    queryPage?: number, searchAllFieldsText?: string
  } = {}) => {
    const { episode, flatListData, querySort, searchBarText: searchAllFieldsText } = this.state
    const newState = {
      isLoading: false,
      isLoadingMore: false
    } as State

    const wasAlerted = await alertIfNoNetworkConnection('load clips')
    if (wasAlerted) return newState

    try {
      if (rightItems.some((option) => option.value === filterKey)) {
        const results = await getMediaRefs({
          sort: filterKey,
          page: queryOptions.queryPage,
          episodeId: episode.id,
          ...(searchAllFieldsText ? { searchAllFieldsText } : {})
        }, this.global.settings.nsfwMode)

        newState.flatListData = [...flatListData, ...results[0]]
        newState.endOfResultsReached = newState.flatListData.length >= results[1]
        newState.flatListDataTotalCount = results[1]
      } else if (!filterKey) {
        newState.flatListData = []
        newState.endOfResultsReached = true
        newState.flatListDataTotalCount = null
      } else {
        const results = await getMediaRefs({
          sort: querySort,
          page: queryOptions.queryPage,
          episodeId: episode.id,
          ...(searchAllFieldsText ? { searchAllFieldsText } : {})
        }, this.global.settings.nsfwMode)

        newState.flatListData = [...flatListData, ...results[0]]
        newState.endOfResultsReached = newState.flatListData.length >= results[1]
        newState.flatListDataTotalCount = results[1]
      }

      newState.queryPage = queryOptions.queryPage || 1

      return newState
    } catch (error) {
      return newState
    }
  }
}

const _clipsKey = 'clips'
const _showNotesKey = 'showNotes'
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
    label: 'Show Notes',
    value: _showNotesKey
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

const styles = StyleSheet.create({
  showNotesView: {
    margin: 8
  },
  showNotesViewText: {
    fontSize: PV.Fonts.sizes.lg
  },
  ListHeaderComponent: {
    borderBottomWidth: 0,
    borderTopWidth: 0,
    flex: 0,
    height: PV.FlatList.searchBar.height,
    justifyContent: 'center',
    marginVertical: 8
  },
  view: {
    flex: 1
  }
})
