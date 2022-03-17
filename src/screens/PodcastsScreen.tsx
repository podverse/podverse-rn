import AsyncStorage from '@react-native-community/async-storage'
import debounce from 'lodash/debounce'
import { Alert, AppState, Linking, Platform, StyleSheet, View as RNView } from 'react-native'
import Config from 'react-native-config'
import Dialog from 'react-native-dialog'
import { endConnection as iapEndConnection, initConnection as iapInitConnection } from 'react-native-iap'
import React from 'reactn'
import { convertToNowPlayingItem } from 'podverse-shared'
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
import { getDefaultSortForFilter, getSelectedFilterLabel, getSelectedSortLabel } from '../lib/filters'
import { translate } from '../lib/i18n'
import { alertIfNoNetworkConnection, hasValidNetworkConnection } from '../lib/network'
import {
  createEmailLinkUrl,
  getAppUserAgent,
  safeKeyExtractor,
  setAppUserAgent,
  setCategoryQueryProperty
} from '../lib/utility'
import { PV } from '../resources'
import { handleAutoDownloadEpisodes } from '../services/autoDownloads'
import { assignCategoryQueryToState, assignCategoryToStateForSortSelect, getCategoryLabel } from '../services/category'
import { getEpisode } from '../services/episode'
import PVEventEmitter from '../services/eventEmitter'
import { getMediaRef } from '../services/mediaRef'
import { getNowPlayingItem, getNowPlayingItemLocally } from '../services/userNowPlayingItem'
import { getAddByRSSPodcastsLocally, parseAllAddByRSSPodcasts } from '../services/parser'
import { playerUpdateUserPlaybackPosition } from '../services/player'
import { audioUpdateTrackPlayerCapabilities } from '../services/playerAudio'
import { getPodcast, getPodcasts } from '../services/podcast'
import { getTrackingConsentAcknowledged, setTrackingConsentAcknowledged, trackPageView } from '../services/tracking'
import { askToSyncWithNowPlayingItem, getAuthenticatedUserInfoLocally, getAuthUserInfo } from '../state/actions/auth'
import { initDownloads, removeDownloadedPodcast, updateDownloadedPodcasts } from '../state/actions/downloads'
import { updateWalletInfo } from '../state/actions/lnpay'
import {
  initializePlaybackSpeed,
  initializePlayer,
  initPlayerState,
  playerLoadNowPlayingItem,
  playerUpdatePlaybackState,
  playerUpdatePlayerState,
  showMiniPlayer
} from '../state/actions/player'
import {
  combineWithAddByRSSPodcasts,
  getSubscribedPodcasts,
  removeAddByRSSPodcast,
  toggleSubscribeToPodcast
} from '../state/actions/podcast'
import { updateScreenReaderEnabledState } from '../state/actions/screenReader'
import { initializeSettings } from '../state/actions/settings'
import { checkIfTrackingIsEnabled } from '../state/actions/tracking'
import { initializeValueProcessor } from '../state/actions/valueTag'
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
  isUnsubscribing: boolean
  queryFrom: string | null
  queryMediaType: string | null
  queryPage: number
  querySort: string | null
  searchBarText: string
  selectedCategory: string | null
  selectedCategorySub: string | null
  selectedFilterLabel?: string | null
  selectedSortLabel?: string | null
  showDataSettingsConfirmDialog: boolean
  showNoInternetConnectionMessage?: boolean
}

const testIDPrefix = 'podcasts_screen'

let isInitialLoad = true

export class PodcastsScreen extends React.Component<Props, State> {
  shouldLoad: boolean
  _unsubscribe: any | null

  constructor(props: Props) {
    super(props)

    this.shouldLoad = true

    this.state = {
      endOfResultsReached: false,
      flatListData: [],
      flatListDataTotalCount: null,
      isLoadingMore: true,
      isRefreshing: false,
      isUnsubscribing: false,
      queryFrom: null,
      queryMediaType: PV.Filters._mediaTypeAllContent,
      queryPage: 1,
      querySort: null,
      searchBarText: '',
      selectedCategory: null,
      selectedCategorySub: null,
      selectedFilterLabel: translate('Subscribed'),
      showDataSettingsConfirmDialog: false,
      selectedSortLabel: translate('A-Z')
    }

    this._handleSearchBarTextQuery = debounce(this._handleSearchBarTextQuery, PV.SearchBar.textInputDebounceTime)
  }

  static navigationOptions = () => ({
    title: translate('Podcasts')
  })

  async componentDidMount() {
    const { navigation } = this.props

    iapInitConnection()

    Linking.getInitialURL().then((initialUrl) => {
      // settimeout here gives a chance to the rest of
      // the app to have finished loading and navigate correctly
      setTimeout(() => {
        if (initialUrl) {
          this._handleOpenURLEvent({ url: initialUrl })
        }
      }, 300)
    })
    Linking.addEventListener('url', this._handleOpenURLEvent)
    AppState.addEventListener('change', this._handleAppStateChange)
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    PVEventEmitter.on(PV.Events.LNPAY_WALLET_INFO_SHOULD_UPDATE, updateWalletInfo)
    PVEventEmitter.on(PV.Events.ADD_BY_RSS_AUTH_SCREEN_SHOW, this._handleNavigateToAddPodcastByRSSAuthScreen)
    PVEventEmitter.on(PV.Events.NAV_TO_MEMBERSHIP_SCREEN, this._handleNavigateToMembershipScreen)
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    PVEventEmitter.on(PV.Keys.TRACKING_TERMS_ACKNOWLEDGED, this._handleTrackingTermsAcknowledged)

    updateScreenReaderEnabledState()

    const trackingConsentAcknowledged = await getTrackingConsentAcknowledged()
    if (!trackingConsentAcknowledged) {
      await navigation.navigate(PV.RouteNames.TrackingConsentScreen)
    }

    try {
      const appHasLaunched = await AsyncStorage.getItem(PV.Keys.APP_HAS_LAUNCHED)
      if (!appHasLaunched) {
        await AsyncStorage.setItem(PV.Keys.APP_HAS_LAUNCHED, 'true')
        await AsyncStorage.setItem(PV.Keys.AUTO_DELETE_EPISODE_ON_END, 'TRUE')
        await AsyncStorage.setItem(PV.Keys.DOWNLOADED_EPISODE_LIMIT_GLOBAL_COUNT, '5')
        await AsyncStorage.setItem(PV.Keys.CENSOR_NSFW_TEXT, 'TRUE')
        await AsyncStorage.setItem(PV.Keys.PLAYER_MAXIMUM_SPEED, '2.5')

        if (!Config.DISABLE_CRASH_LOGS) {
          await AsyncStorage.setItem(PV.Keys.ERROR_REPORTING_ENABLED, 'TRUE')
        }
        this.setState({ isLoadingMore: false })
      } else {
        this._initializeScreenData()
      }
    } catch (error) {
      isInitialLoad = false
      this.setState({
        isLoadingMore: false
      })
      console.log(error)

      Alert.alert(PV.Alerts.SOMETHING_WENT_WRONG.title, PV.Alerts.SOMETHING_WENT_WRONG.message, PV.Alerts.BUTTONS.OK)
    }

    this._unsubscribe = navigation.addListener('willFocus', () => {
      this._setDownloadedDataIfOffline()
    })
  }

  componentWillUnmount() {
    iapEndConnection()
    AppState.removeEventListener('change', this._handleAppStateChange)
    Linking.removeEventListener('url', this._handleOpenURLEvent)
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    PVEventEmitter.removeListener(PV.Events.LNPAY_WALLET_INFO_SHOULD_UPDATE, updateWalletInfo)
    PVEventEmitter.removeListener(
      PV.Events.ADD_BY_RSS_AUTH_SCREEN_SHOW,
      this._handleNavigateToAddPodcastByRSSAuthScreen
    )
    PVEventEmitter.removeListener(PV.Events.NAV_TO_MEMBERSHIP_SCREEN, this._handleNavigateToMembershipScreen)
    this._unsubscribe?.()
  }

  _setDownloadedDataIfOffline = async () => {
    const isConnected = await hasValidNetworkConnection()
    if (!isConnected) {
      const preventIsLoading = false
      const preventAutoDownloading = true
      this.handleSelectFilterItem(PV.Filters._downloadedKey, preventIsLoading, preventAutoDownloading)
    }
  }

  _handleTrackingTermsAcknowledged = async () => {
    /* Get tracking terms from AsyncStorage only here so that getTrackingConsentAcknowledged does not
       return true the first time _handleTrackingTermsAcknowledged is run on iOS */
    const trackingConsentAcknowledged = await AsyncStorage.getItem(PV.Keys.TRACKING_TERMS_ACKNOWLEDGED)
    if (!trackingConsentAcknowledged) {
      await setTrackingConsentAcknowledged()
      this.setState({
        showDataSettingsConfirmDialog: true,
        isLoadingMore: false
      })
    }
  }

  _handleAppStateChange = (nextAppState: any) => {
    (async () => {
      await playerUpdateUserPlaybackPosition()

      if (nextAppState === 'active' && !isInitialLoad) {
        const { nowPlayingItem: lastItem } = this.global.player
        const currentItem = await getNowPlayingItemLocally()

        if (Platform.OS === 'ios') {
          checkIfTrackingIsEnabled()
        }

        if (!lastItem || (lastItem && currentItem && currentItem.episodeId !== lastItem.episodeId)) {
          playerUpdatePlayerState(currentItem)
          showMiniPlayer()
        }

        updateDownloadedPodcasts()
        await playerUpdatePlaybackState()
      }

      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // NOTE: On iOS PVAudioPlayer.updateOptions must be called every time the app
        // goes into the background to prevent the remote controls from disappearing
        // on the lock screen.
        // Source: https://github.com/react-native-kit/react-native-track-player/issues/921#issuecomment-686806847
        if (Platform.OS === 'ios') {
          audioUpdateTrackPlayerCapabilities()
        }
      }

      updateScreenReaderEnabledState()
    })()
  }

  // This event is apparently not needed in development on iOS simulator,
  // but required to work in production (??? unconfirmed).
  _handleOpenURLEvent = (event: any) => {
    if (event) this._handleOpenURL(event.url)
  }

  _handleNavigateToAddPodcastByRSSAuthScreen = (params: any) => {
    const { feedUrl } = params
    this.props.navigation.navigate(PV.RouteNames.AddPodcastByRSSAuthScreen, { feedUrl })
  }

  _handleNavigateToMembershipScreen = () => {
    this.props.navigation.navigate(PV.RouteNames.MembershipScreen)
  }

  // On some Android devices, the .goBack method appears to not work reliably
  // unless there is some delay between screen changes. Wrapping each .goBack method
  // in a delay to make this happen.
  // Go back to the root screen to make sure componentDidMount is called.
  _goBackWithDelay = async () => {
    const { navigation } = this.props
    return new Promise((resolve) => {
      (async () => {
        if (Platform.OS === 'android') {
          setTimeout(() => {
            (async () => {
              await navigation.goBack(null)
              setTimeout(() => {
                (async () => {
                  await navigation.goBack(null)
                  resolve(null)
                })()
              }, 400)
            })()
          }, 400)
        } else if (Platform.OS === 'ios') {
          await navigation.goBack(null)
          await navigation.goBack(null)
          resolve(null)
        }
      })()
    })
  }

  _handleDeepLinkClip = async (mediaRefId: string) => {
    if (mediaRefId) {
      const { navigation } = this.props
      const { navigate } = navigation

      try {
        const currentItem = await getNowPlayingItem()
        if (!currentItem || (mediaRefId && mediaRefId !== currentItem.mediaRefId)) {
          const mediaRef = await getMediaRef(mediaRefId)
          if (mediaRef) {
            const newItem = convertToNowPlayingItem(mediaRef, null, null)
            const shouldPlay = true
            const forceUpdateOrderDate = false
            const setCurrentItemNextInQueue = true
            await playerLoadNowPlayingItem(newItem, shouldPlay, forceUpdateOrderDate, setCurrentItemNextInQueue)
          }
        }

        navigate(PV.RouteNames.PlayerScreen)
      } catch (error) {
        console.log(error)
      }
    }
  }

  _handleOpenURL = async (url: string) => {
    const { navigation } = this.props
    const { navigate } = navigation

    try {
      if (url) {
        const route = url.replace(/.*?:\/\//g, '')
        const splitPath = route.split('/')
        const path = splitPath[1] ? splitPath[1] : ''
        const id = splitPath[2] ? splitPath[2] : ''
        const urlParamsString = splitPath[splitPath.length - 1].split('?')[1]
        const urlParams = {}
        if (urlParamsString) {
          const urlParamsArr = urlParamsString.split('&')
          if (urlParamsArr.length) {
            urlParamsArr.forEach((param) => {
              const [key, value] = param.split('=')
              urlParams[key] = value
            })
          }
        }

        await this._goBackWithDelay()
        if (path === PV.DeepLinks.Clip.pathPrefix) {
          await this._handleDeepLinkClip(id)
        } else if (path === PV.DeepLinks.Episode.pathPrefix) {
          const episode = await getEpisode(id)
          if (episode) {
            const podcast = await getPodcast(episode.podcast?.id)
            navigate(PV.RouteNames.PodcastScreen, {
              podcast,
              navToEpisodeWithId: id
            })
            navigate(PV.RouteNames.EpisodeScreen, {
              episode
            })
          }
        } else if (path === PV.DeepLinks.Playlist.pathPrefix) {
          await navigate(PV.RouteNames.MyLibraryScreen)
          await navigate(PV.RouteNames.PlaylistsScreen, {
            navToPlaylistWithId: id
          })
        } else if (path === PV.DeepLinks.Podcast.pathPrefix) {
          await navigate(PV.RouteNames.PodcastScreen, {
            podcastId: id
          })
        } else if (path === PV.DeepLinks.Profile.pathPrefix) {
          await navigate(PV.RouteNames.MyLibraryScreen)
          await navigate(PV.RouteNames.ProfilesScreen, {
            navToProfileWithId: id
          })
        } else if (path.startsWith(PV.DeepLinks.Account.resetPassword)) {
          navigate(PV.RouteNames.ResetPasswordScreen, {
            resetToken: urlParams.token
          })
        } else {
          await navigate(PV.RouteNames.PodcastsScreen)
        }
      }
    } catch (error) {
      //
    }
  }

  _initializeScreenData = async () => {
    const { navigation } = this.props
    const { queryMediaType, searchBarText } = this.state
    const hasVideo = queryMediaType === PV.Filters._mediaTypeVideoOnly
    await initPlayerState(this.global)
    await initializeSettings()

    // Load the AsyncStorage authenticatedUser and subscribed podcasts immediately,
    // before getting the latest from server and parsing the addByPodcastFeedUrls in getAuthUserInfo.
    await getAuthenticatedUserInfoLocally()
    await combineWithAddByRSSPodcasts(searchBarText, hasVideo)

    const preventIsLoading = false
    const preventAutoDownloading = true
    await this.handleSelectFilterItem(PV.Filters._subscribedKey, preventIsLoading, preventAutoDownloading)

    // Set the appUserAgent one time on initialization, then retrieve from a constant
    // using the getAppUserAgent method, or from the global state (for synchronous access).
    await setAppUserAgent()
    const userAgent = getAppUserAgent()
    this.setGlobal({ userAgent })
    this.setState({ isLoadingMore: false }, () => {
      (async () => {
        try {
          const isLoggedIn = await getAuthUserInfo()
          if (isLoggedIn) await askToSyncWithNowPlayingItem(navigation)
        } catch (error) {
          console.log('initializeScreenData getAuthUserInfo', error)
          // If getAuthUserInfo fails, continue with the networkless version of the app
        }

        const preventIsLoading = true
        const preventAutoDownloading = false
        await this.handleSelectFilterItem(PV.Filters._subscribedKey, preventIsLoading, preventAutoDownloading)

        await initDownloads()
        await initializePlayer()
        await initializePlaybackSpeed()
        initializeValueProcessor()

        this._setDownloadedDataIfOffline()
        trackPageView('/podcasts', 'Podcasts Screen')
      })()
    })
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

    isInitialLoad = false

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
          const newState = await this._queryData(selectedKey, this.state, nextState, options, preventAutoDownloading)
          this.setState(newState)
        })()
      }
    )
  }

  handleSelectSortItem = (selectedKey: string) => {
    if (!selectedKey) {
      return
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
          noContainerPadding
          onChangeText={this._handleSearchBarTextChange}
          placeholder={translate('Search podcasts')}
          testID={`${testIDPrefix}_filter_bar`}
          value={searchBarText}
        />
      </View>
    )
  }

  _ItemSeparatorComponent = () => <Divider style={{ marginHorizontal: 10 }} />

  _renderPodcastItem = ({ item, index }) => (
    <PodcastTableCell
      id={item?.id}
      lastEpisodePubDate={item.lastEpisodePubDate}
      onPress={() =>
        this.props.navigation.navigate(PV.RouteNames.PodcastScreen, {
          podcast: item,
          addByRSSPodcastFeedUrl: item.addByRSSPodcastFeedUrl
        })
      }
      podcastImageUrl={item.shrunkImageUrl || item.imageUrl}
      {...(item.title ? { podcastTitle: item.title } : {})}
      showAutoDownload
      showDownloadCount
      testID={`${testIDPrefix}_podcast_item_${index}`}
    />
  )

  _renderHiddenItem = ({ item, index }, rowMap) => {
    const { queryFrom } = this.state
    const buttonText = queryFrom === PV.Filters._downloadedKey ? translate('Delete') : translate('Unsubscribe')

    return (
      <SwipeRowBack
        isLoading={this.state.isUnsubscribing}
        onPress={() => this._handleHiddenItemPress(item.id, item.addByRSSPodcastFeedUrl, rowMap)}
        testID={`${testIDPrefix}_podcast_item_${index}`}
        text={buttonText}
      />
    )
  }

  _handleHiddenItemPress = async (selectedId, addByRSSPodcastFeedUrl, rowMap) => {
    const { queryFrom } = this.state

    let wasAlerted = false
    if (queryFrom === PV.Filters._subscribedKey || queryFrom === PV.Filters._customFeedsKey) {
      wasAlerted = await alertIfNoNetworkConnection(translate('unsubscribe from podcast'))
    }

    if (wasAlerted) return
    this.setState({ isUnsubscribing: true }, () => {
      (async () => {
        try {
          const { flatListData } = this.state

          if (queryFrom === PV.Filters._subscribedKey || queryFrom === PV.Filters._customFeedsKey) {
            addByRSSPodcastFeedUrl
              ? await removeAddByRSSPodcast(addByRSSPodcastFeedUrl)
              : await toggleSubscribeToPodcast(selectedId)
            await removeDownloadedPodcast(selectedId || addByRSSPodcastFeedUrl)
          } else if (queryFrom === PV.Filters._downloadedKey) {
            await removeDownloadedPodcast(selectedId || addByRSSPodcastFeedUrl)
          }
          const newFlatListData = flatListData.filter((x) => x.id !== selectedId)

          const row = rowMap[selectedId] || rowMap[addByRSSPodcastFeedUrl]
          row.closeRow()

          this.setState({
            flatListData: newFlatListData,
            flatListDataTotalCount: newFlatListData.length,
            isUnsubscribing: false
          })
        } catch (error) {
          this.setState({ isUnsubscribing: false })
        }
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
    const queryFrom = PV.Filters._allPodcastsKey
    const preventIsLoading = false
    const preventAutoDownloading = true
    const keepSearchTitle = true
    this.handleSelectFilterItem(queryFrom, preventIsLoading, preventAutoDownloading, keepSearchTitle)
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
    this.setState({ showDataSettingsConfirmDialog: false })
    this._initializeScreenData()
  }

  _handleDataSettingsAllowData = () => {
    this.setState({ showDataSettingsConfirmDialog: false })
    this._initializeScreenData()
  }

  _navToRequestPodcastEmail = () => {
    Linking.openURL(createEmailLinkUrl(PV.Emails.PODCAST_REQUEST))
  }

  render() {
    const { navigation } = this.props
    const {
      isLoadingMore,
      isRefreshing,
      queryFrom,
      queryMediaType,
      querySort,
      searchBarText,
      selectedCategory,
      selectedCategorySub,
      selectedFilterLabel,
      selectedSortLabel,
      showDataSettingsConfirmDialog,
      showNoInternetConnectionMessage
    } = this.state
    const { offlineModeEnabled, session, subscribedPodcasts = [], subscribedPodcastsTotalCount = 0 } = this.global
    const { subscribedPodcastIds } = session?.userInfo

    let flatListData = []
    let flatListDataTotalCount = null
    if (queryFrom === PV.Filters._subscribedKey) {
      flatListData = subscribedPodcasts
      flatListDataTotalCount = subscribedPodcastsTotalCount
    } else {
      flatListData = this.state.flatListData
      flatListDataTotalCount = this.state.flatListDataTotalCount
    }

    const noSubscribedPodcasts =
      queryFrom === PV.Filters._subscribedKey && (!subscribedPodcastIds || subscribedPodcastIds.length === 0)

    const showOfflineMessage =
      offlineModeEnabled &&
      queryFrom !== PV.Filters._downloadedKey &&
      queryFrom !== PV.Filters._subscribedKey &&
      queryFrom !== PV.Filters._customFeedsKey

    const isCategoryScreen = queryFrom === PV.Filters._categoryKey

    return (
      <View style={styles.view} testID={`${testIDPrefix}_view`}>
        <RNView style={{ flex: 1 }}>
          <PlayerEvents />
          <TableSectionSelectors
            filterScreenTitle={translate('Podcasts')}
            handleSelectCategoryItem={(x: any) => this._selectCategory(x)}
            handleSelectCategorySubItem={(x: any) => this._selectCategory(x, true)}
            handleSelectFilterItem={this.handleSelectFilterItem}
            handleSelectMediaTypeItem={this.handleSelectMediaTypeItem}
            handleSelectSortItem={this.handleSelectSortItem}
            includePadding
            navigation={navigation}
            screenName='PodcastsScreen'
            selectedCategoryItemKey={selectedCategory}
            selectedCategorySubItemKey={selectedCategorySub}
            selectedFilterItemKey={queryFrom}
            selectedFilterLabel={selectedFilterLabel}
            selectedMediaTypeItemKey={queryMediaType}
            selectedSortItemKey={querySort}
            selectedSortLabel={selectedSortLabel}
            testID={testIDPrefix}
          />
          {queryFrom && (
            <FlatList
              data={flatListData}
              dataTotalCount={flatListDataTotalCount}
              disableLeftSwipe={
                queryFrom !== PV.Filters._subscribedKey &&
                queryFrom !== PV.Filters._downloadedKey &&
                queryFrom !== PV.Filters._customFeedsKey
              }
              extraData={flatListData}
              handleNoResultsTopAction={!!Config.CURATOR_EMAIL ? this._navToRequestPodcastEmail : null}
              keyExtractor={(item: any, index: number) => safeKeyExtractor(testIDPrefix, index, item?.id)}
              isLoadingMore={isLoadingMore}
              isRefreshing={isRefreshing}
              ItemSeparatorComponent={this._ItemSeparatorComponent}
              {...(isCategoryScreen ? {} : { ListHeaderComponent: this._ListHeaderComponent })}
              noResultsMessage={
                // eslint-disable-next-line max-len
                noSubscribedPodcasts
                  ? translate('You are not subscribed to any podcasts yet')
                  : translate('No podcasts found')
              }
              noResultsTopActionText={!!Config.CURATOR_EMAIL && searchBarText ? translate('Request Podcast') : ''}
              noResultsTopActionTextAccessibilityHint={translate('ARIA HINT - send us an email to request a podcast')}
              onEndReached={this._onEndReached}
              onRefresh={
                queryFrom === PV.Filters._subscribedKey || queryFrom === PV.Filters._customFeedsKey
                  ? this._onRefresh
                  : null
              }
              renderHiddenItem={this._renderHiddenItem}
              renderItem={this._renderPodcastItem}
              showNoInternetConnectionMessage={showOfflineMessage || showNoInternetConnectionMessage}
              testID={testIDPrefix}
            />
          )}
        </RNView>
        <Dialog.Container accessible visible={showDataSettingsConfirmDialog}>
          <Dialog.Title>Data Settings</Dialog.Title>
          <Dialog.Description>Do you want to allow downloading episodes with your data plan?</Dialog.Description>
          <Dialog.Button
            label={translate('No Wifi Only')}
            onPress={this._handleDataSettingsWifiOnly}
            testID={'alert_no_wifi_only'.prependTestId()}
          />
          <Dialog.Button
            label={translate('Yes Allow Data')}
            onPress={this._handleDataSettingsAllowData}
            testID={'alert_yes_allow_data'.prependTestId()}
          />
        </Dialog.Container>
        <PurchaseListener navigation={navigation} />
      </View>
    )
  }

  _querySubscribedPodcasts = async (preventAutoDownloading?: boolean) => {
    const { queryMediaType, searchBarText } = this.state
    const hasVideo = queryMediaType === PV.Filters._mediaTypeVideoOnly
    await getSubscribedPodcasts(hasVideo)

    if (!searchBarText) await parseAllAddByRSSPodcasts()

    await combineWithAddByRSSPodcasts(searchBarText, hasVideo)

    if (!preventAutoDownloading) {
      await handleAutoDownloadEpisodes()
    }
  }

  _queryCustomFeeds = async () => {
    const customFeeds = await getAddByRSSPodcastsLocally()
    return customFeeds
  }

  _queryAllPodcasts = async (sort: string | null, page = 1) => {
    const { queryMediaType, searchBarText: searchTitle } = this.state
    const results = await getPodcasts({
      sort,
      page,
      ...(searchTitle ? { searchTitle } : {}),
      ...(queryMediaType === PV.Filters._mediaTypeVideoOnly ? { hasVideo: true } : {})
    })
    return results
  }

  _queryPodcastsByCategory = async (categoryId?: string | null, sort?: string | null, page = 1) => {
    const { queryMediaType } = this.state
    const results = await getPodcasts({
      categories: categoryId,
      sort,
      page,
      ...(queryMediaType === PV.Filters._mediaTypeVideoOnly ? { hasVideo: true } : {})
    })
    return results
  }

  _queryData = async (
    filterKey: any,
    prevState: State,
    nextState?: any,
    queryOptions: { isCategorySub?: boolean } = {},
    preventAutoDownloading?: boolean
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
        queryMediaType,
        querySort,
        selectedCategory,
        selectedCategorySub
      } = prevState

      const hasVideo = queryMediaType === PV.Filters._mediaTypeVideoOnly

      const hasInternetConnection = await hasValidNetworkConnection()
      const isMediaTypeSelected = PV.FilterOptions.mediaTypeItems.some((option) => option.value === filterKey)
      const isSubscribedSelected =
        filterKey === PV.Filters._subscribedKey || (isMediaTypeSelected && queryFrom === PV.Filters._subscribedKey)
      const isCustomFeedsSelected =
        filterKey === PV.Filters._customFeedsKey || (isMediaTypeSelected && queryFrom === PV.Filters._customFeedsKey)
      const isDownloadedSelected =
        filterKey === PV.Filters._downloadedKey || (isMediaTypeSelected && queryFrom === PV.Filters._downloadedKey)
      const isAllPodcastsSelected =
        filterKey === PV.Filters._allPodcastsKey || (isMediaTypeSelected && queryFrom === PV.Filters._allPodcastsKey)
      newState.queryMediaType = isMediaTypeSelected ? filterKey : prevState.queryMediaType

      if (isSubscribedSelected) {
        await getAuthUserInfo() // get the latest subscribedPodcastIds first
        await this._querySubscribedPodcasts(preventAutoDownloading)
      } else if (isCustomFeedsSelected) {
        const podcasts = await this._queryCustomFeeds()
        newState.flatListData = [...podcasts]
        newState.endOfResultsReached = true
        newState.flatListDataTotalCount = podcasts.length
      } else if (isDownloadedSelected) {
        const podcasts = await getDownloadedPodcasts(searchTitle, hasVideo)
        newState.flatListData = [...podcasts]
        newState.endOfResultsReached = true
        newState.flatListDataTotalCount = podcasts.length
      } else if (isAllPodcastsSelected) {
        newState.showNoInternetConnectionMessage = !hasInternetConnection
        const results = await this._queryAllPodcasts(querySort, newState.queryPage)
        newState.flatListData = [...flatListData, ...results[0]]
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
          ...(queryMediaType === PV.Filters._mediaTypeVideoOnly ? { hasVideo: true } : {})
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
          selectedCategorySub,
          isMediaTypeSelected
        )

        const categories = assignedCategoryData.categories
        newState = assignedCategoryData.newState

        const results = await this._queryPodcastsByCategory(categories, querySort, newState.queryPage)
        newState.flatListData = [...flatListData, ...results[0]]
        newState.endOfResultsReached = results[0].length < 20
        newState.flatListDataTotalCount = results[1]
      }
    } catch (error) {
      console.log('PodcastsScreen _queryData error', error)
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
