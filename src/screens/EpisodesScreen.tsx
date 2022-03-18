import debounce from 'lodash/debounce'
import { convertNowPlayingItemToEpisode, convertToNowPlayingItem } from 'podverse-shared'
import { StyleSheet } from 'react-native'
import Config from 'react-native-config'
import React from 'reactn'
import {
  ActionSheet,
  ActivityIndicator,
  Divider,
  EpisodeTableCell,
  FlatList,
  SearchBar,
  TableSectionSelectors,
  View
} from '../components'
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
import { trackPageView } from '../services/tracking'
import { getHistoryItemIndexInfoForEpisode } from '../services/userHistoryItem'
import { removeDownloadedPodcastEpisode } from '../state/actions/downloads'
import { core } from '../styles'

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
  queryMediaType: string | null
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
  tempQueryMediaType: string | null
  tempQuerySort: string | null
}

const testIDPrefix = 'episodes_screen'

export class EpisodesScreen extends React.Component<Props, State> {
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
      queryFrom: hasSubscribedPodcasts ? PV.Filters._subscribedKey : Config.DEFAULT_QUERY_EPISODES_SCREEN,
      queryMediaType: PV.Filters._mediaTypeAllContent,
      queryPage: 1,
      querySort: hasSubscribedPodcasts ? PV.Filters._mostRecentKey : PV.Filters._topPastWeek,
      searchBarText: '',
      selectedCategory: null,
      selectedCategorySub: null,
      selectedFilterLabel: hasSubscribedPodcasts ? translate('Subscribed') : translate('All Podcasts'),
      selectedSortLabel: hasSubscribedPodcasts ? translate('recent') : translate('top – week'),
      showActionSheet: false,
      tempQueryEnabled: false,
      tempQueryFrom: hasSubscribedPodcasts ? PV.Filters._subscribedKey : Config.DEFAULT_QUERY_EPISODES_SCREEN,
      tempQueryMediaType: PV.Filters._mediaTypeAllContent,
      tempQuerySort: hasSubscribedPodcasts ? PV.Filters._mostRecentKey : PV.Filters._topPastWeek
    }

    this._handleSearchBarTextQuery = debounce(this._handleSearchBarTextQuery, PV.SearchBar.textInputDebounceTime)
  }

  static navigationOptions = () => ({
    title: translate('Episodes')
  })

  async componentDidMount() {
    const { queryFrom } = this.state
    const hasInternetConnection = await hasValidNetworkConnection()
    const from = hasInternetConnection ? queryFrom : PV.Filters._downloadedKey
    this.handleSelectFilterItem(from)

    PVEventEmitter.on(PV.Events.PODCAST_SUBSCRIBE_TOGGLED, this._handleToggleSubscribeEvent)

    trackPageView('/episodes', 'Episodes Screen')
    this._unsubscribe = this.props.navigation.addListener('willFocus', () => {
      this._setDownloadedDataIfOffline()
    })
  }

  componentWillUnmount() {
    PVEventEmitter.removeListener(PV.Events.PODCAST_SUBSCRIBE_TOGGLED, this._handleToggleSubscribeEvent)
  }

  _setDownloadedDataIfOffline = async () => {
    const isConnected = await hasValidNetworkConnection()
    if (!isConnected) {
      this.handleSelectFilterItem(PV.Filters._downloadedKey)
    }
  }

  _handleToggleSubscribeEvent = () => {
    const { queryFrom } = this.state
    if (queryFrom) this.handleSelectFilterItem(queryFrom)
  }

  handleSelectMediaTypeItem = (selectedKey: string) => {
    if (!selectedKey) {
      return
    }

    this.setState(
      {
        endOfResultsReached: false,
        flatListData: [],
        flatListDataTotalCount: null,
        isLoadingMore: true,
        queryMediaType: selectedKey,
        queryPage: 1
      },
      () => {
        (async () => {
          const newState = await this._queryData(selectedKey, this.state)
          this.setState(newState)
        })()
      }
    )
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

    const selectedFilterLabel = await getSelectedFilterLabel(selectedKey)
    const selectedSortLabel = await getSelectedSortLabel(sort)

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
        queryPage: 1,
        selectedFilterLabel,
        selectedSortLabel
      },
      () => {
        (async () => {
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
          noContainerPadding
          onChangeText={this._handleSearchBarTextChange}
          placeholder={translate('Search episodes')}
          testID={`${testIDPrefix}_filter_bar`}
          value={searchBarText}
        />
      </View>
    )
  }

  _ItemSeparatorComponent = () => <Divider style={{ marginHorizontal: 10 }} />

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
    const { mediaFileDuration, userPlaybackPosition } = getHistoryItemIndexInfoForEpisode(item.id)

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
    const { queryFrom, queryMediaType, querySort, searchBarText, tempQueryEnabled } = this.state
    if (!searchBarText) {
      this._handleRestoreSavedQuery()
    } else {
      const tempQueryObj: any = !tempQueryEnabled
        ? {
            tempQueryEnabled: true,
            tempQueryFrom: queryFrom,
            tempQueryMediaType: queryMediaType,
            tempQuerySort: querySort
          }
        : {
            tempQueryEnabled: true
          }
      this.setState(tempQueryObj, () => {
        const queryFrom = PV.Filters._allPodcastsKey
        const keepSearchTitle = true
        this.handleSelectFilterItem(queryFrom, keepSearchTitle)
      })
    }
  }

  _handleRestoreSavedQuery = () => {
    const { tempQueryFrom, tempQueryMediaType, tempQuerySort } = this.state
    this.setState(
      {
        queryFrom: tempQueryFrom,
        queryMediaType: tempQueryMediaType,
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
      queryMediaType,
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
    const { offlineModeEnabled, session } = this.global
    const { subscribedPodcastIds } = session?.userInfo

    const noSubscribedPodcasts =
      queryFrom === PV.Filters._subscribedKey &&
      (!subscribedPodcastIds || subscribedPodcastIds.length === 0) &&
      !searchBarText &&
      (!flatListData || flatListData.length === 0)

    const showOfflineMessage = offlineModeEnabled && queryFrom !== PV.Filters._downloadedKey

    const defaultNoSubscribedPodcastsMessage =
      Config.DEFAULT_ACTION_NO_SUBSCRIBED_PODCASTS === PV.Keys.DEFAULT_ACTION_BUTTON_SCAN_QR_CODE
        ? translate('Scan QR Code')
        : ''

    const isCategoryScreen = queryFrom === PV.Filters._categoryKey

    return (
      <View style={styles.view} testID='episodes_screen_view'>
        <TableSectionSelectors
          filterScreenTitle={translate('Episodes')}
          handleSelectCategoryItem={(x: any) => this._selectCategory(x)}
          handleSelectCategorySubItem={(x: any) => this._selectCategory(x, true)}
          handleSelectFilterItem={this.handleSelectFilterItem}
          handleSelectMediaTypeItem={this.handleSelectMediaTypeItem}
          handleSelectSortItem={this.handleSelectSortItem}
          includePadding
          navigation={navigation}
          screenName='EpisodesScreen'
          selectedCategoryItemKey={selectedCategory}
          selectedCategorySubItemKey={selectedCategorySub}
          selectedFilterItemKey={queryFrom}
          selectedFilterLabel={selectedFilterLabel}
          selectedMediaTypeItemKey={queryMediaType}
          selectedSortItemKey={querySort}
          selectedSortLabel={selectedSortLabel}
          testID={testIDPrefix}
        />
        {isLoading && <ActivityIndicator fillSpace testID={testIDPrefix} />}
        {!isLoading && queryFrom && (
          <FlatList
            data={flatListData}
            dataTotalCount={flatListDataTotalCount}
            disableLeftSwipe={queryFrom !== PV.Filters._downloadedKey}
            extraData={flatListData}
            handleNoResultsTopAction={this._handleNoResultsTopAction}
            isLoadingMore={isLoadingMore}
            isRefreshing={isRefreshing}
            ItemSeparatorComponent={this._ItemSeparatorComponent}
            keyExtractor={(item: any, index: number) => safeKeyExtractor(testIDPrefix, index, item?.id)}
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
            showNoInternetConnectionMessage={showOfflineMessage || showNoInternetConnectionMessage}
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
    const {
      queryFrom,
      queryMediaType,
      querySort,
      searchBarText: searchTitle,
      selectedCategory,
      selectedCategorySub
    } = this.state

    try {
      const podcastId = this.global.session.userInfo.subscribedPodcastIds
      const { queryPage } = queryOptions

      const hasVideo = queryMediaType === PV.Filters._mediaTypeVideoOnly
      const isMediaTypeSelected = PV.FilterOptions.mediaTypeItems.some((option) => option.value === filterKey)
      const isSubscribedSelected =
        filterKey === PV.Filters._subscribedKey || (isMediaTypeSelected && queryFrom === PV.Filters._subscribedKey)
      const isDownloadedSelected =
        filterKey === PV.Filters._downloadedKey || (isMediaTypeSelected && queryFrom === PV.Filters._downloadedKey)
      const isAllPodcastsSelected =
        filterKey === PV.Filters._allPodcastsKey || (isMediaTypeSelected && queryFrom === PV.Filters._allPodcastsKey)
      newState.queryMediaType = isMediaTypeSelected ? filterKey : queryMediaType

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
            ...(newState.queryMediaType === PV.Filters._mediaTypeVideoOnly ? { hasVideo: true } : {})
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
        const downloadedEpisodes = await getDownloadedEpisodes(podcastSearchTitle, searchTitle, hasVideo)
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
          ...(newState.queryMediaType === PV.Filters._mediaTypeVideoOnly ? { hasVideo: true } : {})
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
          selectedCategorySub,
          isMediaTypeSelected
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
      console.log(error)
      this.shouldLoad = true
      return newState
    }
  }

  _queryAllEpisodes = async (sort: string | null, page = 1) => {
    const { queryMediaType, searchBarText: searchTitle } = this.state
    const cleanedSort =
      sort === PV.Filters._mostRecentKey || sort === PV.Filters._randomKey ? PV.Filters._topPastWeek : sort

    const results = await getEpisodes({
      sort: cleanedSort,
      page,
      ...(searchTitle ? { searchTitle } : {}),
      includePodcast: true,
      ...(queryMediaType === PV.Filters._mediaTypeVideoOnly ? { hasVideo: true } : {})
    })

    return results
  }

  _queryEpisodesByCategory = async (categoryId?: string | null, sort?: string | null, page = 1) => {
    const { queryMediaType } = this.state
    const cleanedSort =
      sort === PV.Filters._mostRecentKey || sort === PV.Filters._randomKey ? PV.Filters._topPastWeek : sort

    const results = await getEpisodes({
      categories: categoryId,
      sort: cleanedSort,
      page,
      includePodcast: true,
      ...(queryMediaType === PV.Filters._mediaTypeVideoOnly ? { hasVideo: true } : {})
    })
    return results
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  }
})
