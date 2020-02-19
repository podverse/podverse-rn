import AsyncStorage from '@react-native-community/async-storage'
import debounce from 'lodash/debounce'
import { View as RNView } from 'react-native'
import { NavigationScreenOptions } from 'react-navigation'
import React from 'reactn'
import {
  ActionSheet,
  ActivityIndicator,
  ClipTableCell,
  Divider,
  EpisodeTableCell,
  FlatList,
  HTMLScrollView,
  NavQueueIcon,
  NavShareIcon,
  NumberSelectorWithText,
  PodcastTableHeader,
  SearchBar,
  SwipeRowBack,
  SwitchWithText,
  TableSectionHeader,
  TableSectionSelectors,
  Text,
  View
} from '../components'
import {
  getDownloadedEpisodeLimit,
  setDownloadedEpisodeLimit
} from '../lib/downloadedEpisodeLimiter'
import { getDownloadedEpisodes } from '../lib/downloadedPodcast'
import { downloadEpisode } from '../lib/downloader'
import { alertIfNoNetworkConnection, hasValidNetworkConnection } from '../lib/network'
import {
  convertNowPlayingItemToEpisode,
  convertToNowPlayingItem
} from '../lib/NowPlayingItem'
import {
  decodeHTMLString,
  readableDate,
  removeHTMLFromString,
  safelyUnwrapNestedVariable
} from '../lib/utility'
import { PV } from '../resources'
import { getEpisodes } from '../services/episode'
import { gaTrackPageView } from '../services/googleAnalytics'
import { getMediaRefs } from '../services/mediaRef'
import { getPodcast } from '../services/podcast'
import {
  removeDownloadedPodcastEpisode,
  updateAutoDownloadSettings
} from '../state/actions/downloads'
import { toggleAddByRSSPodcast } from '../state/actions/parser'
import { toggleSubscribeToPodcast } from '../state/actions/podcast'
import { core } from '../styles'

const {
  aboutKey,
  allEpisodesKey,
  clipsKey,
  downloadedKey,
  mostRecentKey,
  mostRecentAllKey,
  oldestKey,
  randomKey,
  topPastDay,
  topPastMonth,
  topPastWeek,
  topPastYear
} = PV.Filters

type Props = {
  navigation?: any
}

type State = {
  downloadedEpisodeLimit?: string | null
  endOfResultsReached: boolean
  flatListData: any[]
  flatListDataTotalCount: number | null
  isLoading: boolean
  isLoadingMore: boolean
  isRefreshing: boolean
  isSearchScreen?: boolean
  isSubscribing: boolean
  limitDownloadedEpisodes: boolean
  podcast?: any
  podcastId?: string
  queryPage: number
  querySort: string | null
  searchBarText: string
  selectedItem?: any
  showActionSheet: boolean
  showNoInternetConnectionMessage?: boolean
  showSettings: boolean
  viewType: string | null
}

export class PodcastScreen extends React.Component<Props, State> {
  static navigationOptions = ({ navigation }) => {
    const podcastId = navigation.getParam('podcastId')
    const podcastTitle = navigation.getParam('podcastTitle')
    const addByRSSPodcastFeedUrl = navigation.getParam('addByRSSPodcastFeedUrl')

    return {
      title: 'Podcast',
      headerRight: (
        <RNView style={core.row}>
          {
            !addByRSSPodcastFeedUrl &&
              <NavShareIcon
                endingText=' – shared using Podverse'
                podcastTitle={podcastTitle}
                url={PV.URLs.podcast + podcastId}
              />
          }
          <NavQueueIcon navigation={navigation} />
        </RNView>
      )
    } as NavigationScreenOptions
  }

  constructor(props: Props) {
    super(props)

    const podcast = this.props.navigation.getParam('podcast')
    const podcastId =
      (podcast && podcast.id) || (podcast && podcast.addByRSSPodcastFeedUrl) || this.props.navigation.getParam('podcastId')
    const viewType =
      this.props.navigation.getParam('viewType') || allEpisodesKey

    if (podcast && (podcast.id || podcast.addByRSSPodcastFeedUrl)) {
      this.props.navigation.setParams({
        podcastId,
        podcastTitle: podcast.title,
        addByRSSPodcastFeedUrl: podcast.addByRSSPodcastFeedUrl
      })
    }

    this.state = {
      downloadedEpisodeLimit: null,
      endOfResultsReached: false,
      flatListData: [],
      flatListDataTotalCount: null,
      isLoading: viewType !== downloadedKey || !podcast,
      isLoadingMore: false,
      isRefreshing: false,
      isSubscribing: false,
      limitDownloadedEpisodes: false,
      podcast,
      podcastId,
      queryPage: 1,
      querySort: mostRecentKey,
      searchBarText: '',
      showActionSheet: false,
      showSettings: false,
      viewType
    }

    this._handleSearchBarTextQuery = debounce(
      this._handleSearchBarTextQuery,
      PV.SearchBar.textInputDebounceTime
    )
  }

  async componentDidMount() {
    const { navigation } = this.props
    const { podcast, podcastId } = this.state
    const episodeId = navigation.getParam('navToEpisodeWithId')

    const hasInternetConnection = await hasValidNetworkConnection()

    this.setState({
      ...(!hasInternetConnection ? {
        viewType: downloadedKey
      } : { viewType: this.state.viewType })
    }, () => {
      this._initializePageData()
      if (episodeId) {
        navigation.navigate(PV.RouteNames.EpisodeScreen, { episodeId })
      }
    })
    const pageTitle = podcast ?
      'Podcasts Screen - ' + podcast.title
      : 'PodcastsScreen - ' + 'no info available'
    gaTrackPageView('/podcast/' + podcastId, pageTitle)
  }

  async _initializePageData() {
    const { podcast, viewType } = this.state
    const podcastId =
      this.props.navigation.getParam('podcastId') || this.state.podcastId
    const downloadedEpisodeLimit = await getDownloadedEpisodeLimit(podcastId)

    this.setState(
      {
        downloadedEpisodeLimit,
        endOfResultsReached: false,
        flatListData: [],
        flatListDataTotalCount: null,
        isLoading: true,
        limitDownloadedEpisodes:
          downloadedEpisodeLimit && downloadedEpisodeLimit > 0,
        podcastId,
        queryPage: 1
      },
      async () => {
        let newState = {}
        let newPodcast: any

        try {
          if (podcast && podcast.addByRSSPodcastFeedUrl) {
            newPodcast = podcast
            newState.flatListData = podcast.episodes || []
            newState.flatListDataTotalCount = newState.flatListData.length
          } else {
            newPodcast = await getPodcast(podcastId)
            if (viewType === allEpisodesKey) {
              newState = await this._queryData(allEpisodesKey)
            } else if (viewType === clipsKey) {
              newState = await this._queryData(clipsKey)
            }
          }

          newPodcast.description =
            newPodcast.description || 'No summary available.'

          this.setState({
            ...newState,
            isLoading: false,
            podcast: newPodcast
          })
        } catch (error) {
          console.log('_initializePageData', error)
          this.setState({
            ...newState,
            isLoading: false,
            ...(newPodcast ? { podcast: newPodcast } : { podcast })
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
        endOfResultsReached: false,
        flatListData: [],
        flatListDataTotalCount: null,
        isLoading: true,
        queryPage: 1,
        viewType: selectedKey
      },
      async () => {
        const newState = await this._queryData(selectedKey)
        this.setState(newState)
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
    const {
      endOfResultsReached,
      isLoadingMore,
      podcast,
      queryPage = 1,
      viewType
    } = this.state

    if (!podcast.addByRSSPodcastFeedUrl && viewType !== downloadedKey && !endOfResultsReached && !isLoadingMore) {
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

  _onRefresh = () => {
    const { viewType } = this.state

    this.setState(
      {
        isRefreshing: true
      },
      async () => {
        const newState = await this._queryData(viewType, { queryPage: 1 })
        this.setState(newState)
      }
    )
  }

  _ListHeaderComponent = () => {
    const { searchBarText } = this.state

    return (
      <View style={styles.ListHeaderComponent}>
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

  _renderItem = ({ item }) => {
    const { podcast, viewType } = this.state
    const episode = {
      ...item,
      podcast
    }

    const isSearchScreen = this.props.navigation.getParam('isSearchScreen')
    const screen = isSearchScreen
      ? PV.RouteNames.SearchEpisodeScreen
      : PV.RouteNames.EpisodeScreen

    if (viewType === downloadedKey) {
      let description = removeHTMLFromString(item.description)
      description = decodeHTMLString(description)
      return (
        <EpisodeTableCell
          description={description}
          handleMorePress={() =>
            this._handleMorePress(convertToNowPlayingItem(item, null, podcast))
          }
          handleNavigationPress={() =>
            this.props.navigation.navigate(screen, {
              episode,
              addByRSSPodcastFeedUrl: podcast.addByRSSPodcastFeedUrl
            })
          }
          id={item.id}
          pubDate={item.pubDate}
          title={item.title}
        />
      )
    } else if (viewType === allEpisodesKey) {
      let description = removeHTMLFromString(item.description)
      description = decodeHTMLString(description)
      return (
        <EpisodeTableCell
          description={description}
          handleMorePress={() =>
            this._handleMorePress(convertToNowPlayingItem(item, null, podcast))
          }
          handleNavigationPress={() =>
            this.props.navigation.navigate(screen, {
              episode,
              addByRSSPodcastFeedUrl: podcast.addByRSSPodcastFeedUrl
            })
          }
          id={item.id}
          pubDate={item.pubDate}
          title={item.title}
        />
      )
    } else {
      return (
        <ClipTableCell
          endTime={item.endTime}
          episodeId={item.episode.id}
          episodePubDate={readableDate(item.episode.pubDate)}
          episodeTitle={item.episode.title}
          handleMorePress={() =>
            this._handleMorePress(convertToNowPlayingItem(item, null, podcast))
          }
          startTime={item.startTime}
          title={item.title}
        />
      )
    }
  }

  _renderHiddenItem = ({ item }, rowMap) => (
    <SwipeRowBack
      onPress={() => this._handleHiddenItemPress(item.id, rowMap)}
      text='Delete'
    />
  )

  _handleHiddenItemPress = async (selectedId, rowMap) => {
    const filteredEpisodes = this.state.flatListData.filter(
      (x: any) => x.id !== selectedId
    )
    this.setState(
      {
        flatListData: filteredEpisodes
      },
      async () => {
        await removeDownloadedPodcastEpisode(selectedId)
        const finalDownloadedEpisodes = await getDownloadedEpisodes()
        this.setState({ flatListData: finalDownloadedEpisodes })
      }
    )
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

  _handleSearchBarTextQuery = async (
    viewType: string | null,
    queryOptions: any
  ) => {
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

  _toggleSubscribeToPodcast = async () => {
    const { podcast, podcastId } = this.state
    const { addByRSSPodcastFeedUrl } = podcast

    if (podcastId) {
      const wasAlerted = await alertIfNoNetworkConnection(
        'subscribe to podcast'
      )
      if (wasAlerted) return

      this.setState({ isSubscribing: true }, async () => {
        try {
          if (addByRSSPodcastFeedUrl) {
            await toggleAddByRSSPodcast(podcastId)
          } else {
            await toggleSubscribeToPodcast(podcastId)
          }
          this.setState({ isSubscribing: false })
        } catch (error) {
          this.setState({ isSubscribing: false })
        }

        const downloadedEpisodeLimit = await getDownloadedEpisodeLimit(
          podcastId
        )

        this.setState({
          downloadedEpisodeLimit,
          limitDownloadedEpisodes:
            downloadedEpisodeLimit && downloadedEpisodeLimit > 0
        })
      })
    }
  }

  _handleDownloadPressed = () => {
    if (this.state.selectedItem) {
      const episode = convertNowPlayingItemToEpisode(this.state.selectedItem)
      downloadEpisode(episode, episode.podcast)
    }
  }

  _handleToggleAutoDownload = (autoDownloadOn: boolean) => {
    const { podcast, podcastId } = this.state
    const id = (podcast && podcast.id) || podcastId
    if (id) updateAutoDownloadSettings(id, autoDownloadOn)
  }

  _handleToggleSettings = () => {
    this.setState({ showSettings: !this.state.showSettings })
  }

  _handleToggleLimitDownloads = async () => {
    const { podcastId } = this.state
    if (podcastId) {
      const shouldLimitDownloads = !this.state.limitDownloadedEpisodes
      const globalDownloadedEpisodeLimitCount = (await AsyncStorage.getItem(
        PV.Keys.DOWNLOADED_EPISODE_LIMIT_GLOBAL_COUNT
      )) as any
      setDownloadedEpisodeLimit(
        podcastId,
        shouldLimitDownloads ? globalDownloadedEpisodeLimitCount : null
      )
      this.setState({
        downloadedEpisodeLimit: shouldLimitDownloads
          ? globalDownloadedEpisodeLimitCount
          : null,
        limitDownloadedEpisodes: shouldLimitDownloads
      })
    }
  }

  _handleChangeDownloadLimitText = (value: string) => {
    const { podcast } = this.state
    this.setState({ downloadedEpisodeLimit: value })
    const int = parseInt(value, 10)
    if (int) setDownloadedEpisodeLimit(podcast.id, int)
  }

  render() {
    const { navigation } = this.props

    const {
      downloadedEpisodeLimit,
      isLoading,
      isLoadingMore,
      isRefreshing,
      isSubscribing,
      limitDownloadedEpisodes,
      podcast,
      podcastId,
      querySort,
      selectedItem,
      showActionSheet,
      showNoInternetConnectionMessage,
      showSettings,
      viewType
    } = this.state
    const subscribedPodcastIds = safelyUnwrapNestedVariable(
      () => this.global.session.userInfo.subscribedPodcastIds,
      []
    )

    let isSubscribed = subscribedPodcastIds.some(
      (x: string) => x === podcastId
    )

    if (!isSubscribed) {
      const subscribedPodcasts = safelyUnwrapNestedVariable(
        () => this.global.subscribedPodcasts,
        []
      )
      isSubscribed = subscribedPodcasts.some((x: any) => x.addByRSSPodcastFeedUrl && x.addByRSSPodcastFeedUrl === podcastId)
    }

    let { flatListData, flatListDataTotalCount } = this.state
    const { autoDownloadSettings } = this.global
    const autoDownloadOn =
      (podcast && autoDownloadSettings[podcast.id]) ||
      (podcastId && autoDownloadSettings[podcastId])

    let items = rightItems(false, viewType === allEpisodesKey)
    if (viewType === downloadedKey) {
      const { downloadedPodcasts } = this.global
      const downloadedPodcast = downloadedPodcasts.find(
        (x: any) => (podcast && x.id === podcast.id) || x.id === podcastId
      )
      flatListData = (downloadedPodcast && downloadedPodcast.episodes) || []
      flatListDataTotalCount = flatListData.length
      items = rightItems(true)
    } else if (!viewType || viewType === aboutKey) {
      items = []
    }

    const resultsText =
      (viewType === downloadedKey && 'episodes') ||
      (viewType === allEpisodesKey && 'episodes') ||
      (viewType === clipsKey && 'clips') ||
      'results'

    return (
      <View style={styles.view}>
        <PodcastTableHeader
          autoDownloadOn={autoDownloadOn}
          handleToggleAutoDownload={this._handleToggleAutoDownload}
          handleToggleSettings={this._handleToggleSettings}
          handleToggleSubscribe={this._toggleSubscribeToPodcast}
          isLoading={isLoading && !podcast}
          isNotFound={!isLoading && !podcast}
          isSubscribed={isSubscribed}
          isSubscribing={isSubscribing}
          podcastImageUrl={podcast && (podcast.shrunkImageUrl || podcast.imageUrl)}
          podcastTitle={podcast && podcast.title}
          showSettings={showSettings}
        />
        {!showSettings && (
          <TableSectionSelectors
            handleSelectLeftItem={this.selectLeftItem}
            handleSelectRightItem={this.selectRightItem}
            leftItems={leftItems}
            rightItems={items}
            selectedLeftItemKey={viewType}
            selectedRightItemKey={querySort}
          />
        )}
        {showSettings && <TableSectionHeader title='Settings' />}
        {showSettings && (
          <View style={styles.settingsView}>
            <SwitchWithText
              onValueChange={this._handleToggleLimitDownloads}
              text={
                limitDownloadedEpisodes
                  ? 'Download limit on'
                  : 'Download limit off'
              }
              value={limitDownloadedEpisodes}
            />
            <NumberSelectorWithText
              handleChangeText={this._handleChangeDownloadLimitText}
              selectedNumber={downloadedEpisodeLimit}
              text='Download limit max'
            />
            <Text style={styles.settingsHelpText}>
              Once the download limit is exceeded, the oldest episode will be
              auto deleted.
            </Text>
          </View>
        )}
        {!showSettings && (
          <View style={styles.view}>
            {isLoading && <ActivityIndicator />}
            {!isLoading && viewType !== aboutKey && flatListData && podcast && (
              <FlatList
                data={flatListData}
                dataTotalCount={flatListDataTotalCount}
                disableLeftSwipe={viewType !== downloadedKey}
                extraData={flatListData}
                hideEndOfResults={querySort === mostRecentAllKey}
                isLoadingMore={isLoadingMore}
                isRefreshing={isRefreshing}
                ItemSeparatorComponent={this._ItemSeparatorComponent}
                ListHeaderComponent={
                  viewType === allEpisodesKey || viewType === clipsKey ? this._ListHeaderComponent : null
                }
                onEndReached={this._onEndReached}
                renderHiddenItem={this._renderHiddenItem}
                renderItem={this._renderItem}
                resultsText={resultsText}
                showNoInternetConnectionMessage={showNoInternetConnectionMessage}
              />
            )}
            {!isLoading && viewType === aboutKey && podcast && (
              <HTMLScrollView
                html={podcast.description || (showNoInternetConnectionMessage ? 'No internet connection' : '')}
                navigation={navigation}
              />
            )}
            <ActionSheet
              handleCancelPress={this._handleCancelPress}
              items={() =>
                PV.ActionSheet.media.moreButtons(
                  selectedItem,
                  navigation,
                  this._handleCancelPress,
                  this._handleDownloadPressed
                )
              }
              showModal={showActionSheet}
            />
          </View>
        )}
      </View>
    )
  }

  _queryAllEpisodes = async (sort: string | null, page: number = 1) => {
    const { podcastId, searchBarText: searchAllFieldsText } = this.state
    const results = await getEpisodes(
      {
        sort,
        page,
        podcastId,
        ...(searchAllFieldsText ? { searchAllFieldsText } : {})
      },
      this.global.settings.nsfwMode
    )

    return results
  }

  _queryClips = async (sort: string | null, page: number = 1) => {
    const { podcastId, searchBarText: searchAllFieldsText } = this.state
    const results = await getMediaRefs(
      {
        sort,
        page,
        podcastId,
        includeEpisode: true,
        ...(searchAllFieldsText ? { searchAllFieldsText } : {})
      },
      this.global.settings.nsfwMode
    )
    return results
  }

  _queryData = async (
    filterKey: string | null,
    queryOptions: { queryPage?: number; searchAllFieldsText?: string } = {}
  ) => {
    const { flatListData, podcastId, querySort, viewType } = this.state
    const newState = {
      isLoading: false,
      isLoadingMore: false,
      isRefreshing: false,
      showNoInternetConnectionMessage: false
    } as State

    const hasInternetConnection = await hasValidNetworkConnection()
    newState.showNoInternetConnectionMessage = !hasInternetConnection && filterKey !== downloadedKey

    try {
      if (filterKey === allEpisodesKey) {
        const results = await this._queryAllEpisodes(
          querySort,
          queryOptions.queryPage
        )
        newState.flatListData = [...flatListData, ...results[0]]
        newState.endOfResultsReached =
          newState.flatListData.length >= results[1]
        newState.flatListDataTotalCount = results[1]
      } else if (filterKey === clipsKey) {
        const results = await this._queryClips(
          querySort,
          queryOptions.queryPage
        )
        newState.flatListData = [...flatListData, ...results[0]]
        newState.endOfResultsReached =
          newState.flatListData.length >= results[1]
        newState.flatListDataTotalCount = results[1]
      } else if (
        rightItems(
          viewType === downloadedKey,
          viewType === allEpisodesKey
        ).some((option) => option.value === filterKey)
      ) {
        let results = []

        if (viewType === allEpisodesKey) {
          results = await this._queryAllEpisodes(querySort)
        } else if (viewType === clipsKey) {
          results = await this._queryClips(querySort)
        }

        newState.flatListData = [...flatListData, ...results[0]]
        newState.endOfResultsReached =
          newState.flatListData.length >= results[1]
        newState.flatListDataTotalCount = results[1]
      } else if (filterKey === aboutKey) {
        if (podcastId && hasInternetConnection) {
          const newPodcast = await getPodcast(podcastId)
          newState.podcast = newPodcast
        }
      }
      newState.queryPage = queryOptions.queryPage || 1
      return newState
    } catch (error) {
      console.log(error)
      return newState
    }
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

const rightItems = (onlyMostRecent?: boolean, includeOldest?: boolean) => {
  const items = []

  if (onlyMostRecent) {
    items.push({
      label: 'most recent',
      value: mostRecentKey
    })
  } else {
    items.push(
      {
        label: 'most recent',
        value: mostRecentKey
      }
    )

    if (includeOldest) {
      items.push({
        label: 'oldest',
        value: oldestKey
      })
    }

    items.push(
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
      },
      {
        label: 'random',
        value: randomKey
      },
      {
        label: 'most recent (all)',
        value: mostRecentAllKey
      }
    )
  }

  return items
}

const styles = {
  aboutView: {
    margin: 8
  },
  aboutViewText: {
    fontSize: PV.Fonts.sizes.lg
  },
  settingsHelpText: {
    fontSize: PV.Fonts.sizes.md
  },
  settingsView: {
    flex: 1,
    padding: 8
  },
  swipeRowBack: {
    marginBottom: 8,
    marginTop: 8
  },
  view: {
    flex: 1
  }
}
