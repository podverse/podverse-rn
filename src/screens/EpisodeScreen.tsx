import debounce from 'lodash/debounce'
import { convertNowPlayingItemToEpisode, convertToNowPlayingItem } from 'podverse-shared'
import { StyleSheet, View as RNView } from 'react-native'
import { NavigationStackOptions } from 'react-navigation-stack'
import React from 'reactn'
import {
  ActionSheet,
  ActivityIndicator,
  ClipTableCell,
  Divider,
  EpisodeTableHeader,
  FlatList,
  HTMLScrollView,
  NavSearchIcon,
  NavShareIcon,
  SearchBar,
  TableSectionSelectors,
  View
} from '../components'
import { downloadEpisode } from '../lib/downloader'
import { translate } from '../lib/i18n'
import { hasValidNetworkConnection } from '../lib/network'
import { formatTitleViewHtml, isOdd, replaceLinebreaksWithBrTags, testProps } from '../lib/utility'
import { PV } from '../resources'
import { getEpisode, retrieveLatestChaptersForEpisodeId } from '../services/episode'
import { gaTrackPageView } from '../services/googleAnalytics'
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
  includeGoToPodcast: boolean
  isLoading: boolean
  isLoadingMore: boolean
  queryPage: number
  querySort: string | null
  searchBarText: string
  selectedItem?: any
  showActionSheet: boolean
  showNoInternetConnectionMessage?: boolean
  viewType: string | null
}

const testIDPrefix = 'episode_screen'

const viewTypeClipsOrChapters = (viewType: any) =>
  viewType === PV.Filters._clipsKey || viewType === PV.Filters._chaptersKey

export class EpisodeScreen extends React.Component<Props, State> {
  static navigationOptions = ({ navigation }) => {
    const episodeId = navigation.getParam('episodeId')
    const episodeTitle = navigation.getParam('episodeTitle')
    const podcastTitle = navigation.getParam('podcastTitle')
    const addByRSSPodcastFeedUrl = navigation.getParam('addByRSSPodcastFeedUrl')

    return {
      title: translate('Episode'),
      headerRight: (
        <RNView style={core.row}>
          {!addByRSSPodcastFeedUrl && (
            <NavShareIcon
              endingText={translate('shared using brandName')}
              episodeTitle={episodeTitle}
              podcastTitle={podcastTitle}
              urlId={episodeId}
              urlPath={PV.URLs.webPaths.episode}
            />
          )}
          <NavSearchIcon navigation={navigation} />
        </RNView>
      )
    } as NavigationStackOptions
  }

  constructor(props: Props) {
    super(props)

    const viewType = this.props.navigation.getParam('viewType') || PV.Filters._showNotesKey
    const episode = this.props.navigation.getParam('episode')
    const episodeId = (episode && episode.id) || this.props.navigation.getParam('episodeId')
    const includeGoToPodcast = this.props.navigation.getParam('includeGoToPodcast')

    if (episode && !episode.podcast) {
      episode.podcast = {
        title: episode.podcast_title
      }
    }

    if (episode && episode.id) {
      this.props.navigation.setParams({
        episodeId: episode.id,
        episodeTitle: episode.title,
        podcastTitle: episode.podcast?.title || ''
      })
    }

    this.state = {
      endOfResultsReached: false,
      episode,
      episodeId,
      flatListData: [],
      flatListDataTotalCount: null,
      includeGoToPodcast,
      isLoading: !episode || viewType === PV.Filters._clipsKey,
      isLoadingMore: false,
      queryPage: 1,
      querySort: PV.Filters._chronologicalKey,
      searchBarText: '',
      showActionSheet: false,
      viewType
    }

    this._handleSearchBarTextQuery = debounce(this._handleSearchBarTextQuery, PV.SearchBar.textInputDebounceTime)
  }

  async componentDidMount() {
    const { episode, episodeId } = this.state
    this._initializePageData()
    const pageTitle =
      episode && episode.podcast
        ? translate('Episode Screen - ') + episode.podcast.title + ' - ' + episode.title
        : translate('Episode Screen - ') + translate('no info available')
    gaTrackPageView('/episode/' + episodeId, pageTitle)
  }

  async _initializePageData() {
    const { episode, viewType } = this.state
    const episodeId = this.props.navigation.getParam('episodeId') || this.state.episodeId

    this.setState(
      {
        endOfResultsReached: false,
        episodeId,
        flatListData: [],
        flatListDataTotalCount: null,
        isLoading: true,
        queryPage: 1
      },
      async () => {
        let newState = {}
        let newEpisode: any

        try {
          if (episode && episode.podcast && episode.podcast.addByRSSPodcastFeedUrl) {
            newEpisode = episode
            if (viewType === PV.Filters._chaptersKey) {
              newState = await this._queryData(PV.Filters._chaptersKey)
            }
          } else {
            newEpisode = await getEpisode(episodeId)
            if (viewType === PV.Filters._clipsKey) {
              newState = await this._queryData(PV.Filters._clipsKey)
            } else if (viewType === PV.Filters._chaptersKey) {
              newState = await this._queryData(PV.Filters._chaptersKey)
            }
          }

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
      }
    )
  }

  selectLeftItem = async (selectedKey: string) => {
    if (!selectedKey) {
      this.setState({ viewType: null })
      return
    }

    this.setState(
      {
        endOfResultsReached: selectedKey !== PV.Filters._clipsKey && selectedKey !== PV.Filters._chaptersKey,
        flatListData: [],
        flatListDataTotalCount: null,
        isLoading: viewTypeClipsOrChapters(selectedKey),
        queryPage: 1,
        searchBarText: '',
        viewType: selectedKey
      },
      async () => {
        if (viewTypeClipsOrChapters(selectedKey)) {
          const newState = await this._queryData(selectedKey)
          this.setState(newState)
        }
      }
    )
  }

  selectRightItem = async (selectedKey: string) => {
    if (!selectedKey) {
      this.setState({ querySort: null })
      return
    }

    this.setState(
      {
        endOfResultsReached: false,
        flatListData: [],
        flatListDataTotalCount: null,
        isLoading: true,
        queryPage: 1,
        querySort: selectedKey
      },
      async () => {
        const newState = await this._queryData(selectedKey)
        this.setState(newState)
      }
    )
  }

  _onEndReached = ({ distanceFromEnd }) => {
    const { endOfResultsReached, isLoadingMore, queryPage = 1, viewType } = this.state
    if (viewType === PV.Filters._clipsKey && !endOfResultsReached && !isLoadingMore) {
      if (distanceFromEnd > -1) {
        this.setState(
          {
            isLoadingMore: true
          },
          async () => {
            const newState = await this._queryData(viewType, {
              queryPage: queryPage + 1,
              searchAllFieldsText: this.state.searchBarText
            })
            this.setState(newState)
          }
        )
      }
    }
  }

  _ListHeaderComponent = () => {
    const { searchBarText } = this.state

    return (
      <View style={core.ListHeaderComponent}>
        <SearchBar
          inputContainerStyle={core.searchBar}
          onChangeText={this._handleSearchBarTextChange}
          onClear={this._handleSearchBarClear}
          value={searchBarText}
        />
      </View>
    )
  }

  _ItemSeparatorComponent = () => {
    return <Divider />
  }

  _renderItem = ({ item, index }) => {
    const { episode } = this.state
    return (
      <ClipTableCell
        episodeId={episode.id}
        endTime={item.endTime}
        handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(item, episode, episode.podcast))}
        hasZebraStripe={isOdd(index)}
        hideImage={true}
        showEpisodeInfo={false}
        showPodcastTitle={false}
        startTime={item.startTime}
        testID={`${testIDPrefix}_clip_item_${index}`}
        {...(item.title ? { title: item.title } : {})}
      />
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

    this.setState(
      {
        isLoadingMore: true,
        searchBarText: text
      },
      async () => {
        this._handleSearchBarTextQuery(viewType, { searchAllFieldsText: text })
      }
    )
  }

  _handleSearchBarTextQuery = async (viewType: string | null, queryOptions: any) => {
    this.setState(
      {
        flatListData: [],
        flatListDataTotalCount: null,
        queryPage: 1
      },
      async () => {
        const state = await this._queryData(viewType, {
          searchAllFieldsText: queryOptions.searchAllFieldsText
        })
        this.setState(state)
      }
    )
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
    const {
      episode,
      flatListData,
      flatListDataTotalCount,
      includeGoToPodcast,
      isLoading,
      isLoadingMore,
      querySort,
      selectedItem,
      showActionSheet,
      showNoInternetConnectionMessage,
      viewType
    } = this.state
    const { downloadedEpisodeIds, downloadsActive, offlineModeEnabled } = this.global

    if (episode) episode.description = replaceLinebreaksWithBrTags(episode.description)

    const showOfflineMessage = offlineModeEnabled && viewType === PV.Filters._clipsKey

    let noResultsMessage = translate('No clips found')
    let noResultsSubMessage = ''
    if (viewType === PV.Filters._chaptersKey) {
      noResultsMessage = translate('No chapters found')
      noResultsSubMessage = translate('Chapters are created by the podcaster')
    }

    return (
      <View style={styles.view} {...testProps('episode_screen_view')}>
        <EpisodeTableHeader
          downloadedEpisodeIds={downloadedEpisodeIds}
          downloadsActive={downloadsActive}
          handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(episode, null, episode.podcast))}
          id={episode && episode.id}
          isLoading={isLoading && !episode}
          isNotFound={!isLoading && !episode}
          podcastImageUrl={
            episode &&
            ((episode.podcast && episode.podcast.shrunkImageUrl) ||
              episode.podcast_shrunkImageUrl ||
              (episode.podcast && episode.podcast.imageUrl))
          }
          pubDate={episode && episode.pubDate}
          testID={testIDPrefix}
          title={episode && episode.title}
        />
        <TableSectionSelectors
          handleSelectLeftItem={this.selectLeftItem}
          handleSelectRightItem={this.selectRightItem}
          screenName='EpisodeScreen'
          selectedLeftItemKey={viewType}
          selectedRightItemKey={querySort}
          testID={testIDPrefix}
        />
        {isLoading && (!episode || viewTypeClipsOrChapters(viewType)) && <ActivityIndicator />}
        {!isLoading && viewTypeClipsOrChapters(viewType) && flatListData && (
          <FlatList
            data={flatListData}
            dataTotalCount={flatListDataTotalCount}
            disableLeftSwipe={true}
            extraData={flatListData}
            isLoadingMore={isLoadingMore}
            ItemSeparatorComponent={this._ItemSeparatorComponent}
            keyExtractor={(item: any) => item.id}
            {...(viewType === PV.Filters._clipsKey ? { ListHeaderComponent: this._ListHeaderComponent } : {})}
            noResultsMessage={noResultsMessage}
            onEndReached={this._onEndReached}
            renderItem={this._renderItem}
            showNoInternetConnectionMessage={showOfflineMessage || showNoInternetConnectionMessage}
          />
        )}
        {viewType === PV.Filters._showNotesKey && episode && (
          <HTMLScrollView fontSizeLargestScale={PV.Fonts.largeSizes.md} html={episode.description || ''} />
        )}
        {viewType === PV.Filters._titleKey && episode && (
          <HTMLScrollView fontSizeLargestScale={PV.Fonts.largeSizes.md} html={formatTitleViewHtml(episode)} />
        )}
        <ActionSheet
          handleCancelPress={this._handleCancelPress}
          items={() =>
            PV.ActionSheet.media.moreButtons(
              selectedItem,
              navigation,
              this._handleCancelPress,
              this._handleDownloadPressed,
              null, // handleDeleteClip
              includeGoToPodcast,
              false // includeGoToEpisode
            )
          }
          showModal={showActionSheet}
          testID={testIDPrefix}
        />
      </View>
    )
  }

  _queryData = async (
    filterKey: string | null,
    queryOptions: {
      queryPage?: number
      searchAllFieldsText?: string
    } = {}
  ) => {
    const { episode, flatListData, querySort, searchBarText: searchAllFieldsText } = this.state
    const newState = {
      isLoading: false,
      isLoadingMore: false,
      showNoInternetConnectionMessage: false
    } as State

    const hasInternetConnection = await hasValidNetworkConnection()

    if (!hasInternetConnection && viewTypeClipsOrChapters(filterKey)) {
      newState.showNoInternetConnectionMessage = true
      return newState
    }

    try {
      if (PV.FilterOptions.screenFilters.EpisodeScreen.sort.some((option) => option.value === filterKey)) {
        const results = await getMediaRefs({
          sort: filterKey,
          page: queryOptions.queryPage,
          episodeId: episode.id,
          ...(searchAllFieldsText ? { searchAllFieldsText } : {}),
          allowUntitled: true
        })

        newState.flatListData = [...flatListData, ...results[0]]
        newState.endOfResultsReached = newState.flatListData.length >= results[1]
        newState.flatListDataTotalCount = results[1]
      } else if (!filterKey) {
        newState.flatListData = []
        newState.endOfResultsReached = true
        newState.flatListDataTotalCount = null
      } else if (filterKey === PV.Filters._chaptersKey) {
        const results = await retrieveLatestChaptersForEpisodeId(episode.id)
        newState.flatListData = [...flatListData, ...results[0]]
        newState.endOfResultsReached = true
        newState.flatListDataTotalCount = results[1]
      } else {
        const results = await getMediaRefs({
          sort: querySort,
          page: queryOptions.queryPage,
          episodeId: episode.id,
          ...(searchAllFieldsText ? { searchAllFieldsText } : {}),
          allowUntitled: true
        })

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

const styles = StyleSheet.create({
  showNotesView: {
    margin: 8
  },
  showNotesViewText: {
    fontSize: PV.Fonts.sizes.lg
  },
  view: {
    flex: 1
  }
})
