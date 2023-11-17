import {
  convertNowPlayingItemToEpisode,
  convertToNowPlayingItem,
  getAuthorityFeedUrlFromArray,
  getUsernameAndPasswordFromCredentials
} from 'podverse-shared'
import { Alert, StyleSheet, View as RNView } from 'react-native'
import { Config } from 'react-native-config'
import { NavigationStackOptions } from 'react-navigation-stack'
import React, { getGlobal } from 'reactn'
import {
  ActionSheet,
  AlbumTableHeader,
  Button,
  FlatList,
  NavFundingIcon,
  NavShareIcon,
  ScrollView,
  SwitchWithText,
  TableSectionSelectors,
  Text,
  TrackTableCell,
  View
} from '../components'
import { errorLogger } from '../lib/logger'
import { removeDownloadedPodcast } from '../lib/downloadedPodcast'
import { downloadEpisode } from '../lib/downloader'
import { getSelectedFilterLabel } from '../lib/filters'
import { translate } from '../lib/i18n'
import { alertIfNoNetworkConnection, hasValidNetworkConnection } from '../lib/network'
import { safeKeyExtractor, safelyUnwrapNestedVariable } from '../lib/utility'
import { PV } from '../resources'
import PVEventEmitter from '../services/eventEmitter'
import { getEpisodesAndLiveItems } from '../services/liveItem'
import {
  getPodcastCredentials,
  getAddByRSSPodcastLocally,
  removePodcastCredentials,
  savePodcastCredentials
} from '../services/parser'
import { getPodcast } from '../services/podcast'
import { getTrackingIdText, trackPageView } from '../services/tracking'
import * as DownloadState from '../state/actions/downloads'
import { toggleAddByRSSPodcastFeedUrl } from '../state/actions/parser'
import { playerLoadNowPlayingItem } from '../state/actions/player'
import { toggleSubscribeToPodcast } from '../state/actions/podcast'
import { core } from '../styles'

const _fileName = 'src/screens/AlbumScreen.tsx'

type Props = {
  navigation?: any
}

type State = {
  endOfResultsReached: boolean
  flatListData: any[]
  flatListDataTotalCount: number | null
  hasInternetConnection: boolean
  isLoading: boolean
  isLoadingMore: boolean
  isRefreshing: boolean
  isSubscribing: boolean
  password: string
  podcast?: any
  podcastId?: string
  queryPage: number
  sections: Section[] | null
  selectedFilterLabel?: string | null
  selectedItem?: any
  showActionSheet: boolean
  showNoInternetConnectionMessage?: boolean
  showSettings: boolean
  showUsernameAndPassword: boolean
  username: string
  viewType: string | null
}

const testIDPrefix = 'album_screen'

const getScreenTitle = () => {
  const screenTitle = translate('Music - Album')
  return screenTitle
}

const getDefaultSelectedFilterLabel = () => {
  const defaultSelectedFilterLabel = translate('Music - Tracks')
  return defaultSelectedFilterLabel
}

export class AlbumScreen extends React.Component<Props, State> {
  shouldLoad: boolean
  listRef = null
  listStickyRef = null

  constructor(props: Props) {
    super()

    this.shouldLoad = true
    const podcast = props.navigation.getParam('podcast')

    const podcastId = podcast?.id || podcast?.addByRSSPodcastFeedUrl || props.navigation.getParam('podcastId')

    if (podcast?.id || podcast?.addByRSSPodcastFeedUrl) {
      props.navigation.setParams({
        podcastId,
        podcastTitle: podcast.title,
        addByRSSPodcastFeedUrl: podcast.addByRSSPodcastFeedUrl
      })
    } else if (podcastId) {
      props.navigation.setParams({
        podcastId
      })
    }

    const { viewType } = this.getDefaultFilters(props)

    this.state = {
      endOfResultsReached: false,
      flatListData: [],
      flatListDataTotalCount: null,
      hasInternetConnection: false,
      isLoading: false,
      isLoadingMore: true,
      isRefreshing: false,
      isSubscribing: false,
      password: '',
      podcast,
      podcastId,
      queryPage: 1,
      sections: null,
      selectedFilterLabel: getDefaultSelectedFilterLabel(),
      showActionSheet: false,
      showSettings: false,
      showUsernameAndPassword: false,
      username: '',
      viewType
    }
  }

  static navigationOptions = ({ navigation }) => {
    const podcastId = navigation.getParam('podcastId')
    const podcastTitle = navigation.getParam('podcastTitle')
    const podcast = navigation.getParam('podcast')
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
            <NavShareIcon podcastTitle={podcastTitle} urlId={podcastId} urlPath={PV.URLs.webPaths.podcast} />
          )}
          {!!addByRSSPodcastFeedUrl && podcast?.linkUrl && (
            <NavShareIcon
              customUrl={podcast.linkUrl}
              endingText={translate('shared using brandName')}
              podcastTitle={podcastTitle}
            />
          )}
        </RNView>
      )
    } as NavigationStackOptions
  }

  getDefaultFilters = (props: Props) => {
    const { navigation } = props
    const hasInternetConnection = navigation.getParam('hasInternetConnection')
    const { isInMaintenanceMode } = this.global
    let viewType = PV.Filters._tracksKey
    const viewTypeOverride = navigation.getParam('viewType')
    if (!hasInternetConnection || isInMaintenanceMode) {
      viewType = PV.Filters._downloadedKey
    } else if (viewTypeOverride) {
      viewType = viewTypeOverride
    }

    return { viewType }
  }

  async componentDidMount() {
    const { navigation } = this.props
    const { podcastId, viewType } = this.state

    let podcast = navigation.getParam('podcast')
    const forceRequest = navigation.getParam('forceRequest')
    const addByRSSPodcastFeedUrl = this.props.navigation.getParam('addByRSSPodcastFeedUrl')
    const hasInternetConnection = navigation.getParam('hasInternetConnection')
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    PVEventEmitter.on(PV.Events.SERVER_MAINTENANCE_MODE, this._handleMaintenanceMode)

    // If passed the addByRSSPodcastFeedUrl in the navigation,
    // use the podcast from local storage.
    if (addByRSSPodcastFeedUrl) {
      podcast = await getAddByRSSPodcastLocally(addByRSSPodcastFeedUrl)
    } else if (!hasInternetConnection && podcastId) {
      podcast = await getPodcast(podcastId, forceRequest)
    }

    const selectedFilterLabel = await getSelectedFilterLabel(viewType)

    this.setState(
      {
        viewType,
        podcast,
        hasInternetConnection: !!hasInternetConnection,
        selectedFilterLabel
      },
      () => {
        this._initializePageData()

        const titleToEncode = podcast ? podcast.title : translate('no info available')
        trackPageView(
          '/album/' + getTrackingIdText(podcastId, !!addByRSSPodcastFeedUrl),
          'Album Screen - ',
          titleToEncode
        )
      }
    )
  }

  _initializePageData() {
    const { navigation } = this.props
    const { podcast, viewType } = this.state
    const podcastId = navigation.getParam('podcastId') || this.state.podcastId

    this.setState(
      {
        endOfResultsReached: false,
        flatListData: [],
        flatListDataTotalCount: null,
        isLoadingMore: true,
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

            this.setState(
              {
                ...newState,
                isLoadingMore: false,
                podcast: newPodcast
              },
              () => {
                this._updateCredentialsState()
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
    const { podcast, viewType } = this.state

    const episode = {
      ...item,
      podcast
    }

    let testId = ''
    if (viewType === PV.Filters._downloadedKey) {
      testId = `${testIDPrefix}_track_downloaded_item_${index}`
    } else if (viewType === PV.Filters._tracksKey) {
      testId = `${testIDPrefix}_track_item_${index}`
    }

    const userPlaybackPosition = 0
    const newNowPlayingItem = convertToNowPlayingItem(item, null, podcast, userPlaybackPosition)

    return (
      <TrackTableCell
        episode={episode}
        handleMorePress={() =>
          this._handleMorePress(newNowPlayingItem)
        }
        handlePlayPress={async () => {
          await playerLoadNowPlayingItem(newNowPlayingItem, {
            forceUpdateOrderDate: false,
            setCurrentItemNextInQueue: true,
            shouldPlay: true
          })    
        }}
        hideImage={false}
        testID={testId}
      />
    )
  }

  _handleDeleteEpisode = async (item: any) => {
    const selectedId = item?.episodeId || item?.id
    if (selectedId) {
      await DownloadState.removeDownloadedPodcastEpisode(selectedId)
    }
  }

  _handleToggleDeleteDownloadedEpisodesDialog = () => {
    const DOWNLOADED_EPISODES_DELETE = PV.Alerts.DOWNLOADED_EPISODES_DELETE(
      this._handleDeleteDownloadedEpisodesForThisPodcast)
    Alert.alert(
      DOWNLOADED_EPISODES_DELETE.title,
      DOWNLOADED_EPISODES_DELETE.message,
      DOWNLOADED_EPISODES_DELETE.buttons
    )
  }

  _handleDeleteDownloadedEpisodesForThisPodcast = async () => {
    const { podcast, podcastId } = this.state
    const id = podcast?.id || podcastId
    try {
      await removeDownloadedPodcast(id)
    } catch (error) {
      //
    }
    DownloadState.updateDownloadedPodcasts()
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
        })()
      })
    }
  }

  _handleToggleSettings = () => {
    this.setState({ showSettings: !this.state.showSettings })
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

  _renderTableInnerHeader = () => {
    const { navigation } = this.props
    const { selectedFilterLabel, viewType } = this.state
    const addByRSSPodcastFeedUrl = navigation.getParam('addByRSSPodcastFeedUrl')

    return (
      <TableSectionSelectors
        addByRSSPodcastFeedUrl={addByRSSPodcastFeedUrl}
        filterScreenTitle={getScreenTitle()}
        hideDropdown
        includePadding
        navigation={navigation}
        screenName='AlbumScreen'
        selectedFilterItemKey={viewType}
        selectedFilterLabel={selectedFilterLabel}
        testID={testIDPrefix}
      />
    )
  }

  render() {
    const { navigation } = this.props

    const {
      isLoadingMore,
      isRefreshing,
      isSubscribing,
      password,
      podcast,
      podcastId,
      sections,
      selectedItem,
      showActionSheet,
      showNoInternetConnectionMessage,
      showSettings,
      showUsernameAndPassword,
      username,
      flatListData,
      flatListDataTotalCount
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

    const noResultsMessage = translate('No music tracks found')
    const disableNoResultsMessage = isLoadingMore || !!sections?.length

    return (
      <View style={styles.headerView} testID={`${testIDPrefix}_view`}>
        <AlbumTableHeader
          addByRSSPodcastFeedUrl={addByRSSPodcastFeedUrl}
          authors={podcast?.authors}
          description={podcast && podcast.description}
          episodes={flatListData}
          handleNavigateToPodcastInfoScreen={this._handleNavigateToPodcastInfoScreen}
          handleToggleSettings={this._handleToggleSettings}
          handleToggleSubscribe={this._toggleSubscribeToPodcast}
          isLoading={isLoadingMore && !podcast}
          isNotFound={!isLoadingMore && !podcast}
          isSubscribed={isSubscribed}
          isSubscribing={isSubscribing}
          podcast={podcast}
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
                disableNoResultsMessage={disableNoResultsMessage}
                extraData={flatListData}
                isLoadingMore={isLoadingMore}
                isRefreshing={isRefreshing}
                keyExtractor={(item: any, index: number) =>
                  safeKeyExtractor(testIDPrefix, index, item?.id, !!item?.addedByRSS)
                }
                listRef={(ref) => (this.listRef = ref)}
                noResultsMessage={noResultsMessage}
                renderItem={this._renderItem}
                sections={sections}
                showNoInternetConnectionMessage={showNoInternetConnectionMessage}
                // stickySectionHeadersEnabled
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
                    handleDownload: () => this._handleDownloadPressed(convertNowPlayingItemToEpisode(selectedItem))
                  },
                  'track'
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

  _queryEpisodes = async (viewType: string, page = 1) => {
    const { podcast, podcastId } = this.state

    if (podcast?.addByRSSPodcastFeedUrl) {
      const { addByRSSEpisodes, addByRSSEpisodesCount } = this._queryAddByRSSEpisodes(viewType)
      return [addByRSSEpisodes, addByRSSEpisodesCount]
    } else if (viewType === PV.Filters._downloadedKey) {
      let downloadedEpisodes = this._filterDownloadedEpisodes()

      downloadedEpisodes = [...downloadedEpisodes].sort(function(a, b) {
        return b.itunesEpisode - a.itunesEpisode
      })

      const extraParams = {}
      return [[downloadedEpisodes, downloadedEpisodes.length], extraParams]
    } else {
      const results = await getEpisodesAndLiveItems(
        {
          sort: PV.Filters._episodeNumberAscKey,
          page,
          podcastId,
          maxResults: true
        },
        podcastId
      )

      const { combinedEpisodes } = results
      const extraParams = {}

      return [combinedEpisodes, extraParams]
    }
  }

  _queryData = async (filterKey: string | null, queryOptions: { queryPage?: number } = {}) => {
    const { flatListData, podcast, viewType } = this.state
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
          filterKey === PV.Filters._tracksKey) &&
        podcast &&
        podcast.addByRSSPodcastFeedUrl
      ) {
        const { addByRSSEpisodes, addByRSSEpisodesCount } = this._queryAddByRSSEpisodes(filterKey)
        newState.flatListData = addByRSSEpisodes || []
        newState.flatListDataTotalCount = addByRSSEpisodesCount
      } else if (
        !podcast?.addByRSSPodcastFeedUrl &&
        (filterKey === PV.Filters._downloadedKey ||
          filterKey === PV.Filters._tracksKey)
      ) {
        const results = await this._queryEpisodes(filterKey, queryOptions.queryPage)
        const episodes = results[0]?.[0]
        const episodesCount = results[0]?.[1]
        const extraParams = results[1]
        newState.flatListData = [...flatListData, ...episodes]
        newState.flatListData = this.cleanFlatListData(newState.flatListData, filterKey)
        newState.endOfResultsReached = newState.flatListData.length >= extraParams
        newState.flatListDataTotalCount = episodesCount
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
    if (viewTypeKey === PV.Filters._tracksKey) {
      return flatListData?.filter((item: any) => !!item?.id) || []
    } else {
      return flatListData
    }
  }

  _queryAddByRSSEpisodes = (viewType: string) => {
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


    addByRSSEpisodes = [...addByRSSEpisodes].sort(function(a, b) {
      return b.itunesEpisode - a.itunesEpisode
    })

    const addByRSSEpisodesCount = addByRSSEpisodes.length

    return {
      addByRSSEpisodes,
      addByRSSEpisodesCount
    }
  }
}

const styles = StyleSheet.create({
  divider: {
    marginBottom: 24,
    marginTop: 32
  },
  settingsDeletebutton: {
    marginBottom: 50,
    marginTop: 8,
    marginHorizontal: 8,
    borderRadius: 8
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
  switchWrapper: {
    marginBottom: 12,
    marginTop: 28
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
