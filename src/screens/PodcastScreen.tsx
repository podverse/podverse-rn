import AsyncStorage from '@react-native-community/async-storage'
import debounce from 'lodash/debounce'
import {
  Episode,
  convertNowPlayingItemToEpisode,
  convertToNowPlayingItem,
  getAuthorityFeedUrlFromArray,
  getSeasonOrSerialEpisodesData,
  getUsernameAndPasswordFromCredentials
} from 'podverse-shared'
import { Alert, StyleSheet, View as RNView } from 'react-native'
import { Config } from 'react-native-config'
import { NavigationStackOptions } from 'react-navigation-stack'
import React, { getGlobal } from 'reactn'
import {
  ActionSheet,
  ActivityIndicator,
  Button,
  ClipTableCell,
  Divider,
  EpisodeTableCell,
  FlatList,
  NavFundingIcon,
  NavShareIcon,
  NavNotificationsIcon,
  NumberSelectorWithText,
  PillButton,
  PodcastTableHeader,
  ScrollView,
  SearchBar,
  SwitchWithText,
  TableSectionSelectors,
  Text,
  View,
  PressableWithOpacity,
  Icon
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
import {
  PodcastScreenSavedQuery,
  updateSavedQueriesPodcastScreen
} from '../services/savedQueryFilters'
import { getTrackingIdText, trackPageView } from '../services/tracking'
import { getHistoryItemIndexInfoForEpisode } from '../services/userHistoryItem'
import * as DownloadState from '../state/actions/downloads'
import { clearEpisodesCountForPodcast } from '../state/actions/newEpisodesCount'
import { checkIfNotificationsEnabledForPodcastId } from '../state/actions/notifications'
import { toggleAddByRSSPodcastFeedUrl } from '../state/actions/parser'
import { toggleSubscribeToPodcast } from '../state/actions/podcast'
import { markAsPlayedEpisodesAll, markAsPlayedEpisodesMultiple } from '../state/actions/userHistoryItem'
import { core } from '../styles'
import { checkIfLoggedIn } from '../services/auth'
import { SectionListStickyHeaders } from '../components/SectionListStickyHeaders'

const _fileName = 'src/screens/PodcastScreen.tsx'

type Props = {
  navigation?: any
}

type State = {
  collapsedSectionsData: any
  downloadedEpisodeLimit?: string | null
  endOfResultsReached: boolean
  flatListData: any[]
  flatListDataTotalCount: number | null
  hasInternetConnection: boolean
  hasSeasons: boolean
  isLoading: boolean
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
  searchTitle?: string
  sections: Section[] | null
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
  selectedEpisodes: string[]
  multiSelectEnabled: boolean
}

const testIDPrefix = 'podcast_screen'

const getScreenTitle = () => {
  const { appMode } = getGlobal()
  let screenTitle = translate('Podcast')

  if (appMode === PV.AppMode.video) {
    screenTitle = translate('Channel')
  } else if (appMode === PV.AppMode.music) {
    screenTitle = translate('Album')
  }

  return screenTitle
}

const getSearchPlaceholder = () => {
  return translate('Search podcasts')
}

const getDefaultSelectedFilterLabel = () => {
  const { appMode } = getGlobal()
  let defaultSelectedFilterLabel = translate('Episodes')

  if (appMode === PV.AppMode.video) {
    defaultSelectedFilterLabel = translate('Videos')
  } else if (appMode === PV.AppMode.music) {
    defaultSelectedFilterLabel = translate('Tracks - music')
  }

  return defaultSelectedFilterLabel
}

export class PodcastScreen extends React.Component<Props, State> {
  shouldLoad: boolean
  listRef = null
  listStickyRef = null

  constructor(props: Props) {
    super()

    this.shouldLoad = true
    const podcast = props.navigation.getParam('podcast')

    const podcastId = podcast?.id || podcast?.addByRSSPodcastFeedUrl || props.navigation.getParam('podcastId')
    const notificationsEnabled = checkIfNotificationsEnabledForPodcastId(podcastId)

    if (podcast?.id || podcast?.addByRSSPodcastFeedUrl) {
      props.navigation.setParams({
        podcastId,
        podcastTitle: podcast.title,
        addByRSSPodcastFeedUrl: podcast.addByRSSPodcastFeedUrl,
        notificationsEnabled
      })
    } else if (podcastId) {
      props.navigation.setParams({
        podcastId,
        notificationsEnabled
      })
    }

    const { querySort, viewType } = this.getDefaultFilters(props)

    this.state = {
      collapsedSectionsData: {},
      downloadedEpisodeLimit: null,
      endOfResultsReached: false,
      flatListData: [],
      flatListDataTotalCount: null,
      hasInternetConnection: false,
      hasSeasons: false,
      isLoading: false,
      isLoadingMore: true,
      isRefreshing: false,
      isSubscribing: false,
      limitDownloadedEpisodes: false,
      password: '',
      podcast,
      podcastId,
      queryPage: 1,
      querySort,
      searchBarText: '',
      sections: null,
      selectedFilterLabel: getDefaultSelectedFilterLabel(),
      selectedSortLabel: translate('Recent'),
      showActionSheet: false,
      showSettings: false,
      showUsernameAndPassword: false,
      username: '',
      viewType,
      multiSelectEnabled: false,
      selectedEpisodes: []
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
              navigation={navigation}
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

  getDefaultFilters = (props: Props) => {
    const { navigation } = props
    const savedQuery = navigation.getParam('savedQuery')
    const isSerial = navigation.getParam('isSerial')
    const hasInternetConnection = navigation.getParam('hasInternetConnection')
    const { isInMaintenanceMode } = this.global
    let viewType = PV.Filters._episodesKey
    let querySort = PV.Filters._mostRecentKey
    const viewTypeOverride = navigation.getParam('viewType')
    if (!hasInternetConnection || isInMaintenanceMode) {
      viewType = PV.Filters._downloadedKey
    } else if (viewTypeOverride) {
      viewType = viewTypeOverride
    } else if (savedQuery?.filterType) {
      viewType = savedQuery.filterType
    }
    if (savedQuery?.sortType) {
      querySort = savedQuery.sortType
    } else if (isSerial) {
      querySort = PV.Filters._oldestKey
    }

    return { querySort, viewType }
  }

  async componentDidMount() {
    const { navigation } = this.props
    const { podcastId, querySort, viewType } = this.state

    let podcast = navigation.getParam('podcast')
    const forceRequest = navigation.getParam('forceRequest')
    const addByRSSPodcastFeedUrl = this.props.navigation.getParam('addByRSSPodcastFeedUrl')
    const hasInternetConnection = navigation.getParam('hasInternetConnection')
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    PVEventEmitter.on(PV.Events.PODCAST_START_PODCAST_FROM_TIME_SET, this.refreshStartPodcastFromTime)
    PVEventEmitter.on(PV.Events.SERVER_MAINTENANCE_MODE, this._handleMaintenanceMode)

    // If passed the addByRSSPodcastFeedUrl in the navigation,
    // use the podcast from local storage.
    if (addByRSSPodcastFeedUrl) {
      podcast = await getAddByRSSPodcastLocally(addByRSSPodcastFeedUrl)
    } else if (!hasInternetConnection && podcastId) {
      podcast = await getPodcast(podcastId, forceRequest)
    }

    this.refreshStartPodcastFromTime()

    const selectedFilterLabel = await getSelectedFilterLabel(viewType)
    const selectedSortLabel = await getSelectedSortLabel(querySort)

    this.setState(
      {
        querySort,
        viewType,
        podcast,
        hasInternetConnection: !!hasInternetConnection,
        selectedFilterLabel,
        selectedSortLabel
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
              newState = await this._queryData(this.state.viewType)
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
                // NOTE: contentOffset works for the SectionList version of FlatList,
                // but not with our Flatlist for some reason. As a result I'm only calling
                // scrollToOffset in addition to setting contentOffset.
                // The setTimeout is necessary for some render timing reason...
                setTimeout(() => {
                  this.listRef?.scrollToOffset?.({
                    animated: false,
                    offset: PV.FlatList.ListHeaderHiddenSearchBar.contentOffset.y
                  })
                  this.listStickyRef?.scrollToOffset?.({
                    animated: false,
                    offset: PV.FlatList.ListHeaderHiddenSearchBar.contentOffset.y
                  })
                }, 0)
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
    const { viewType } = this.state

    if (viewType !== PV.Filters._downloadedKey) {
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
    if (this.state?.podcastId && this.state?.querySort) {
      const savedQuery: PodcastScreenSavedQuery = {
        filterType: selectedKey,
        sortType: this.state.querySort
      }
      await updateSavedQueriesPodcastScreen(this.state.podcastId, savedQuery)
    }

    const selectedFilterLabel = await getSelectedFilterLabel(selectedKey)

    this.setState(
      {
        endOfResultsReached: false,
        flatListData: [],
        flatListDataTotalCount: null,
        isLoadingMore: true,
        queryPage: 1,
        searchBarText: '',
        sections: null,
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

    if (this.state?.podcastId && this.state?.viewType) {
      const savedQuery: PodcastScreenSavedQuery = {
        filterType: this.state.viewType,
        sortType: selectedKey
      }
      await updateSavedQueriesPodcastScreen(this.state.podcastId, savedQuery)
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
        sections: null,
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
    const { endOfResultsReached, podcast, queryPage = 1, sections, viewType } = this.state
    
    if (!!sections?.length) return null 

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
    const { searchBarText, viewType, flatListDataTotalCount, sections } = this.state
    const placeholder = getSearchPlaceholder(viewType)
    const shouldShowSearchBar =
      !!(searchBarText
        || (flatListDataTotalCount && flatListDataTotalCount > 3)
        || (sections && sections.length >= 1))

    return (
      <>
        {shouldShowSearchBar && (
          <View style={styles.ListHeaderComponent}>
            <SearchBar
              handleClear={this._handleSearchBarClear}
              hideIcon
              icon='filter'
              onChangeText={this._handleSearchBarTextChange}
              placeholder={placeholder}
              testID={`${testIDPrefix}_filter_bar`}
              value={searchBarText}
            />
          </View>
        )}
      </>
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

  _renderItem = ({ item, index }) => {
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
            if (!this.state.multiSelectEnabled) {
              const { hasInternetConnection } = this.state
              this.props.navigation.navigate(PV.RouteNames.EpisodeScreen, {
                episode,
                podcast,
                addByRSSPodcastFeedUrl: podcast.addByRSSPodcastFeedUrl,
                hasInternetConnection
              })
            } else {
              if (!this.state.selectedEpisodes.includes(episode.id)) {
                this.setState({ selectedEpisodes: [...this.state.selectedEpisodes, episode.id] })
              } else {
                this.setState({
                  selectedEpisodes: this.state.selectedEpisodes.filter((episodeId) => episodeId !== episode.id)
                })
              }
            }
          }}
          hideControls={this.state.multiSelectEnabled}
          hideImage
          item={episode}
          selected={this.state.multiSelectEnabled && this.state.selectedEpisodes.includes(episode.id)}
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
        queryPage: 1,
        sections: null
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
        isLoadingMore: true,
        sections: null
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
            this.setState({ isSubscribing: false, selectedEpisodes: [], multiSelectEnabled: false })
          } catch (error) {
            this.setState({ isSubscribing: false, selectedEpisodes: [], multiSelectEnabled: false })
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

  _onShowMarkMultipleAsPlayed = async () => {
    const { navigation } = this.props
    const { viewType } = this.state

    const shouldShowMarkAsPlayed = await checkIfLoggedIn()

    if (shouldShowMarkAsPlayed) {
      if (viewType !== PV.Filters._episodesKey) {
        await this.handleSelectFilterItem(PV.Filters._episodesKey)
      }
      this.setState({ multiSelectEnabled: true, showSettings: false })
    } else {
      Alert.alert(
        PV.Alerts.LOGIN_TO_MARK_EPISODES_AS_PLAYED.title,
        PV.Alerts.LOGIN_TO_MARK_EPISODES_AS_PLAYED.message,
        PV.Alerts.GO_TO_LOGIN_BUTTONS(navigation)
      )
    }
  }

  _onMarkAsPlayed = async (episodeIds: string[] = []) => {
    const { navigation } = this.props
    const shouldShowMarkAsPlayed = await checkIfLoggedIn()

    if (shouldShowMarkAsPlayed) {
      if (!episodeIds.length) {
        Alert.alert(
          translate('Mark All Episodes As Played'),
          translate('All episodes in this podcast will be marked as played.'),
          [
            {
              text: translate('Confirm'),
              onPress: this.markEpisodesAsPlayed
            },
            {
              text: translate('Cancel'),
              style: 'cancel'
            }
          ]
        )
      } else {
        this.markEpisodesAsPlayed(episodeIds)
      }
    } else {
      Alert.alert(
        PV.Alerts.LOGIN_TO_MARK_EPISODES_AS_PLAYED.title,
        PV.Alerts.LOGIN_TO_MARK_EPISODES_AS_PLAYED.message,
        PV.Alerts.GO_TO_LOGIN_BUTTONS(navigation)
      )
    }
  }

  markEpisodesAsPlayed = async (episodeIds: string[] = []) => {
    const { podcastId } = this.state
    this.setState({ isLoading: true })
    // if episodeIds is empty all must be marked as played
    if (episodeIds.length) {
      await markAsPlayedEpisodesMultiple(episodeIds)
    } else if (podcastId) {
      await markAsPlayedEpisodesAll(podcastId)
    } else {
      Alert.alert(PV.Alerts.SOMETHING_WENT_WRONG.title, PV.Alerts.SOMETHING_WENT_WRONG.message, PV.Alerts.BUTTONS.OK)
      this.setState({ isLoading: false })
      return
    }

    this.setState({
      isLoading: false,
      showSettings: false,
      multiSelectEnabled: false,
      selectedEpisodes: []
    })
  }

  _renderTableInnerHeader = () => {
    const { navigation } = this.props
    const { hasSeasons, querySort, selectedFilterLabel, selectedSortLabel, viewType, multiSelectEnabled } = this.state

    const addByRSSPodcastFeedUrl = navigation.getParam('addByRSSPodcastFeedUrl')

    if (multiSelectEnabled) {
      return (
        <RNView style={styles.multiSelectOptionsContainer}>
          <View style={styles.markSelectedButtonsRow}>
            <PillButton
              testID='podcast_screen_cancel_multi_selection'
              buttonTitle={translate('Cancel')}
              handleOnPress={() => {
                this.setState({ selectedEpisodes: [], multiSelectEnabled: false })
              }}
              destructive
            />
            <PillButton
              testID='podcast_screen_mark_as_played_button'
              buttonTitle={translate('Mark selected')}
              handleOnPress={() => {
                if (!this.state.selectedEpisodes?.length) {
                  Alert.alert('Please select at least one episode to mark as played', '', [{ text: 'OK' }])
                } else {
                  this._onMarkAsPlayed(this.state.selectedEpisodes)
                }
              }}
            />
          </View>
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.sm} style={styles.markSelectedButtonsHelperText}>
            {translate('Select episodes to mark as played')}
          </Text>
        </RNView>
      )
    } else {
      return (
        <TableSectionSelectors
          addByRSSPodcastFeedUrl={addByRSSPodcastFeedUrl}
          filterScreenTitle={getScreenTitle()}
          handleSelectFilterItem={this.handleSelectFilterItem}
          handleSelectSortItem={this.handleSelectSortItem}
          hasSeasons={hasSeasons}
          includePadding
          navigation={navigation}
          screenName='PodcastScreen'
          selectedFilterItemKey={viewType}
          selectedFilterLabel={selectedFilterLabel}
          selectedSortItemKey={querySort}
          selectedSortLabel={selectedSortLabel}
          testID={testIDPrefix}
        />
      )
    }
  }

  _renderSectionHeader = ({ section }, { collapsedSectionsData, globalTheme }) => {
    const sectionIsCollapsed = !!collapsedSectionsData?.[section.seasonKey]

    return (
      <PressableWithOpacity
        onPress={() => {
          this._setSeasonIsCollapsed(section.seasonKey, !sectionIsCollapsed)
        }}>
        <TableSectionSelectors
          disableFilter
          expandedIconColor={globalTheme.headerText.color}
          expandedState={sectionIsCollapsed ? 'collapsed' : 'expanded'}
          hideDropdown
          includePadding
          selectedFilterLabel={section.title}
          showDivider
          textStyle={[globalTheme.headerText, core.seasonSectionHeaderText]}
          viewStyle={[globalTheme.sectionHeaderBackground]}
        />
      </PressableWithOpacity>
    )
  }

  _setSeasonIsCollapsed = (seasonKey: string, shouldCollapse: boolean) => {
    const { collapsedSectionsData, sections } = this.state
    if (shouldCollapse) {
      const section = sections?.find((s: any) => {
        return s.seasonKey === seasonKey
      })
      if (section) {
        collapsedSectionsData[seasonKey] = section.data
        sections?.map((s: any) => {
          if (s.seasonKey === seasonKey) {
            s.data = []
          }
          return s
        })
      }
    } else {
      sections?.map((s: any) => {
        if (s.seasonKey === seasonKey) {
          s.data = collapsedSectionsData[seasonKey] || []
        }
        return s
      })
      delete collapsedSectionsData[seasonKey]
    }

    this.setState({ collapsedSectionsData, sections })
  }

  render() {
    const { navigation } = this.props

    const {
      collapsedSectionsData,
      downloadedEpisodeLimit,
      hasSeasons,
      isLoading,
      isLoadingMore,
      isRefreshing,
      isSubscribing,
      limitDownloadedEpisodes,
      password,
      podcast,
      podcastId,
      sections,
      selectedItem,
      showActionSheet,
      showNoInternetConnectionMessage,
      showSettings,
      showUsernameAndPassword,
      startPodcastFromTime,
      username,
      viewType,
      flatListData,
      flatListDataTotalCount
    } = this.state
    const { globalTheme } = this.global
    const subscribedPodcastIds = safelyUnwrapNestedVariable(() => this.global.session.userInfo.subscribedPodcastIds, [])
    const addByRSSPodcastFeedUrl = this.props.navigation.getParam('addByRSSPodcastFeedUrl')

    let isSubscribed = subscribedPodcastIds.some((x: string) => x === podcastId)
    if (!isSubscribed) {
      const subscribedPodcasts = safelyUnwrapNestedVariable(() => this.global.subscribedPodcasts, [])
      isSubscribed = subscribedPodcasts.some(
        (x: any) => x.addByRSSPodcastFeedUrl && x.addByRSSPodcastFeedUrl === podcastId
      )
    }

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

    const disableNoResultsMessage = isLoadingMore || !!sections?.length

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
          this._renderTableInnerHeader()
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
            {!addByRSSPodcastFeedUrl && (
              <>
                <Button
                  accessibilityLabel={translate('Select Multiple Episodes')}
                  onPress={this._onShowMarkMultipleAsPlayed}
                  wrapperStyles={styles.settingsMarkEpisodesAsPlayed}
                  testID={`${testIDPrefix}_mark_selected_episodes_as_played`}
                  text={translate('Select Multiple Episodes')}
                />
                <Button
                  accessibilityLabel={translate('Mark All Episodes As Played')}
                  onPress={this._onMarkAsPlayed}
                  wrapperStyles={styles.settingsMarkEpisodesAsPlayed}
                  testID={`${testIDPrefix}_mars_all_episodes_played`}
                  text={translate('Mark All Episodes As Played')}
                />
              </>
            )}
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
            {flatListData && podcast && !hasSeasons && (
              <FlatList
                contentOffset={{
                  x: 0,
                  y: PV.FlatList.ListHeaderHiddenSearchBar.contentOffset.y
                }}
                data={flatListData}
                dataTotalCount={flatListDataTotalCount}
                disableNoResultsMessage={disableNoResultsMessage}
                extraData={flatListData}
                isLoadingMore={isLoadingMore}
                isRefreshing={isRefreshing}
                keyExtractor={(item: any, index: number) =>
                  safeKeyExtractor(testIDPrefix, index, item?.id, !!item?.addedByRSS)
                }
                ListHeaderComponent={this._ListHeaderComponent}
                listRef={(ref) => (this.listRef = ref)}
                noResultsMessage={noResultsMessage}
                onEndReached={this._onEndReached}
                renderItem={this._renderItem}
                renderSectionHeader={(obj) => this._renderSectionHeader(obj, { collapsedSectionsData, globalTheme })}
                sections={sections}
                showNoInternetConnectionMessage={showNoInternetConnectionMessage}
                // stickySectionHeadersEnabled
              />
            )}
            {flatListData && podcast && hasSeasons && (
              <SectionListStickyHeaders
                contentOffset={{
                  x: 0,
                  y: PV.FlatList.ListHeaderHiddenSearchBar.contentOffset.y
                }}
                disableNoResultsMessage={disableNoResultsMessage}
                globalTheme={globalTheme}
                isLoadingMore={isLoadingMore}
                keyExtractor={(item: any, index: number) =>
                  safeKeyExtractor(testIDPrefix, index, item?.id, !!item?.addedByRSS)
                }
                ListHeaderComponent={this._ListHeaderComponent}
                listRef={(ref) => (this.listStickyRef = ref)}
                noResultsMessage={noResultsMessage}
                renderItem={this._renderItem}
                renderSectionHeader={(obj) => this._renderSectionHeader(obj, { collapsedSectionsData, globalTheme })}
                sections={sections || []}
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
        {isLoading && (
          <ActivityIndicator
            fillSpace
            isOverlay
            loadingMessage={translate('Mark as played loading text')}
            testID={testIDPrefix}
            transparent={false}
          />
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

      const extraParams = {}
      return [[downloadedEpisodes, downloadedEpisodes.length], extraParams]
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

      const { combinedEpisodes, hasSeasons, isSerial } = results
      const extraParams = {
        hasSeasons,
        isSerial
      }

      return [combinedEpisodes, extraParams]
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

  _handleSeasonOrSerialPodcastEpisodes = async (
    data: any[], querySort: string | null, newState: State,
    extraParams: any) => {
    
    const { hasSeasons, querySort: newQuerySort, seasonSections } = getSeasonOrSerialEpisodesData({
      data,
      querySort,
      extraParams,
      translator: translate,
      _oldestKey: PV.Filters._oldestKey,
      _mostRecentKey: PV.Filters._mostRecentKey
    })

    if (hasSeasons) {
      newState.hasSeasons = hasSeasons
      newState.sections = seasonSections
      newState.selectedSortLabel = await getSelectedSortLabel(newQuerySort)
      newState.flatListData = []
      newState.flatListDataTotalCount = 0
      newState.collapsedSectionsData = {}
    }

    newState.querySort = newQuerySort
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
        const episodes = results[0]?.[0]
        const episodesCount = results[0]?.[1]
        const extraParams = results[1]
        await this._handleSeasonOrSerialPodcastEpisodes(episodes, querySort, newState, extraParams)
        newState.flatListData = [...flatListData, ...episodes]
        newState.flatListData = this.cleanFlatListData(newState.flatListData, filterKey)
        newState.endOfResultsReached = newState.flatListData.length >= extraParams
        newState.flatListDataTotalCount = episodesCount
      } else if (filterKey === PV.Filters._clipsKey) {
        const results = await this._queryClips(querySort, queryOptions.queryPage)
        newState.flatListData = [...flatListData, ...results[0]]
        newState.flatListData = this.cleanFlatListData(newState.flatListData, filterKey)
        newState.endOfResultsReached = newState.flatListData.length >= results[1]
        newState.flatListDataTotalCount = results[1]
      } else if (PV.FilterOptions.screenFilters.PodcastScreen.sort.some((option) => option === filterKey)) {
        let data = []
        let dataCount = 0

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
          const results = await this._queryEpisodes(viewType, filterKey)
          data = results[0]?.[0]
          dataCount = results[0]?.[1]
          const extraParams = results[1]
          await this._handleSeasonOrSerialPodcastEpisodes(data, querySort, newState, extraParams)
        } else if (viewType === PV.Filters._clipsKey) {
          const results = await this._queryClips(querySort)
          data = results[0]
          dataCount = results[1]
        }

        newState.flatListData = [...flatListData, ...data]
        newState.flatListData = this.cleanFlatListData(newState.flatListData, viewType)
        newState.endOfResultsReached = newState.flatListData.length >= dataCount
        newState.flatListDataTotalCount = dataCount
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
    const { podcast, searchBarText } = this.state

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

    const trimmedSearchBarText = searchBarText?.trim() || ''
    if (trimmedSearchBarText) {
      const finalSearchText = trimmedSearchBarText.toLowerCase()
      const pattern = new RegExp(`${finalSearchText}*`, 'g')
      addByRSSEpisodes = addByRSSEpisodes.filter((episode: Episode) => {
        const lowerCaseTitle = episode?.title?.toLowerCase() || ''
        return pattern.test(lowerCaseTitle)
      })
    }

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
  dropdownButtonIcon: {
    flex: 1,
    fontSize: PV.Fonts.sizes.xxl,
    paddingHorizontal: 16
  },
  itemWrapper: {
    marginTop: 32
  },
  markSelectedButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly'
  },
  markSelectedButtonsHelperText: {
    marginBottom: 2,
    marginTop: 10,
    textAlign: 'center',
    fontSize: PV.Fonts.sizes.tiny
  },
  multiSelectOptionsContainer: {
    flexDirection: 'column',
    paddingVertical: 12
  },
  settingsClearNewEpisodeIndicators: {
    marginBottom: 20,
    marginHorizontal: 8,
    marginTop: 8,
    borderRadius: 8
  },
  settingsMarkEpisodesAsPlayed: {
    marginBottom: 20,
    marginHorizontal: 8,
    marginTop: 8,
    borderRadius: 8
  },
  settingsDeletebutton: {
    marginBottom: 50,
    marginTop: 8,
    marginHorizontal: 8,
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
    marginTop: -60,
    paddingTop: 75
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
