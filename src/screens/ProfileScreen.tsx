import { convertNowPlayingItemToEpisode, convertToNowPlayingItem } from 'podverse-shared'
import { Alert, StyleSheet, View as RNView } from 'react-native'
import Dialog from 'react-native-dialog'
import { NavigationStackOptions } from 'react-navigation-stack'
import React, { setGlobal } from 'reactn'
import {
  ActionSheet,
  ActivityIndicator,
  ClipTableCell,
  Divider,
  FlatList,
  MessageWithAction,
  NavSearchIcon,
  NavShareIcon,
  PlaylistTableCell,
  PodcastTableCell,
  ProfileTableHeader,
  TableSectionSelectors,
  View
} from '../components'
import { downloadEpisode } from '../lib/downloader'
import { getDefaultSortForFilter, getSelectedFilterLabel, getSelectedSortLabel } from '../lib/filters'
import { translate } from '../lib/i18n'
import { navigateToPodcastScreenWithPodcast } from '../lib/navigate'
import { alertIfNoNetworkConnection, hasValidNetworkConnection } from '../lib/network'
import { isOdd, safelyUnwrapNestedVariable } from '../lib/utility'
import { PV } from '../resources'
import { deleteMediaRef } from '../services/mediaRef'
import { getPodcasts } from '../services/podcast'
import { trackPageView } from '../services/tracking'
import {
  getLoggedInUserMediaRefs,
  getLoggedInUserPlaylists,
  getUserMediaRefs,
  getUserPlaylists
} from '../services/user'
import { getAuthUserInfo } from '../state/actions/auth'
import { loadItemAndPlayTrack } from '../state/actions/player'
import { getPublicUser, toggleSubscribeToUser } from '../state/actions/user'
import { core } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  endOfResultsReached: boolean
  flatListData: any[]
  flatListDataTotalCount: number | null
  initializeClips: boolean
  isLoading: boolean
  isLoadingMore: boolean
  isSubscribed: boolean
  isSubscribing: boolean
  preventSortQuery?: boolean
  queryPage: number
  querySort?: string | null
  selectedFilterLabel?: string | null
  selectedSortLabel?: string | null
  selectedItem?: any
  showActionSheet: boolean
  showDeleteConfirmDialog?: boolean
  showNoInternetConnectionMessage?: boolean
  userId?: string
  viewType: string | null
}

const testIDPrefix = 'profile_screen'

export class ProfileScreen extends React.Component<Props, State> {
  shouldLoad: boolean

  constructor(props: Props) {
    super(props)
    this.shouldLoad = true

    const id = safelyUnwrapNestedVariable(() => this.global.session.userInfo.id, '')
    const subscribedUserIds = safelyUnwrapNestedVariable(() => this.global.session.userInfo.subscribedUserIds, [])
    const user = this.props.navigation.getParam('user')
    const userId = (user && user.id) || this.props.navigation.getParam('userId')
    const isLoggedInUserProfile = userId === id
    const isSubscribed = subscribedUserIds.some((x: string) => x === userId)
    const initializeClips = this.props.navigation.getParam('initializeClips')

    if (user && user.id) {
      this.props.navigation.setParams({
        userId: user.id,
        userIsPublic: user.isPublic,
        userName: user.name
      })
    }

    this.state = {
      endOfResultsReached: false,
      flatListData: [],
      flatListDataTotalCount: null,
      initializeClips,
      isLoading: true,
      isLoadingMore: false,
      isSubscribed,
      isSubscribing: false,
      queryPage: 1,
      querySort: initializeClips ? PV.Filters._mostRecentKey : PV.Filters._alphabeticalKey,
      selectedFilterLabel: initializeClips ? translate('Clips') : translate('Podcasts'),
      selectedSortLabel: initializeClips ? translate('recent') : translate('A-Z'),
      showActionSheet: false,
      userId,
      viewType: initializeClips ? PV.Filters._clipsKey : PV.Filters._podcastsKey
    }

    setGlobal({
      profile: {
        ...(isLoggedInUserProfile ? { user: this.global.session.userInfo } : { user })
      }
    })
  }

  static navigationOptions = ({ navigation }) => {
    const userId = navigation.getParam('userId')
    const userIsPublic = navigation.getParam('userIsPublic')
    const userName = navigation.getParam('userName')
    const isMyProfile = navigation.getParam('isMyProfile')

    return {
      title: isMyProfile ? translate('My Profile') : translate('Profile'),
      headerRight: () => (
        <RNView style={core.row}>
          {userIsPublic && userId && (
            <NavShareIcon profileName={userName} urlId={userId} urlPath={PV.URLs.webPaths.profile} />
          )}
          <NavSearchIcon navigation={navigation} />
        </RNView>
      )
    } as NavigationStackOptions
  }

  componentDidMount() {
    const { userId } = this.state
    this._initializeScreenData()
    const idPath = userId ? userId : 'user-not-logged-in'
    trackPageView('/profile/' + idPath, 'Profile Screen')
  }

  async _initializeScreenData() {
    const userId = this.props.navigation.getParam('userId') || this.state.userId
    const { viewType } = this.state

    const hasInternetConnection = await hasValidNetworkConnection()
    if (!hasInternetConnection) {
      this.setState({
        endOfResultsReached: false,
        flatListData: [],
        flatListDataTotalCount: null,
        isLoading: false,
        showNoInternetConnectionMessage: true,
        userId
      })
      return
    }

    this.setState(
      {
        endOfResultsReached: false,
        flatListData: [],
        flatListDataTotalCount: null,
        isLoading: true,
        showNoInternetConnectionMessage: false,
        userId
      },
      () => {
        (async () => {
          const { id } = this.global.session.userInfo
          const isLoggedInUserProfile = userId === id
          let newState = {} as any
  
          if (isLoggedInUserProfile) {
            newState = {
              isLoading: false,
              isLoadingMore: false,
              queryPage: 1
            } as State
  
            try {
              await getAuthUserInfo()
              setGlobal(
                {
                  profile: {
                    ...this.global.profile,
                    user: this.global.session.userInfo
                  }
                },
                async () => {
                  newState = await this._queryData(viewType, 1)
                  this.setState(newState)
                }
              )
            } catch (error) {
              this.setState(newState)
            }
          } else {
            newState = {
              isLoading: false,
              isLoadingMore: false,
              queryPage: 1
            } as State
  
            try {
              const { profileFlatListData } = await getPublicUser(userId)
              newState.flatListData = profileFlatListData
              newState = await this._queryData(viewType, 1)
            } catch (error) {
              //
            }
            this.setState(newState)
          }
        })()
      }
    )
  }

  handleSelectFilterItem = async (selectedKey: string) => {
    if (!selectedKey) return

    const { querySort } = this.state
    const sort = getDefaultSortForFilter({
      screenName: PV.RouteNames.ProfileScreen,
      selectedFilterItemKey: selectedKey,
      selectedSortItemKey: querySort
    })

    const selectedFilterLabel = await getSelectedFilterLabel(selectedKey)
    const selectedSortLabel = getSelectedSortLabel(sort)

    this.setState(
      {
        endOfResultsReached: false,
        flatListData: [],
        flatListDataTotalCount: null,
        isLoading: true,
        preventSortQuery: true,
        viewType: selectedKey,
        queryPage: 1,
        querySort: sort,
        selectedFilterLabel,
        selectedSortLabel
      },
      () => {
        (async () => {
          const newState = await this._queryData(selectedKey, 1)
          newState.preventSortQuery = false
          this.setState(newState)
        })()
      }
    )
  }

  handleSelectSortItem = (selectedKey: string) => {
    if (this.state.preventSortQuery) {
      this.setState({ preventSortQuery: false })
      return
    }

    if (!selectedKey) return

    const selectedSortLabel = getSelectedSortLabel(selectedKey)

    this.setState(
      {
        endOfResultsReached: false,
        flatListData: [],
        flatListDataTotalCount: null,
        isLoading: true,
        queryPage: 1,
        querySort: selectedKey,
        selectedSortLabel
      },
      () => {
        (async () => {
          const newState = await this._queryData(selectedKey, 1)
          this.setState(newState)
        })()
      }
    )
  }

  _onEndReached = ({ distanceFromEnd }) => {
    const { endOfResultsReached, queryPage = 1, viewType } = this.state
    if (!endOfResultsReached && this.shouldLoad) {
      if (distanceFromEnd > -1) {
        this.shouldLoad = false

        this.setState(
          {
            isLoadingMore: true
          },
          () => {
            (async () => {
              const newState = await this._queryData(viewType, queryPage + 1)
              this.setState(newState)
            })()
          }
        )
      }
    }
  }

  _ItemSeparatorComponent = () => <Divider />

  _handlePodcastPress = (podcast: any) => {
    const { navigation } = this.props
    navigateToPodcastScreenWithPodcast(navigation, podcast)
  }

  _handlePlaylistPress = (playlist: any) => {
    this.props.navigation.navigate(PV.RouteNames.PlaylistScreen, {
      playlist
    })
  }

  _handleCancelPress = () => new Promise((resolve) => {
    this.setState({ showActionSheet: false }, resolve)
  })

  _handleMorePress = (selectedItem: any) => {
    this.setState({
      selectedItem,
      showActionSheet: true
    })
  }

  _handleEditPress = () => {
    const { user } = this.global.profile
    this.props.navigation.navigate(PV.RouteNames.EditProfileScreen, { user })
  }

  _handleToggleSubscribe = async (id: string) => {
    const wasAlerted = await alertIfNoNetworkConnection(translate('subscribe to profile'))
    if (wasAlerted) return

    this.setState({ isSubscribing: true }, () => {
      (async () => {
        try {
          await toggleSubscribeToUser(id)
          const subscribedUserIds = safelyUnwrapNestedVariable(() => this.global.session.userInfo.subscribedUserIds, [])
          const isSubscribed = subscribedUserIds.some((x: string) => x === id)
  
          this.setState({
            isSubscribed,
            isSubscribing: false
          })
        } catch (error) {
          this.setState({ isSubscribing: false })
        }
      })()
    })
  }

  _handleDownloadPressed = () => {
    if (this.state.selectedItem) {
      const episode = convertNowPlayingItemToEpisode(this.state.selectedItem)
      downloadEpisode(episode, episode.podcast)
    }
  }

  _showDeleteConfirmDialog = () => {
    this.setState({ showDeleteConfirmDialog: true })
  }

  _deleteMediaRef = () => {
    const { selectedItem } = this.state
    let { flatListData, flatListDataTotalCount } = this.state

    if (selectedItem && selectedItem.clipId) {
      this.setState(
        {
          isLoading: true,
          showDeleteConfirmDialog: false
        },
        () => {
          (async () => {
            try {
              await deleteMediaRef(selectedItem.clipId)
              flatListData = flatListData.filter((x: any) => x.id !== selectedItem.clipId)
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

  _cancelDeleteMediaRef = () => {
    this.setState({
      showDeleteConfirmDialog: false
    })
  }

  _handleNavigationPress = async (selectedItem: any) => {
    const shouldPlay = true
    const forceUpdateOrderDate = false
    const setCurrentItemNextInQueue = true
    await loadItemAndPlayTrack(selectedItem, shouldPlay, forceUpdateOrderDate, setCurrentItemNextInQueue)
  }

  _renderItem = ({ item, index }) => {
    const { viewType } = this.state

    if (viewType === PV.Filters._podcastsKey) {
      return (
        <PodcastTableCell
          hasZebraStripe={isOdd(index)}
          id={item.id}
          lastEpisodePubDate={item.lastEpisodePubDate}
          onPress={() => this._handlePodcastPress(item)}
          podcastImageUrl={item.shrunkImageUrl || item.imageUrl}
          {...(item.title ? { podcastTitle: item.title } : {})}
          testID={`${testIDPrefix}_podcast_item_${index}`}
        />
      )
    } else if (viewType === PV.Filters._clipsKey) {
      const episode = item?.episode
      return episode?.id && episode?.podcast ? (
        <ClipTableCell
          handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(item, null, null))}
          showEpisodeInfo
          showPodcastInfo
          testID={`${testIDPrefix}_clip_item_${index}`}
          item={item}
        />
      ) : (
        <></>
      )
    } else {
      return (
        <PlaylistTableCell
          hasZebraStripe={isOdd(index)}
          itemCount={item.itemCount}
          onPress={() => this._handlePlaylistPress(item)}
          testID={`${testIDPrefix}_profile_item_${index}`}
          title={item.title}
        />
      )
    }
  }

  _onPressLogin = () => this.props.navigation.navigate(PV.RouteNames.AuthScreen)

  render() {
    const {
      flatListData,
      flatListDataTotalCount,
      initializeClips,
      isLoading,
      isLoadingMore,
      isSubscribed,
      isSubscribing,
      querySort,
      selectedFilterLabel,
      selectedSortLabel,
      selectedItem,
      showActionSheet,
      showDeleteConfirmDialog,
      showNoInternetConnectionMessage,
      userId,
      viewType
    } = this.state

    const { offlineModeEnabled, profile, session } = this.global
    const { user } = profile
    const { isLoggedIn, userInfo } = session
    const { id } = userInfo
    const { navigation } = this.props
    const isLoggedInUserProfile = userId && id && userId === id

    let noResultsMessage = translate('No podcasts found')
    if (viewType === PV.Filters._clipsKey) {
      noResultsMessage = translate('No clips found')
    } else if (viewType === PV.Filters._playlistsKey) {
      noResultsMessage = translate('No playlists found')
    }

    const isMyProfile = navigation.getParam('isMyProfile')
    const loginMessage = initializeClips
      ? translate('Login to view your clips')
      : translate('Login to view your profile')

    const showOfflineMessage = offlineModeEnabled

    return (
      <View
        style={styles.view}
        testID={`${testIDPrefix}_view`}>
        {isMyProfile && !isLoggedIn && (
          <MessageWithAction
            topActionHandler={this._onPressLogin}
            topActionText={translate('Login')}
            message={loginMessage}
          />
        )}
        {!(isMyProfile && !isLoggedIn) && (
          <View style={styles.view}>
            <ProfileTableHeader
              handleEditPress={isLoggedInUserProfile ? this._handleEditPress : null}
              handleToggleSubscribe={isLoggedInUserProfile ? null : () => this._handleToggleSubscribe(userId)}
              id={userId}
              isLoading={isLoading && !user}
              isLoggedInUserProfile={isLoggedInUserProfile}
              isNotFound={!isLoading && !user}
              isSubscribed={isSubscribed}
              isSubscribing={isSubscribing}
              name={(user && user.name) || translate('anonymous')}
              testID={testIDPrefix}
            />
            <TableSectionSelectors
              filterScreenTitle={translate('Profile')}
              handleSelectFilterItem={this.handleSelectFilterItem}
              handleSelectSortItem={this.handleSelectSortItem}
              includePadding
              navigation={navigation}
              screenName='ProfileScreen'
              selectedFilterItemKey={viewType}
              selectedFilterLabel={selectedFilterLabel}
              selectedSortItemKey={querySort}
              selectedSortLabel={selectedSortLabel}
              testID={testIDPrefix}
            />
            {isLoading && <ActivityIndicator accessible={false} fillSpace testID={testIDPrefix} />}
            {!isLoading && viewType && flatListData && (
              <FlatList
                data={flatListData}
                dataTotalCount={flatListDataTotalCount}
                disableLeftSwipe
                extraData={flatListData}
                isLoadingMore={isLoadingMore}
                ItemSeparatorComponent={this._ItemSeparatorComponent}
                keyExtractor={(item: any) => item.id}
                noResultsMessage={noResultsMessage}
                onEndReached={this._onEndReached}
                renderItem={this._renderItem}
                showNoInternetConnectionMessage={showOfflineMessage || showNoInternetConnectionMessage}
              />
            )}
            <ActionSheet
              handleCancelPress={this._handleCancelPress}
              items={() => {
                if (selectedItem) {
                  const loggedInUserId = safelyUnwrapNestedVariable(() => session.userInfo.id, '')
                  selectedItem.ownerId = loggedInUserId

                  const itemType = selectedItem.clipIsOfficialChapter
                    ? 'chapter'
                    : !!selectedItem.clipId
                      ? 'clip'
                      : 'episode'

                  return PV.ActionSheet.media.moreButtons(
                    selectedItem,
                    navigation,
                    {
                      handleDismiss: this._handleCancelPress,
                      handleDownload: this._handleDownloadPressed,
                      handleDeleteClip: this._showDeleteConfirmDialog,
                      includeGoToPodcast: true,
                      includeGoToEpisodeInEpisodesStack: true
                    },
                    itemType
                  )
                }
              }}
              showModal={showActionSheet}
              testID={testIDPrefix}
            />
            <Dialog.Container visible={showDeleteConfirmDialog}>
              <Dialog.Title>Delete Clip</Dialog.Title>
              <Dialog.Description>Are you sure?</Dialog.Description>
              <Dialog.Button
                label={translate('Cancel')}
                onPress={this._cancelDeleteMediaRef}
                testID={'dialog_delete_clip_cancel'.prependTestId()}
              />
              <Dialog.Button
                label={translate('Delete')}
                onPress={this._deleteMediaRef}
                testID={'dialog_delete_clip_delete'.prependTestId()}
              />
            </Dialog.Container>
          </View>
        )}
      </View>
    )
  }

  _queryPodcasts = async (newState: any, page = 1, sort?: string | null) => new Promise((resolve) => {
    (async () => {
      const { flatListData } = this.state
      const query = {
        page,
        podcastIds: this.global.profile.user.subscribedPodcastIds,
        sort
      }

      let results = [[], 0]
      if (this.global.profile.user.subscribedPodcastIds.length > 0) {
        results = await getPodcasts(query)
      }

      setGlobal(
        {
          profile: {
            user: this.global.profile.user
          }
        },
        () => {
          newState.flatListData = [...flatListData, ...results[0]]
          newState.endOfResultsReached = newState.flatListData.length >= results[1]
          newState.flatListDataTotalCount = results[1]
          newState.queryPage = page
          resolve(newState)
        }
      )
    })()
  })

  _queryMediaRefs = async (newState: any, page = 1, sort?: string | null) => new Promise((resolve) => {
    (async () => {
      const { flatListData, userId } = this.state
      const query = { page }
      const { id } = this.global.session.userInfo
      const isLoggedInUserProfile = userId === id
      let results = [] as any[]
      query.sort = sort

      if (isLoggedInUserProfile) {
        results = await getLoggedInUserMediaRefs(query)
      } else {
        results = await getUserMediaRefs(this.global.profile.user.id, query)
      }

      setGlobal(
        {
          profile: {
            user: this.global.profile.user
          }
        },
        () => {
          newState.flatListData = [...flatListData, ...results[0]]
          newState.endOfResultsReached = newState.flatListData.length >= results[1]
          newState.flatListDataTotalCount = results[1]
          newState.queryPage = page
          resolve(newState)
        }
      )
    })()
  })

  _queryPlaylists = async (newState: any, page = 1, sort?: string | null) => new Promise((resolve) => {
    (async () => {
      const { userId } = this.state
      const { id } = this.global.session.userInfo
      const query = { page, sort }
      const isLoggedInUserProfile = userId === id
      let results = [] as any[]

      if (isLoggedInUserProfile) {
        results = await getLoggedInUserPlaylists()
      } else {
        results = await getUserPlaylists(this.global.profile.user.id, query)
      }
      newState.flatListData = results[0]
      newState.endOfResultsReached = newState.flatListData.length >= results[1]
      newState.flatListDataTotalCount = results[1]
      newState.queryPage = page
      resolve(newState)
    })()
  })

  _queryData = async (filterKey: string | null, page = 1) => {
    const { querySort, viewType } = this.state
    let newState = {
      isLoading: false,
      isLoadingMore: false,
      showNoInternetConnectionMessage: false
    } as State

    const hasInternetConnection = await hasValidNetworkConnection()

    if (!hasInternetConnection) {
      newState.showNoInternetConnectionMessage = true
      this.shouldLoad = true
      return newState
    }

    try {
      if (filterKey === PV.Filters._podcastsKey || filterKey === PV.Filters._alphabeticalKey) {
        newState = await (this._queryPodcasts(newState, page, querySort) as any)
        newState.flatListData = this.cleanFlatListData(newState.flatListData, filterKey)
      } else if (filterKey === PV.Filters._clipsKey) {
        newState.querySort = PV.Filters._mostRecentKey
        newState = await (this._queryMediaRefs(newState, page, PV.Filters._mostRecentKey) as any)
        newState.flatListData = this.cleanFlatListData(newState.flatListData, filterKey)
      } else if (filterKey === PV.Filters._playlistsKey) {
        newState = await (this._queryPlaylists(newState, page, querySort) as any)
        newState.flatListData = this.cleanFlatListData(newState.flatListData, filterKey)
      } else {
        if (viewType === PV.Filters._podcastsKey) {
          newState = await (this._queryPodcasts(newState, page, filterKey) as any)
        } else if (viewType === PV.Filters._clipsKey) {
          newState = await (this._queryMediaRefs(newState, page, filterKey) as any)
        } else if (viewType === PV.Filters._playlistsKey) {
          newState = await (this._queryPlaylists(newState, page, filterKey) as any)
        }
        newState.flatListData = this.cleanFlatListData(newState.flatListData, viewType)
      }

      newState.selectedFilterLabel = await getSelectedFilterLabel(viewType)
    } catch (error) {
      console.log('ProfileScreen queryData error:', error)
    }

    this.shouldLoad = true
    return newState
  }

  cleanFlatListData = (flatListData: any[], viewTypeKey: string | null) => {
    if (viewTypeKey === PV.Filters._podcastsKey || viewTypeKey === PV.Filters._playlistsKey) {
      return flatListData?.filter((item: any) => !!item?.id) || []
    } else if (viewTypeKey === PV.Filters._clipsKey) {
      return flatListData?.filter((item: any) => !!item?.episode?.id && !!item?.episode?.podcast) || []
    } else {
      return flatListData
    }
  }
}

const styles = StyleSheet.create({
  msgView: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  msgViewText: {
    fontSize: PV.Fonts.sizes.lg
  },
  view: {
    flex: 1
  }
})
