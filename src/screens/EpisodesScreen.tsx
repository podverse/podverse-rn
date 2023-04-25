import debounce from 'lodash/debounce'
import { convertNowPlayingItemToEpisode, convertToNowPlayingItem } from 'podverse-shared'
import { StyleSheet } from 'react-native'
import Config from 'react-native-config'
import { NavigationStackOptions } from 'react-navigation-stack'
import React, { getGlobal } from 'reactn'
import {
  ActionSheet,
  ActivityIndicator,
  EpisodeTableCell,
  FlatList,
  SearchBar,
  TableSectionSelectors,
  View
} from '../components'
import { errorLogger } from '../lib/logger'
import { getDownloadedEpisodes } from '../lib/downloadedPodcast'
import { downloadEpisode } from '../lib/downloader'
import { getDefaultSortForFilter, getSelectedFilterLabel, getSelectedSortLabel } from '../lib/filters'
import { translate } from '../lib/i18n'
import { hasValidNetworkConnection } from '../lib/network'
import { getUniqueArrayByKey, safeKeyExtractor, setCategoryQueryProperty } from '../lib/utility'
import { PV } from '../resources'
import { assignCategoryQueryToState, assignCategoryToStateForSortSelect, getCategoryLabel } from '../services/category'
import { getEpisodes } from '../services/episode'
import PVEventEmitter from '../services/eventEmitter'
import { combineEpisodesWithAddByRSSEpisodesLocally, hasAddByRSSEpisodesLocally } from '../services/parser'
import { getSavedQueryEpisodesScreen, setSavedQueryEpisodesScreen } from '../services/savedQueryFilters'
import { trackPageView } from '../services/tracking'
import { getHistoryItemIndexInfoForEpisode } from '../services/userHistoryItem'
import { removeDownloadedPodcastEpisode } from '../state/actions/downloads'
import { core } from '../styles'
import { HistoryIndexListenerScreen } from './HistoryIndexListenerScreen'

const _fileName = 'src/screens/EpisodesScreen.tsx'

type Props = {
  navigation?: any
}

type State = {
  endOfResultsReached: boolean
  flatListData: any[]
  flatListDataTotalCount: number | null
  isLoadingMore: boolean
  isRefreshing: boolean
  queryFrom: string
  queryPage: number
  querySort: string | null
  searchBarText: string
  selectedItem?: any
  selectedCategory: string | null
  selectedCategorySub: string | null
  selectedFilterLabel?: string | null
  selectedSortLabel?: string | null
  showActionSheet: boolean
  showNoInternetConnectionMessage?: boolean
  tempQueryEnabled: boolean
  tempQueryFrom: string
  tempQuerySort: string | null
}

const testIDPrefix = 'episodes_screen'

const getScreenTitle = () => {
  const { appMode } = getGlobal()
  let screenTitle = translate('Episodes')
  if (appMode === PV.AppMode.videos) {
    screenTitle = translate('Videos')
  }

  return screenTitle
}

const getSearchPlaceholder = () => {
  const { appMode } = getGlobal()
  let searchPlaceholder = translate('Search episodes')
  if (appMode === PV.AppMode.videos) {
    searchPlaceholder = translate('Search videos')
  }
  return searchPlaceholder
}

export class EpisodesScreen extends HistoryIndexListenerScreen<Props, State> {
  shouldLoad: boolean
  _unsubscribe: any | null

  constructor(props: Props) {
    super(props)

    this.shouldLoad = true

    const { subscribedPodcasts } = this.global

    const hasSubscribedPodcasts = subscribedPodcasts && subscribedPodcasts.length > 0

    this.state = {
      endOfResultsReached: false,
      flatListData: [],
      flatListDataTotalCount: null,
      isLoadingMore: true,
      isRefreshing: false,
      queryFrom: PV.Filters._subscribedKey,
      queryPage: 1,
      querySort: PV.Filters._mostRecentKey,
      searchBarText: '',
      selectedCategory: null,
      selectedCategorySub: null,
      selectedFilterLabel: hasSubscribedPodcasts ? translate('Subscribed') : translate('All Podcasts'),
      selectedSortLabel: hasSubscribedPodcasts ? translate('recent') : translate('top – week'),
      showActionSheet: false,
      tempQueryEnabled: false,
      tempQueryFrom: hasSubscribedPodcasts ? PV.Filters._subscribedKey : Config.DEFAULT_QUERY_EPISODES_SCREEN,
      tempQuerySort: hasSubscribedPodcasts ? PV.Filters._mostRecentKey : PV.Filters._topPastWeek
    }

    this._handleSearchBarTextQuery = debounce(this._handleSearchBarTextQuery, PV.SearchBar.textInputDebounceTime)
  }

  static navigationOptions = ({ navigation }) => {
    const _screenTitle = navigation.getParam('_screenTitle')

    return {
      title: _screenTitle
    } as NavigationStackOptions
  }

  async componentDidMount() {
    super.componentDidMount()

    this.props.navigation.setParams({
      _screenTitle: getScreenTitle()
    })

    PVEventEmitter.on(PV.Events.PODCAST_SUBSCRIBE_TOGGLED, this._handleToggleSubscribeEvent)
    PVEventEmitter.on(PV.Events.APP_MODE_CHANGED, this._handleAppModeChanged)
    PVEventEmitter.on(PV.Events.DOWNLOADED_EPISODE_REFRESH, this._handleDownloadEpisodeFinishedEvent)
    PVEventEmitter.on(PV.Events.SERVER_MAINTENANCE_MODE, this._handleMaintenanceMode)

    const { queryFrom } = this.state
    const { isInMaintenanceMode } = this.global
    const hasInternetConnection = await hasValidNetworkConnection()
    const from = hasInternetConnection && !isInMaintenanceMode ? queryFrom : PV.Filters._downloadedKey

    const savedQuery = await getSavedQueryEpisodesScreen()

    if (savedQuery?.queryFrom && savedQuery?.querySort) {
      const nonCategoryFilters = [PV.Filters._allPodcastsKey, PV.Filters._downloadedKey, PV.Filters._subscribedKey]
      if (nonCategoryFilters.includes(savedQuery.queryFrom)) {
        const { queryFrom, querySort } = savedQuery
        this.setState({ querySort }, () => {
          this.handleSelectFilterItem(queryFrom)
        })
      } else if (savedQuery.queryFrom === PV.Filters._categoryKey) {
        const { querySort, selectedCategory, selectedCategorySub } = savedQuery
        this.setState({ querySort }, () => {
          const isCategorySub = !!selectedCategorySub
          const categoryId = isCategorySub ? selectedCategorySub : selectedCategory
          this._selectCategory(categoryId, isCategorySub)
        })
      }
    } else {
      this.handleSelectFilterItem(from)
    }

    trackPageView('/episodes', 'Episodes Screen')
  }

  componentWillUnmount() {
    super.componentWillUnmount()
    PVEventEmitter.removeListener(PV.Events.PODCAST_SUBSCRIBE_TOGGLED, this._handleToggleSubscribeEvent)
    PVEventEmitter.removeListener(PV.Events.APP_MODE_CHANGED, this._handleAppModeChanged)
    PVEventEmitter.removeListener(PV.Events.DOWNLOADED_EPISODE_REFRESH, this._handleDownloadEpisodeFinishedEvent)
    PVEventEmitter.removeListener(PV.Events.SERVER_MAINTENANCE_MODE, this._handleMaintenanceMode)
    // this._unsubscribe?.()
  }

  _handleMaintenanceMode = () => {
    const { queryFrom } = this.state

    if (queryFrom !== PV.Filters._downloadedKey) {
      this.handleSelectFilterItem(PV.Filters._downloadedKey)
    }
  }

  _handleAppModeChanged = () => {
    this._onRefresh()
    this.props.navigation.setParams({
      _screenTitle: getScreenTitle()
    })
  }

  _handleToggleSubscribeEvent = () => {
    const { queryFrom } = this.state
    if (queryFrom) this.handleSelectFilterItem(queryFrom)
  }

  _handleDownloadEpisodeFinishedEvent = () => {
    const { queryFrom } = this.state
    if (queryFrom === PV.Filters._downloadedKey) {
      const keepSearchTitle = true
      this.handleSelectFilterItem(PV.Filters._downloadedKey, keepSearchTitle)
    }
  }

  handleSelectFilterItem = async (selectedKey: string, keepSearchTitle?: boolean) => {
    if (!selectedKey) {
      return
    }

    const { querySort } = this.state
    const sort = getDefaultSortForFilter({
      screenName: PV.RouteNames.EpisodesScreen,
      selectedFilterItemKey: selectedKey,
      selectedSortItemKey: querySort
    })

    const [selectedFilterLabel, selectedSortLabel] = await Promise.all([
      getSelectedFilterLabel(selectedKey),
      getSelectedSortLabel(sort)
    ])

    this.setState(
      {
        endOfResultsReached: false,
        flatListData: [],
        flatListDataTotalCount: null,
        isLoadingMore: true,
        queryFrom: selectedKey,
        queryPage: 1,
        querySort: sort,
        searchBarText: keepSearchTitle ? this.state.searchBarText : '',
        selectedFilterLabel,
        selectedSortLabel
      },
      () => {
        (async () => {
          await setSavedQueryEpisodesScreen(selectedKey, sort)

          const newState = await this._queryData(selectedKey)
          this.setState(newState)
        })()
      }
    )
  }

  handleSelectSortItem = async (selectedKey: string) => {
    if (!selectedKey) {
      return
    }

    const selectedSortLabel = await getSelectedSortLabel(selectedKey)

    this.setState(
      {
        endOfResultsReached: false,
        flatListData: [],
        flatListDataTotalCount: null,
        isLoadingMore: true,
        queryPage: 1,
        querySort: selectedKey,
        selectedSortLabel
      },
      () => {
        (async () => {
          await setSavedQueryEpisodesScreen(this.state.queryFrom, selectedKey)

          const newState = await this._queryData(selectedKey)
          this.setState(newState)
        })()
      }
    )
  }

  _selectCategory = async (selectedKey: string, isCategorySub?: boolean) => {
    if (!selectedKey) {
      return
    }

    const { querySort } = this.state

    const selectedFilterLabel = await getCategoryLabel(selectedKey)
    const sort = getDefaultSortForFilter({
      screenName: PV.RouteNames.EpisodesScreen,
      selectedFilterItemKey: selectedKey,
      selectedSortItemKey: querySort
    })
    const selectedSortLabel = await getSelectedSortLabel(sort)

    this.setState(
      {
        endOfResultsReached: false,
        isLoadingMore: true,
        ...((isCategorySub ? { selectedCategorySub: selectedKey } : { selectedCategory: selectedKey }) as any),
        flatListData: [],
        flatListDataTotalCount: null,
        queryFrom: PV.Filters._categoryKey,
        queryPage: 1,
        selectedFilterLabel,
        selectedSortLabel
      },
      () => {
        (async () => {
          await setSavedQueryEpisodesScreen(
            PV.Filters._categoryKey,
            sort,
            (!isCategorySub && selectedKey) || '',
            (isCategorySub && selectedKey) || ''
          )

          const newState = await this._queryData(selectedKey, { isCategorySub })
          this.setState(newState)
        })()
      }
    )
  }

  _onEndReached = ({ distanceFromEnd }) => {
    const { endOfResultsReached, queryFrom, queryPage = 1 } = this.state
    if (!endOfResultsReached && this.shouldLoad) {
      if (distanceFromEnd > -1) {
        this.shouldLoad = false

        this.setState(
          {
            isLoadingMore: true,
            queryPage: queryPage + 1
          },
          () => {
            (async () => {
              const newState = await this._queryData(queryFrom, {
                queryPage: this.state.queryPage
              })
              this.setState(newState)
            })()
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
      () => {
        (async () => {
          const newState = await this._queryData(queryFrom, {
            queryPage: 1
          })
          this.setState(newState)
        })()
      }
    )
  }

  _ListHeaderComponent = () => {
    const { searchBarText } = this.state

    return (
      <View style={core.ListHeaderComponent}>
        <SearchBar
          handleClear={this._handleSearchBarClear}
          hideIcon
          icon='filter'
          onChangeText={this._handleSearchBarTextChange}
          placeholder={getSearchPlaceholder()}
          testID={`${testIDPrefix}_filter_bar`}
          value={searchBarText}
        />
      </View>
    )
  }

  _handleCancelPress = () =>
    new Promise((resolve) => {
      this.setState({ showActionSheet: false }, resolve)
    })

  _handleMorePress = (selectedItem: any) => {
    this.setState({
      selectedItem,
      showActionSheet: true
    })
  }

  _handleDownloadPressed = (selectedItem: any) => {
    if (selectedItem) {
      downloadEpisode(selectedItem, selectedItem.podcast)
    }
  }

  _handleDownloadPressedNowPlayingItem = (selectedItem: any) => {
    const episode = convertNowPlayingItemToEpisode(selectedItem)
    if (episode && episode.podcast) {
      downloadEpisode(episode, episode.podcast)
    }
  }

  _renderEpisodeItem = ({ item, index }) => {
    const { navigation } = this.props
    const { completed, mediaFileDuration, userPlaybackPosition } = getHistoryItemIndexInfoForEpisode(item.id)

    const { hideCompleted } = this.global
    const shouldHideCompleted = hideCompleted && completed

    return (
      <EpisodeTableCell
        item={item}
        handleDeletePress={() => this._handleDeleteEpisode(item)}
        handleMorePress={() =>
          this._handleMorePress(convertToNowPlayingItem(item, null, item?.podcast, userPlaybackPosition))
        }
        handleDownloadPress={this._handleDownloadPressed}
        handleNavigationPress={() => {
          this.props.navigation.navigate(PV.RouteNames.EpisodeScreen, {
            addByRSSPodcastFeedUrl: item.podcast.addByRSSPodcastFeedUrl,
            episode: item,
            includeGoToPodcast: true
          })
        }}
        mediaFileDuration={mediaFileDuration}
        navigation={navigation}
        shouldHideCompleted={shouldHideCompleted}
        showPodcastInfo
        testID={`${testIDPrefix}_episode_item_${index}`}
        userPlaybackPosition={userPlaybackPosition}
      />
    )
  }

  _handleDeleteEpisode = async (item: any) => {
    const selectedId = item?.id
    if (selectedId) {
      await removeDownloadedPodcastEpisode(selectedId)
    }
  }

  _handleSearchBarClear = () => {
    this.setState(
      {
        endOfResultsReached: false,
        flatListData: [],
        flatListDataTotalCount: null,
        isLoadingMore: true
      },
      () => {
        this._handleSearchBarTextChange('')
      }
    )
  }

  _handleSearchBarTextChange = (text: string) => {
    this.setState(
      {
        searchBarText: text
      },
      () => {
        this._handleSearchBarTextQuery()
      }
    )
  }

  _handleSearchBarTextQuery = () => {
    const { queryFrom, querySort, searchBarText, tempQueryEnabled } = this.state
    if (!searchBarText) {
      this._handleRestoreSavedQuery()
    } else {
      const tempQueryObj: any = !tempQueryEnabled
        ? {
            tempQueryEnabled: true,
            tempQueryFrom: queryFrom,
            tempQuerySort: querySort
          }
        : {}
      this.setState(tempQueryObj, () => {
        const queryFrom = PV.Filters._allPodcastsKey
        const keepSearchTitle = true
        this.handleSelectFilterItem(queryFrom, keepSearchTitle)
      })
    }
  }

  _handleRestoreSavedQuery = () => {
    const { tempQueryFrom, tempQuerySort } = this.state
    this.setState(
      {
        queryFrom: tempQueryFrom,
        querySort: tempQuerySort,
        tempQueryEnabled: false
      },
      () => {
        const restoredQueryFrom = tempQueryFrom || PV.Filters._subscribedKey
        const keepSearchTitle = false
        this.handleSelectFilterItem(restoredQueryFrom, keepSearchTitle)
      }
    )
  }

  _handleSearchNavigation = () => {
    this.props.navigation.navigate(PV.RouteNames.SearchScreen)
  }

  _handleScanQRCodeNavigation = () => {
    // this.props.navigation.navigate(PV.RouteNames.ScanQRCodeScreen)
  }

  _handleNoResultsTopAction = () => {
    if (Config.DEFAULT_ACTION_NO_SUBSCRIBED_PODCASTS === PV.Keys.DEFAULT_ACTION_BUTTON_SCAN_QR_CODE) {
      this._handleScanQRCodeNavigation()
    } else {
      this._handleSearchNavigation()
    }
  }

  render() {
    const {
      flatListData,
      flatListDataTotalCount,
      isLoading,
      isLoadingMore,
      isRefreshing,
      queryFrom,
      querySort,
      searchBarText,
      selectedCategory,
      selectedCategorySub,
      selectedFilterLabel,
      selectedItem,
      selectedSortLabel,
      showActionSheet,
      showNoInternetConnectionMessage
    } = this.state
    const { navigation } = this.props
    const { session } = this.global
    const { subscribedPodcastIds } = session?.userInfo

    const noSubscribedPodcasts =
      queryFrom === PV.Filters._subscribedKey &&
      (!subscribedPodcastIds || subscribedPodcastIds.length === 0) &&
      !searchBarText &&
      (!flatListData || flatListData.length === 0)

    const isCategoryScreen = queryFrom === PV.Filters._categoryKey

    return (
      <View style={styles.view} testID='episodes_screen_view'>
        <TableSectionSelectors
          filterScreenTitle={getScreenTitle()}
          handleSelectCategoryItem={(x: any) => this._selectCategory(x)}
          handleSelectCategorySubItem={(x: any) => this._selectCategory(x, true)}
          handleSelectFilterItem={this.handleSelectFilterItem}
          handleSelectSortItem={this.handleSelectSortItem}
          includePadding
          navigation={navigation}
          screenName='EpisodesScreen'
          selectedCategoryItemKey={selectedCategory}
          selectedCategorySubItemKey={selectedCategorySub}
          selectedFilterItemKey={queryFrom}
          selectedFilterLabel={selectedFilterLabel}
          selectedSortItemKey={querySort}
          selectedSortLabel={selectedSortLabel}
          testID={testIDPrefix}
        />
        {isLoading && <ActivityIndicator fillSpace testID={testIDPrefix} />}
        {!isLoading && queryFrom && (
          <FlatList
            data={flatListData}
            dataTotalCount={flatListDataTotalCount}
            extraData={flatListData}
            handleNoResultsTopAction={this._handleNoResultsTopAction}
            isLoadingMore={isLoadingMore}
            isRefreshing={isRefreshing}
            keyExtractor={(item: any, index: number) =>
              safeKeyExtractor(testIDPrefix, index, item?.id, !!item.addedByRSS)
            }
            {...(isCategoryScreen ? {} : { ListHeaderComponent: this._ListHeaderComponent })}
            noResultsMessage={
              // eslint-disable-next-line max-len
              noSubscribedPodcasts
                ? translate('You are not subscribed to any podcasts yet')
                : translate('No episodes found')
            }
            onEndReached={this._onEndReached}
            onRefresh={this._onRefresh}
            renderItem={this._renderEpisodeItem}
            showNoInternetConnectionMessage={showNoInternetConnectionMessage}
            stickyHeader
          />
        )}
        <ActionSheet
          handleCancelPress={this._handleCancelPress}
          items={() =>
            PV.ActionSheet.media.moreButtons(
              selectedItem,
              navigation,
              {
                handleDismiss: this._handleCancelPress,
                handleDownload: this._handleDownloadPressedNowPlayingItem,
                includeGoToPodcast: true,
                includeGoToEpisodeInCurrentStack: true
              },
              'episode'
            )
          }
          showModal={showActionSheet}
          testID={testIDPrefix}
        />
      </View>
    )
  }

  _queryData = async (
    filterKey: any,
    queryOptions: {
      isCategorySub?: boolean
      queryPage?: number
    } = {}
  ) => {
    let newState = {
      isLoadingMore: false,
      isRefreshing: false,
      showNoInternetConnectionMessage: false
    } as State

    const hasInternetConnection = await hasValidNetworkConnection()
    if (!hasInternetConnection && filterKey !== PV.Filters._downloadedKey) {
      newState.showNoInternetConnectionMessage = true
      this.shouldLoad = true
      return newState
    }

    let { flatListData } = this.state
    const { queryFrom, querySort, searchBarText: searchTitle, selectedCategory, selectedCategorySub } = this.state

    try {
      const podcastId = this.global.session.userInfo.subscribedPodcastIds
      const { queryPage } = queryOptions

      const { appMode } = this.global
      const hasVideo = appMode === PV.AppMode.videos
      const isSubscribedSelected = filterKey === PV.Filters._subscribedKey || queryFrom === PV.Filters._subscribedKey
      const isDownloadedSelected = filterKey === PV.Filters._downloadedKey || queryFrom === PV.Filters._downloadedKey
      const isAllPodcastsSelected = filterKey === PV.Filters._allPodcastsKey || queryFrom === PV.Filters._allPodcastsKey

      flatListData = queryOptions && queryOptions.queryPage === 1 ? [] : flatListData

      if (isSubscribedSelected) {
        let results = []

        if (podcastId) {
          results = await getEpisodes({
            sort: querySort,
            page: queryPage,
            podcastId,
            ...(searchTitle ? { searchTitle } : {}),
            subscribedOnly: true,
            includePodcast: true,
            ...(hasVideo ? { hasVideo: true } : {})
          })
        }

        const hasAddByRSSEpisodes = await hasAddByRSSEpisodesLocally()
        if (querySort === PV.Filters._mostRecentKey && hasAddByRSSEpisodes) {
          results = await combineEpisodesWithAddByRSSEpisodesLocally(results, searchTitle, hasVideo)
        }

        newState.flatListData = [...flatListData, ...results[0]]
        newState.endOfResultsReached = results[0].length < 20
        newState.flatListDataTotalCount = results[1]
      } else if (isDownloadedSelected) {
        const podcastSearchTitle = ''
        const downloadedSort = PV.FilterOptions.screenFilters.EpisodesScreen.sort.some((option) => option === filterKey)
          ? filterKey
          : querySort
        const downloadedEpisodes = await getDownloadedEpisodes(
          podcastSearchTitle,
          searchTitle,
          hasVideo,
          downloadedSort
        )
        newState.flatListData = [...downloadedEpisodes]
        newState.endOfResultsReached = true
        newState.flatListDataTotalCount = downloadedEpisodes.length
      } else if (isAllPodcastsSelected) {
        const results = await this._queryAllEpisodes(querySort, queryPage)
        newState.flatListData = [...flatListData, ...results[0]]
        newState.endOfResultsReached = results[0].length < 20
        newState.flatListDataTotalCount = results[1]
      } else if (PV.FilterOptions.screenFilters.EpisodesScreen.sort.some((option) => option === filterKey)) {
        let results = await getEpisodes({
          ...setCategoryQueryProperty(queryFrom, selectedCategory, selectedCategorySub),
          ...(queryFrom === PV.Filters._subscribedKey ? { podcastId } : {}),
          sort: filterKey,
          ...(searchTitle ? { searchTitle } : {}),
          subscribedOnly: queryFrom === PV.Filters._subscribedKey,
          includePodcast: true,
          ...(hasVideo ? { hasVideo: true } : {})
        })

        const hasAddByRSSEpisodes = await hasAddByRSSEpisodesLocally()
        if (queryFrom === PV.Filters._subscribedKey && filterKey === PV.Filters._mostRecentKey && hasAddByRSSEpisodes) {
          results = await combineEpisodesWithAddByRSSEpisodesLocally(results, searchTitle)
        }

        newState.flatListData = results[0]
        newState.endOfResultsReached = results[0].length < 20
        newState.flatListDataTotalCount = results[1]
        newState = assignCategoryToStateForSortSelect(newState, selectedCategory, selectedCategorySub)
      } else {
        const assignedCategoryData = assignCategoryQueryToState(
          filterKey,
          newState,
          queryOptions,
          selectedCategory,
          selectedCategorySub
        )

        const categories = assignedCategoryData.categories
        newState = assignedCategoryData.newState

        const results = await this._queryEpisodesByCategory(categories, querySort, queryPage)
        newState.flatListData = results[0]
        newState.endOfResultsReached = results[0].length < 20
        newState.flatListDataTotalCount = results[1]
      }

      newState.flatListData = getUniqueArrayByKey(newState.flatListData, 'id')

      this.shouldLoad = true
      return newState
    } catch (error) {
      errorLogger(_fileName, '_queryData', error)
      this.shouldLoad = true
      return newState
    }
  }

  _queryAllEpisodes = async (sort: string | null, page = 1) => {
    const { searchBarText: searchTitle } = this.state
    const { appMode } = this.global
    const hasVideo = appMode === PV.AppMode.videos

    const cleanedSort =
      sort === PV.Filters._mostRecentKey || sort === PV.Filters._randomKey ? PV.Filters._topPastWeek : sort

    const results = await getEpisodes({
      sort: cleanedSort,
      page,
      ...(searchTitle ? { searchTitle } : {}),
      includePodcast: true,
      ...(hasVideo ? { hasVideo: true } : {})
    })

    return results
  }

  _queryEpisodesByCategory = async (categoryId?: string | null, sort?: string | null, page = 1) => {
    const { appMode } = this.global
    const hasVideo = appMode === PV.AppMode.videos

    const cleanedSort =
      sort === PV.Filters._mostRecentKey || sort === PV.Filters._randomKey ? PV.Filters._topPastWeek : sort

    const results = await getEpisodes({
      categories: categoryId,
      sort: cleanedSort,
      page,
      includePodcast: true,
      ...(hasVideo ? { hasVideo: true } : {})
    })
    return results
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  }
})
