import debounce from 'lodash/debounce'
import { StyleSheet } from 'react-native'
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
import { hasValidNetworkConnection } from '../lib/network'
import { convertNowPlayingItemToEpisode, convertToNowPlayingItem } from '../lib/NowPlayingItem'
import { isOdd, setCategoryQueryProperty, testProps } from '../lib/utility'
import { PV } from '../resources'
import { getEpisodes } from '../services/episode'
import { gaTrackPageView } from '../services/googleAnalytics'
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

export class EpisodesScreen extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'Episodes'
  }

  constructor(props: Props) {
    super(props)

    const { subscribedPodcastIds } = this.global.session.userInfo

    this.state = {
      endOfResultsReached: false,
      flatListData: [],
      flatListDataTotalCount: null,
      hideRightItemWhileLoading: false,
      isLoading: true,
      isLoadingMore: false,
      isRefreshing: false,
      queryFrom:
        subscribedPodcastIds && subscribedPodcastIds.length > 0
          ? PV.Filters._subscribedKey
          : PV.Filters._allPodcastsKey,
      queryPage: 1,
      querySort:
        subscribedPodcastIds && subscribedPodcastIds.length > 0 ? PV.Filters._mostRecentKey : PV.Filters._topPastWeek,
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
    gaTrackPageView('/episodes', 'Episodes Screen')
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
        handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(item, null, null))}
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
        podcastTitle={podcastTitle}
        pubDate={item.pubDate}
        testId={'episodes_screen_episode_item_' + index}
        title={title}
      />
    )
  }

  _renderHiddenItem = ({ item }, rowMap) => (
    <SwipeRowBack onPress={() => this._handleHiddenItemPress(item.id, rowMap)} text='Delete' />
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
    const includeGoToPodcast = true

    return (
      <View style={styles.view} {...testProps('episodes_screen_view')}>
        <TableSectionSelectors
          handleSelectLeftItem={this.selectLeftItem}
          handleSelectRightItem={this.selectRightItem}
          hideRightItemWhileLoading={hideRightItemWhileLoading}
          screenName='EpisodesScreen'
          selectedLeftItemKey={queryFrom}
          selectedRightItemKey={querySort}
        />
        {queryFrom === PV.Filters._categoryKey && (
          <TableSectionSelectors
            handleSelectLeftItem={(x: string) => this._selectCategory(x)}
            handleSelectRightItem={(x: string) => this._selectCategory(x, true)}
            isBottomBar={true}
            isCategories={true}
            screenName='EpisodesScreen'
            selectedLeftItemKey={selectedCategory}
            selectedRightItemKey={selectedSubCategory}
          />
        )}
        {isLoading && <ActivityIndicator />}
        {!isLoading && queryFrom && (
          <FlatList
            data={flatListData}
            dataTotalCount={flatListDataTotalCount}
            disableLeftSwipe={queryFrom !== PV.Filters._downloadedKey}
            extraData={flatListData}
            handleSearchNavigation={this._handleSearchNavigation}
            isLoadingMore={isLoadingMore}
            isRefreshing={isRefreshing}
            ItemSeparatorComponent={this._ItemSeparatorComponent}
            keyExtractor={(item: any) => item.id}
            ListHeaderComponent={queryFrom !== PV.Filters._downloadedKey ? this._ListHeaderComponent : null}
            noSubscribedPodcasts={
              queryFrom === PV.Filters._subscribedKey && (!flatListData || flatListData.length === 0) && !searchBarText
            }
            onEndReached={this._onEndReached}
            onRefresh={this._onRefresh}
            renderHiddenItem={this._renderHiddenItem}
            renderItem={this._renderEpisodeItem}
            resultsText='episodes'
            showNoInternetConnectionMessage={showNoInternetConnectionMessage}
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
              null,
              includeGoToPodcast
            )
          }
          showModal={showActionSheet}
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
    newState.showNoInternetConnectionMessage = !hasInternetConnection && filterKey !== PV.Filters._downloadedKey

    try {
      let { flatListData } = this.state
      const { queryFrom, querySort, selectedCategory, selectedSubCategory } = this.state
      const podcastId = this.global.session.userInfo.subscribedPodcastIds
      const nsfwMode = this.global.settings.nsfwMode
      const { queryPage, searchAllFieldsText } = queryOptions

      flatListData = queryOptions && queryOptions.queryPage === 1 ? [] : flatListData

      if (filterKey === PV.Filters._subscribedKey) {
        const results = await getEpisodes(
          {
            sort: querySort,
            page: queryPage,
            podcastId,
            ...(searchAllFieldsText ? { searchAllFieldsText } : {}),
            subscribedOnly: true,
            includePodcast: true
          },
          this.global.settings.nsfwMode
        )
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
        const results = await getEpisodes(
          {
            ...setCategoryQueryProperty(queryFrom, selectedCategory, selectedSubCategory),
            ...(queryFrom === PV.Filters._subscribedKey ? { podcastId } : {}),
            sort: filterKey,
            ...(searchAllFieldsText ? { searchAllFieldsText } : {}),
            subscribedOnly: queryFrom === PV.Filters._subscribedKey,
            includePodcast: true
          },
          nsfwMode
        )
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

      return newState
    } catch (error) {
      console.log(error)
      return newState
    }
  }

  _queryAllEpisodes = async (sort: string | null, page: number = 1) => {
    const { searchBarText: searchAllFieldsText } = this.state

    const results = await getEpisodes(
      {
        sort,
        page,
        ...(searchAllFieldsText ? { searchAllFieldsText } : {}),
        includePodcast: true
      },
      this.global.settings.nsfwMode
    )

    return results
  }

  _queryEpisodesByCategory = async (categoryId?: string | null, sort?: string | null, page: number = 1) => {
    const { searchBarText: searchAllFieldsText } = this.state
    const results = await getEpisodes(
      {
        categories: categoryId,
        sort,
        page,
        ...(searchAllFieldsText ? { searchAllFieldsText } : {}),
        includePodcast: true
      },
      this.global.settings.nsfwMode
    )
    return results
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  }
})
