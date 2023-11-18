import debounce from 'lodash/debounce'
import { createEmailLinkUrl, Podcast, NowPlayingItem } from 'podverse-shared'
import {
  Alert,
  Linking,
  StyleSheet,
  View as RNView
} from 'react-native'
import Config from 'react-native-config'
import { NavigationStackOptions } from 'react-navigation-stack'
import React, { addCallback } from 'reactn'
import {
  ActionSheet,
  Divider,
  FlatList,
  // NavPodcastsViewIcon,
  PodcastTableCell,
  SearchBar,
  SwipeRowBackMultipleButtons,
  TableSectionSelectors,
  View
} from '../components'
import { SwipeRowBackButton } from '../components/SwipeRowBackMultipleButtons'
import { errorLogger } from '../lib/logger'
import { getDownloadedPodcasts } from '../lib/downloadedPodcast'
import { getDefaultSortForFilter, getSelectedFilterLabel, getSelectedSortLabel } from '../lib/filters'
import { translate } from '../lib/i18n'
import { handleAlbumScreenNavigateWithParams } from '../lib/navigate'
import { alertIfNoNetworkConnection, hasValidNetworkConnection } from '../lib/network'
import {
  GlobalPropertyCallbackFunction,
  safeKeyExtractor,
  setCategoryQueryProperty
} from '../lib/utility'
import { PV } from '../resources'
import { assignCategoryQueryToState, assignCategoryToStateForSortSelect, getCategoryLabel } from '../services/category'
import PVEventEmitter from '../services/eventEmitter'
import { getAddByRSSPodcastsLocally, parseAllAddByRSSPodcasts } from '../services/parser'
import { getPodcasts } from '../services/podcast'
import { getSavedQueryAlbumsScreenSort, setSavedQueryAlbumsScreenSort } from '../services/savedQueryFilters'
import { trackPageView } from '../services/tracking'
import { removeDownloadedPodcast } from '../state/actions/downloads'
import { clearEpisodesCountForPodcast } from '../state/actions/newEpisodesCount'
import {
  combineWithAddByRSSPodcasts,
  findCombineWithAddByRSSPodcasts,
  getSubscribedPodcasts,
  removeAddByRSSPodcast,
  toggleSubscribeToPodcast
} from '../state/actions/podcast'
import { core } from '../styles'

const _fileName = 'src/screens/AlbumsScreen.tsx'

type Props = {
  navigation?: any
}

type State = {
  endOfResultsReached: boolean
  flatListData: any[]
  flatListDataTotalCount: number | null
  isInitialLoadFinished: boolean
  isLoadingMore: boolean
  isRefreshing: boolean
  isUnsubscribing: boolean
  queryFrom: string | null
  queryPage: number
  querySort: string | null
  searchBarText: string
  selectedCategory: string | null
  selectedCategorySub: string | null
  selectedFilterLabel?: string | null
  selectedSortLabel?: string | null
  showNoInternetConnectionMessage?: boolean
  tempQueryEnabled: boolean
  tempQueryFrom: string | null
  tempQuerySort: string | null
  showPodcastActionSheet: boolean
  gridItemSelected: (Podcast & NowPlayingItem) | null
}

const testIDPrefix = 'albums_screen'

export let isInitialLoadPodcastsScreen = true
const horizontalRowHeight = 98
const dividerHeight = 1

const getScreenTitle = () => {
  const screenTitle = translate('Music - Albums')
  return screenTitle
}

const getSearchPlaceholder = () => {
  const searchPlaceholder = translate('Search podcasts')
  return searchPlaceholder
}

export class AlbumsScreen extends React.Component<Props, State> {
  shouldLoad: boolean

  constructor(props: Props) {
    super(props)

    this.shouldLoad = true

    this.state = {
      endOfResultsReached: false,
      flatListData: [],
      flatListDataTotalCount: null,
      isInitialLoadFinished: false,
      isLoadingMore: true,
      isRefreshing: false,
      isUnsubscribing: false,
      queryFrom: null,
      queryPage: 1,
      querySort: null,
      searchBarText: '',
      selectedCategory: null,
      selectedCategorySub: null,
      selectedFilterLabel: translate('Subscribed'),
      selectedSortLabel: translate('A-Z'),
      tempQueryEnabled: false,
      tempQueryFrom: null,
      tempQuerySort: null,
      showPodcastActionSheet: false,
      gridItemSelected: null
    }

    this._handleSearchBarTextQuery = debounce(this._handleSearchBarTextQuery, PV.SearchBar.textInputDebounceTime)

    // Add a callback for subscribed podcasts to show or hide header button
    addCallback(
      GlobalPropertyCallbackFunction('subscribedPodcastsTotalCount', (podcastCount) => {
        props.navigation.setParams({
          _hasSubscribedPodcasts: podcastCount && podcastCount > 0
        })
      })
    )
  }

  static navigationOptions = ({ navigation }) => {
    const _screenTitle = navigation.getParam('_screenTitle')
    // const _hasSubscribedPodcasts = navigation.getParam('_hasSubscribedPodcasts')
    return {
      title: _screenTitle,
      // headerRight: () =>
      //   _hasSubscribedPodcasts ? (
      //     <RNView style={core.row}>
      //       <NavPodcastsViewIcon />
      //     </RNView>
      //   ) : null
    } as NavigationStackOptions
  }

  componentDidMount() {
    this.props.navigation.setParams({
      _screenTitle: getScreenTitle()
    })

    PVEventEmitter.on(PV.Events.USER_LOGGED_IN, this._handleUserLoggedIn)

    try {
      this._initializeScreenData()
    } catch (error) {
      isInitialLoadPodcastsScreen = false
      this.setState({
        isLoadingMore: false
      })
      errorLogger(_fileName, 'componentDidMount init', error)

      Alert.alert(PV.Alerts.SOMETHING_WENT_WRONG.title, PV.Alerts.SOMETHING_WENT_WRONG.message, PV.Alerts.BUTTONS.OK)
    }
  }

  componentWillUnmount() {
    PVEventEmitter.removeListener(PV.Events.USER_LOGGED_IN, this._handleUserLoggedIn)
  }

  _handleUserLoggedIn = () => {
    this.handleSelectFilterItem(PV.Filters._subscribedKey)
  }

  _setDownloadedDataIfOffline = async (forceOffline?: boolean) => {
    const isConnected = await hasValidNetworkConnection()
    if (!isConnected || forceOffline) {
      this.handleSelectFilterItem(PV.Filters._downloadedKey)
    }
  }

  _initializeScreenData = async () => {
    await this._handleInitialDefaultQuery()
    await this._setDownloadedDataIfOffline()
    trackPageView('/albums', 'Albums Screen')
  }

  _handleInitialDefaultQuery = async () => {
    const { isInMaintenanceMode } = this.global
    if (!isInMaintenanceMode) {
      const isConnected = await hasValidNetworkConnection()
      const keepSearchTitle = false
      if (isConnected) {
        const savedQuerySort = await getSavedQueryAlbumsScreenSort()
        this.setState({ querySort: savedQuerySort }, () => {
          this.handleSelectFilterItem(
            PV.Filters._subscribedKey,
            keepSearchTitle
          )
        })
      } else {
        this._setDownloadedDataIfOffline()
      }
    }
  }

  handleSelectFilterItem = async (
    selectedKey: string,
    keepSearchTitle?: boolean
  ) => {
    if (!selectedKey) {
      return
    }

    const { querySort } = this.state
    const sort = getDefaultSortForFilter({
      screenName: PV.RouteNames.AlbumsScreen,
      selectedFilterItemKey: selectedKey,
      selectedSortItemKey: querySort
    })

    const selectedFilterLabel = await getSelectedFilterLabel(selectedKey)
    const selectedSortLabel = getSelectedSortLabel(sort)

    isInitialLoadPodcastsScreen = false

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
        selectedCategory: null,
        selectedCategorySub: null,
        selectedFilterLabel,
        selectedSortLabel
      },
      () => {
        (async () => {
          const nextState = null
          const options = {}
          const newState = await this._queryData(
            selectedKey,
            this.state,
            nextState,
            options
          )
          this.setState({
            ...newState,
            isInitialLoadFinished: true
          })
        })()
      }
    )
  }

  handleSelectSortItem = async (selectedKey: string) => {
    if (!selectedKey) {
      return
    }

    const { queryFrom } = this.state

    if (queryFrom === PV.Filters._subscribedKey) {
      await setSavedQueryAlbumsScreenSort(selectedKey)
    }

    const selectedSortLabel = getSelectedSortLabel(selectedKey)

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
          const newState = await this._queryData(selectedKey, this.state)
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
    const sort = getDefaultSortForFilter({
      screenName: PV.RouteNames.AlbumsScreen,
      selectedFilterItemKey: selectedKey,
      selectedSortItemKey: querySort
    })

    const selectedFilterLabel = await getCategoryLabel(selectedKey)
    const selectedSortLabel = getSelectedSortLabel(sort)

    this.setState(
      {
        endOfResultsReached: false,
        isLoadingMore: true,
        ...((isCategorySub ? { selectedCategorySub: selectedKey } : { selectedCategory: selectedKey }) as any),
        flatListData: [],
        flatListDataTotalCount: null,
        queryFrom: PV.Filters._categoryKey,
        queryPage: 1,
        querySort: sort,
        selectedFilterLabel,
        selectedSortLabel
      },
      () => {
        (async () => {
          const newState = await this._queryData(selectedKey, this.state, {}, { isCategorySub })
          this.setState(newState)
        })()
      }
    )
  }

  _onEndReached = (evt: any) => {
    const { distanceFromEnd } = evt
    const { endOfResultsReached, queryFrom, queryPage = 1 } = this.state

    if (
      queryFrom !== PV.Filters._subscribedKey &&
      queryFrom !== PV.Filters._customFeedsKey &&
      !endOfResultsReached &&
      this.shouldLoad
    ) {
      if (distanceFromEnd > -1) {
        this.shouldLoad = false
        this.setState(
          {
            isLoadingMore: true
          },
          () => {
            (async () => {
              const nextPage = queryPage + 1
              const newState = await this._queryData(queryFrom, this.state, {
                queryPage: nextPage
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
          if (queryFrom === PV.Filters._customFeedsKey) {
            await parseAllAddByRSSPodcasts()
          }

          const newState = await this._queryData(queryFrom, this.state, {
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
      <View style={core.ListHeaderComponent} testID={`${testIDPrefix}_filter_wrapper`}>
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

  _ItemSeparatorComponent = () => <Divider optional style={{ marginHorizontal: 10 }} />

  _renderPodcastItem = ({ item, index }) => (
    <PodcastTableCell
      addByRSSPodcastFeedUrl={item?.addByRSSPodcastFeedUrl}
      id={item?.id}
      lastEpisodePubDate={item.lastEpisodePubDate}
      latestLiveItemStatus={item.latestLiveItemStatus}
      onPress={() => this._onPodcastItemSelected(item)}
      podcastImageUrl={item.shrunkImageUrl || item.imageUrl}
      {...(item.title ? { podcastTitle: item.title } : {})}
      showAutoDownload
      showDownloadCount
      // TODO: change
      testID={`${testIDPrefix}_album_item_${index}`}
      valueTags={item.value}
    />
  )

  _onPodcastItemSelected = (podcast: Podcast) => {
    handleAlbumScreenNavigateWithParams(
      this.props.navigation,
      podcast.id,
      podcast,
      { forceRequest: false }
    )
  }

  _onPodcastItemLongPressed = (item: Podcast) => {
    this.setState({ showPodcastActionSheet: true, gridItemSelected: item })
  }

  _handleClearNewEpisodeIndicators = (podcast: any) => {
    if (podcast?.id || podcast?.addByRSSPodcastFeedUrl) {
      clearEpisodesCountForPodcast(podcast.addByRSSPodcastFeedUrl || podcast.id)
    }
  }

  _renderHiddenItem = ({ item, index }, rowMap) => {
    const { isUnsubscribing, queryFrom } = this.state
    const buttonText: string = queryFrom === PV.Filters._downloadedKey ? translate('Delete') : translate('Unsubscribe')

    const buttons: SwipeRowBackButton[] = [
      {
        key: 'mark_as_seen',
        text: translate('Mark as Seen'),
        type: 'primary',
        onPress: () => {
          this._handleClearNewEpisodeIndicators(item)
          const rowId = safeKeyExtractor(testIDPrefix, index, item?.id)
          rowMap[rowId]?.closeRow()
        }
      },
      {
        key: 'unsubscribe',
        text: buttonText,
        type: 'danger',
        onPress: () => this._handleHiddenItemPress(item.id, item.addByRSSPodcastFeedUrl),
        isLoading: isUnsubscribing
      }
    ]

    return <SwipeRowBackMultipleButtons buttons={buttons} testID={`${testIDPrefix}_album_item_hidden_${index}`} />
  }

  _handleHiddenItemPress = async (selectedId, addByRSSPodcastFeedUrl) => {
    const { queryFrom } = this.state

    let wasAlerted = false
    if (queryFrom === PV.Filters._subscribedKey || queryFrom === PV.Filters._customFeedsKey) {
      wasAlerted = await alertIfNoNetworkConnection(translate('unsubscribe from podcast'))
    }

    if (wasAlerted) return
    this.setState({ isUnsubscribing: true }, () => {
      (async () => {
        try {
          if (queryFrom === PV.Filters._subscribedKey || queryFrom === PV.Filters._customFeedsKey) {
            addByRSSPodcastFeedUrl
              ? await removeAddByRSSPodcast(addByRSSPodcastFeedUrl)
              : await toggleSubscribeToPodcast(selectedId)
            await removeDownloadedPodcast(selectedId || addByRSSPodcastFeedUrl)
          } else if (queryFrom === PV.Filters._downloadedKey) {
            await removeDownloadedPodcast(selectedId || addByRSSPodcastFeedUrl)
          }

          // TODO: the safeKeyExtractor is breaking the logic below
          // by appending an index to the rowMap key
          // const row = rowMap[selectedId] || rowMap[addByRSSPodcastFeedUrl]
          // row.closeRow()
        } catch (error) {
          errorLogger(_fileName, '_handleHiddenItemPress', error)
        }
        this.setState({ isUnsubscribing: false })
      })()
    })
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

  _handleSearchBarTextQuery = async () => {
    const { queryFrom, querySort, searchBarText, tempQueryEnabled } = this.state

    if (!searchBarText) {
      this._handleRestoreSavedQuery()
    } else {
      const hasInternetConnection = await hasValidNetworkConnection()
      const tempQueryObj: any = !tempQueryEnabled
        ? {
            tempQueryEnabled: true,
            tempQueryFrom: queryFrom,
            tempQuerySort: querySort
          }
        : {}
      this.setState(tempQueryObj, () => {
        const queryFrom = !hasInternetConnection ? PV.Filters._downloadedKey : PV.Filters._allPodcastsKey
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

  _navToRequestPodcastEmail = () => {
    Linking.openURL(createEmailLinkUrl(PV.Emails.PODCAST_REQUEST))
  }

  _getItemLayout = (_: any, index: number) => {
    return {
      length: horizontalRowHeight + dividerHeight,
      offset: (horizontalRowHeight + dividerHeight) * index,
      index
    }
  }

  render() {
    const { navigation } = this.props
    const {
      flatListData,
      flatListDataTotalCount,
      isInitialLoadFinished,
      isLoadingMore,
      isRefreshing,
      queryFrom,
      querySort,
      searchBarText,
      selectedCategory,
      selectedCategorySub,
      selectedFilterLabel,
      selectedSortLabel,
      showNoInternetConnectionMessage,
      showPodcastActionSheet
    } = this.state
    const { session, podcastsGridViewEnabled } = this.global
    const { subscribedPodcastIds } = session?.userInfo

    const noSubscribedPodcasts =
      queryFrom === PV.Filters._subscribedKey && (!subscribedPodcastIds || subscribedPodcastIds.length === 0)

    const isCategoryScreen = queryFrom === PV.Filters._categoryKey

    return (
      <View style={styles.view} testID={`${testIDPrefix}_view`}>
        <RNView style={{ flex: 1 }}>
          <TableSectionSelectors
            filterScreenTitle={getScreenTitle()}
            handleSelectCategoryItem={(x: any) => this._selectCategory(x)}
            handleSelectCategorySubItem={(x: any) => this._selectCategory(x, true)}
            handleSelectFilterItem={(selectedFilter: string) => this.handleSelectFilterItem(selectedFilter)}
            handleSelectSortItem={this.handleSelectSortItem}
            includePadding
            navigation={navigation}
            screenName='AlbumsScreen'
            selectedCategoryItemKey={selectedCategory}
            selectedCategorySubItemKey={selectedCategorySub}
            selectedFilterItemKey={queryFrom}
            selectedFilterLabel={selectedFilterLabel}
            selectedSortItemKey={querySort}
            selectedSortLabel={selectedSortLabel}
            testID={testIDPrefix}
          />
          <FlatList
            data={flatListData}
            dataTotalCount={flatListDataTotalCount}
            disableLeftSwipe={
              queryFrom !== PV.Filters._subscribedKey &&
              queryFrom !== PV.Filters._downloadedKey &&
              queryFrom !== PV.Filters._customFeedsKey
            }
            disableNoResultsMessage={!isInitialLoadFinished}
            extraData={flatListData}
            getItemLayout={this._getItemLayout}
            gridView={podcastsGridViewEnabled}
            handleNoResultsTopAction={!!Config.CURATOR_EMAIL ? this._navToRequestPodcastEmail : null}
            keyExtractor={(item: any, index: number) => safeKeyExtractor(testIDPrefix, index, item?.id)}
            isLoadingMore={isLoadingMore}
            isRefreshing={isRefreshing}
            ItemSeparatorComponent={this._ItemSeparatorComponent}
            {...(isCategoryScreen ? null : { ListHeaderComponent: this._ListHeaderComponent })}
            noResultsMessage={
              // eslint-disable-next-line max-len
              noSubscribedPodcasts
                ? translate('You are not subscribed to any albums yet')
                : translate('No albums found')
            }
            noResultsTopActionText={!!Config.CURATOR_EMAIL && searchBarText ? translate('Request Podcast') : ''}
            noResultsTopActionTextAccessibilityHint={translate('ARIA HINT - send us an email to request a podcast')}
            onEndReached={this._onEndReached}
            onGridItemSelected={this._onPodcastItemSelected}
            onGridItemLongPressed={this._onPodcastItemLongPressed}
            onRefresh={this._onRefresh}
            renderHiddenItem={this._renderHiddenItem}
            renderItem={this._renderPodcastItem}
            rightOpenValue={PV.FlatList.hiddenItems.rightOpenValue.twoButtons}
            showNoInternetConnectionMessage={showNoInternetConnectionMessage}
            stickyHeader
            testID={testIDPrefix}
          />
        </RNView>
        <ActionSheet
          handleCancelPress={this._handleActionSheetCancelPress}
          items={this._getGridActionItems()}
          showModal={showPodcastActionSheet}
          testID={testIDPrefix}
        />
      </View>
    )
  }

  _getGridActionItems = () => {
    const { gridItemSelected } = this.state

    return [
      {
        accessibilityLabel: translate('Mark as Seen'),
        key: 'mark_as_seen',
        text: translate('Mark as Seen'),
        onPress: () => {
          this._handleClearNewEpisodeIndicators(gridItemSelected)
          this.setState({ showPodcastActionSheet: false, gridItemSelected: null })
        }
      },
      {
        accessibilityLabel: translate('Unsubscribe'),
        key: 'unsubscribe',
        text: translate('Unsubscribe'),
        onPress: async () => {
          await this._handleHiddenItemPress(gridItemSelected?.id, gridItemSelected?.addByRSSPodcastFeedUrl).then()
          this.setState({ showPodcastActionSheet: false, gridItemSelected: null })
        },
        buttonTextStyle: {
          color: PV.Colors.redLighter
        }
      }
    ]
  }

  _handleActionSheetCancelPress = () => {
    this.setState({ showPodcastActionSheet: false, gridItemSelected: null })
  }

  _querySubscribedPodcasts = async () => {
    const { querySort, searchBarText } = this.state
    let subscribedPodcastsAllMediums = await getSubscribedPodcasts(querySort)
    subscribedPodcastsAllMediums = await combineWithAddByRSSPodcasts(searchBarText, querySort)
    const subscribedPodcasts = subscribedPodcastsAllMediums.filter((podcast: Podcast) => podcast.medium === 'music')
    return subscribedPodcasts
  }

  _queryCustomFeeds = async () => {
    const customFeeds = await getAddByRSSPodcastsLocally()
    return customFeeds
  }

  _queryAllPodcasts = async (sort: string | null, page = 1) => {
    const { searchBarText: searchTitle } = this.state

    let localPodcasts = [] as any
    if (searchTitle && page === 1) {
      localPodcasts = await findCombineWithAddByRSSPodcasts(PV.Medium.music, searchTitle)
      this.setState({
        queryFrom: PV.Filters._allPodcastsKey,
        flatListData: localPodcasts,
        flatListDataTotalCount: localPodcasts.length,
        // Need to set endOfResultsReached to true to prevent onEndReached from
        // being called immediately after localPodcasts loads in the flatListData.
        // It will be reset to false after _queryData finishes if the end is not reached yet.
        endOfResultsReached: true
      })
    }

    const results = await getPodcasts({
      sort,
      page,
      ...(searchTitle ? { searchTitle } : {}),
      isMusic: true
    })

    if (searchTitle) {
      const filteredResults = results[0].filter((serverPodcast: any) => {
        return !localPodcasts.some((localPodcast: any) => {
          return localPodcast?.title === serverPodcast?.title
        })
      })

      results[0] = [...localPodcasts, ...filteredResults]
    }

    return results
  }

  _queryPodcastsByCategory = async (categoryId?: string | null, sort?: string | null, page = 1) => {
    const results = await getPodcasts({
      categories: categoryId,
      sort,
      page,
      isMusic: true
    })
    return results
  }

  _queryData = async (
    filterKey: any,
    prevState: State,
    nextState?: any,
    queryOptions: { isCategorySub?: boolean } = {}
  ) => {
    let newState = {
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
        selectedCategorySub
      } = prevState

      const { isInMaintenanceMode } = this.global

      const hasInternetConnection = await hasValidNetworkConnection()
      const isSubscribedSelected = filterKey === PV.Filters._subscribedKey || queryFrom === PV.Filters._subscribedKey
      const isCustomFeedsSelected = filterKey === PV.Filters._customFeedsKey || queryFrom === PV.Filters._customFeedsKey
      const isDownloadedSelected =
        filterKey === PV.Filters._downloadedKey || queryFrom === PV.Filters._downloadedKey || isInMaintenanceMode
      const isAllPodcastsSelected = filterKey === PV.Filters._allPodcastsKey || queryFrom === PV.Filters._allPodcastsKey

      if (isDownloadedSelected) {
        const podcasts = await getDownloadedPodcasts({
          searchTitle,
          isMusic: true
        })
        newState.flatListData = [...podcasts]
        newState.queryFrom = PV.Filters._downloadedKey
        newState.selectedFilterLabel = await getSelectedFilterLabel(PV.Filters._downloadedKey)
        newState.endOfResultsReached = true
        newState.flatListDataTotalCount = podcasts.length
      } else if (isSubscribedSelected) {
        const subscribedPodcasts = await this._querySubscribedPodcasts()
        newState.flatListData = [...subscribedPodcasts]
        newState.flatListDataTotalCount = subscribedPodcasts.length
      } else if (isCustomFeedsSelected) {
        const podcasts = await this._queryCustomFeeds()
        newState.flatListData = [...podcasts]
        newState.endOfResultsReached = true
        newState.flatListDataTotalCount = podcasts.length
      } else if (isAllPodcastsSelected) {
        newState.showNoInternetConnectionMessage = !hasInternetConnection
        const results = await this._queryAllPodcasts(querySort, newState.queryPage)
        newState.flatListData = newState.queryPage > 1 ? [...flatListData, ...results[0]] : [...results[0]]
        newState.endOfResultsReached = results[0].length < 20
        newState.flatListDataTotalCount = results[1]
      } else if (
        PV.FilterOptions.screenFilters.AlbumsScreen.sort.some((option) => option === filterKey) ||
        PV.FilterOptions.screenFilters.AlbumsScreen.subscribedSort.some((option) => option === filterKey)
      ) {
        newState.showNoInternetConnectionMessage = !hasInternetConnection
        const results = await getPodcasts({
          ...setCategoryQueryProperty(queryFrom, selectedCategory, selectedCategorySub),
          sort: filterKey,
          ...(searchTitle ? { searchTitle } : {}),
          isMusic: true
        })
        newState.flatListData = results[0]
        newState.endOfResultsReached = results[0].length < 20
        newState.flatListDataTotalCount = results[1]
        newState = assignCategoryToStateForSortSelect(newState, selectedCategory, selectedCategorySub)
      } else {
        newState.showNoInternetConnectionMessage = !hasInternetConnection

        const assignedCategoryData = assignCategoryQueryToState(
          filterKey,
          newState,
          queryOptions,
          selectedCategory,
          selectedCategorySub
        )

        const categories = assignedCategoryData.categories
        newState = assignedCategoryData.newState

        const results = await this._queryPodcastsByCategory(categories, querySort, newState.queryPage)
        newState.flatListData = [...flatListData, ...results[0]]
        newState.endOfResultsReached = results[0].length < 20
        newState.flatListDataTotalCount = results[1]
      }
    } catch (error) {
      errorLogger(_fileName, '_queryData error', error)
    }

    newState.flatListData = this.cleanFlatListData(newState.flatListData)

    this.shouldLoad = true

    return newState
  }

  cleanFlatListData = (flatListData: any[]) => {
    return flatListData?.filter((item) => !!item?.id) || []
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  }
})
