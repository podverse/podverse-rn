import debounce from 'lodash/debounce'
import { convertNowPlayingItemToEpisode, convertToNowPlayingItem } from 'podverse-shared'
import { Alert } from 'react-native'
import React from 'reactn'
import {
  ActionSheet,
  ActivityIndicator,
  ClipTableCell,
  Divider,
  FlatList,
  SearchBar,
  TableSectionSelectors,
  View
} from '../components'
import { errorLogger } from '../lib/logger'
import { downloadEpisode } from '../lib/downloader'
import { getSelectedFilterLabel, getSelectedSortLabel } from '../lib/filters'
import { translate } from '../lib/i18n'
import { hasValidNetworkConnection } from '../lib/network'
import { safeKeyExtractor, safelyUnwrapNestedVariable, setCategoryQueryProperty } from '../lib/utility'
import { PV } from '../resources'
import { assignCategoryQueryToState, assignCategoryToStateForSortSelect, getCategoryLabel } from '../services/category'
import { deleteMediaRef, getMediaRefs } from '../services/mediaRef'
import { trackPageView } from '../services/tracking'
import { getLoggedInUserMediaRefs } from '../services/user'
import { playerLoadNowPlayingItem } from '../state/actions/player'
import { core } from '../styles'

const _fileName = 'src/screens/ClipsScreen.tsx'

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
  selectedCategory: string | null
  selectedCategorySub: string | null
  selectedFilterLabel?: string | null
  selectedSortLabel?: string | null
  selectedItem?: any
  showActionSheet: boolean
  showNoInternetConnectionMessage?: boolean
  tempQueryEnabled: boolean
  tempQueryFrom: string | null
  tempQuerySort: string | null
}

const testIDPrefix = 'clips_screen'

export class ClipsScreen extends React.Component<Props, State> {
  shouldLoad: boolean

  constructor(props: Props) {
    super(props)

    this.shouldLoad = true

    this.state = {
      endOfResultsReached: false,
      flatListData: [],
      flatListDataTotalCount: null,
      isLoading: false,
      isLoadingMore: true,
      isRefreshing: false,
      queryFrom: PV.Filters._subscribedKey,
      queryPage: 1,
      querySort: PV.Filters._mostRecentKey,
      searchBarText: '',
      selectedCategory: null,
      selectedCategorySub: null,
      selectedFilterLabel: translate('Subscribed'),
      selectedSortLabel: translate('Recent'),
      showActionSheet: false,
      tempQueryEnabled: false,
      tempQueryFrom: PV.Filters._subscribedKey,
      tempQuerySort: PV.Filters._mostRecentKey
    }

    this._handleSearchBarTextQuery = debounce(this._handleSearchBarTextQuery, PV.SearchBar.textInputDebounceTime)
  }

  static navigationOptions = () => ({
    title: translate('Clips')
  })

  async componentDidMount() {
    const { queryFrom } = this.state
    const newState = await this._queryData(queryFrom)
    this.setState(newState)
    trackPageView('/clips', 'Clips Screen')
  }

  handleSelectFilterItem = async (selectedKey: string, keepSearchTitle?: boolean) => {
    if (!selectedKey) {
      return
    }

    const { querySort } = this.state
    const [selectedFilterLabel, selectedSortLabel] = await Promise.all([
      getSelectedFilterLabel(selectedKey),
      getSelectedSortLabel(querySort)
    ])

    this.setState(
      {
        endOfResultsReached: false,
        flatListData: [],
        flatListDataTotalCount: null,
        isLoading: false,
        isLoadingMore: true,
        queryFrom: selectedKey,
        queryPage: 1,
        querySort,
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
        isLoading: false,
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

  _selectCategory = async (selectedKey: string, isSubCategory?: boolean) => {
    if (!selectedKey) {
      return
    }

    const selectedFilterLabel = await getCategoryLabel(selectedKey)

    this.setState(
      {
        endOfResultsReached: false,
        isLoading: false,
        isLoadingMore: true,
        ...((isSubCategory ? { selectedCategorySub: selectedKey } : { selectedCategory: selectedKey }) as any),
        flatListData: [],
        flatListDataTotalCount: null,
        queryFrom: PV.Filters._categoryKey,
        queryPage: 1,
        selectedFilterLabel
      },
      () => {
        (async () => {
          const newState = await this._queryData(selectedKey, { isSubCategory })
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
          placeholder={translate('Search podcasts')}
          testID={`${testIDPrefix}_filter_bar`}
          value={searchBarText}
        />
      </View>
    )
  }

  _ItemSeparatorComponent = () => <Divider optional />

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

  _renderClipItem = ({ item, index }) => {
    const { navigation } = this.props
    return item?.episode?.id ? (
      <ClipTableCell
        item={item}
        handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(item, null, item.episode.podcast))}
        navigation={navigation}
        showEpisodeInfo
        showPodcastInfo
        testID={`${testIDPrefix}_clip_item_${index}`}
      />
    ) : null
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

  _handleDownloadPressed = () => {
    if (this.state.selectedItem) {
      const episode = convertNowPlayingItemToEpisode(this.state.selectedItem)
      downloadEpisode(episode, episode.podcast)
    }
  }

  _showClipDeleteConfirmDialog = (mediaRefIdToDelete: string) => {
    const CLIP_DELETE = PV.Alerts.CLIP_DELETE(() => this._deleteMediaRef(mediaRefIdToDelete))
    PV.Alerts.modalAlert(CLIP_DELETE.title, CLIP_DELETE.message, CLIP_DELETE.buttons)
  }

  _handleSearchNavigation = () => {
    this.props.navigation.navigate(PV.RouteNames.SearchScreen)
  }

  _deleteMediaRef = (mediaRefIdToDelete: string) => {
    let { flatListData, flatListDataTotalCount } = this.state

    if (mediaRefIdToDelete) {
      this.setState(
        {
          isLoading: true
        },
        () => {
          (async () => {
            try {
              await deleteMediaRef(mediaRefIdToDelete)
              flatListData = flatListData.filter((x: any) => x.id !== mediaRefIdToDelete)
              flatListDataTotalCount = flatListData.length
            } catch (error) {
              if (error.response) {
                Alert.alert(
                  PV.Alerts.SOMETHING_WENT_WRONG.title,
                  PV.Alerts.SOMETHING_WENT_WRONG.message,
                  PV.Alerts.BUTTONS.OK
                )
              }
            }
            this.setState({
              flatListData,
              flatListDataTotalCount,
              isLoading: false
            })
          })()
        }
      )
    }
  }

  _handleNavigationPress = async (selectedItem: any) => {
    await playerLoadNowPlayingItem(selectedItem, {
      forceUpdateOrderDate: false,
      setCurrentItemNextInQueue: true,
      shouldPlay: true
    })
  }

  render() {
    const { navigation } = this.props
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
      selectedSortLabel,
      selectedItem,
      showActionSheet,
      showNoInternetConnectionMessage
    } = this.state
    const { session } = this.global
    const subscribedPodcastIds = safelyUnwrapNestedVariable(() => session.userInfo.subscribedPodcastIds, '')

    const noSubscribedPodcasts =
      queryFrom === PV.Filters._subscribedKey &&
      (!subscribedPodcastIds || subscribedPodcastIds.length === 0) &&
      !searchBarText

    return (
      <View style={styles.view} testID={`${testIDPrefix}_view`}>
        <TableSectionSelectors
          filterScreenTitle={translate('Clips')}
          handleSelectCategoryItem={(x: any) => this._selectCategory(x)}
          handleSelectCategorySubItem={(x: any) => this._selectCategory(x, true)}
          handleSelectFilterItem={this.handleSelectFilterItem}
          handleSelectSortItem={this.handleSelectSortItem}
          includePadding
          navigation={navigation}
          screenName='ClipsScreen'
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
            handleNoResultsTopAction={this._handleSearchNavigation}
            isLoadingMore={isLoadingMore}
            isRefreshing={isRefreshing}
            ItemSeparatorComponent={this._ItemSeparatorComponent}
            keyExtractor={(item: any, index: number) => safeKeyExtractor(testIDPrefix, index, item?.id)}
            ListHeaderComponent={this._ListHeaderComponent}
            noResultsMessage={
              noSubscribedPodcasts
                ? translate('You are not subscribed to any podcasts yet')
                : translate('No clips found')
            }
            onEndReached={this._onEndReached}
            onRefresh={this._onRefresh}
            renderItem={this._renderClipItem}
            showNoInternetConnectionMessage={showNoInternetConnectionMessage}
            stickyHeader
          />
        )}
        <ActionSheet
          handleCancelPress={this._handleCancelPress}
          items={() => {
            if (!selectedItem) return []

            return PV.ActionSheet.media.moreButtons(
              selectedItem,
              navigation,
              {
                handleDismiss: this._handleCancelPress,
                handleDownload: this._handleDownloadPressed,
                handleDeleteClip: this._showClipDeleteConfirmDialog,
                includeGoToPodcast: true,
                includeGoToEpisodeInEpisodesStack: true
              },
              'clip'
            )
          }}
          showModal={showActionSheet}
          testID={testIDPrefix}
        />
      </View>
    )
  }

  _getLoggedInUserMediaRefs = async (queryPage?: number, newSortFilter?: string) =>
    getLoggedInUserMediaRefs({
      sort: newSortFilter ? newSortFilter : PV.Filters._mostRecentKey,
      page: queryPage ? queryPage : 1,
      includePodcast: true
    })

  _queryData = async (
    filterKey: any,
    queryOptions: {
      isSubCategory?: boolean
      queryPage?: number
    } = {}
  ) => {
    let newState = {
      isLoading: false,
      isLoadingMore: false,
      isRefreshing: false,
      showNoInternetConnectionMessage: false
    } as State

    const hasInternetConnection = await hasValidNetworkConnection()

    if (!hasInternetConnection) {
      newState.showNoInternetConnectionMessage = true
      this.shouldLoad = true
      return newState
    }

    try {
      let { flatListData } = this.state
      const { queryFrom, querySort, searchBarText, selectedCategory, selectedCategorySub } = this.state
      const podcastId = this.global.session.userInfo.subscribedPodcastIds
      const { queryPage } = queryOptions

      flatListData = queryOptions && queryOptions.queryPage === 1 ? [] : flatListData

      if (filterKey === PV.Filters._subscribedKey) {
        const results = await getMediaRefs({
          sort: querySort,
          page: queryPage,
          podcastId,
          ...(searchBarText ? { searchTitle: searchBarText } : {}),
          subscribedOnly: true,
          includePodcast: true
        })
        newState.flatListData = [...flatListData, ...results[0]]
        newState.endOfResultsReached = results[0].length < 20
        newState.flatListDataTotalCount = results[1]
      } else if (filterKey === PV.Filters._allPodcastsKey) {
        const results = await this._queryAllMediaRefs(querySort, queryPage)
        newState.flatListData = [...flatListData, ...results[0]]
        newState.endOfResultsReached = results[0].length < 20
        newState.flatListDataTotalCount = results[1]
      } else if (PV.FilterOptions.screenFilters.ClipsScreen.sort.some((option) => option === filterKey)) {
        let results = []
        results = await getMediaRefs({
          ...setCategoryQueryProperty(queryFrom, selectedCategory, selectedCategorySub),
          ...(queryFrom === PV.Filters._subscribedKey ? { podcastId } : {}),
          sort: filterKey,
          ...(searchBarText ? { searchTitle: searchBarText } : {}),
          subscribedOnly: queryFrom === PV.Filters._subscribedKey,
          includePodcast: true
        })

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
        filterKey = assignedCategoryData.newFilterKey
        newState = assignedCategoryData.newState

        const results = await this._queryMediaRefsByCategory(categories, querySort, queryPage)
        newState.flatListData = results[0]
        newState.endOfResultsReached = results[0].length < 20
        newState.flatListDataTotalCount = results[1]
      }
    } catch (error) {
      errorLogger(_fileName, 'queryData', error)
    }
    newState.flatListData = this.cleanFlatListData(newState.flatListData)

    this.shouldLoad = true

    return newState
  }

  cleanFlatListData = (flatListData: any[]) => {
    return flatListData?.filter((item: any) => !!item?.episode?.id) || []
  }

  _queryAllMediaRefs = async (sort: string | null, page = 1) => {
    const { searchBarText: searchTitle } = this.state
    const results = await getMediaRefs({
      sort,
      page,
      ...(searchTitle ? { searchTitle } : {}),
      ...(!searchTitle ? { podcastsOnly: true } : {}),
      includePodcast: true
    })

    return results
  }

  _queryMediaRefsByCategory = async (categoryId?: string | null, sort?: string | null, page = 1) => {
    const { searchBarText: searchTitle } = this.state
    const results = await getMediaRefs({
      categories: categoryId,
      sort,
      page,
      ...(searchTitle ? { searchTitle } : {}),
      ...(!searchTitle ? { podcastsOnly: true } : {}),
      includePodcast: true
    })
    return results
  }
}

const styles = {
  view: {
    flex: 1
  }
}
