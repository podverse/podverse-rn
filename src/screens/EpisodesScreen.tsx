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
  SwipeRowBack,
  TableSectionSelectors,
  View
} from '../components'
import { getDownloadedEpisodes } from '../lib/downloadedPodcast'
import { downloadEpisode } from '../lib/downloader'
import { translate } from '../lib/i18n'
import { hasValidNetworkConnection } from '../lib/network'
import { getUniqueArrayByKey, isOdd, setCategoryQueryProperty, testProps } from '../lib/utility'
import { PV } from '../resources'
import { getEpisodes } from '../services/episode'
import { combineEpisodesWithAddByRSSEpisodesLocally, hasAddByRSSEpisodesLocally } from '../services/parser'
import { trackPageView } from '../services/tracking'
import { removeDownloadedPodcastEpisode } from '../state/actions/downloads'
import { core } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  endOfResultsReached: boolean
  flatListData: any[]
  flatListDataTotalCount: number | null
  hideRightItemWhileLoading: boolean
  isLoading: boolean
  isLoadingMore: boolean
  isRefreshing: boolean
  queryFrom: string | null
  queryPage: number
  querySort: string | null
  searchBarText: string
  selectedItem?: any
  selectedCategory: string | null
  selectedSubCategory: string | null
  showActionSheet: boolean
  showNoInternetConnectionMessage?: boolean
}

const testIDPrefix = 'episodes_screen'

export class EpisodesScreen extends React.Component<Props, State> {
  static navigationOptions = () => {
    return {
      title: translate('Episodes')
    }
  }

  constructor(props: Props) {
    super(props)
    const { subscribedPodcasts } = this.global

    this.state = {
      endOfResultsReached: false,
      flatListData: [],
      flatListDataTotalCount: null,
      hideRightItemWhileLoading: false,
      isLoading: true,
      isLoadingMore: false,
      isRefreshing: false,
      queryFrom:
        subscribedPodcasts && subscribedPodcasts.length > 0
          ? PV.Filters._subscribedKey
          : Config.DEFAULT_QUERY_EPISODES_SCREEN,
      queryPage: 1,
      querySort:
        subscribedPodcasts && subscribedPodcasts.length > 0 ? PV.Filters._mostRecentKey : PV.Filters._topPastWeek,
      searchBarText: '',
      selectedCategory: PV.Filters._allCategoriesKey,
      selectedSubCategory: PV.Filters._allCategoriesKey,
      showActionSheet: false
    }

    this._handleSearchBarTextQuery = debounce(this._handleSearchBarTextQuery, PV.SearchBar.textInputDebounceTime)
  }

  async componentDidMount() {
    const { queryFrom } = this.state
    const hasInternetConnection = await hasValidNetworkConnection()
    const from = hasInternetConnection ? queryFrom : PV.Filters._downloadedKey
    this.setState(
      {
        queryFrom: from
      },
      async () => {
        const newState = await this._queryData(from)
        this.setState(newState)
      }
    )
    trackPageView('/episodes', 'Episodes Screen')
  }

  selectLeftItem = async (selectedKey: string) => {
    if (!selectedKey) {
      this.setState({ queryFrom: null })
      return
    }

    const { querySort } = this.state

    let sort = querySort
    let hideRightItemWhileLoading = false
    if (
      (selectedKey === PV.Filters._allPodcastsKey || selectedKey === PV.Filters._categoryKey) &&
      (querySort === PV.Filters._mostRecentKey || querySort === PV.Filters._randomKey)
    ) {
      sort = PV.Filters._topPastWeek
      hideRightItemWhileLoading = true
    } else if (selectedKey === PV.Filters._downloadedKey) {
      sort = PV.Filters._mostRecentKey
      hideRightItemWhileLoading = true
    }

    this.setState(
      {
        endOfResultsReached: false,
        flatListData: [],
        flatListDataTotalCount: null,
        hideRightItemWhileLoading,
        isLoading: true,
        queryFrom: selectedKey,
        queryPage: 1,
        querySort: sort,
        searchBarText: ''
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
        const newState = await this._queryData(selectedKey, { isSubCategory })
        this.setState(newState)
      }
    )
  }

  _onEndReached = ({ distanceFromEnd }) => {
    const { endOfResultsReached, isLoadingMore, queryFrom, queryPage = 1 } = this.state
    if (!endOfResultsReached && !isLoadingMore) {
      if (distanceFromEnd > -1) {
        this.setState(
          {
            isLoadingMore: true,
            queryPage: queryPage + 1
          },
          async () => {
            const newState = await this._queryData(queryFrom, {
              queryPage: this.state.queryPage,
              searchAllFieldsText: this.state.searchBarText
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
        const newState = await this._queryData(queryFrom, {
          queryPage: 1,
          searchAllFieldsText: this.state.searchBarText
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

  _renderEpisodeItem = ({ item, index }) => {
    const description = item.description ? item.description.substr(0, 300) : ''
    const title = item.title || ''
    const podcastTitle = item?.podcast_title || item?.podcast?.title || ''

    return (
      <EpisodeTableCell
        description={description}
        handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(item, null, item.podcast))}
        handleNavigationPress={() =>
          this.props.navigation.navigate(PV.RouteNames.EpisodeScreen, {
            episode: item,
            includeGoToPodcast: true
          })
        }
        hasZebraStripe={isOdd(index)}
        hideImage={false}
        id={item.id}
        podcastImageUrl={
          item.podcast_shrunkImageUrl ||
          item.podcast_imageUrl ||
          (item.podcast && (item.podcast.shrunkImageUrl || item.podcast.imageUrl))
        }
        {...(podcastTitle ? { podcastTitle } : {})}
        pubDate={item.pubDate}
        showPodcastTitle={true}
        testID={`${testIDPrefix}_episode_item_${index}`}
        {...(title ? { title } : {})}
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

  _handleHiddenItemPress = async (selectedId, rowMap) => {
    const filteredEpisodes = this.state.flatListData.filter((x: any) => x.id !== selectedId)
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

  _handleSearchBarClear = (text: string) => {
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

  _handleSearchBarTextQuery = async (queryFrom: string | null, queryOptions: any) => {
    this.setState(
      {
        flatListData: [],
        flatListDataTotalCount: null,
        queryPage: 1
      },
      async () => {
        const state = await this._queryData(queryFrom, {
          searchAllFieldsText: queryOptions.searchAllFieldsText
        })
        this.setState(state)
      }
    )
  }

  _handleSearchNavigation = () => {
    this.props.navigation.navigate(PV.RouteNames.SearchScreen)
  }

  _handleDownloadPressed = () => {
    if (this.state.selectedItem) {
      const episode = convertNowPlayingItemToEpisode(this.state.selectedItem)
      downloadEpisode(episode, episode.podcast)
    }
  }

  render() {
    const {
      flatListData,
      flatListDataTotalCount,
      hideRightItemWhileLoading,
      isLoading,
      isLoadingMore,
      isRefreshing,
      queryFrom,
      querySort,
      searchBarText,
      selectedCategory,
      selectedItem,
      selectedSubCategory,
      showActionSheet,
      showNoInternetConnectionMessage
    } = this.state
    const { navigation } = this.props
    const { offlineModeEnabled } = this.global
    const { subscribedPodcastIds } = this.global.session.userInfo

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

    const isSortLimitQueries = queryFrom === PV.Filters._allPodcastsKey || queryFrom === PV.Filters._categoryKey

    return (
      <View style={styles.view} {...testProps('episodes_screen_view')}>
        <TableSectionSelectors
          handleSelectLeftItem={this.selectLeftItem}
          handleSelectRightItem={this.selectRightItem}
          hideRightItemWhileLoading={hideRightItemWhileLoading}
          isSortLimitQueries={isSortLimitQueries}
          screenName='EpisodesScreen'
          selectedLeftItemKey={queryFrom}
          selectedRightItemKey={querySort}
          testID={testIDPrefix}
        />
        {queryFrom === PV.Filters._categoryKey && (
          <TableSectionSelectors
            handleSelectLeftItem={(x: string) => this._selectCategory(x)}
            handleSelectRightItem={(x: string) => this._selectCategory(x, true)}
            isBottomBar={true}
            isCategories={true}
            isSortLimitQueries={isSortLimitQueries}
            screenName='EpisodesScreen'
            selectedLeftItemKey={selectedCategory}
            selectedRightItemKey={selectedSubCategory}
            testID={`${testIDPrefix}_sub`}
          />
        )}
        {isLoading && <ActivityIndicator />}
        {!isLoading && queryFrom && (
          <FlatList
            data={flatListData}
            dataTotalCount={flatListDataTotalCount}
            disableLeftSwipe={queryFrom !== PV.Filters._downloadedKey}
            extraData={flatListData}
            handleNoResultsTopAction={this._handleSearchNavigation}
            isLoadingMore={isLoadingMore}
            isRefreshing={isRefreshing}
            ItemSeparatorComponent={this._ItemSeparatorComponent}
            keyExtractor={(item: any) => item.id}
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
            PV.ActionSheet.media.moreButtons(
              selectedItem,
              navigation,
              this._handleCancelPress,
              this._handleDownloadPressed,
              null, // handleDeleteEpisode
              true, // includeGoToPodcast
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
      isSubCategory?: boolean
      queryPage?: number
      searchAllFieldsText?: string
    } = {}
  ) => {
    const newState = {
      hideRightItemWhileLoading: false,
      isLoading: false,
      isLoadingMore: false,
      isRefreshing: false,
      showNoInternetConnectionMessage: false
    } as State

    const hasInternetConnection = await hasValidNetworkConnection()

    if (!hasInternetConnection && filterKey !== PV.Filters._downloadedKey) {
      newState.showNoInternetConnectionMessage = true
      return newState
    }

    try {
      let { flatListData } = this.state
      const { queryFrom, querySort, selectedCategory, selectedSubCategory } = this.state
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
      } else if (filterKey === PV.Filters._categoryKey) {
        if (selectedCategory && selectedSubCategory === PV.Filters._allCategoriesKey) {
          const results = await this._queryEpisodesByCategory(selectedCategory, querySort, queryPage)
          newState.flatListData = [...flatListData, ...results[0]]
          newState.endOfResultsReached = newState.flatListData.length >= results[1]
          newState.flatListDataTotalCount = results[1]
        } else if (selectedSubCategory) {
          const results = await this._queryEpisodesByCategory(selectedSubCategory, querySort, queryPage)
          newState.flatListData = [...flatListData, ...results[0]]
          newState.endOfResultsReached = newState.flatListData.length >= results[1]
          newState.flatListDataTotalCount = results[1]
          newState.selectedSubCategory = selectedSubCategory || PV.Filters._allCategoriesKey
        } else {
          const podcastResults = await this._queryAllEpisodes(querySort, queryPage)
          newState.flatListData = [...flatListData, ...podcastResults[0]]
          newState.endOfResultsReached = newState.flatListData.length >= podcastResults[1]
          newState.flatListDataTotalCount = podcastResults[1]
        }
      } else if (PV.FilterOptions.screenFilters.EpisodesScreen.sort.some((option) => option === filterKey)) {
        let results = await getEpisodes({
          ...setCategoryQueryProperty(queryFrom, selectedCategory, selectedSubCategory),
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
      } else {
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

        const results = await this._queryEpisodesByCategory(categories, querySort, queryPage)
        newState.flatListData = results[0]
        newState.endOfResultsReached = newState.flatListData.length >= results[1]
        newState.flatListDataTotalCount = results[1]
      }

      newState.flatListData = getUniqueArrayByKey(newState.flatListData, 'id')

      return newState
    } catch (error) {
      console.log(error)
      return newState
    }
  }

  _queryAllEpisodes = async (sort: string | null, page: number = 1) => {
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

  _queryEpisodesByCategory = async (categoryId?: string | null, sort?: string | null, page: number = 1) => {
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
