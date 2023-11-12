import AsyncStorage from '@react-native-community/async-storage'
import messaging from '@react-native-firebase/messaging'
import { hasNotch, hasDynamicIsland } from 'react-native-device-info'
import debounce from 'lodash/debounce'
import { convertToNowPlayingItem, createEmailLinkUrl, Podcast, NowPlayingItem } from 'podverse-shared'
import qs from 'qs'
import {
  Alert,
  AppState,
  Dimensions,
  Linking,
  NativeEventEmitter,
  NativeModules,
  Platform,
  StyleSheet,
  View as RNView,
  EmitterSubscription
} from 'react-native'
import { CarPlay } from 'react-native-carplay'
import Config from 'react-native-config'
import { endConnection as iapEndConnection, initConnection as iapInitConnection } from 'react-native-iap'
import { NavigationStackOptions } from 'react-navigation-stack'
import React, { addCallback } from 'reactn'
import Popover from 'react-native-popover-view'
import {
  ActionSheet,
  Button,
  Divider,
  FlatList,
  NavPodcastsViewIcon,
  PlayerEvents,
  PodcastTableCell,
  PurchaseListener,
  SearchBar,
  SwipeRowBackMultipleButtons,
  TableSectionSelectors,
  View
} from '../components'
import { SwipeRowBackButton } from '../components/SwipeRowBackMultipleButtons'
import { errorLogger, debugLogger } from '../lib/logger'
import { checkIfFDroidAppVersion, isPortrait } from '../lib/deviceDetection'
import { getDownloadedPodcasts } from '../lib/downloadedPodcast'
import { getDefaultSortForFilter, getSelectedFilterLabel, getSelectedSortLabel } from '../lib/filters'
import { translate } from '../lib/i18n'
import {
  handlePodcastScreenNavigateWithParams,
  navigateToEpisodeScreenInPodcastsStackNavigatorWithIds
} from '../lib/navigate'
import { alertIfNoNetworkConnection, hasValidNetworkConnection } from '../lib/network'
import { resetAllAppKeychain } from '../lib/secutity'
import {
  GlobalPropertyCallbackFunction,
  getAppUserAgent,
  safeKeyExtractor,
  setCategoryQueryProperty
} from '../lib/utility'
import { PV } from '../resources'
import { v4vAlbyCheckConnectDeepLink } from '../services/v4v/providers/alby'
import { getAutoDownloadsLastRefreshDate, handleAutoDownloadEpisodes } from '../services/autoDownloads'
import { handleAutoQueueEpisodes } from '../services/autoQueue'
import { verifyEmail } from '../services/auth'
import { assignCategoryQueryToState, assignCategoryToStateForSortSelect, getCategoryLabel } from '../services/category'
import { getCustomLaunchScreenKey } from '../services/customLaunchScreen'
import { getEpisode } from '../services/episode'
import PVEventEmitter from '../services/eventEmitter'
import { getMediaRef } from '../services/mediaRef'
import { getAddByRSSPodcastsLocally, parseAllAddByRSSPodcasts } from '../services/parser'
import { playerUpdateUserPlaybackPosition } from '../services/player'
import { audioUpdateTrackPlayerCapabilities } from '../services/playerAudioSetup'
import { getPodcast, getPodcasts } from '../services/podcast'
import { getSavedQueryPodcastsScreenSort, setSavedQueryPodcastsScreenSort } from '../services/savedQueryFilters'
import { getTrackingConsentAcknowledged, setTrackingConsentAcknowledged, trackPageView } from '../services/tracking'
import { getNowPlayingItem, getNowPlayingItemLocally } from '../services/userNowPlayingItem'
import { askToSyncWithNowPlayingItem, getAuthenticatedUserInfoLocally, getAuthUserInfo } from '../state/actions/auth'
import { initAutoQueue } from '../state/actions/autoQueue'
import {
  downloadedEpisodeDeleteMarked,
  initDownloads,
  removeDownloadedPodcast,
  updateDownloadedPodcasts
} from '../state/actions/downloads'
import { v4vAlbyHandleConnect } from '../state/actions/v4v/providers/alby'
import {
  clearEpisodesCount,
  clearEpisodesCountForPodcast,
  handleUpdateNewEpisodesCount,
  syncNewEpisodesCountWithHistory
} from '../state/actions/newEpisodesCount'
import {
  initializePlayerSettings,
  initializePlayer,
  initPlayerState,
  playerLoadNowPlayingItem,
  playerUpdatePlaybackState,
  playerUpdatePlayerState,
  showMiniPlayer,
  handleNavigateToPlayerScreen
} from '../state/actions/player'
import { refreshChaptersWidth } from '../state/actions/playerChapters'
import {
  combineWithAddByRSSPodcasts,
  findCombineWithAddByRSSPodcasts,
  getSubscribedPodcasts,
  removeAddByRSSPodcast,
  toggleSubscribeToPodcast
} from '../state/actions/podcast'
import { updateScreenReaderEnabledState } from '../state/actions/screenReader'
import { initializeSettings, setPodcastsGridView } from '../state/actions/settings'
import { setShouldshowPodcastsListPopover } from '../state/actions/podcasts-ui'
import { checkIfTrackingIsEnabled } from '../state/actions/tracking'
import { v4vInitialize, v4vRefreshConnectedProviders } from '../state/actions/v4v/v4v'
import { core } from '../styles'

const { PVUnifiedPushModule } = NativeModules

const _fileName = 'src/screens/PodcastsScreen.tsx'

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

const horizontalRowHeight = 98
const dividerHeight = 1

const getScreenTitle = () => {
  const screenTitle = translate('Music')
  return screenTitle
}

const getSearchPlaceholder = () => {
  return translate('Search podcasts')
}

export class AlbumsScreen extends React.Component<Props, State> {
  shouldLoad: boolean
  _unsubscribe: any | null
  // TODO: Replace with service
  pvNativeEventEmitter: NativeEventEmitter | null = checkIfFDroidAppVersion()
    ? new NativeEventEmitter(PVUnifiedPushModule)
    : null
  pvNativeEventSubscriptions: EmitterSubscription[] = []

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
    const _hasSubscribedPodcasts = navigation.getParam('_hasSubscribedPodcasts')
    return {
      title: _screenTitle,
      headerRight: () =>
        _hasSubscribedPodcasts ? (
          <RNView style={core.row}>
            <NavPodcastsViewIcon />
          </RNView>
        ) : null
    } as NavigationStackOptions
  }

  async componentDidMount() {
    this.props.navigation.setParams({
      _screenTitle: getScreenTitle()
    })

    try {
      this._initializeScreenData()
    } catch (error) {
      this.setState({ isLoadingMore: false })
      errorLogger(_fileName, 'componentDidMount init', error)
      Alert.alert(PV.Alerts.SOMETHING_WENT_WRONG.title, PV.Alerts.SOMETHING_WENT_WRONG.message, PV.Alerts.BUTTONS.OK)
    }
  }

  _setDownloadedDataIfOffline = async (forceOffline?: boolean) => {
    const isConnected = await hasValidNetworkConnection()
    if (!isConnected || forceOffline) {
      const preventIsLoading = false
      const preventAutoDownloading = true
      this.handleSelectFilterItem(PV.Filters._downloadedKey, preventIsLoading, preventAutoDownloading)
    }
  }

  _initializeScreenData = async () => {
    const { searchBarText } = this.state
    const savedQuerySort = await getSavedQueryPodcastsScreenSort()
    await combineWithAddByRSSPodcasts(PV.Medium.music, searchBarText, savedQuerySort)
    this._handleInitialDefaultQuery()
    this._initializeScreenDataPart2()
  }

  _initializeScreenDataPart2 = async () => {
    await Promise.all([this._handleInitialDefaultQuery])
    this._setDownloadedDataIfOffline()
    trackPageView('/albums', 'Albums Screen')
  }

  _handleInitialDefaultQuery = async () => {
    const { isInMaintenanceMode } = this.global
    if (!isInMaintenanceMode) {
      const isConnected = await hasValidNetworkConnection()
      const preventIsLoading = true
      const preventAutoDownloading = false
      const keepSearchTitle = false
      if (isConnected) {
        const savedQuerySort = await getSavedQueryPodcastsScreenSort()
        this.setState({ querySort: savedQuerySort }, () => {
          this.handleSelectFilterItem(
            PV.Filters._subscribedKey,
            preventIsLoading,
            preventAutoDownloading,
            keepSearchTitle
          )
        })
      } else {
        this._setDownloadedDataIfOffline()
      }
    }
  }

  handleSelectFilterItem = async (selectedKey: string) => {
    const preventIsLoading = false
    const preventAutoDownloading = true
    const keepSearchTitle = false
    await this.handleSelectFilterItem(
      selectedKey,
      preventIsLoading,
      preventAutoDownloading,
      keepSearchTitle
    )
  }

  handleSelectFilterItem = async (
    selectedKey: string,
    preventIsLoading?: boolean,
    preventAutoDownloading?: boolean,
    keepSearchTitle?: boolean
  ) => {
    if (!selectedKey) {
      return
    }

    const { querySort } = this.state
    const sort = getDefaultSortForFilter({
      screenName: PV.RouteNames.PodcastsScreen,
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
        isLoadingMore: !preventIsLoading,
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
            options,
            preventAutoDownloading
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
      await setSavedQueryPodcastsScreenSort(selectedKey)
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
      screenName: PV.RouteNames.PodcastsScreen,
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
      testID={`${testIDPrefix}_podcast_item_${index}`}
      valueTags={item.value}
    />
  )

  _onPodcastItemSelected = (podcast: Podcast) => {
    handlePodcastScreenNavigateWithParams(this.props.navigation, podcast.id, podcast, { forceRequest: false })
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

    return <SwipeRowBackMultipleButtons buttons={buttons} testID={`${testIDPrefix}_podcast_item_hidden_${index}`} />
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
        const preventIsLoading = false
        const preventAutoDownloading = true
        const keepSearchTitle = true
        this.handleSelectFilterItem(queryFrom, preventIsLoading, preventAutoDownloading, keepSearchTitle)
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
        const preventIsLoading = false
        const preventAutoDownloading = true
        const keepSearchTitle = false
        this.handleSelectFilterItem(restoredQueryFrom, preventIsLoading, preventAutoDownloading, keepSearchTitle)
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

  _handleDataSettingsWifiOnly = () => {
    AsyncStorage.setItem(PV.Keys.DOWNLOADING_WIFI_ONLY, 'TRUE')
    this._initializeScreenData()
  }

  _handleDataSettingsAllowData = () => {
    this._initializeScreenData()
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

    const hasANotch = hasNotch() || hasDynamicIsland()
    const popoverYOffset = hasANotch ? 100 : 40

    return (
      <View style={styles.view} testID={`${testIDPrefix}_view`}>
        <RNView style={{ flex: 1 }}>
          <PlayerEvents />
          <TableSectionSelectors
            filterScreenTitle={getScreenTitle()}
            handleSelectCategoryItem={(x: any) => this._selectCategory(x)}
            handleSelectCategorySubItem={(x: any) => this._selectCategory(x, true)}
            handleSelectFilterItem={this.handleSelectFilterItem}
            handleSelectSortItem={this.handleSelectSortItem}
            includePadding
            navigation={navigation}
            screenName='PodcastsScreen'
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
                ? translate('You are not subscribed to any podcasts yet')
                : translate('No podcasts found')
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
        <PurchaseListener navigation={navigation} />
        <ActionSheet
          handleCancelPress={this._handleActionSheetCancelPress}
          items={this._getGridActionItems()}
          showModal={showPodcastActionSheet}
          testID={testIDPrefix}
        />
        <Popover
          arrowSize={{ width: 0, height: 0 }}
          from={{ x: this.global.screen.screenWidth - 25, y: popoverYOffset }}
          popoverStyle={[styles.popoverStyle]}
          onRequestClose={() => setShouldshowPodcastsListPopover(false)}
          isVisible={this.global.showPodcastsListPopover}>
          <Button
            accessibilityLabel={translate('ARIA HINT - toggle podcast screen display')}
            onPress={() => {
              setPodcastsGridView(!this.global.podcastsGridViewEnabled)
              setShouldshowPodcastsListPopover(false)
            }}
            testID={`${testIDPrefix}_toggle_podcasts_screen_view`}
            text={this.global.podcastsGridViewEnabled ? translate('List View') : translate('Grid View')}
            wrapperStyles={[core.button, styles.podcastViewChangeButton]}
          />
          <Button
            accessibilityLabel={translate('ARIA HINT - clear the new episode indicators for all podcasts')}
            onPress={() => {
              clearEpisodesCount()
              setShouldshowPodcastsListPopover(false)
            }}
            testID={`${testIDPrefix}_clear_all_new_episode_indicators`}
            text={translate('Mark All As Seen')}
            wrapperStyles={[core.button, styles.markAllAsSeenButton]}
          />
        </Popover>
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

  _querySubscribedPodcasts = async (preventAutoDownloading?: boolean) => {
    const { querySort, searchBarText } = this.state
    let localSubscribedPodcasts = await getSubscribedPodcasts(PV.Medium.music, querySort)

    await handleUpdateNewEpisodesCount()
    localSubscribedPodcasts = await combineWithAddByRSSPodcasts(PV.Medium.mixed, searchBarText, querySort)

    if (!preventAutoDownloading) {
      try {
        const dateISOString = await getAutoDownloadsLastRefreshDate()
        await handleAutoDownloadEpisodes(dateISOString)
        await handleAutoQueueEpisodes(dateISOString)
      } catch (error) {
        errorLogger(_fileName, '_querySubscribedPodcasts auto download', error)
      }
      await AsyncStorage.setItem(PV.Keys.AUTODOWNLOADS_LAST_REFRESHED, new Date().toISOString())
    }

    // let syncing with server history data run in the background
    syncNewEpisodesCountWithHistory()

    return localSubscribedPodcasts
  }

  _queryCustomFeeds = async () => {
    const customFeeds = await getAddByRSSPodcastsLocally(PV.Medium.podcast)
    return customFeeds
  }

  _queryAllPodcasts = async (sort: string | null, page = 1) => {
    const { searchBarText: searchTitle } = this.state
    let localPodcasts = [] as any
    if (searchTitle && page === 1) {
      localPodcasts = await findCombineWithAddByRSSPodcasts(PV.Medium.podcast, searchTitle)
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
      ...(!searchTitle ? { podcastsOnly: true } : {})
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
      podcastsOnly: true
    })
    return results
  }

  _queryData = async (
    filterKey: any,
    prevState: State,
    nextState?: any,
    queryOptions: { isCategorySub?: boolean } = {},
    preventAutoDownloading?: boolean,
    preventParseCustomRSSFeeds?: boolean
  ) => {
    let newState = {
      isLoadingMore: false,
      isRefreshing: false,
      showNoInternetConnectionMessage: false,
      ...nextState
    } as State

    let shouldCleanFlatListData = true

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
        const podcasts = await getDownloadedPodcasts(PV.Medium.podcast, searchTitle)
        newState.flatListData = [...podcasts]
        newState.flatListDataTotalCount = podcasts.length
        newState.queryFrom = PV.Filters._downloadedKey
        newState.selectedFilterLabel = await getSelectedFilterLabel(PV.Filters._downloadedKey)
        newState.endOfResultsReached = true
      } else if (isSubscribedSelected) {
        if (!preventParseCustomRSSFeeds) {
          await getAuthUserInfo() // get the latest subscribedPodcastIds first
          shouldCleanFlatListData = false
        }
        const localPodcastsData = await this._querySubscribedPodcasts(
          preventAutoDownloading, preventParseCustomRSSFeeds)
        newState.flatListData = [...localPodcastsData]
        newState.flatListDataTotalCount = localPodcastsData.length
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
        PV.FilterOptions.screenFilters.PodcastsScreen.sort.some((option) => option === filterKey) ||
        PV.FilterOptions.screenFilters.PodcastsScreen.subscribedSort.some((option) => option === filterKey)
      ) {
        newState.showNoInternetConnectionMessage = !hasInternetConnection
        const results = await getPodcasts({
          ...setCategoryQueryProperty(queryFrom, selectedCategory, selectedCategorySub),
          sort: filterKey,
          ...(searchTitle ? { searchTitle } : {}),
          ...(!searchTitle ? { podcastsOnly: true } : {})
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

    if (shouldCleanFlatListData) {
      newState.flatListData = this.cleanFlatListData(newState.flatListData)
    }

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
  },
  popoverStyle: {
    backgroundColor: PV.Colors.whiteOpaque,
    borderRadius: 10
  },
  podcastViewChangeButton: {
    backgroundColor: PV.Colors.velvet,
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 10
  },
  markAllAsSeenButton: {
    backgroundColor: PV.Colors.velvet,
    marginTop: 0,
    marginBottom: 10,
    paddingHorizontal: 10
  }
})
