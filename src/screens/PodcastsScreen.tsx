import AsyncStorage from '@react-native-community/async-storage'
import debounce from 'lodash/debounce'
import { Alert, AppState, Linking, Platform, StyleSheet } from 'react-native'
import Dialog from 'react-native-dialog'
import React from 'reactn'
import {
  ActivityIndicator,
  Divider,
  FlatList,
  PlayerEvents,
  PodcastTableCell,
  PurchaseListener,
  SearchBar,
  SwipeRowBack,
  TableSectionSelectors,
  View
} from '../components'
import { getDownloadedPodcasts } from '../lib/downloadedPodcast'
import { alertIfNoNetworkConnection, hasValidNetworkConnection } from '../lib/network'
import { isOdd, setCategoryQueryProperty } from '../lib/utility'
import { PV } from '../resources'
import { getEpisode } from '../services/episode'
import { gaTrackPageView } from '../services/googleAnalytics'
import {
  checkIdlePlayerState,
  getNowPlayingItemFromQueueOrHistoryByTrackId,
  PVTrackPlayer,
  updateUserPlaybackPosition
} from '../services/player'
import { getPodcast, getPodcasts } from '../services/podcast'
import { getAuthUserInfo } from '../state/actions/auth'
import { initDownloads, removeDownloadedPodcast } from '../state/actions/downloads'
import {
  initializePlaybackSpeed,
  initializePlayerQueue,
  initPlayerState,
  updatePlaybackState,
  updatePlayerState
} from '../state/actions/player'
import { getSubscribedPodcasts, removeAddByRSSPodcast, toggleSubscribeToPodcast } from '../state/actions/podcast'
import { core, darkTheme } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  endOfResultsReached: boolean
  flatListData: any[]
  flatListDataTotalCount: number | null
  isLoading: boolean
  isLoadingMore: boolean
  isRefreshing: boolean
  isUnsubscribing: boolean
  queryFrom: string | null
  queryPage: number
  querySort: string | null
  searchBarText: string
  selectedCategory: string | null
  selectedSubCategory: string | null
  showDataSettingsConfirmDialog: boolean
  showNoInternetConnectionMessage?: boolean
}

// isInitialLoad is used to prevent rendering the PodcastsScreen components until
// it knows which table header dropdown selectors to render (after the first query completes).
let isInitialLoad = true

export class PodcastsScreen extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'Podcasts'
  }

  constructor(props: Props) {
    super(props)

    this.state = {
      endOfResultsReached: false,
      flatListData: [],
      flatListDataTotalCount: null,
      isLoading: true,
      isLoadingMore: false,
      isRefreshing: false,
      isUnsubscribing: false,
      queryFrom: null,
      queryPage: 1,
      querySort: null,
      searchBarText: '',
      selectedCategory: PV.Filters._allCategoriesKey,
      selectedSubCategory: PV.Filters._allCategoriesKey,
      showDataSettingsConfirmDialog: false
    }

    this._handleSearchBarTextQuery = debounce(this._handleSearchBarTextQuery, PV.SearchBar.textInputDebounceTime)
  }

  async componentDidMount() {
    Linking.addEventListener('url', this._handleOpenURLEvent)

    AppState.addEventListener('change', this._handleAppStateChange)

    try {
      const appHasLaunched = await AsyncStorage.getItem(PV.Keys.APP_HAS_LAUNCHED)
      if (!appHasLaunched) {
        await AsyncStorage.setItem(PV.Keys.APP_HAS_LAUNCHED, 'true')
        await AsyncStorage.setItem(PV.Keys.AUTO_DELETE_EPISODE_ON_END, 'TRUE')
        await AsyncStorage.setItem(PV.Keys.DOWNLOADED_EPISODE_LIMIT_GLOBAL_COUNT, '5')
        await AsyncStorage.setItem(PV.Keys.PLAYER_MAXIMUM_SPEED, '2.5')
        this.setState({ showDataSettingsConfirmDialog: true })
      } else {
        this._initializeScreenData()
      }
    } catch (error) {
      isInitialLoad = false
      this.setState({
        isLoading: false
      })
      console.log(error)

      Alert.alert(PV.Alerts.SOMETHING_WENT_WRONG.title, PV.Alerts.SOMETHING_WENT_WRONG.message, PV.Alerts.BUTTONS.OK)
    }

    gaTrackPageView('/podcasts', 'Podcasts Screen')
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange)
    Linking.removeEventListener('url', this._handleOpenURLEvent)
  }

  _handleAppStateChange = async (nextAppState: any) => {
    if (nextAppState === 'active' && !isInitialLoad) {
      const { nowPlayingItem: lastItem } = this.global.player
      const trackId = await PVTrackPlayer.getCurrentTrack()

      if (trackId) {
        const currentItem = await getNowPlayingItemFromQueueOrHistoryByTrackId(trackId)

        if (!lastItem || (lastItem && currentItem && currentItem.episodeId !== lastItem.episodeId)) {
          await updatePlayerState(currentItem)
          updateUserPlaybackPosition()
        }
      }

      await updatePlaybackState()

      // NOTE: On iOS, when returning to the app from the background while the player was paused,
      // sometimes the player will be in an idle state, requiring the user to press play twice to
      // reload the item in the player and begin playing. By calling initializePlayerQueue once whenever
      // the idle playback-state event is called, it automatically reloads the item.
      // I don't think this issue is happening on Android, so we're not using this workaround on Android.
      const isIdle = await checkIdlePlayerState()
      if (Platform.OS === 'ios' && isIdle) {
        await initializePlayerQueue()
      }
    }

    if (nextAppState === 'background' || nextAppState === 'inactive') {
      const currentState = await PVTrackPlayer.getState()
      // If an episode is not playing, then assume its latest playback position does not
      // need to get updated in history.
      // This will also prevent the history from being updated when a user closes the app on Device A,
      // then reloads it to make it load with last history item (currently playing item) on Device B.
      if (currentState === PVTrackPlayer.STATE_PLAYING) {
        updateUserPlaybackPosition()
      }
    }
  }

  // This event is apparently not needed in development on iOS simulator,
  // but required to work in production (??? unconfirmed).
  _handleOpenURLEvent = (event: any) => {
    if (event) this._handleOpenURL(event.url)
  }

  // On some Android devices, the .goBack method appears to not work reliably
  // unless there is some delay between screen changes. Wrapping each .goBack method
  // in a delay to make this happen.
  _goBackWithDelay = async () => {
    const { navigation } = this.props
    return new Promise(async (resolve) => {
      if (Platform.OS === 'android') {
        setTimeout(async () => {
          await navigation.goBack(null)
          setTimeout(async () => {
            await navigation.goBack(null)
            resolve()
          }, 1000)
        }, 1000)
      } else if (Platform.OS === 'ios') {
        await navigation.goBack(null)
        await navigation.goBack(null)
        resolve()
      }
    })
  }

  _handleOpenURL = async (url: string) => {
    const { navigation } = this.props
    const { navigate } = navigation
    const isDarkMode = this.global.globalTheme === darkTheme

    try {
      if (url) {
        const route = url.replace(/.*?:\/\//g, '')
        const splitPath = route.split('/')
        const path = splitPath[0] ? splitPath[0] : ''
        const id = splitPath[1] ? splitPath[1] : ''

        // Go back to the root screen in order to make sure
        // componentDidMount is called on all screens
        // so initialize methods are run.
        await this._goBackWithDelay()

        if (path === PV.DeepLinks.Clip.pathPrefix) {
          await navigate(PV.RouteNames.PlayerScreen, {
            mediaRefId: id,
            isDarkMode
          })
        } else if (path === PV.DeepLinks.Episode.pathPrefix) {
          const episode = await getEpisode(id)
          if (episode) {
            const podcast = await getPodcast(episode.podcast.id)
            await navigate(PV.RouteNames.PodcastScreen, {
              podcast,
              navToEpisodeWithId: id
            })
          }
        } else if (path === PV.DeepLinks.Playlist.pathPrefix) {
          await navigate(PV.RouteNames.MoreScreen)
          await navigate(PV.RouteNames.PlaylistsScreen, {
            navToPlaylistWithId: id
          })
        } else if (path === PV.DeepLinks.Playlists.path) {
          await navigate(PV.RouteNames.MoreScreen)
          await navigate(PV.RouteNames.PlaylistsScreen)
        } else if (path === PV.DeepLinks.Podcast.pathPrefix) {
          await navigate(PV.RouteNames.PodcastScreen, { podcastId: id })
        } else if (path === PV.DeepLinks.Podcasts.path) {
          await navigate(PV.RouteNames.PodcastsScreen)
        } else if (path === PV.DeepLinks.Profile.pathPrefix) {
          await navigate(PV.RouteNames.MoreScreen)
          await navigate(PV.RouteNames.ProfilesScreen, {
            navToProfileWithId: id
          })
        } else if (path === PV.DeepLinks.Profiles.path) {
          await navigate(PV.RouteNames.MoreScreen)
          await navigate(PV.RouteNames.ProfilesScreen)
        } else if (path === PV.DeepLinks.Search.path) {
          await navigate(PV.RouteNames.SearchScreen)
        } else {
          await navigate(PV.RouteNames.PodcastsScreen)
        }
      }
    } catch (error) {
      //
    }
  }

  _initializeScreenData = async () => {
    await initPlayerState(this.global)

    try {
      await getAuthUserInfo()
    } catch (error) {
      console.log('initializeScreenData getAuthUserInfo', error)
      // If getAuthUserInfo fails, continue with the networkless version of the app
    }

    const { subscribedPodcastIds } = this.global.session.userInfo
    if (subscribedPodcastIds && subscribedPodcastIds.length > 0) {
      this.selectLeftItem(PV.Filters._subscribedKey, PV.Filters._alphabeticalKey)
    } else {
      this.selectLeftItem(PV.Filters._allPodcastsKey, PV.Filters._topPastWeek)
    }

    await initDownloads()
    await initializePlayerQueue()
    await initializePlaybackSpeed()
  }

  // querySortOverride is only used in _initializeScreenData, and it determines
  // what sort filter to use for the first query after launch.
  selectLeftItem = async (selectedKey: string, querySortOverride?: string) => {
    if (!selectedKey) {
      this.setState({ queryFrom: null })
      return
    }

    const { querySort } = this.state
    let sort =
      !querySort || querySort === PV.Filters._alphabeticalKey || querySort === PV.Filters._mostRecentKey
        ? PV.Filters._topPastWeek
        : querySort

    if (querySortOverride) {
      sort = querySortOverride
    }
    isInitialLoad = false

    this.setState(
      {
        endOfResultsReached: false,
        flatListData: [],
        flatListDataTotalCount: null,
        isLoading: true,
        queryFrom: selectedKey,
        queryPage: 1,
        querySort: sort,
        searchBarText: ''
      },
      async () => {
        const newState = await this._queryData(selectedKey, this.state)
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
        const newState = await this._queryData(selectedKey, this.state)

        this.setState(newState)
      }
    )
  }

  _selectCategory = async (selectedKey: string, isSubCategory?: boolean) => {
    if (!selectedKey) {
      this.setState({
        ...((isSubCategory ? { selectedSubCategory: null } : { selectedCategory: null }) as any)
      })
      return
    }

    this.setState(
      {
        endOfResultsReached: false,
        isLoading: true,
        ...((isSubCategory ? { selectedSubCategory: selectedKey } : { selectedCategory: selectedKey }) as any),
        flatListData: [],
        flatListDataTotalCount: null,
        queryPage: 1
      },
      async () => {
        const newState = await this._queryData(selectedKey, this.state, {}, { isSubCategory })
        this.setState(newState)
      }
    )
  }

  _onEndReached = (evt: any) => {
    const { distanceFromEnd } = evt
    const { endOfResultsReached, isLoadingMore, queryFrom, queryPage = 1 } = this.state
    if (queryFrom !== PV.Filters._subscribedKey && !endOfResultsReached && !isLoadingMore) {
      if (distanceFromEnd > -1) {
        this.setState(
          {
            isLoadingMore: true
          },
          async () => {
            const nextPage = queryPage + 1
            const newState = await this._queryData(queryFrom, this.state, {
              queryPage: nextPage,
              searchTitle: this.state.searchBarText
            })
            this.setState(newState)
          }
        )
      }
    }
  }

  _onRefresh = () => {
    const { queryFrom } = this.state

    this.setState(
      {
        isRefreshing: true
      },
      async () => {
        const newState = await this._queryData(queryFrom, this.state, {
          queryPage: 1
        })
        this.setState(newState)
      }
    )
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

  _renderPodcastItem = ({ item, index }) => {
    const { downloadedPodcastEpisodeCounts } = this.global
    // const userLocalPodcastView =
    //   this.state.queryFrom === PV.Filters._subscribedKey ||
    //   this.state.queryFrom === PV.Filters._downloadedKey
    const episodeCount = downloadedPodcastEpisodeCounts[item.id]

    return (
      <PodcastTableCell
        hasZebraStripe={isOdd(index)}
        id={item.id}
        lastEpisodePubDate={item.lastEpisodePubDate}
        onPress={() =>
          this.props.navigation.navigate(PV.RouteNames.PodcastScreen, {
            podcast: item,
            episodeCount,
            addByRSSPodcastFeedUrl: item.addByRSSPodcastFeedUrl
          })
        }
        // podcastAuthors={
        //   userLocalPodcastView ? '' : generateAuthorsText(item.authors)
        // }
        // podcastCategories={
        //   userLocalPodcastView ? '' : generateCategoriesText(item.categories)
        // }
        podcastImageUrl={item.shrunkImageUrl || item.imageUrl}
        podcastTitle={item.title}
        showAutoDownload={true}
        showDownloadCount={true}
      />
    )
  }

  _renderHiddenItem = ({ item }, rowMap) => {
    const { queryFrom } = this.state
    const buttonText = queryFrom === PV.Filters._downloadedKey ? 'Delete' : 'Unsubscribe'

    return (
      <SwipeRowBack
        isLoading={this.state.isUnsubscribing}
        onPress={() => this._handleHiddenItemPress(item.id, item.addByRSSPodcastFeedUrl, rowMap)}
        text={buttonText}
      />
    )
  }

  _handleHiddenItemPress = async (selectedId, addByRSSPodcastFeedUrl, rowMap) => {
    const { queryFrom } = this.state

    let wasAlerted = false
    if (queryFrom === PV.Filters._subscribedKey) {
      wasAlerted = await alertIfNoNetworkConnection('unsubscribe from podcast')
    }

    if (wasAlerted) return
    this.setState({ isUnsubscribing: true }, async () => {
      try {
        const { flatListData } = this.state

        if (queryFrom === PV.Filters._subscribedKey) {
          if (selectedId) {
            await toggleSubscribeToPodcast(selectedId)
          } else {
            await removeAddByRSSPodcast(addByRSSPodcastFeedUrl)
          }
          await removeDownloadedPodcast(selectedId || addByRSSPodcastFeedUrl)
        } else if (queryFrom === PV.Filters._downloadedKey) {
          await removeDownloadedPodcast(selectedId || addByRSSPodcastFeedUrl)
        }
        const newFlatListData = flatListData.filter((x) => x.id !== selectedId)
        rowMap[selectedId].closeRow()
        this.setState({
          flatListData: newFlatListData,
          flatListDataTotalCount: newFlatListData.length,
          isUnsubscribing: false
        })
      } catch (error) {
        this.setState({ isUnsubscribing: false })
      }
    })
  }

  _handleSearchBarClear = (text: string) => {
    this.setState({
      flatListData: [],
      flatListDataTotalCount: null,
      searchBarText: ''
    })
  }

  _handleSearchBarTextChange = (text: string) => {
    const { queryFrom } = this.state

    this.setState(
      {
        isLoadingMore: true,
        searchBarText: text
      },
      async () => {
        this._handleSearchBarTextQuery(queryFrom, this.state, {}, { searchTitle: text })
      }
    )
  }

  _handleSearchBarTextQuery = async (queryFrom: string | null, prevState: any, newState: any, queryOptions: any) => {
    this.setState(
      {
        flatListData: [],
        flatListDataTotalCount: null,
        queryPage: 1
      },
      async () => {
        prevState.flatListData = []
        prevState.flatListDataTotalCount = null
        const state = await this._queryData(queryFrom, prevState, newState, {
          searchTitle: queryOptions.searchTitle
        })
        this.setState(state)
      }
    )
  }

  _handleSearchNavigation = () => {
    this.props.navigation.navigate(PV.RouteNames.SearchScreen)
  }

  _handleDataSettingsWifiOnly = () => {
    AsyncStorage.setItem(PV.Keys.DOWNLOADING_WIFI_ONLY, 'TRUE')
    this.setState({ showDataSettingsConfirmDialog: false })
    this._initializeScreenData()
  }

  _handleDataSettingsAllowData = () => {
    this.setState({ showDataSettingsConfirmDialog: false })
    this._initializeScreenData()
  }

  render() {
    const { navigation } = this.props
    const {
      isLoading,
      isLoadingMore,
      isRefreshing,
      queryFrom,
      querySort,
      selectedCategory,
      selectedSubCategory,
      showDataSettingsConfirmDialog,
      showNoInternetConnectionMessage
    } = this.state

    let flatListData = []
    let flatListDataTotalCount = null
    if (queryFrom === PV.Filters._subscribedKey) {
      flatListData = this.global.subscribedPodcasts
      flatListDataTotalCount = this.global.subscribedPodcastsTotalCount
    } else if (queryFrom === PV.Filters._downloadedKey) {
      flatListData = this.global.downloadedPodcasts
      flatListDataTotalCount = this.global.downloadedPodcasts && this.global.downloadedPodcasts.length
    } else {
      flatListData = this.state.flatListData
      flatListDataTotalCount = this.state.flatListDataTotalCount
    }

    return (
      <View style={styles.view}>
        <PlayerEvents />
        <TableSectionSelectors
          handleSelectLeftItem={(selectedKey: string) => this.selectLeftItem(selectedKey)}
          handleSelectRightItem={(selectedKey: string) => this.selectRightItem(selectedKey)}
          hidePickers={isInitialLoad}
          selectedLeftItemKey={queryFrom}
          selectedRightItemKey={querySort}
          screenName='PodcastsScreen'
        />
        {queryFrom === PV.Filters._categoryKey && (
          <TableSectionSelectors
            handleSelectLeftItem={(x: string) => this._selectCategory(x)}
            handleSelectRightItem={(x: string) => this._selectCategory(x, true)}
            selectedLeftItemKey={selectedCategory}
            selectedRightItemKey={selectedSubCategory}
            isBottomBar={true}
            isCategories={true}
            screenName='PodcastsScreen'
          />
        )}
        {isLoading && <ActivityIndicator />}
        {!isLoading && queryFrom && (
          <FlatList
            data={flatListData}
            dataTotalCount={flatListDataTotalCount}
            disableLeftSwipe={queryFrom !== PV.Filters._subscribedKey && queryFrom !== PV.Filters._downloadedKey}
            extraData={flatListData}
            handleSearchNavigation={this._handleSearchNavigation}
            isLoadingMore={isLoadingMore}
            isRefreshing={isRefreshing}
            ItemSeparatorComponent={this._ItemSeparatorComponent}
            ListHeaderComponent={
              queryFrom !== PV.Filters._subscribedKey && queryFrom !== PV.Filters._downloadedKey
                ? this._ListHeaderComponent
                : null
            }
            noSubscribedPodcasts={
              queryFrom === PV.Filters._subscribedKey && (!flatListData || flatListData.length === 0)
            }
            onEndReached={this._onEndReached}
            onRefresh={queryFrom === PV.Filters._subscribedKey ? this._onRefresh : null}
            renderHiddenItem={this._renderHiddenItem}
            renderItem={this._renderPodcastItem}
            resultsText='podcasts'
            showNoInternetConnectionMessage={showNoInternetConnectionMessage}
          />
        )}
        <Dialog.Container visible={showDataSettingsConfirmDialog}>
          <Dialog.Title>Data Settings</Dialog.Title>
          <Dialog.Description>Do you want to allow downloading episodes with your data plan?</Dialog.Description>
          <Dialog.Button label='No, Wifi Only' onPress={this._handleDataSettingsWifiOnly} />
          <Dialog.Button label='Yes, Allow Data' onPress={this._handleDataSettingsAllowData} />
        </Dialog.Container>
        <PurchaseListener navigation={navigation} />
      </View>
    )
  }

  _querySubscribedPodcasts = async () => {
    const { session } = this.global
    const { userInfo } = session
    await getSubscribedPodcasts(userInfo.subscribedPodcastIds || [])
  }

  _queryAllPodcasts = async (sort: string | null, page: number = 1) => {
    const { searchBarText: searchTitle } = this.state
    const results = await getPodcasts(
      {
        sort,
        page,
        ...(searchTitle ? { searchTitle } : {})
      },
      this.global.settings.nsfwMode
    )
    return results
  }

  _queryPodcastsByCategory = async (categoryId?: string | null, sort?: string | null, page: number = 1) => {
    const { searchBarText: searchTitle } = this.state
    const results = await getPodcasts(
      {
        categories: categoryId,
        sort,
        page,
        ...(searchTitle ? { searchTitle } : {})
      },
      this.global.settings.nsfwMode
    )
    return results
  }

  _queryData = async (
    filterKey: string | null,
    prevState: State,
    nextState?: {},
    queryOptions: { isSubCategory?: boolean; searchTitle?: string } = {}
  ) => {
    const newState = {
      isLoading: false,
      isLoadingMore: false,
      isRefreshing: false,
      showNoInternetConnectionMessage: false,
      ...nextState
    } as State

    try {
      const {
        searchBarText: searchTitle,
        flatListData = [],
        queryFrom,
        querySort,
        selectedCategory,
        selectedSubCategory
      } = prevState
      const { settings } = this.global
      const { nsfwMode } = settings

      const hasInternetConnection = await hasValidNetworkConnection()
      if (filterKey === PV.Filters._subscribedKey) {
        await getAuthUserInfo() // get the latest subscribedPodcastIds first
        await this._querySubscribedPodcasts()
      } else if (filterKey === PV.Filters._downloadedKey) {
        const podcasts = await getDownloadedPodcasts()
        newState.endOfResultsReached = true
        newState.flatListDataTotalCount = podcasts.length
      } else if (filterKey === PV.Filters._allPodcastsKey) {
        newState.showNoInternetConnectionMessage = !hasInternetConnection

        const results = await this._queryAllPodcasts(querySort, newState.queryPage)
        newState.flatListData = [...flatListData, ...results[0]]
        newState.endOfResultsReached = newState.flatListData.length >= results[1]
        newState.flatListDataTotalCount = results[1]
      } else if (filterKey === PV.Filters._categoryKey) {
        newState.showNoInternetConnectionMessage = !hasInternetConnection

        const { querySort, selectedCategory, selectedSubCategory } = prevState
        if (selectedCategory && selectedSubCategory === PV.Filters._allCategoriesKey) {
          const results = await this._queryPodcastsByCategory(selectedCategory, querySort, newState.queryPage)
          newState.flatListData = [...flatListData, ...results[0]]
          newState.endOfResultsReached = newState.flatListData.length >= results[1]
          newState.flatListDataTotalCount = results[1]
        } else if (selectedSubCategory) {
          const results = await this._queryPodcastsByCategory(selectedSubCategory, querySort, newState.queryPage)
          newState.flatListData = [...flatListData, ...results[0]]
          newState.endOfResultsReached = newState.flatListData.length >= results[1]
          newState.flatListDataTotalCount = results[1]
          newState.selectedSubCategory = selectedSubCategory || PV.Filters._allCategoriesKey
        } else {
          const podcastResults = await this._queryAllPodcasts(querySort, newState.queryPage)
          newState.flatListData = [...flatListData, ...podcastResults[0]]
          newState.endOfResultsReached = newState.flatListData.length >= podcastResults[1]
          newState.flatListDataTotalCount = podcastResults[1]
        }
      } else if (PV.FilterOptions.screenFilters.PodcastsScreen.sort.some((option) => option === filterKey)) {
        newState.showNoInternetConnectionMessage = !hasInternetConnection

        const results = await getPodcasts(
          {
            ...setCategoryQueryProperty(queryFrom, selectedCategory, selectedSubCategory),
            sort: filterKey,
            ...(searchTitle ? { searchTitle } : {})
          },
          nsfwMode
        )
        newState.flatListData = results[0]
        newState.endOfResultsReached = newState.flatListData.length >= results[1]
        newState.flatListDataTotalCount = results[1]
      } else {
        newState.showNoInternetConnectionMessage = !hasInternetConnection

        const { isSubCategory } = queryOptions
        let categories
        if (isSubCategory) {
          categories = filterKey === PV.Filters._allCategoriesKey ? selectedCategory : filterKey
        } else if (filterKey === PV.Filters._allCategoriesKey) {
          newState.selectedCategory = PV.Filters._allCategoriesKey
        } else {
          categories = filterKey
          newState.selectedSubCategory = PV.Filters._allCategoriesKey
          newState.selectedCategory = filterKey
        }

        const results = await this._queryPodcastsByCategory(categories, querySort)
        newState.flatListData = results[0]
        newState.endOfResultsReached = newState.flatListData.length >= results[1]
        newState.flatListDataTotalCount = results[1]
      }

      return newState
    } catch (error) {
      console.log('PodcastsScreen _queryData error', error)
      return newState
    }
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  }
})
