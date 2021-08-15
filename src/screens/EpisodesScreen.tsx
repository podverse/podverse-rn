import debounce from 'lodash/debounce'
import { convertToNowPlayingItem } from 'podverse-shared'
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
  SwipeRowBack,
  TableSectionSelectors,
  View
} from '../components'
import { getDownloadedEpisodes } from '../lib/downloadedPodcast'
import { downloadEpisode } from '../lib/downloader'
import { getDefaultSortForFilter, getSelectedFilterLabel, getSelectedSortLabel } from '../lib/filters'
import { translate } from '../lib/i18n'
import { hasValidNetworkConnection } from '../lib/network'
import { getUniqueArrayByKey, safeKeyExtractor, setCategoryQueryProperty, testProps } from '../lib/utility'
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
  isLoading: boolean
  isLoadingMore: boolean
  isRefreshing: boolean
  queryFrom: string | null
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
}

const testIDPrefix = 'episodes_screen'

export class EpisodesScreen extends React.Component<Props, State> {
  shouldLoad: boolean

  constructor(props: Props) {
    super(props)

    this.shouldLoad = true

    const { subscribedPodcasts } = this.global

    const hasSubscribedPodcasts = subscribedPodcasts && subscribedPodcasts.length > 0

    this.state = {
      endOfResultsReached: false,
      flatListData: [],
      flatListDataTotalCount: null,
      isLoading: true,
      isLoadingMore: false,
      isRefreshing: false,
      queryFrom: hasSubscribedPodcasts ? PV.Filters._subscribedKey : Config.DEFAULT_QUERY_EPISODES_SCREEN,
      queryPage: 1,
      querySort: hasSubscribedPodcasts ? PV.Filters._mostRecentKey : PV.Filters._topPastWeek,
      searchBarText: '',
      selectedCategory: null,
      selectedCategorySub: null,
      selectedFilterLabel: hasSubscribedPodcasts ? translate('Subscribed') : translate('All Podcasts'),
      selectedSortLabel: hasSubscribedPodcasts ? translate('recent') : translate('top - week'),
      showActionSheet: false
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
    this.setState(
      {
        queryFrom: from
      },
      () => {
        (async () => {
          const newState = await this._queryData(from)
          this.setState(newState)
        })()
      }
    )

    PVEventEmitter.on(PV.Events.PODCAST_SUBSCRIBE_TOGGLED, this._handleToggleSubscribeEvent)

    trackPageView('/episodes', 'Episodes Screen')
  }

  componentWillUnmount() {
    PVEventEmitter.removeListener(PV.Events.PODCAST_SUBSCRIBE_TOGGLED, this._handleToggleSubscribeEvent)
  }

  _handleToggleSubscribeEvent = () => {
    const { queryFrom } = this.state
    if (queryFrom) this.handleSelectFilterItem(queryFrom)
  }

  handleSelectFilterItem = async (selectedKey: string) => {
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
        isLoading: true,
        queryFrom: selectedKey,
        queryPage: 1,
        querySort: sort,
        searchBarText: '',
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
        isLoading: true,
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
        isLoading: true,
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
                queryPage: this.state.queryPage,
                searchAllFieldsText: this.state.searchBarText
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
            queryPage: 1,
            searchAllFieldsText: this.state.searchBarText
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
          inputContainerStyle={core.searchBar}
          onChangeText={this._handleSearchBarTextChange}
          onClear={this._handleSearchBarClear}
          value={searchBarText}
        />
      </View>
    )
  }

  _ItemSeparatorComponent = () => <Divider style={{ marginHorizontal: 10 }} />

  _handleCancelPress = () => new Promise((resolve) => {
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

  _renderEpisodeItem = ({ item, index }) => {
    const { mediaFileDuration, userPlaybackPosition } = getHistoryItemIndexInfoForEpisode(item.id)

    return (
      <EpisodeTableCell
        item={item}
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
        showPodcastInfo
        testID={`${testIDPrefix}_episode_item_${index}`}
        userPlaybackPosition={userPlaybackPosition}
      />
    )
  }

  _renderHiddenItem = ({ item, index }, rowMap) => (
    <SwipeRowBack
      onPress={() => this._handleHiddenItemPress(item.id, rowMap)}
      testID={`${testIDPrefix}_episode_item_${index}`}
      text={translate('Delete')}
    />
  )

  _handleHiddenItemPress = (selectedId) => {
    const filteredEpisodes = this.state.flatListData.filter((x: any) => x.id !== selectedId)
    this.setState(
      {
        flatListData: filteredEpisodes
      },
      () => {
        (async () => {
          await removeDownloadedPodcastEpisode(selectedId)
          const finalDownloadedEpisodes = await getDownloadedEpisodes()
          this.setState({ flatListData: finalDownloadedEpisodes })
        })()
      }
    )
  }

  _handleSearchBarClear = () => {
    this.setState({
      flatListData: [],
      flatListDataTotalCount: null,
      searchBarText: ''
    })
  }

  _handleSearchBarTextChange = (text: string) => {
    const { queryFrom } = this.state

    this.setState({
      isLoadingMore: true,
      searchBarText: text
    })
    this._handleSearchBarTextQuery(queryFrom, { searchAllFieldsText: text })
  }

  _handleSearchBarTextQuery = (queryFrom: string | null, queryOptions: any) => {
    this.setState(
      {
        flatListData: [],
        flatListDataTotalCount: null,
        queryPage: 1
      },
      () => {
        (async () => {
          const state = await this._queryData(queryFrom, {
            searchAllFieldsText: queryOptions.searchAllFieldsText
          })
          this.setState(state)
        })()
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
        : translate('Search')

    return (
      <View style={styles.view} {...testProps('episodes_screen_view')}>
        <TableSectionSelectors
          filterScreenTitle={translate('Episodes')}
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
            disableLeftSwipe={queryFrom !== PV.Filters._downloadedKey}
            extraData={flatListData}
            handleNoResultsTopAction={this._handleNoResultsTopAction}
            isLoadingMore={isLoadingMore}
            isRefreshing={isRefreshing}
            ItemSeparatorComponent={this._ItemSeparatorComponent}
            keyExtractor={(item: any, index: number) => safeKeyExtractor(testIDPrefix, index, item?.id)}
            ListHeaderComponent={queryFrom !== PV.Filters._downloadedKey ? this._ListHeaderComponent : null}
            noResultsMessage={
              noSubscribedPodcasts ? translate("You don't have any podcasts yet") : translate('No episodes found')
            }
            noResultsTopActionText={noSubscribedPodcasts ? defaultNoSubscribedPodcastsMessage : ''}
            onEndReached={this._onEndReached}
            onRefresh={this._onRefresh}
            renderHiddenItem={this._renderHiddenItem}
            renderItem={this._renderEpisodeItem}
            showNoInternetConnectionMessage={showOfflineMessage || showNoInternetConnectionMessage}
          />
        )}
        <ActionSheet
          handleCancelPress={this._handleCancelPress}
          items={() =>
            PV.ActionSheet.media.moreButtons(selectedItem, navigation, {
              handleDismiss: this._handleCancelPress,
              includeGoToPodcast: true
            })
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
      searchAllFieldsText?: string
    } = {}
  ) => {
    let newState = {
      isLoading: false,
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

    try {
      let { flatListData } = this.state
      const { queryFrom, querySort, selectedCategory, selectedCategorySub } = this.state
      const podcastId = this.global.session.userInfo.subscribedPodcastIds
      const { queryPage, searchAllFieldsText } = queryOptions

      flatListData = queryOptions && queryOptions.queryPage === 1 ? [] : flatListData

      if (filterKey === PV.Filters._subscribedKey) {
        let results = []

        if (podcastId) {
          results = await getEpisodes({
            sort: querySort,
            page: queryPage,
            podcastId,
            ...(searchAllFieldsText ? { searchAllFieldsText } : {}),
            subscribedOnly: true,
            includePodcast: true
          })
        }

        const hasAddByRSSEpisodes = await hasAddByRSSEpisodesLocally()
        if (querySort === PV.Filters._mostRecentKey && hasAddByRSSEpisodes) {
          results = await combineEpisodesWithAddByRSSEpisodesLocally(results)
        }

        newState.flatListData = [...flatListData, ...results[0]]
        newState.endOfResultsReached = newState.flatListData.length >= results[1]
        newState.flatListDataTotalCount = results[1]
      } else if (filterKey === PV.Filters._downloadedKey) {
        const downloadedEpisodes = await getDownloadedEpisodes()
        newState.flatListData = [...downloadedEpisodes]
        newState.endOfResultsReached = true
        newState.flatListDataTotalCount = downloadedEpisodes.length
      } else if (filterKey === PV.Filters._allPodcastsKey) {
        const results = await this._queryAllEpisodes(querySort, queryPage)
        newState.flatListData = [...flatListData, ...results[0]]
        newState.endOfResultsReached = newState.flatListData.length >= results[1]
        newState.flatListDataTotalCount = results[1]
      } else if (PV.FilterOptions.screenFilters.EpisodesScreen.sort.some((option) => option === filterKey)) {
        let results = await getEpisodes({
          ...setCategoryQueryProperty(queryFrom, selectedCategory, selectedCategorySub),
          ...(queryFrom === PV.Filters._subscribedKey ? { podcastId } : {}),
          sort: filterKey,
          ...(searchAllFieldsText ? { searchAllFieldsText } : {}),
          subscribedOnly: queryFrom === PV.Filters._subscribedKey,
          includePodcast: true
        })

        const hasAddByRSSEpisodes = await hasAddByRSSEpisodesLocally()
        if (queryFrom === PV.Filters._subscribedKey && filterKey === PV.Filters._mostRecentKey && hasAddByRSSEpisodes) {
          results = await combineEpisodesWithAddByRSSEpisodesLocally(results)
        }

        newState.flatListData = results[0]
        newState.endOfResultsReached = newState.flatListData.length >= results[1]
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
        filterKey = assignedCategoryData.newFilterKey
        newState = assignedCategoryData.newState

        const results = await this._queryEpisodesByCategory(categories, querySort, queryPage)
        newState.flatListData = results[0]
        newState.endOfResultsReached = newState.flatListData.length >= results[1]
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
    const { searchBarText: searchAllFieldsText } = this.state
    const cleanedSort =
      sort === PV.Filters._mostRecentKey || sort === PV.Filters._randomKey ? PV.Filters._topPastWeek : sort

    const results = await getEpisodes({
      sort: cleanedSort,
      page,
      ...(searchAllFieldsText ? { searchAllFieldsText } : {}),
      includePodcast: true
    })

    return results
  }

  _queryEpisodesByCategory = async (categoryId?: string | null, sort?: string | null, page = 1) => {
    const { searchBarText: searchAllFieldsText } = this.state
    const cleanedSort =
      sort === PV.Filters._mostRecentKey || sort === PV.Filters._randomKey ? PV.Filters._topPastWeek : sort

    const results = await getEpisodes({
      categories: categoryId,
      sort: cleanedSort,
      page,
      ...(searchAllFieldsText ? { searchAllFieldsText } : {}),
      includePodcast: true
    })
    return results
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  }
})
