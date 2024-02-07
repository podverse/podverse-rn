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
import React, { setGlobal, addCallback } from 'reactn'
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
import { handlePodcastScreenNavigateWithParams,
  navigateToAlbumScreenWithPodcast,
  navigateToEpisodeScreenInPodcastsStackNavigatorWithIds } from '../lib/navigate'
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
import { playerCheckActiveType, playerUpdateUserPlaybackPosition } from '../services/player'
import { audioUpdateTrackPlayerCapabilities } from '../services/playerAudioSetup'
import { getPodcast, getPodcasts } from '../services/podcast'
import { setAutoPlayEpisodesFromPodcast } from '../services/queue'
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
import { getLoggedInUserPlaylistsCombined } from '../state/actions/user'
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

const testIDPrefix = 'podcasts_screen'

export let isInitialLoadPodcastsScreen = true
const horizontalRowHeight = 98
const dividerHeight = 1

const getScreenTitle = () => {
  const screenTitle = translate('Podcasts')
  return screenTitle
}

const getSearchPlaceholder = () => {
  const searchPlaceholder = translate('Search podcasts')
  return searchPlaceholder
}

export class PodcastsScreen extends React.Component<Props, State> {
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
      queryFrom: PV.Filters._subscribedKey,
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
    const { navigation } = this.props

    this.props.navigation.setParams({
      _screenTitle: getScreenTitle()
    })

    if (CarPlay.connected) {
      CarPlay.bridge.checkForConnection()
    }

    iapInitConnection()
    // settimeout here gives a chance to the rest of
    // the app to have finished loading and navigate correctly
    setTimeout(this.setupDeeplinkListeners, PV.Timeouts.APP_LAUNCH_DELAY + 500)

    Dimensions.addEventListener('change', this._handleOrientationChange)
    Linking.addEventListener('url', this._handleOpenURLEvent)
    AppState.addEventListener('change', this._handleAppStateChange)
    PVEventEmitter.on(
      PV.Events.NOTIFICATION_BANNER_PRESSED, 
      (params: {episodeId:string, podcastId:string}) => 
        navigateToEpisodeScreenInPodcastsStackNavigatorWithIds(
          this.props.navigation,  
          params.podcastId, 
          params.episodeId
      ))
    PVEventEmitter.on(PV.Events.ADD_BY_RSS_AUTH_SCREEN_SHOW, this._handleNavigateToAddPodcastByRSSAuthScreen)
    PVEventEmitter.on(PV.Events.NAV_TO_MEMBERSHIP_SCREEN, this._handleNavigateToMembershipScreen)
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    PVEventEmitter.on(PV.Keys.TRACKING_TERMS_ACKNOWLEDGED, this._handleTrackingTermsAcknowledged)
    PVEventEmitter.on(PV.Events.SERVER_MAINTENANCE_MODE, this._handleMaintenanceMode)
    PVEventEmitter.on(PV.Events.USER_LOGGED_IN, this._handleUserLoggedIn)
    PVEventEmitter.on(PV.Events.RELOAD_SUBSCRIPTIONS, this._handleReloadSubscriptions)

    updateScreenReaderEnabledState()

    const trackingConsentAcknowledged = await getTrackingConsentAcknowledged()
    if (!trackingConsentAcknowledged) {
      await navigation.navigate(PV.RouteNames.TrackingConsentScreen)
    }

    try {
      const appHasLaunched = await AsyncStorage.getItem(PV.Keys.APP_HAS_LAUNCHED)
      if (!appHasLaunched) {
        await Promise.all([
          AsyncStorage.setItem(PV.Keys.APP_HAS_LAUNCHED, 'true'),
          AsyncStorage.setItem(PV.Keys.AUTO_DELETE_EPISODE_ON_END, 'TRUE'),
          AsyncStorage.setItem(PV.Keys.DOWNLOADED_EPISODE_LIMIT_GLOBAL_COUNT, '5'),
          AsyncStorage.setItem(PV.Keys.PLAYER_MAXIMUM_SPEED, '2.5'),
          AsyncStorage.setItem(PV.Keys.PODCASTS_GRID_VIEW_ENABLED, 'TRUE'),
          AsyncStorage.setItem(PV.Keys.AUTO_DOWNLOAD_BY_DEFAULT, 'TRUE'),
          AsyncStorage.setItem(PV.Keys.REFRESH_SUBSCRIPTIONS_ON_LAUNCH, 'TRUE'),
          AsyncStorage.setItem(PV.Keys.SETTING_SHOULD_DISPLAY_NON_TOC_CHAPTERS, 'TRUE'),
          setAutoPlayEpisodesFromPodcast('newer'),
          resetAllAppKeychain()
        ])

        if (!Config.DISABLE_CRASH_LOGS) {
          await AsyncStorage.setItem(PV.Keys.ERROR_REPORTING_ENABLED, 'TRUE')
        }
        this.setState({ isLoadingMore: false })
      } else {
        this._initializeScreenData()
      }
    } catch (error) {
      isInitialLoadPodcastsScreen = false
      this.setState({
        isLoadingMore: false
      })
      errorLogger(_fileName, 'componentDidMount init', error)

      Alert.alert(PV.Alerts.SOMETHING_WENT_WRONG.title, PV.Alerts.SOMETHING_WENT_WRONG.message, PV.Alerts.BUTTONS.OK)
    }

    // this._unsubscribe = navigation.addListener('willFocus', () => {
    //   this._setDownloadedDataIfOffline()
    // })
  }

  componentWillUnmount() {
    iapEndConnection()
    AppState.removeEventListener('change', this._handleAppStateChange)
    Dimensions.removeEventListener('change', this._handleOrientationChange)
    Linking.removeEventListener('url', this._handleOpenURLEvent)
    PVEventEmitter.removeListener(
      PV.Events.ADD_BY_RSS_AUTH_SCREEN_SHOW,
      this._handleNavigateToAddPodcastByRSSAuthScreen
    )
    PVEventEmitter.removeListener(PV.Events.NAV_TO_MEMBERSHIP_SCREEN, this._handleNavigateToMembershipScreen)
    PVEventEmitter.removeListener(PV.Events.SERVER_MAINTENANCE_MODE, this._handleMaintenanceMode)
    PVEventEmitter.removeListener(PV.Events.USER_LOGGED_IN, this._handleUserLoggedIn)
    PVEventEmitter.removeListener(PV.Events.RELOAD_SUBSCRIPTIONS, this._handleReloadSubscriptions)
    // this._unsubscribe?.()

    this.pvNativeEventSubscriptions.forEach((subscription) => subscription.remove())
  }

  _handleUserLoggedIn = () => {
    this.handleSelectFilterItem(PV.Filters._subscribedKey)
  }

  _handleReloadSubscriptions = () => {
    const preventIsLoading = false
    const preventAutoDownloading = false
    const keepSearchTitle = false
    const preventParseCustomRSSFeeds = true
    this.handleSelectFilterItem(
      PV.Filters._subscribedKey,
      preventIsLoading,
      preventAutoDownloading,
      keepSearchTitle,
      preventParseCustomRSSFeeds
    )
  }

  handleNoficationOpened = async (remoteMessage: any, goBackToRootScreen = false) => {
    const podcastId = remoteMessage?.data?.podcastId
    const episodeId = remoteMessage?.data?.episodeId

    debugLogger(`Notification for podcastId: ${podcastId}, episodeId: ${episodeId}`)

    if (goBackToRootScreen) {
      await this._goBackWithDelay()
    }

    if (remoteMessage && podcastId && episodeId) {
      navigateToEpisodeScreenInPodcastsStackNavigatorWithIds(this.props.navigation, podcastId, episodeId)
    }
  }

  handleInitialNotification = async (remoteMessage: any) => {
    const podcastId = remoteMessage?.data?.podcastId
    const episodeId = remoteMessage?.data?.episodeId
    const podcastTitle = remoteMessage?.data?.podcastTitle
    const episodeTitle = remoteMessage?.data?.episodeTitle
    const notificationType = remoteMessage?.data?.notificationType
    const isLiveNotification = notificationType === 'live'

    debugLogger(
      `Notification for podcastId: ${podcastId}, episodeId: ${episodeId}, isLiveNotification: ${isLiveNotification}`
    )

    if (remoteMessage && podcastId && episodeId && isLiveNotification) {
      const GO_TO_LIVE_PODCAST = PV.Alerts.GO_TO_LIVE_PODCAST(
        this.props.navigation,
        podcastId,
        episodeId,
        podcastTitle,
        episodeTitle,
        this._goBackWithDelay
      )
      Alert.alert(GO_TO_LIVE_PODCAST.title, GO_TO_LIVE_PODCAST.message, GO_TO_LIVE_PODCAST.buttons)
    } else if (remoteMessage && podcastId && episodeId) {
      await this.handleNoficationOpened(remoteMessage, true)
    }
  }

  setupDeeplinkListeners = () => {
    if (checkIfFDroidAppVersion() && !!this.pvNativeEventEmitter) {
      this.pvNativeEventSubscriptions.push(
        this.pvNativeEventEmitter.addListener('UnifiedPushMessage', ({ instance, payload }) => {
          debugLogger(`Received UnifiedPush notification from ${instance} with payload`, payload)
          this.handleNoficationOpened(payload)
        })
      )

      PVUnifiedPushModule.getInitialNotification().then(this.handleInitialNotification)
    } else {
      messaging().onNotificationOpenedApp(this.handleNoficationOpened)

      messaging()
        .getInitialNotification()
        .then(this.handleInitialNotification)

      messaging().onMessage((notification) => {
        const data = notification.data
        const { podcastId, episodeId, notificationType, episodeTitle,
          podcastTitle, title: notificationTitle } = data || {}
        const image = data?.fcm_options?.image
        const title = podcastTitle
        const description = notificationType === 'live'
          ? notificationTitle
          : episodeTitle

        if(AppState.currentState === "active") {
          setGlobal({
            bannerInfo: {
              podcastId,
              episodeId,
              show: true,
              title,
              description,
              imageUrl: image,
              type: 'NOTIFICATION'
            }
          })
        }
      })
    }

    // DEBUG: Make sure remote debugging is disabled in the dev environment
    // or else initialUrl will always return null.
    Linking.getInitialURL().then((initialUrl) => {
      if (initialUrl) {
        this._handleOpenURLEvent({ url: initialUrl })
      }
    })
  }

  _handleMaintenanceMode = () => {
    const { queryFrom } = this.state

    this.setGlobal(
      {
        isInMaintenanceMode: true
      },
      async () => {
        if (queryFrom !== PV.Filters._downloadedKey) {
          const forceOffline = true
          // Prevent flash of grid view in case the event for _handleMaintenanceMode
          // is called before the app finishes with initializeSettings.
          const podcastsGridViewEnabled = await AsyncStorage.getItem(PV.Keys.PODCASTS_GRID_VIEW_ENABLED)
          this.setGlobal(
            {
              podcastsGridViewEnabled: !!podcastsGridViewEnabled
            },
            () => {
              this._setDownloadedDataIfOffline(forceOffline)
              Alert.alert(PV.Alerts.MAINTENANCE_MODE.title, PV.Alerts.MAINTENANCE_MODE.message, PV.Alerts.BUTTONS.OK)
            }
          )
        }
      }
    )
  }

  _handleOrientationChange = () => {
    this.setGlobal({
      screen: {
        orientation: isPortrait() ? 'portrait' : 'landscape',
        screenWidth: Dimensions.get('window').width
      }
    })
    refreshChaptersWidth()
  }

  _setDownloadedDataIfOffline = async (forceOffline?: boolean) => {
    const isConnected = await hasValidNetworkConnection()
    if (!isConnected || forceOffline) {
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
      this.setState({ isLoadingMore: false })
      const DOWNLOAD_DATA_SETTINGS = PV.Alerts.DOWNLOAD_DATA_SETTINGS(
        this._handleDataSettingsWifiOnly,
        this._handleDataSettingsAllowData
      )
      Alert.alert(DOWNLOAD_DATA_SETTINGS.title, DOWNLOAD_DATA_SETTINGS.message, DOWNLOAD_DATA_SETTINGS.buttons)
    }
  }

  _handleAppStateChange = (nextAppState: any) => {
    (async () => {
      const { nowPlayingItem: lastItem } = this.global.player
      const currentItem = await getNowPlayingItemLocally()
      /*
        Only call playerUpdateUserPlaybackPosition if there is a nowPlayingItem.
        This is a workaround because we can't clear the currently loaded
        item from the queue with react-native-track-player, and when
        playerUpdateUserPlaybackPosition is called it will re-assign the
        item as the nowPlayingItem...and that is a problem when
        playback-queue-ended should remove the nowPlayingItem from state and storage.
      */
      if (!!lastItem || !!currentItem) {
        playerUpdateUserPlaybackPosition()
      }

      if (nextAppState === 'active' && !isInitialLoadPodcastsScreen) {
        if (Platform.OS === 'ios') {
          checkIfTrackingIsEnabled()
        }

        if (!lastItem || (lastItem && currentItem && currentItem.episodeId !== lastItem.episodeId)) {
          playerUpdatePlayerState(currentItem)
          showMiniPlayer()
        }

        updateDownloadedPodcasts()
        await playerUpdatePlaybackState()
        v4vRefreshConnectedProviders()
      }

      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // NOTE: On iOS PVAudioPlayer.updateOptions must be called every time the app
        // goes into the background to prevent the remote controls from disappearing
        // on the lock screen.
        // Source: https://github.com/react-native-kit/react-native-track-player/issues/921#issuecomment-686806847
        if (Platform.OS === 'ios') {
          const playerActiveType = await playerCheckActiveType()
          if (playerActiveType === PV.Player.playerTypes.isAudio) {
            await audioUpdateTrackPlayerCapabilities()
          }
        } else if (Platform.OS === 'android') {
          const { PipModule } = NativeModules
          const playerType = await playerCheckActiveType()
          if (playerType === PV.Player.playerTypes.isVideo) {
            PipModule.EnterPipMode()
          }
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

  // Go back to the root screen to make sure componentDidMount is called.
  // On some Android devices, the .goBack method appears to not work reliably
  // unless there is some delay between screen changes. Wrapping each .goBack method
  // in a delay to make this happen.
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

      try {
        const currentItem = await getNowPlayingItem()
        if (!currentItem || (mediaRefId && mediaRefId !== currentItem.mediaRefId)) {
          const mediaRef = await getMediaRef(mediaRefId)
          if (mediaRef) {
            const newItem = convertToNowPlayingItem(mediaRef, null, null)
            await playerLoadNowPlayingItem(newItem, {
              forceUpdateOrderDate: false,
              setCurrentItemNextInQueue: true,
              shouldPlay: true
            })
          }
        }

        handleNavigateToPlayerScreen(navigation)
      } catch (error) {
        errorLogger(_fileName, '_handleDeepLinkClip', error)
      }
    }
  }

  _handleOpenURL = async (url: string) => {
    const { navigation } = this.props
    const { navigate } = navigation

    try {
      if (url) {
        if (url.endsWith('xml') || url.endsWith('opml')) {
          await getAuthUserInfo(() => {
            navigate(PV.RouteNames.MoreScreen, { opmlUri: url })
          })
        } else {
          const route = url.replace(/.*?:\/\//g, '')
          const splitPath = route.split('/')
          const domain = splitPath[0] ? splitPath[0] : ''
          const path = splitPath[1] ? splitPath[1] : ''
          const id = splitPath[2] ? splitPath[2] : ''
          const urlParams: {
            code?: string
            token?: string
          } = qs.parse(splitPath[splitPath.length - 1].split('?')[1])

          await this._goBackWithDelay()
          if (path.indexOf(PV.DeepLinks.VerifyEmail.path) > -1) {
            const ok = await verifyEmail(urlParams?.token || '')
            if (ok) {
              Alert.alert(translate('Verify email title'), translate('Verify email succeeded'), PV.Alerts.BUTTONS.OK)
            }
          } else if (path === PV.DeepLinks.Clip.pathPrefix) {
            await this._handleDeepLinkClip(id)
          } else if (path === PV.DeepLinks.Episode.pathPrefix) {
            const episode = await getEpisode(id)
            if (episode) {
              const podcast = await getPodcast(episode.podcast?.id)

              if (!podcast?.id && !episode?.id) return

              navigateToEpisodeScreenInPodcastsStackNavigatorWithIds(
                this.props.navigation,
                podcast?.id,
                episode.id
              )
            }
          } else if (path === PV.DeepLinks.Playlist.pathPrefix) {
            await navigate(PV.RouteNames.MyLibraryScreen)
            await navigate(PV.RouteNames.PlaylistsScreen, {
              navToPlaylistWithId: id
            })
          } else if (path === PV.DeepLinks.Podcast.pathPrefix) {
            await handlePodcastScreenNavigateWithParams(
              this.props.navigation,
              id
            )
          } else if (path === PV.DeepLinks.Profile.pathPrefix) {
            await navigate(PV.RouteNames.MyLibraryScreen)
            await navigate(PV.RouteNames.ProfilesScreen, {
              navToProfileWithId: id
            })
          } else if (path.startsWith(PV.DeepLinks.Account.resetPassword)) {
            navigate(PV.RouteNames.ResetPasswordScreen, {
              resetToken: urlParams.token
            })
          } else if (path === PV.DeepLinks.About.path) {
            await navigate(PV.RouteNames.MoreScreen)
            await navigate(PV.RouteNames.AboutScreen)
          } else if (path === PV.DeepLinks.Contact.path) {
            await navigate(PV.RouteNames.MoreScreen)
            await navigate(PV.RouteNames.ContactScreen)
          } else if (path === PV.DeepLinks.Membership.path) {
            await navigate(PV.RouteNames.MoreScreen)
            await navigate(PV.RouteNames.MembershipScreen)
          } else if (path === PV.DeepLinks.Contribute.path) {
            await navigate(PV.RouteNames.MoreScreen)
            await navigate(PV.RouteNames.ContributeScreen)
          } else if (path === PV.DeepLinks.Terms.path) {
            await navigate(PV.RouteNames.MoreScreen)
            await navigate(PV.RouteNames.TermsOfServiceScreen)
          } else if (path === PV.DeepLinks.XMPP.path) {
            await navigate(PV.RouteNames.MoreScreen)
            await navigate(PV.RouteNames.ContactXMPPChatScreen)
          } else if (path === PV.DeepLinks.Albums.path) {
            await navigate(PV.RouteNames.MyLibraryScreen)
            await navigate(PV.RouteNames.AlbumsScreen)
          } else if (path === PV.DeepLinks.Album.pathPrefix) {
            await navigate(PV.RouteNames.MyLibraryScreen)
            setTimeout(() => {
              navigate(PV.RouteNames.AlbumsScreen)
              setTimeout(() => {
                navigate(PV.RouteNames.AlbumScreen, {
                  podcastId: id
                })
              }, 333)
            }, 333)
          }

          // V4V PROVIDERS:
          // NOTE: HandleConnect is in two places due to iOS webview issue.
          // https://github.com/react-native-webview/react-native-webview/issues/2681
          else if (v4vAlbyCheckConnectDeepLink(domain) && urlParams?.code) {
            await v4vAlbyHandleConnect(navigation, urlParams.code)
          }

          // ELSE:
          else {
            await navigate(PV.RouteNames.PodcastsScreen)
          }
        }
      }
    } catch (error) {
      //
    }
  }

  _initializeScreenData = async () => {
    const { navigation } = this.props
    const { navigate } = navigation
    const { searchBarText } = this.state

    await initPlayerState(this.global)
    await initializeSettings()

    // Load the AsyncStorage authenticatedUser and subscribed podcasts immediately,
    // before getting the latest from server and parsing the addByPodcastFeedUrls in getAuthUserInfo.
    await getAuthenticatedUserInfoLocally()
    const savedQuerySort = await getSavedQueryPodcastsScreenSort()

    // Set the subscribedPodcasts immediately on state, without waiting for local parsing,
    // then update subscribedPodcasts again combined with addByRSS feeds.
    const initialPodcastsAllMediums = await combineWithAddByRSSPodcasts(searchBarText, savedQuerySort)
    const initalPodcasts = initialPodcastsAllMediums.filter((podcast: Podcast) =>
      podcast.medium === PV.Medium.podcast
      || podcast.hasVideo)

    this.setState({
      flatListData: initalPodcasts || [],
      flatListDataTotalCount: initalPodcasts?.length || 0
    })

    /* Navigate to custom screen on app launch */
    const customLaunchScreen = await getCustomLaunchScreenKey()
    if (customLaunchScreen && PV.CustomLaunchScreen.nonDefaultValidScreenKeys.includes(customLaunchScreen)) {
      navigate(customLaunchScreen)
    }

    this._handleInitialDefaultQuery()

    const userAgent = getAppUserAgent()
    this.setGlobal({ userAgent })

    // Initialize UnifiedPush on Android
    // Only sets it if previously registered
    if (checkIfFDroidAppVersion()) {
      await PVUnifiedPushModule.registerExistingDistributor()
    }

    this.setState({ isLoadingMore: false }, () => {
      (async () => {
        let isLoggedIn = false
        try {
          isLoggedIn = await getAuthUserInfo()
          if (isLoggedIn) await askToSyncWithNowPlayingItem(this._initializeScreenDataPart2)
        } catch (error) {
          errorLogger(_fileName, 'initializeScreenData getAuthUserInfo', error)
          // If getAuthUserInfo fails, continue with the networkless version of the app
        }
        if (!isLoggedIn) this._initializeScreenDataPart2()
      })()
    })
  }

  _initializeScreenDataPart2 = async () => {
    // Init downloads without blocking thread
    initDownloads()

    await Promise.all([
      initAutoQueue(),
      initializePlayer(),
      initializePlayerSettings()
    ])

    // Run this after initializePlayer is finished,
    // as the nowPlayingItem may affect when v4v buttons
    // are rendered on the PlayerScreen
    await v4vInitialize()

    // This is an initialization step that can happen in the background.
    // We need playlists in global state at all times so we can determine
    // when an item is already in one of your playlists.
    getLoggedInUserPlaylistsCombined()

    this._setDownloadedDataIfOffline()
    downloadedEpisodeDeleteMarked()

    /* This event signals to CarPlay to refresh views after the app initializes. */
    setTimeout(() => PVEventEmitter.emit(PV.Events.APP_FINISHED_INITALIZING_FOR_CARPLAY), 1000)

    trackPageView('/podcasts', 'Podcasts Screen')
  }

  _handleInitialDefaultQuery = async () => {
    const { isInMaintenanceMode } = this.global
    if (!isInMaintenanceMode) {
      const isConnected = await hasValidNetworkConnection()
      const preventIsLoading = false
      const preventAutoDownloading = false
      const keepSearchTitle = false
      const retainPreviousFlatListData = true
      if (isConnected) {
        const refreshSubscriptionsOnLaunch = await AsyncStorage.getItem(PV.Keys.REFRESH_SUBSCRIPTIONS_ON_LAUNCH)
        const preventParseCustomRSSFeeds = !refreshSubscriptionsOnLaunch
        const savedQuerySort = await getSavedQueryPodcastsScreenSort()
        this.setState({ querySort: savedQuerySort }, () => {
          this.handleSelectFilterItem(
            PV.Filters._subscribedKey,
            preventIsLoading,
            preventAutoDownloading,
            keepSearchTitle,
            preventParseCustomRSSFeeds,
            retainPreviousFlatListData
          )
        })
      } else {
        this._setDownloadedDataIfOffline()
      }
    }
  }

  // NOTE: there is a race-condition possibility if you reparse RSS feeds whenever
  // the Subscribed filter is selected from the FilterScreen. This is happening
  // because the subscribed handler first gets subscriptions from server,
  // then parses the custom RSS feeds, then combines the parsed results
  // with the subscribedPodcasts on globalState. To prevent this,
  // use handleSelectFilterItemWithoutParse on the FilterScreen.
  handleSelectFilterItemWithoutParse = async (selectedKey: string) => {
    const preventIsLoading = false
    const preventAutoDownloading = true
    const keepSearchTitle = false
    const preventParseCustomRSSFeeds = true
    await this.handleSelectFilterItem(
      selectedKey,
      preventIsLoading,
      preventAutoDownloading,
      keepSearchTitle,
      preventParseCustomRSSFeeds
    )
  }

  handleSelectFilterItem = async (
    selectedKey: string,
    preventIsLoading?: boolean,
    preventAutoDownloading?: boolean,
    keepSearchTitle?: boolean,
    preventParseCustomRSSFeeds?: boolean,
    retainPreviousFlatListData?: boolean
  ) => {
    if (!selectedKey) {
      return
    }

    const { flatListData, flatListDataTotalCount, querySort } = this.state
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
        flatListData: retainPreviousFlatListData ? flatListData : [],
        flatListDataTotalCount: retainPreviousFlatListData ? flatListDataTotalCount : null,
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
            preventAutoDownloading,
            preventParseCustomRSSFeeds
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
    const { navigation } = this.props
    const isMusic = podcast?.medium === PV.Medium.music
    if (isMusic) {
      navigateToAlbumScreenWithPodcast(navigation, podcast)
    } else {
      handlePodcastScreenNavigateWithParams(
        navigation,
        podcast.id,
        podcast,
        { forceRequest: false }
      )
    }
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
          this._removeFlatListItem(selectedId)
        } catch (error) {
          errorLogger(_fileName, '_handleHiddenItemPress', error)
        }
        this.setState({ isUnsubscribing: false })
      })()
    })
  }

  _removeFlatListItem = (podcastId: string) => {
    const flatListData = this.state.flatListData?.filter((podcast: Podcast) => podcast.id !== podcastId)
    this.setState({
      flatListData,
      flatListDataTotalCount: flatListData.length
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
            handleSelectFilterItem={this.handleSelectFilterItemWithoutParse}
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

  _querySubscribedPodcasts = async (preventAutoDownloading?: boolean, preventParseCustomRSSFeeds?: boolean) => {
    const { querySort, searchBarText } = this.state
    
    let subscribedPodcastsAllMediums = await getSubscribedPodcasts(querySort)

    await handleUpdateNewEpisodesCount()

    if (!preventParseCustomRSSFeeds) {
      if (!searchBarText && preventAutoDownloading) await parseAllAddByRSSPodcasts()
      subscribedPodcastsAllMediums = await combineWithAddByRSSPodcasts(searchBarText, querySort)
    }

    const subscribedPodcasts = subscribedPodcastsAllMediums.filter(
      (podcast: Podcast) => podcast.medium === PV.Medium.podcast || podcast.hasVideo)

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
      // When searching on the PodcastsScreen, we want to return ALL podcast results,
      // including music and video.
      const medium = searchTitle ? PV.Medium.mixed : PV.Medium.podcast
      localPodcasts = await findCombineWithAddByRSSPodcasts(medium, searchTitle)
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
        const podcasts = await getDownloadedPodcasts({
          searchTitle,
          podcastsOnly: searchTitle ? false : true
        })
        newState.flatListData = [...podcasts]
        newState.queryFrom = PV.Filters._downloadedKey
        newState.selectedFilterLabel = await getSelectedFilterLabel(PV.Filters._downloadedKey)
        newState.endOfResultsReached = true
        newState.flatListDataTotalCount = podcasts.length
      } else if (isSubscribedSelected) {
        if (!preventParseCustomRSSFeeds) {
          await getAuthUserInfo() // get the latest subscribedPodcastIds first
          shouldCleanFlatListData = false
        }
        const subscribedPodcasts = await this._querySubscribedPodcasts(
          preventAutoDownloading, preventParseCustomRSSFeeds)
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
