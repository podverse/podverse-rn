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
import { translate } from '../lib/i18n'
import { alertIfNoNetworkConnection, hasValidNetworkConnection } from '../lib/network'
import {
  generateAuthorsText,
  generateCategoriesText,
  isOdd,
  readableDate,
  safelyUnwrapNestedVariable,
  testProps
} from '../lib/utility'
import { PV } from '../resources'
import { gaTrackPageView } from '../services/googleAnalytics'
import { deleteMediaRef } from '../services/mediaRef'
import { loadItemAndPlayTrack } from '../services/player'
import { getPodcasts } from '../services/podcast'
import {
  getLoggedInUserMediaRefs,
  getLoggedInUserPlaylists,
  getUserMediaRefs,
  getUserPlaylists
} from '../services/user'
import { getAuthUserInfo } from '../state/actions/auth'
import { getPublicUser, toggleSubscribeToUser } from '../state/actions/user'
import { core } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  endOfResultsReached: boolean
  flatListData: any[]
  flatListDataTotalCount: number | null
  hideRightItemWhileLoading: boolean
  initializeClips: boolean
  isLoading: boolean
  isLoadingMore: boolean
  isSubscribed: boolean
  isSubscribing: boolean
  preventSortQuery?: boolean
  queryFrom: string | null
  queryPage: number
  querySort?: string | null
  selectedItem?: any
  showActionSheet: boolean
  showDeleteConfirmDialog?: boolean
  showNoInternetConnectionMessage?: boolean
  userId?: string
}

export class ProfileScreen extends React.Component<Props, State> {
  static navigationOptions = ({ navigation }) => {
    const userId = navigation.getParam('userId')
    const userIsPublic = navigation.getParam('userIsPublic')
    const userName = navigation.getParam('userName')
    const isMyProfile = navigation.getParam('isMyProfile')

    return {
      title: isMyProfile ? translate('My Profile') : translate('Profile'),
      headerRight: (
        <RNView style={core.row}>
          {userIsPublic && userId && <NavShareIcon profileName={userName} url={PV.URLs.profile + userId} />}
          <NavSearchIcon navigation={navigation} />
        </RNView>
      )
    } as NavigationStackOptions
  }

  constructor(props: Props) {
    super(props)
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
      hideRightItemWhileLoading: false,
      initializeClips,
      isLoading: true,
      isLoadingMore: false,
      isSubscribed,
      isSubscribing: false,
      queryFrom: initializeClips ? PV.Filters._clipsKey : PV.Filters._podcastsKey,
      queryPage: 1,
      querySort: initializeClips ? PV.Filters._mostRecentKey : PV.Filters._alphabeticalKey,
      showActionSheet: false,
      userId
    }

    setGlobal({
      profile: {
        ...(isLoggedInUserProfile ? { user: this.global.session.userInfo } : { user })
      }
    })
  }

  async componentDidMount() {
    const { userId } = this.state
    this._initializeScreenData()
    const idPath = userId ? userId : 'user-not-logged-in'
    gaTrackPageView('/profile/' + idPath, 'Profile Screen')
  }

  async _initializeScreenData() {
    const userId = this.props.navigation.getParam('userId') || this.state.userId
    const { queryFrom } = this.state

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
      async () => {
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
                newState = await this._queryData(queryFrom, 1)
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
            const { profileFlatListData } = await getPublicUser(userId, this.global)
            newState.flatListData = profileFlatListData
            newState = await this._queryData(queryFrom, 1)
          } catch (error) {
            //
          }
          this.setState(newState)
        }
      }
    )
  }

  selectLeftItem = async (selectedKey: string) => {
    const { querySort } = this.state
    if (!selectedKey) {
      this.setState({ queryFrom: null })
      return
    }

    let sort = querySort
    let hideRightItemWhileLoading = false
    if (querySort === PV.Filters._alphabeticalKey && selectedKey !== PV.Filters._podcastsKey) {
      sort = PV.Filters._topPastWeek
      hideRightItemWhileLoading = true
    }

    this.setState(
      {
        endOfResultsReached: false,
        flatListData: [],
        flatListDataTotalCount: null,
        hideRightItemWhileLoading,
        isLoading: true,
        preventSortQuery: true,
        queryFrom: selectedKey,
        queryPage: 1,
        querySort: sort
      },
      async () => {
        const newState = await this._queryData(selectedKey, 1)
        newState.preventSortQuery = false
        this.setState(newState)
      }
    )
  }

  selectRightItem = async (selectedKey: string) => {
    if (this.state.preventSortQuery) {
      this.setState({ preventSortQuery: false })
      return
    }

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
        const newState = await this._queryData(selectedKey, 1)
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
            isLoadingMore: true
          },
          async () => {
            const newState = await this._queryData(queryFrom, queryPage + 1)
            this.setState(newState)
          }
        )
      }
    }
  }

  _ItemSeparatorComponent = () => {
    return <Divider />
  }

  _handlePodcastPress = (podcast: any) => {
    this.props.navigation.navigate(PV.RouteNames.MorePodcastScreen, {
      podcast
    })
  }

  _handleClipPress = (clip: any) => {
    console.log('clip pressed')
  }

  _handlePlaylistPress = (playlist: any) => {
    this.props.navigation.navigate(PV.RouteNames.PlaylistScreen, {
      playlist
    })
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

  _handleEditPress = () => {
    const { user } = this.global.profile
    this.props.navigation.navigate(PV.RouteNames.EditProfileScreen, { user })
  }

  _handleToggleSubscribe = async (id: string) => {
    const wasAlerted = await alertIfNoNetworkConnection(translate('subscribe to profile'))
    if (wasAlerted) return

    this.setState({ isSubscribing: true }, async () => {
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

  _deleteMediaRef = async () => {
    const { selectedItem } = this.state
    let { flatListData, flatListDataTotalCount } = this.state

    if (selectedItem && selectedItem.clipId) {
      this.setState(
        {
          isLoading: true,
          showDeleteConfirmDialog: false
        },
        async () => {
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
        }
      )
    }
  }

  _cancelDeleteMediaRef = async () => {
    this.setState({
      showDeleteConfirmDialog: false
    })
  }

  _handleNavigationPress = (selectedItem: any) => {
    const shouldPlay = true
    loadItemAndPlayTrack(selectedItem, shouldPlay)
  }

  _renderItem = ({ item, index }) => {
    const { queryFrom } = this.state

    if (queryFrom === PV.Filters._podcastsKey) {
      return (
        <PodcastTableCell
          hasZebraStripe={isOdd(index)}
          id={item.id}
          lastEpisodePubDate={item.lastEpisodePubDate}
          onPress={() => this._handlePodcastPress(item)}
          podcastAuthors={generateAuthorsText(item.authors)}
          podcastCategories={generateCategoriesText(item.categories)}
          podcastImageUrl={item.shrunkImageUrl || item.imageUrl}
          podcastTitle={item.title}
        />
      )
    } else if (queryFrom === PV.Filters._clipsKey) {
      return item && item.episode && item.episode.id && item.episode.podcast ? (
        <ClipTableCell
          endTime={item.endTime}
          episodeId={item.episode.id}
          episodePubDate={readableDate(item.episode.pubDate)}
          episodeTitle={item.episode.title}
          handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(item, null, null))}
          handleNavigationPress={() => this._handleNavigationPress(convertToNowPlayingItem(item, null, null))}
          hasZebraStripe={isOdd(index)}
          podcastImageUrl={item.episode.podcast.shrunkImageUrl || item.episode.podcast.imageUrl}
          podcastTitle={item.episode.podcast.title}
          startTime={item.startTime}
          title={item.title}
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
      hideRightItemWhileLoading,
      initializeClips,
      isLoading,
      isLoadingMore,
      isSubscribed,
      isSubscribing,
      queryFrom,
      querySort,
      selectedItem,
      showActionSheet,
      showDeleteConfirmDialog,
      showNoInternetConnectionMessage,
      userId
    } = this.state

    const { profile, session } = this.global
    const { user } = profile
    const { isLoggedIn, userInfo } = session
    const { id } = userInfo
    const { navigation } = this.props
    const isLoggedInUserProfile = userId && id && userId === id

    let noResultsMessage = translate('No podcasts found')
    if (queryFrom === PV.Filters._clipsKey) {
      noResultsMessage = translate('No clips found')
    } else if (queryFrom === PV.Filters._playlistsKey) {
      noResultsMessage = translate('No playlists found')
    }

    const isMyProfile = navigation.getParam('isMyProfile')
    const loginMessage = initializeClips
      ? translate('Login to view your clips')
      : translate('Login to view your profile')

    return (
      <View style={styles.view} {...testProps('profile_screen_view')}>
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
              isNotFound={!isLoading && !user}
              isSubscribed={isSubscribed}
              isSubscribing={isSubscribing}
              name={(user && user.name) || translate('anonymous')}
            />
            <TableSectionSelectors
              handleSelectLeftItem={this.selectLeftItem}
              handleSelectRightItem={this.selectRightItem}
              hideRightItemWhileLoading={hideRightItemWhileLoading}
              screenName='ProfileScreen'
              selectedLeftItemKey={queryFrom}
              selectedRightItemKey={querySort}
            />
            {isLoading && <ActivityIndicator />}
            {!isLoading && queryFrom && flatListData && (
              <FlatList
                data={flatListData}
                dataTotalCount={flatListDataTotalCount}
                disableLeftSwipe={true}
                extraData={flatListData}
                isLoadingMore={isLoadingMore}
                ItemSeparatorComponent={this._ItemSeparatorComponent}
                keyExtractor={(item: any) => item.id}
                noResultsMessage={noResultsMessage}
                onEndReached={this._onEndReached}
                renderItem={this._renderItem}
                showNoInternetConnectionMessage={showNoInternetConnectionMessage}
              />
            )}
            <ActionSheet
              handleCancelPress={this._handleCancelPress}
              items={() => {
                if (selectedItem) {
                  const loggedInUserId = safelyUnwrapNestedVariable(() => session.userInfo.id, '')
                  selectedItem.ownerId = loggedInUserId
                  return PV.ActionSheet.media.moreButtons(
                    selectedItem,
                    navigation,
                    this._handleCancelPress,
                    this._handleDownloadPressed,
                    this._showDeleteConfirmDialog,
                    true, // includeGoToPodcast
                    true // includeGoToEpisode
                  )
                }
              }}
              showModal={showActionSheet}
            />
            <Dialog.Container visible={showDeleteConfirmDialog}>
              <Dialog.Title>Delete Clip</Dialog.Title>
              <Dialog.Description>Are you sure?</Dialog.Description>
              <Dialog.Button label={translate('Cancel')} onPress={this._cancelDeleteMediaRef} />
              <Dialog.Button label={translate('Delete')} onPress={this._deleteMediaRef} />
            </Dialog.Container>
          </View>
        )}
      </View>
    )
  }

  _queryPodcasts = async (newState: any, page: number = 1, sort?: string | null) => {
    return new Promise(async (resolve, reject) => {
      const { flatListData } = this.state
      const query = {
        page,
        podcastIds: this.global.profile.user.subscribedPodcastIds,
        sort
      }

      let results = [[], 0]
      if (this.global.profile.user.subscribedPodcastIds.length > 0) {
        results = await getPodcasts(query, this.global.settings.nsfwMode)
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
    })
  }

  _queryMediaRefs = async (newState: any, page: number = 1, sort?: string | null) => {
    return new Promise(async (resolve, reject) => {
      const { flatListData, userId } = this.state
      const { settings } = this.global
      const { nsfwMode } = settings
      const query = { page }
      const { id } = this.global.session.userInfo
      const isLoggedInUserProfile = userId === id
      let results = [] as any[]
      query.sort = sort

      if (isLoggedInUserProfile) {
        results = await getLoggedInUserMediaRefs(query)
      } else {
        results = await getUserMediaRefs(this.global.profile.user.id, query, nsfwMode)
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
    })
  }

  _queryPlaylists = async (newState: any, page: number = 1, sort?: string | null) => {
    return new Promise(async (resolve, reject) => {
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
    })
  }

  _queryData = async (filterKey: string | null, page: number = 1) => {
    const { queryFrom, querySort } = this.state
    let newState = {
      hideRightItemWhileLoading: false,
      isLoading: false,
      isLoadingMore: false,
      showNoInternetConnectionMessage: false
    } as State

    const hasInternetConnection = await hasValidNetworkConnection()
    if (!hasInternetConnection) {
      newState.showNoInternetConnectionMessage = true
      return newState
    }

    try {
      if (filterKey === PV.Filters._podcastsKey || filterKey === PV.Filters._alphabeticalKey) {
        newState = await this._queryPodcasts(newState, page, querySort)
      } else if (filterKey === PV.Filters._clipsKey) {
        newState.querySort = PV.Filters._mostRecentKey
        newState = await this._queryMediaRefs(newState, page, PV.Filters._mostRecentKey)
      } else if (filterKey === PV.Filters._playlistsKey) {
        newState = await this._queryPlaylists(newState, page, querySort)
      } else if (PV.FilterOptions.screenFilters.ProfileScreen.sort.some((option) => option === filterKey)) {
        if (queryFrom === PV.Filters._podcastsKey) {
          newState = await this._queryPodcasts(newState, page, filterKey)
        } else if (queryFrom === PV.Filters._clipsKey) {
          newState = await this._queryMediaRefs(newState, page, filterKey)
        } else if (queryFrom === PV.Filters._playlistsKey) {
          newState = await this._queryPlaylists(newState, page, filterKey)
        }
      }

      return newState
    } catch (error) {
      return newState
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
