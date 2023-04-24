import AsyncStorage from '@react-native-community/async-storage'
import debounce from 'lodash/debounce'
import {
  convertNowPlayingItemToEpisode,
  convertToNowPlayingItem,
  getAuthorityFeedUrlFromArray,
  getUsernameAndPasswordFromCredentials
} from 'podverse-shared'
import { Alert, Platform, StyleSheet, View as RNView } from 'react-native'
import { Config } from 'react-native-config'
import { NavigationStackOptions } from 'react-navigation-stack'
import React, { getGlobal } from 'reactn'
import {
  ActionSheet,
  Button,
  ClipTableCell,
  Divider,
  EpisodeTableCell,
  FlatList,
  NavFundingIcon,
  NavShareIcon,
  NavNotificationsIcon,
  NumberSelectorWithText,
  PodcastTableHeader,
  ScrollView,
  SearchBar,
  SwitchWithText,
  TableSectionSelectors,
  Text,
  View
} from '../components'
import { errorLogger } from '../lib/logger'
import { getDownloadedEpisodeLimit, setDownloadedEpisodeLimit } from '../lib/downloadedEpisodeLimiter'
import { removeDownloadedPodcast } from '../lib/downloadedPodcast'
import { downloadEpisode } from '../lib/downloader'
import { getSelectedFilterLabel, getSelectedSortLabel } from '../lib/filters'
import { translate } from '../lib/i18n'
import { alertIfNoNetworkConnection, hasValidNetworkConnection } from '../lib/network'
import { getStartPodcastFromTime } from '../lib/startPodcastFromTime'
import { safeKeyExtractor, safelyUnwrapNestedVariable } from '../lib/utility'
import { PV } from '../resources'
import { updateAutoQueueSettings } from '../state/actions/autoQueue'
import PVEventEmitter from '../services/eventEmitter'
import { getEpisodesAndLiveItems } from '../services/liveItem'
import { getMediaRefs } from '../services/mediaRef'
import {
  getPodcastCredentials,
  getAddByRSSPodcastLocally,
  removePodcastCredentials,
  savePodcastCredentials
} from '../services/parser'
import { getPodcast } from '../services/podcast'
import { getTrackingIdText, trackPageView } from '../services/tracking'
import { getHistoryItemIndexInfoForEpisode } from '../services/userHistoryItem'
import * as DownloadState from '../state/actions/downloads'
import { clearEpisodesCountForPodcast } from '../state/actions/newEpisodesCount'
import { checkIfNotificationsEnabledForPodcastId } from '../state/actions/notifications'
import { toggleAddByRSSPodcastFeedUrl } from '../state/actions/parser'
import { toggleSubscribeToPodcast } from '../state/actions/podcast'
import { core } from '../styles'
import { HistoryIndexListenerScreen } from './HistoryIndexListenerScreen'

const _fileName = 'src/screens/PodcastScreen.tsx'

type Props = {
  navigation?: any
}

type State = {
  downloadedEpisodeLimit?: string | null
  endOfResultsReached: boolean
  flatListData: any[]
  flatListDataTotalCount: number | null
  hasInternetConnection: boolean
  isLoadingMore: boolean
  isRefreshing: boolean
  isSubscribing: boolean
  limitDownloadedEpisodes: boolean
  password: string
  podcast?: any
  podcastId?: string
  queryPage: number
  querySort: string | null
  searchBarText: string
  selectedFilterLabel?: string | null
  selectedSortLabel?: string | null
  selectedItem?: any
  showActionSheet: boolean
  showNoInternetConnectionMessage?: boolean
  showSettings: boolean
  showUsernameAndPassword: boolean
  startPodcastFromTime?: number
  username: string
  viewType: string | null
}

type RenderItemArg = { item: any; index: number }

const testIDPrefix = 'podcast_screen'

const getScreenTitle = () => {
  const { appMode } = getGlobal()
  let screenTitle = translate('Podcast')

  if (appMode === PV.AppMode.videos) {
    screenTitle = translate('Channel')
  }

  return screenTitle
}

const getSearchPlaceholder = (viewType: string) => {
  const { appMode } = getGlobal()
  let searchPlaceholder = translate('Search episodes')

  if (viewType === PV.Filters._clipsKey) {
    searchPlaceholder = translate('Search clips')
  } else {
    if (appMode === PV.AppMode.videos) {
      searchPlaceholder = translate('Search videos')
    }
  }

  return searchPlaceholder
}

const getDefaultSelectedFilterLabel = () => {
  const { appMode } = getGlobal()
  let defaultSelectedFilterLabel = translate('Episodes')

  if (appMode === PV.AppMode.videos) {
    defaultSelectedFilterLabel = translate('Videos')
  }

  return defaultSelectedFilterLabel
}

export class PodcastScreen extends HistoryIndexListenerScreen<Props, State> {
  shouldLoad: boolean
  listRef = null

  constructor(props: Props) {
    super(props)

    this.shouldLoad = true

    const podcast = this.props.navigation.getParam('podcast')
    const podcastId = podcast?.id || podcast?.addByRSSPodcastFeedUrl || this.props.navigation.getParam('podcastId')
    const viewType = this.props.navigation.getParam('viewType') || PV.Filters._episodesKey
    const notificationsEnabled = checkIfNotificationsEnabledForPodcastId(podcastId)

    if (podcast?.id || podcast?.addByRSSPodcastFeedUrl) {
      this.props.navigation.setParams({
        podcastId,
        podcastTitle: podcast.title,
        addByRSSPodcastFeedUrl: podcast.addByRSSPodcastFeedUrl,
        notificationsEnabled
      })
    } else if (podcastId) {
      this.props.navigation.setParams({
        podcastId,
        notificationsEnabled
      })
    }

    this.state = {
      downloadedEpisodeLimit: null,
      endOfResultsReached: false,
      flatListData: [],
      flatListDataTotalCount: null,
      hasInternetConnection: false,
      isLoadingMore: true,
      isRefreshing: false,
      isSubscribing: false,
      limitDownloadedEpisodes: false,
      password: '',
      podcast,
      podcastId,
      queryPage: 1,
      querySort: PV.Filters._mostRecentKey,
      searchBarText: '',
      selectedFilterLabel: getDefaultSelectedFilterLabel(),
      selectedSortLabel: translate('recent'),
      showActionSheet: false,
      showSettings: false,
      showUsernameAndPassword: false,
      username: '',
      viewType
    }

    this._handleSearchBarTextQuery = debounce(this._handleSearchBarTextQuery, PV.SearchBar.textInputDebounceTime)
  }

  static navigationOptions = ({ navigation }) => {
    const podcastId = navigation.getParam('podcastId')
    const podcastTitle = navigation.getParam('podcastTitle')
    const podcast = navigation.getParam('podcast')
    const notificationsEnabled = navigation.getParam('notificationsEnabled')
    const addByRSSPodcastFeedUrl = navigation.getParam('addByRSSPodcastFeedUrl')

    const { globalTheme } = getGlobal()

    const showFundingIcon = podcast?.funding?.length > 0 || podcast?.value?.length > 0

    return {
      title: getScreenTitle(),
      headerRight: () => (
        <RNView style={core.row}>
          {/* Always show NavFundingIcon in dev, otherwise funding tag will be unavailable to Appium tests. */}
          {(!!Config.IS_DEV || !!showFundingIcon) && podcast && (
            <NavFundingIcon globalTheme={globalTheme} navigation={navigation} podcast={podcast} />
          )}
          {!addByRSSPodcastFeedUrl && (
            <NavNotificationsIcon
              podcastId={podcastId}
              isEnabled={notificationsEnabled}
              onNotificationSelectionChanged={() =>
                navigation.setParams({ notificationsEnabled: !notificationsEnabled })
              }
            />
          )}
          {!addByRSSPodcastFeedUrl && (
            <NavShareIcon podcastTitle={podcastTitle} urlId={podcastId} urlPath={PV.URLs.webPaths.podcast} />
          )}
          {!!addByRSSPodcastFeedUrl && podcast?.linkUrl && (
            <NavShareIcon
              customUrl={podcast.linkUrl}
              endingText={translate('shared using brandName')}
              podcastTitle={podcastTitle}
            />
          )}
          {/* <NavSearchIcon navigation={navigation} /> */}
        </RNView>
      )
    } as NavigationStackOptions
  }

  async componentDidMount() {
    super.componentDidMount()

    const { navigation } = this.props
    const { podcastId } = this.state
    const { isInMaintenanceMode } = this.global
    let podcast = navigation.getParam('podcast')
    const forceRequest = navigation.getParam('forceRequest')
    const addByRSSPodcastFeedUrl = this.props.navigation.getParam('addByRSSPodcastFeedUrl')
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    PVEventEmitter.on(PV.Events.PODCAST_START_PODCAST_FROM_TIME_SET, this.refreshStartPodcastFromTime)
    PVEventEmitter.on(PV.Events.SERVER_MAINTENANCE_MODE, this._handleMaintenanceMode)

    const hasInternetConnection = await hasValidNetworkConnection()

    // If passed the addByRSSPodcastFeedUrl in the navigation,
    // use the podcast from local storage.
    if (addByRSSPodcastFeedUrl) {
      podcast = await getAddByRSSPodcastLocally(addByRSSPodcastFeedUrl)
    } else if (!hasInternetConnection && podcastId) {
      podcast = await getPodcast(podcastId, forceRequest)
    }

    this.refreshStartPodcastFromTime()

    this.setState(
      {
        ...(!hasInternetConnection || isInMaintenanceMode
          ? {
              viewType: PV.Filters._downloadedKey
            }
          : { viewType: this.state.viewType }),
        podcast,
        hasInternetConnection: !!hasInternetConnection
      },
      () => {
        this._initializePageData()

        const titleToEncode = podcast ? podcast.title : translate('no info available')
        trackPageView(
          '/podcast/' + getTrackingIdText(podcastId, !!addByRSSPodcastFeedUrl),
          'Podcast Screen - ',
          titleToEncode
        )
      }
    )
  }

  componentWillUnmount() {
    super.componentWillUnmount()
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    PVEventEmitter.removeListener(PV.Events.PODCAST_START_PODCAST_FROM_TIME_SET, this.refreshStartPodcastFromTime)
    PVEventEmitter.removeListener(PV.Events.SERVER_MAINTENANCE_MODE, this._handleMaintenanceMode)
  }

  async _initializePageData() {
    const { navigation } = this.props
    const { podcast, viewType } = this.state
    const podcastId = navigation.getParam('podcastId') || this.state.podcastId
    const downloadedEpisodeLimit = await getDownloadedEpisodeLimit(podcastId)

    this.setState(
      {
        downloadedEpisodeLimit,
        endOfResultsReached: false,
        flatListData: [],
        flatListDataTotalCount: null,
        isLoadingMore: true,
        limitDownloadedEpisodes: downloadedEpisodeLimit && downloadedEpisodeLimit > 0,
        podcastId,
        queryPage: 1
      },
      () => {
        (async () => {
          let newState = {}
          let newPodcast: any
          const { isInMaintenanceMode } = this.global

          try {
            if (podcast && podcast.addByRSSPodcastFeedUrl) {
              newPodcast = podcast
              newState.flatListData = podcast.episodes || []
              newState.flatListDataTotalCount = newState.flatListData.length
            } else if (isInMaintenanceMode) {
              newPodcast = podcast
              newState = await this._queryData(PV.Filters._downloadedKey)
            } else {
              const forceRequest = navigation.getParam('forceRequest')
              newPodcast = await getPodcast(podcastId, forceRequest)
              newState = await this._queryData(viewType)
            }

            newPodcast.description = newPodcast.description || translate('No summary available')

            this.setState(
              {
                ...newState,
                isLoadingMore: false,
                podcast: newPodcast
              },
              () => {
                this._updateCredentialsState()
                // Adding a no time setTimeout for the listref to have populated
                // in the next event loop otherwise, there will be no ref to call scroll to yet
                if (Platform.OS === 'ios') {
                  setTimeout(() => {
                    this.listRef?.scrollToOffset({
                      animated: false,
                      offset: PV.FlatList.ListHeaderHiddenSearchBar.contentOffset.y
                    })
                  })
                }
              }
            )
          } catch (error) {
            errorLogger(_fileName, '_initializePageData', error)
            this.setState(
              {
                ...newState,
                isLoadingMore: false,
                ...(newPodcast ? { podcast: newPodcast } : { podcast })
              },
              () => {
                this._updateCredentialsState()
              }
            )
          }
        })()
      }
    )
  }

  _handleMaintenanceMode = () => {
    const { queryFrom } = this.state

    if (queryFrom !== PV.Filters._downloadedKey) {
      this.handleSelectFilterItem(PV.Filters._downloadedKey)
    }
  }

  refreshStartPodcastFromTime = async () => {
    const { podcastId } = this.state
    const startPodcastFromTime = await getStartPodcastFromTime(podcastId)
    this.setState({ startPodcastFromTime })
  }

  handleSelectFilterItem = async (selectedKey: string) => {
    if (!selectedKey) return

    const selectedFilterLabel = await getSelectedFilterLabel(selectedKey)

    this.setState(
      {
        endOfResultsReached: false,
        flatListData: [],
        flatListDataTotalCount: null,
        isLoadingMore: true,
        queryPage: 1,
        searchBarText: '',
        selectedFilterLabel,
        viewType: selectedKey
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
    if (!selectedKey) return

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

  _onEndReached = ({ distanceFromEnd }: { distanceFromEnd: number }) => {
    const { endOfResultsReached, podcast, queryPage = 1, viewType } = this.state

    if (
      !podcast.addByRSSPodcastFeedUrl &&
      viewType !== PV.Filters._downloadedKey &&
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
              const newState = await this._queryData(viewType, {
                queryPage: queryPage + 1,
                searchTitle: this.state.searchBarText
              })
              this.setState(newState)
            })()
          }
        )
      }
    }
  }

  _onRefresh = () => {
    const { viewType } = this.state
    this.setState(
      {
        isRefreshing: true
      },
      () => {
        (async () => {
          const newState = await this._queryData(viewType, { queryPage: 1 })
          this.setState(newState)
        })()
      }
    )
  }

  _ListHeaderComponent = () => {
    const { searchBarText, viewType, flatListDataTotalCount } = this.state
    const placeholder = getSearchPlaceholder(viewType)
    const shouldShowSearchBar = !!(searchBarText || (flatListDataTotalCount && flatListDataTotalCount > 3))

    return (
      <View style={styles.ListHeaderComponent}>
        {shouldShowSearchBar && (
          <SearchBar
            handleClear={this._handleSearchBarClear}
            hideIcon
            icon='filter'
            noContainerPadding
            onChangeText={this._handleSearchBarTextChange}
            placeholder={placeholder}
            testID={`${testIDPrefix}_filter_bar`}
            value={searchBarText}
          />
        )}
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
    const { podcast } = this.state
    if (selectedItem) {
      downloadEpisode(selectedItem, podcast)
    }
  }

  _renderItem = ({ item, index }: RenderItemArg) => {
    const { navigation } = this.props
    const { podcast, viewType } = this.state

    if (viewType === PV.Filters._clipsKey) {
      return (
        item?.episode?.id && (
          <ClipTableCell
            handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(item, null, podcast))}
            hideImage
            item={item}
            navigation={navigation}
            showEpisodeInfo
            showPodcastInfo={false}
            testID={`${testIDPrefix}_clip_item_${index}`}
          />
        )
      )
    } else {
      const episode = {
        ...item,
        podcast
      }

      let testId = ''
      if (viewType === PV.Filters._downloadedKey) {
        testId = `${testIDPrefix}_episode_downloaded_item_${index}`
      } else if (viewType === PV.Filters._episodesKey) {
        testId = `${testIDPrefix}_episode_item_${index}`
      } else if (viewType === PV.Filters._hideCompletedKey) {
        testId = `${testIDPrefix}_episode_hide_completed_item_${index}`
      } else if (viewType === PV.Filters._showCompletedKey) {
        testId = `${testIDPrefix}_episode_completed_item_${index}`
      }
      const { completed, mediaFileDuration, userPlaybackPosition } = getHistoryItemIndexInfoForEpisode(item?.id)

      const { hideCompleted } = this.global
      const shouldHideCompleted =
        (hideCompleted && viewType === PV.Filters._episodesKey && completed) ||
        (!hideCompleted && viewType === PV.Filters._hideCompletedKey && completed)

      return (
        <EpisodeTableCell
          handleDeletePress={() => this._handleDeleteEpisode(item)}
          handleDownloadPress={() => this._handleDownloadPressed(item)}
          handleMorePress={() =>
            this._handleMorePress(convertToNowPlayingItem(item, null, podcast, userPlaybackPosition))
          }
          handleNavigationPress={() => {
            const { hasInternetConnection } = this.state
            this.props.navigation.navigate(PV.RouteNames.EpisodeScreen, {
              episode,
              podcast,
              addByRSSPodcastFeedUrl: podcast.addByRSSPodcastFeedUrl,
              hasInternetConnection
            })
          }}
          hideImage
          item={episode}
          mediaFileDuration={mediaFileDuration}
          navigation={navigation}
          shouldHideCompleted={shouldHideCompleted}
          testID={testId}
          userPlaybackPosition={userPlaybackPosition}
        />
      )
    }
  }

  _handleDeleteEpisode = async (item: any) => {
    const selectedId = item?.episodeId || item?.id
    if (selectedId) {
      await DownloadState.removeDownloadedPodcastEpisode(selectedId)
    }
  }

  _handleToggleDeleteDownloadedEpisodesDialog = () => {
    const DOWNLOADED_EPISODES_DELETE = PV.Alerts.DOWNLOADED_EPISODES_DELETE(() => this._handleDeleteDownloadedEpisodes)
    Alert.alert(
      DOWNLOADED_EPISODES_DELETE.title,
      DOWNLOADED_EPISODES_DELETE.message,
      DOWNLOADED_EPISODES_DELETE.buttons
    )
  }

  _handleDeleteDownloadedEpisodes = async () => {
    const { podcast, podcastId } = this.state
    const id = podcast?.id || podcastId
    try {
      await removeDownloadedPodcast(id)
    } catch (error) {
      //
    }
    DownloadState.updateDownloadedPodcasts()
  }

  _handleClearNewEpisodeIndicators = () => {
    const { podcast } = this.state
    if (podcast?.id) {
      clearEpisodesCountForPodcast(podcast.id)
    }
  }

  _handleSearchBarTextChange = (text: string) => {
    const { viewType } = this.state

    this.setState(
      {
        searchBarText: text
      },
      () => {
        this._handleSearchBarTextQuery(viewType, { searchTitle: text })
      }
    )
  }

  _handleSearchBarTextQuery = (viewType: string | null, queryOptions: any) => {
    this.setState(
      {
        flatListData: [],
        flatListDataTotalCount: null,
        isLoadingMore: true,
        queryPage: 1
      },
      () => {
        (async () => {
          const { podcast } = this.state
          const { addByRSSPodcastFeedUrl } = podcast
          if (addByRSSPodcastFeedUrl) {
            this._handleSearchAddByRSSEpisodes(queryOptions.searchTitle)
          } else {
            const state = await this._queryData(viewType, {
              searchTitle: queryOptions.searchTitle
            })
            this.setState(state)
          }
        })()
      }
    )
  }

  _handleSearchAddByRSSEpisodes = (searchTitle: string) => {
    const { querySort, viewType } = this.state
    this.setState({ searchTitle }, () => {
      const { addByRSSEpisodes, addByRSSEpisodesCount } = this._queryAddByRSSEpisodes(viewType, querySort)

      this.setState({
        endOfResultsReached: true,
        flatListData: addByRSSEpisodes,
        flatListDataTotalCount: addByRSSEpisodesCount,
        isLoadingMore: false
      })
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

  _toggleSubscribeToPodcast = async () => {
    const { podcast, podcastId } = this.state
    const { addByRSSPodcastFeedUrl } = podcast

    if (podcastId) {
      const wasAlerted = await alertIfNoNetworkConnection(translate('subscribe to podcast'))
      if (wasAlerted) return

      this.setState({ isSubscribing: true }, () => {
        (async () => {
          try {
            if (addByRSSPodcastFeedUrl) {
              await toggleAddByRSSPodcastFeedUrl(podcastId)
            } else {
              await toggleSubscribeToPodcast(podcastId)
            }
            this.setState({ isSubscribing: false })
          } catch (error) {
            this.setState({ isSubscribing: false })
          }

          const downloadedEpisodeLimit = await getDownloadedEpisodeLimit(podcastId)

          this.setState({
            downloadedEpisodeLimit,
            limitDownloadedEpisodes: downloadedEpisodeLimit && downloadedEpisodeLimit > 0
          })
        })()
      })
    }
  }

  _handleToggleAutoDownload = (autoDownloadOn: boolean) => {
    const { podcast, podcastId } = this.state
    const id = podcast?.id || podcastId
    const { addByRSSPodcastFeedUrl } = podcast

    if (addByRSSPodcastFeedUrl) {
      DownloadState.updateAutoDownloadSettingsAddByRSS(addByRSSPodcastFeedUrl, autoDownloadOn)
    } else if (id) {
      DownloadState.updateAutoDownloadSettings(id, autoDownloadOn)
    }
  }

  _handleToggleSettings = () => {
    this.setState({ showSettings: !this.state.showSettings })
  }

  _handleToggleAutoAddToQueue = (autoAddToQueueOn: boolean) => {
    const { podcast, podcastId } = this.state
    const id = podcast?.id || podcastId

    if (id) {
      updateAutoQueueSettings(id, !autoAddToQueueOn)
    }
  }

  _handleToggleLimitDownloads = async () => {
    const { podcastId } = this.state
    if (podcastId) {
      const shouldLimitDownloads = !this.state.limitDownloadedEpisodes
      const globalDownloadedEpisodeLimitCount = (await AsyncStorage.getItem(
        PV.Keys.DOWNLOADED_EPISODE_LIMIT_GLOBAL_COUNT
      )) as any
      setDownloadedEpisodeLimit(podcastId, shouldLimitDownloads ? globalDownloadedEpisodeLimitCount : null)
      this.setState({
        downloadedEpisodeLimit: shouldLimitDownloads ? globalDownloadedEpisodeLimitCount : null,
        limitDownloadedEpisodes: shouldLimitDownloads
      })
    }
  }

  _handleChangeDownloadLimitText = (value: string) => {
    const { podcast } = this.state
    this.setState({ downloadedEpisodeLimit: value })
    const int = parseInt(value, 10)
    if (int && podcast?.id) setDownloadedEpisodeLimit(podcast.id, int)
  }

  _handleNavigateToStartPodcastFromTimeScreen = () => {
    const { navigation } = this.props
    const { podcast, startPodcastFromTime } = this.state
    navigation.navigate(PV.RouteNames.StartPodcastFromTimeScreen, {
      podcast,
      startPodcastFromTime
    })
  }

  _handleToggleUsernameAndPassword = async () => {
    const { showUsernameAndPassword } = this.state
    const newState = !showUsernameAndPassword

    if (!newState) {
      await this._handleClearPodcastCredentials()

      this.setState({
        password: '',
        showUsernameAndPassword: newState,
        username: ''
      })
    } else {
      const { password = '', username = '' } = await this._getCredentials()
      this.setState({
        password,
        showUsernameAndPassword: newState,
        username
      })
    }
  }

  _updateCredentialsState = () => {
    (async () => {
      const { username, password } = await this._getCredentials()
      this.setState({
        username,
        password,
        showUsernameAndPassword: !!username && !!password
      })
    })()
  }

  _getFinalFeedUrl = () => {
    const { podcast } = this.state
    const feedUrlObjects = podcast.feedUrls
    return this.props.navigation.getParam('addByRSSPodcastFeedUrl') || getAuthorityFeedUrlFromArray(feedUrlObjects)
  }

  _getCredentials = async () => {
    const finalFeedUrl = this._getFinalFeedUrl()
    const credentials = await getPodcastCredentials(finalFeedUrl)
    return getUsernameAndPasswordFromCredentials(credentials)
  }

  _handleClearPodcastCredentials = async () => {
    const finalFeedUrl = this._getFinalFeedUrl()
    if (finalFeedUrl) {
      await removePodcastCredentials(finalFeedUrl)
    }
  }

  _handleSavePodcastCredentials = () => {
    const { password, showUsernameAndPassword, username } = this.state
    const finalFeedUrl = this._getFinalFeedUrl()

    if (finalFeedUrl) {
      this.setState({ isLoadingMore: true }, () => {
        (async () => {
          try {
            if (showUsernameAndPassword && username && password) {
              const credentials = `${username}:${password}`
              await savePodcastCredentials(finalFeedUrl, credentials)
            } else {
              await removePodcastCredentials(finalFeedUrl)
            }
            this.setState({
              isLoadingMore: false,
              showSettings: false
            })
          } catch (error) {
            errorLogger(_fileName, '_handleSavePodcastCredentials', error)
            this.setState({
              isLoadingMore: false,
              showSettings: false
            })
          }
        })()
      })
    }
  }

  _handleNavigateToPodcastInfoScreen = () => {
    const { navigation } = this.props
    const { podcast } = this.state
    const addByRSSPodcastFeedUrl = this.props.navigation.getParam('addByRSSPodcastFeedUrl')
    navigation.navigate(PV.RouteNames.PodcastInfoScreen, {
      addByRSSPodcastFeedUrl,
      podcast
    })
  }

  render() {
    const { navigation } = this.props

    const {
      downloadedEpisodeLimit,
      isLoadingMore,
      isRefreshing,
      isSubscribing,
      limitDownloadedEpisodes,
      password,
      podcast,
      podcastId,
      querySort,
      selectedFilterLabel,
      selectedSortLabel,
      selectedItem,
      showActionSheet,
      showNoInternetConnectionMessage,
      showSettings,
      showUsernameAndPassword,
      startPodcastFromTime,
      username,
      viewType
    } = this.state
    const subscribedPodcastIds = safelyUnwrapNestedVariable(() => this.global.session.userInfo.subscribedPodcastIds, [])
    const addByRSSPodcastFeedUrl = this.props.navigation.getParam('addByRSSPodcastFeedUrl')

    let isSubscribed = subscribedPodcastIds.some((x: string) => x === podcastId)
    if (!isSubscribed) {
      const subscribedPodcasts = safelyUnwrapNestedVariable(() => this.global.subscribedPodcasts, [])
      isSubscribed = subscribedPodcasts.some(
        (x: any) => x.addByRSSPodcastFeedUrl && x.addByRSSPodcastFeedUrl === podcastId
      )
    }

    const { flatListData, flatListDataTotalCount } = this.state
    const { autoDownloadSettings, autoQueueSettings } = this.global
    const autoDownloadOn =
      (podcast && podcast.id && autoDownloadSettings[podcast.id]) || (podcastId && autoDownloadSettings[podcastId])
    const autoQueueOn =
      (podcast && podcast.id && autoQueueSettings[podcast.id]) || (podcastId && autoQueueSettings[podcastId])

    const noResultsMessage =
      (viewType === PV.Filters._downloadedKey && translate('No episodes found')) ||
      ((viewType === PV.Filters._episodesKey ||
        viewType === PV.Filters._hideCompletedKey ||
        viewType === PV.Filters._showCompletedKey) &&
        translate('No episodes found')) ||
      (viewType === PV.Filters._clipsKey && translate('No clips found'))

    return (
      <View style={styles.headerView} testID={`${testIDPrefix}_view`}>
        <PodcastTableHeader
          addByRSSPodcastFeedUrl={addByRSSPodcastFeedUrl}
          autoDownloadOn={autoDownloadOn}
          description={podcast && podcast.description}
          handleNavigateToPodcastInfoScreen={this._handleNavigateToPodcastInfoScreen}
          handleToggleAutoDownload={this._handleToggleAutoDownload}
          handleToggleSettings={this._handleToggleSettings}
          handleToggleSubscribe={this._toggleSubscribeToPodcast}
          isLoading={isLoadingMore && !podcast}
          isNotFound={!isLoadingMore && !podcast}
          isSubscribed={isSubscribed}
          isSubscribing={isSubscribing}
          podcastImageUrl={podcast && (podcast.shrunkImageUrl || podcast.imageUrl)}
          podcastTitle={podcast && podcast.title}
          podcastValue={podcast?.value}
          showSettings={showSettings}
          testID={testIDPrefix}
        />
        {!showSettings ? (
          <TableSectionSelectors
            addByRSSPodcastFeedUrl={addByRSSPodcastFeedUrl}
            filterScreenTitle={getScreenTitle()}
            handleSelectFilterItem={this.handleSelectFilterItem}
            handleSelectSortItem={this.handleSelectSortItem}
            includePadding
            navigation={navigation}
            screenName='PodcastScreen'
            selectedFilterItemKey={viewType}
            selectedFilterLabel={selectedFilterLabel}
            selectedSortItemKey={querySort}
            selectedSortLabel={selectedSortLabel}
            testID={testIDPrefix}
          />
        ) : (
          <ScrollView style={styles.settingsView}>
            <Text accessibilityRole='header' style={styles.settingsTitle}>
              {translate('Settings')}
            </Text>
            {!podcast?.addByRSSPodcastFeedUrl && (
              <SwitchWithText
                accessibilityLabel={translate('Automatically add new episodes to queue')}
                onValueChange={() => this._handleToggleAutoAddToQueue(autoQueueOn)}
                testID={`${testIDPrefix}_auto_add_to_queue`}
                text={translate('Automatically add new episodes to queue')}
                value={autoQueueOn}
                wrapperStyle={styles.toggleAutoQueueSwitchWrapper}
              />
            )}
            <SwitchWithText
              accessibilityHint={
                limitDownloadedEpisodes
                  ? translate('ARIA HINT - disable the downloaded episode limit for this podcast')
                  : translate('ARIA HINT - limit the number of episodes from this podcast to save on your device')
              }
              accessibilityLabel={
                limitDownloadedEpisodes ? translate('Download limit on') : translate('Download limit off')
              }
              onValueChange={this._handleToggleLimitDownloads}
              testID={`${testIDPrefix}_toggle_download_limit`}
              text={translate('Download limit')}
              value={limitDownloadedEpisodes}
              wrapperStyle={styles.toggleLimitDownloadsSwitchWrapper}
            />
            {limitDownloadedEpisodes && (
              <View style={styles.itemWrapper}>
                <NumberSelectorWithText
                  accessibilityHint={`${translate(
                    'ARIA HINT - set the maximum number of downloaded episodes to save from this podcast on your device'
                  )},${translate(
                    // eslint-disable-next-line max-len
                    'Limit the number of downloaded epiosdes explanation'
                  )}`}
                  accessibilityLabel={`${translate('Download limit max')} ${
                    !!downloadedEpisodeLimit ? downloadedEpisodeLimit : ''
                  }`}
                  handleChangeText={this._handleChangeDownloadLimitText}
                  selectedNumber={downloadedEpisodeLimit}
                  subText={translate(
                    // eslint-disable-next-line max-len
                    'Limit the number of downloaded epiosdes explanation'
                  )}
                  testID={`${testIDPrefix}_downloaded_episode_limit_count`}
                  text={translate('Limit')}
                />
              </View>
            )}
            <View style={styles.itemWrapper}>
              <NumberSelectorWithText
                accessibilityHint={translate(
                  'ARIA HINT - set the time you want this episode to always start playing from'
                )}
                accessibilityLabel={translate('Preset podcast start time')}
                editable={false}
                isHHMMSS
                selectedNumber={startPodcastFromTime}
                subText={translate('Episodes from this podcast will start playback from this time')}
                testID={`${testIDPrefix}_start_podcast_from_time`}
                text={translate('Preset podcast start time')}
                textInputOnPress={this._handleNavigateToStartPodcastFromTimeScreen}
                textInputStyle={{ width: 76 }}
                wrapperOnPress={this._handleNavigateToStartPodcastFromTimeScreen}
              />
            </View>
            {(addByRSSPodcastFeedUrl || podcast?.credentialsRequired) && (
              <View style={styles.switchWrapper}>
                <SwitchWithText
                  accessibilityHint={translate('ARIA HINT - type a username and password for this feed')}
                  accessibilityLabel={translate('Include username and password')}
                  inputAutoCorrect={false}
                  inputEditable
                  inputEyebrowTitle={translate('Username')}
                  inputHandleTextChange={(text?: string) => this.setState({ username: text || '' })}
                  inputPlaceholder={translate('Username')}
                  inputShow={!!showUsernameAndPassword}
                  inputText={username}
                  input2AutoCorrect={false}
                  input2Editable
                  input2EyebrowTitle={translate('Password')}
                  input2HandleTextChange={(text?: string) => this.setState({ password: text || '' })}
                  input2Placeholder={translate('Password')}
                  input2Show={!!showUsernameAndPassword}
                  input2Text={password}
                  onValueChange={this._handleToggleUsernameAndPassword}
                  subText={!!showUsernameAndPassword ? translate('If this is a password protected feed') : ''}
                  subTextAccessible
                  text={translate('Include username and password')}
                  testID={`${testIDPrefix}_include_username_and_password`}
                  value={!!showUsernameAndPassword}
                />
                {!!showUsernameAndPassword && (
                  <Button
                    accessibilityLabel={translate('Save Password')}
                    isSuccess
                    onPress={this._handleSavePodcastCredentials}
                    wrapperStyles={styles.settingsSavePasswordButton}
                    testID={`${testIDPrefix}_save_password`}
                    text={translate('Save Password')}
                  />
                )}
              </View>
            )}
            <Divider style={styles.divider} />
            <Button
              accessibilityHint={translate('ARIA HINT - delete all the episodes you have downloaded for this podcast')}
              accessibilityLabel={translate('Mark episodes as seen')}
              onPress={this._handleClearNewEpisodeIndicators}
              wrapperStyles={styles.settingsClearNewEpisodeIndicators}
              testID={`${testIDPrefix}_clear_new_episode_indicators`}
              text={translate('Mark episodes as seen')}
            />
            <Button
              accessibilityHint={translate('ARIA HINT - delete all the episodes you have downloaded for this podcast')}
              accessibilityLabel={translate('Delete Downloaded Episodes')}
              isWarning
              onPress={this._handleToggleDeleteDownloadedEpisodesDialog}
              wrapperStyles={styles.settingsDeletebutton}
              testID={`${testIDPrefix}_delete_downloaded_episodes`}
              text={translate('Delete Downloaded Episodes')}
            />
          </ScrollView>
        )}
        {!showSettings && (
          <View style={styles.view}>
            {flatListData && podcast && (
              <FlatList
                data={flatListData}
                dataTotalCount={flatListDataTotalCount}
                disableNoResultsMessage={isLoadingMore}
                extraData={flatListData}
                isLoadingMore={isLoadingMore}
                isRefreshing={isRefreshing}
                keyExtractor={(item: any, index: number) =>
                  safeKeyExtractor(testIDPrefix, index, item?.id, !!item?.addedByRSS)
                }
                ListHeaderComponent={this._ListHeaderComponent}
                noResultsMessage={noResultsMessage}
                onEndReached={this._onEndReached}
                renderItem={this._renderItem}
                listRef={(ref) => (this.listRef = ref)}
                stickyHeaderIndices={false}
                showNoInternetConnectionMessage={showNoInternetConnectionMessage}
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
                    handleDownload: () => this._handleDownloadPressed(convertNowPlayingItemToEpisode(selectedItem)),
                    includeGoToEpisodeInCurrentStack: true
                  },
                  viewType === PV.Filters._clipsKey ? 'clip' : 'episode'
                )
              }
              showModal={showActionSheet}
              testID={testIDPrefix}
            />
          </View>
        )}
      </View>
    )
  }

  _filterDownloadedEpisodes = () => {
    const { downloadedPodcasts } = this.global
    const { podcastId } = this.state
    const downloadedPodcast = downloadedPodcasts.find((x: any) => podcastId && x.id && x.id === podcastId)
    const episodes = downloadedPodcast?.episodes || []
    return episodes
  }

  _queryEpisodes = async (viewType: string, sort: string | null, page = 1) => {
    const { podcast, podcastId, searchBarText: searchTitle } = this.state

    if (podcast?.addByRSSPodcastFeedUrl) {
      const { addByRSSEpisodes, addByRSSEpisodesCount } = this._queryAddByRSSEpisodes(viewType, sort)
      return [addByRSSEpisodes, addByRSSEpisodesCount]
    } else if (viewType === PV.Filters._downloadedKey) {
      let downloadedEpisodes = this._filterDownloadedEpisodes()

      // Use spread operator with sort to prevent mutate in place
      if (sort === PV.Filters._oldestKey) {
        downloadedEpisodes = [...downloadedEpisodes].sort(function(a, b) {
          return new Date(a.pubDate) - new Date(b.pubDate)
        })
      } else if (sort === PV.Filters._mostRecentKey) {
        downloadedEpisodes = [...downloadedEpisodes].sort(function(a, b) {
          return new Date(b.pubDate) - new Date(a.pubDate)
        })
      }

      return [downloadedEpisodes, downloadedEpisodes.length]
    } else {
      const results = await getEpisodesAndLiveItems(
        {
          sort,
          page,
          podcastId,
          ...(searchTitle ? { searchTitle } : {})
        },
        podcastId
      )

      const { combinedEpisodes } = results
      return combinedEpisodes
    }
  }

  _queryClips = async (sort: string | null, page = 1) => {
    const { podcastId, searchBarText: searchTitle } = this.state
    const results = await getMediaRefs({
      sort,
      page,
      podcastId,
      includeEpisode: true,
      ...(searchTitle ? { searchTitle } : {})
    })
    return results
  }

  _queryData = async (filterKey: string | null, queryOptions: { queryPage?: number; searchTitle?: string } = {}) => {
    const { flatListData, podcast, querySort, viewType } = this.state
    const newState = {
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
      if (
        (filterKey === PV.Filters._downloadedKey ||
          filterKey === PV.Filters._episodesKey ||
          filterKey === PV.Filters._hideCompletedKey ||
          filterKey === PV.Filters._showCompletedKey) &&
        podcast &&
        podcast.addByRSSPodcastFeedUrl
      ) {
        const { addByRSSEpisodes, addByRSSEpisodesCount } = this._queryAddByRSSEpisodes(filterKey, querySort)
        newState.flatListData = addByRSSEpisodes || []
        newState.flatListDataTotalCount = addByRSSEpisodesCount
      } else if (
        !podcast?.addByRSSPodcastFeedUrl &&
        (filterKey === PV.Filters._downloadedKey ||
          filterKey === PV.Filters._episodesKey ||
          filterKey === PV.Filters._hideCompletedKey ||
          filterKey === PV.Filters._showCompletedKey)
      ) {
        const results = await this._queryEpisodes(filterKey, querySort, queryOptions.queryPage)
        newState.flatListData = [...flatListData, ...results[0]]
        newState.flatListData = this.cleanFlatListData(newState.flatListData, filterKey)
        newState.endOfResultsReached = newState.flatListData.length >= results[1]
        newState.flatListDataTotalCount = results[1]
      } else if (filterKey === PV.Filters._clipsKey) {
        const results = await this._queryClips(querySort, queryOptions.queryPage)
        newState.flatListData = [...flatListData, ...results[0]]
        newState.flatListData = this.cleanFlatListData(newState.flatListData, filterKey)
        newState.endOfResultsReached = newState.flatListData.length >= results[1]
        newState.flatListDataTotalCount = results[1]
      } else if (PV.FilterOptions.screenFilters.PodcastScreen.sort.some((option) => option === filterKey)) {
        let results = []

        if (podcast?.addByRSSPodcastFeedUrl) {
          const { addByRSSEpisodes, addByRSSEpisodesCount } = this._queryAddByRSSEpisodes(viewType, filterKey)
          newState.flatListData = addByRSSEpisodes || []
          newState.flatListDataTotalCount = addByRSSEpisodesCount
        } else if (
          viewType === PV.Filters._downloadedKey ||
          viewType === PV.Filters._episodesKey ||
          viewType === PV.Filters._hideCompletedKey ||
          viewType === PV.Filters._showCompletedKey
        ) {
          results = await this._queryEpisodes(viewType, filterKey)
        } else if (viewType === PV.Filters._clipsKey) {
          results = await this._queryClips(querySort)
        }

        newState.flatListData = [...flatListData, ...results[0]]
        newState.flatListData = this.cleanFlatListData(newState.flatListData, viewType)
        newState.endOfResultsReached = newState.flatListData.length >= results[1]
        newState.flatListDataTotalCount = results[1]
      }
      newState.queryPage = queryOptions.queryPage || 1

      newState.selectedFilterLabel = await getSelectedFilterLabel(viewType)
    } catch (error) {
      errorLogger(_fileName, 'queryData', error)
    }
    this.shouldLoad = true

    return newState
  }

  cleanFlatListData = (flatListData: any[], viewTypeKey: string | null) => {
    if (
      viewTypeKey === PV.Filters._episodesKey ||
      viewTypeKey === PV.Filters._hideCompletedKey ||
      viewTypeKey === PV.Filters._showCompletedKey
    ) {
      return flatListData?.filter((item: any) => !!item?.id) || []
    } else if (viewTypeKey === PV.Filters._clipsKey) {
      return flatListData?.filter((item: any) => !!item?.episode?.id) || []
    } else {
      return flatListData
    }
  }

  _queryAddByRSSEpisodes = (viewType: string, querySort: string | null) => {
    const { podcast } = this.state

    if (!Array.isArray(podcast?.episodes)) {
      return {
        addByRSSEpisodes: [],
        addByRSSEpisodesCount: 0
      }
    }

    let addByRSSEpisodes = podcast.episodes
    addByRSSEpisodes = this.cleanFlatListData(addByRSSEpisodes, viewType)

    if (viewType === PV.Filters._downloadedKey) {
      addByRSSEpisodes = this._filterDownloadedEpisodes()
    }

    // Use spread operator with sort to prevent mutate in place
    if (querySort === PV.Filters._oldestKey) {
      addByRSSEpisodes = [...addByRSSEpisodes].sort(function(a, b) {
        return new Date(a.pubDate) - new Date(b.pubDate)
      })
    } else if (querySort === PV.Filters._mostRecentKey) {
      addByRSSEpisodes = [...addByRSSEpisodes].sort(function(a, b) {
        return new Date(b.pubDate) - new Date(a.pubDate)
      })
    }

    const addByRSSEpisodesCount = addByRSSEpisodes.length

    return {
      addByRSSEpisodes,
      addByRSSEpisodesCount
    }
  }
}

const styles = StyleSheet.create({
  aboutView: {
    margin: 8
  },
  aboutViewText: {
    fontSize: PV.Fonts.sizes.lg
  },
  divider: {
    marginBottom: 24,
    marginTop: 32
  },
  itemWrapper: {
    marginTop: 32
  },
  settingsClearNewEpisodeIndicators: {
    marginBottom: 32,
    marginHorizontal: 8,
    marginTop: 8,
    borderRadius: 8
  },
  settingsDeletebutton: {
    margin: 8,
    borderRadius: 8
  },
  settingsHelpText: {
    fontSize: PV.Fonts.sizes.md
  },
  settingsSavePasswordButton: {
    marginHorizontal: 8,
    marginTop: 24
  },
  settingsTitle: {
    fontSize: PV.Fonts.sizes.xxl,
    fontWeight: PV.Fonts.weights.bold,
    marginBottom: 16
  },
  settingsView: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 16
  },
  swipeRowBack: {
    marginBottom: 8,
    marginTop: 8
  },
  switchWrapper: {
    marginBottom: 12,
    marginTop: 28
  },
  toggleLimitDownloadsSwitchWrapper: {
    marginTop: 4
  },
  toggleAutoQueueSwitchWrapper: {
    marginBottom: 24,
    marginTop: 4
  },
  ListHeaderComponent: {
    paddingTop: 15
  },
  view: {
    flex: 1,
    borderTopColor: PV.Colors.grayLight,
    borderTopWidth: StyleSheet.hairlineWidth
  },
  headerView: {
    flex: 1
  }
})
