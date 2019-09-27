import { StyleSheet, View as RNView } from 'react-native'
import { NavigationScreenOptions } from 'react-navigation'
import React, { setGlobal } from 'reactn'
import { ActionSheet, ActivityIndicator, ClipTableCell, Divider, FlatList, MessageWithAction, NavQueueIcon, NavShareIcon,
  PlaylistTableCell, PodcastTableCell, ProfileTableHeader, TableSectionSelectors, View } from '../components'
import { downloadEpisode } from '../lib/downloader'
import { alertIfNoNetworkConnection } from '../lib/network'
import { convertNowPlayingItemToEpisode, convertToNowPlayingItem } from '../lib/NowPlayingItem'
import { generateAuthorsText, generateCategoriesText, readableDate } from '../lib/utility'
import { PV } from '../resources'
import { getPodcasts } from '../services/podcast'
import { getLoggedInUserMediaRefs, getLoggedInUserPlaylists, getUserMediaRefs, getUserPlaylists } from '../services/user'
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
  userId?: string
}

export class ProfileScreen extends React.Component<Props, State> {

  static navigationOptions = ({ navigation }) => {
    const userId = navigation.getParam('userId')
    const userIsPublic = navigation.getParam('userIsPublic')
    const userName = navigation.getParam('userName')

    return {
      title: 'Profile',
      headerRight: (
        <RNView style={core.row}>
          {
            userIsPublic && userId &&
              <NavShareIcon
                profileName={userName}
                url={PV.URLs.profile + userId} />
          }
          <NavQueueIcon navigation={navigation} />
        </RNView>
      )
    } as NavigationScreenOptions
  }

  constructor(props: Props) {
    super(props)
    const { id, subscribedUserIds } = this.global.session.userInfo
    const user = this.props.navigation.getParam('user')
    const userId = (user && user.id) || this.props.navigation.getParam('userId')
    const isLoggedInUserProfile = userId === id
    const isSubscribed = subscribedUserIds.some((x: string) => userId)

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
      isLoading: true,
      isLoadingMore: false,
      isSubscribed,
      isSubscribing: false,
      queryFrom: _podcastsKey,
      queryPage: 1,
      querySort: _alphabeticalKey,
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
    this._initializeScreenData()
  }

  async _initializeScreenData() {
    const userId = this.props.navigation.getParam('userId') || this.state.userId
    const { queryFrom } = this.state

    this.setState({
      endOfResultsReached: false,
      flatListData: [],
      flatListDataTotalCount: null,
      isLoading: true,
      userId
    }, async () => {
      const { id } = this.global.session.userInfo
      const isLoggedInUserProfile = userId === id
      let newState = {} as any

      const wasAlerted = await alertIfNoNetworkConnection('load your profile')
      if (wasAlerted) {
        this.setState({
          flatListData: [],
          flatListDataTotalCount: null,
          isLoading: false,
          isLoadingMore: false,
          queryPage: 1
        })
        return
      }

      if (isLoggedInUserProfile) {
        newState = {
          isLoading: false,
          isLoadingMore: false,
          queryPage: 1
        } as State

        try {
          await getAuthUserInfo()
          setGlobal({
            profile: {
              ...this.global.profile,
              user: this.global.session.userInfo
            }
          }, async () => {
            newState = await this._queryData(queryFrom, 1)
            this.setState(newState)
          })
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
    })
  }

  selectLeftItem = async (selectedKey: string) => {
    const { querySort } = this.state
    if (!selectedKey) {
      this.setState({ queryFrom: null })
      return
    }

    this.setState({
      endOfResultsReached: false,
      flatListData: [],
      flatListDataTotalCount: null,
      isLoading: true,
      preventSortQuery: true,
      queryFrom: selectedKey,
      queryPage: 1,
      ...(querySort === _alphabeticalKey && selectedKey !== _podcastsKey ? { querySort: _topPastWeek } : {})
    }, async () => {
      const newState = await this._queryData(selectedKey, 1)
      newState.preventSortQuery = false
      this.setState(newState)
    })
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

    this.setState({
      endOfResultsReached: false,
      flatListData: [],
      flatListDataTotalCount: null,
      isLoading: true,
      queryPage: 1,
      querySort: selectedKey
    }, async () => {
      const newState = await this._queryData(selectedKey, 1)
      this.setState(newState)
    })
  }

  _onEndReached = ({ distanceFromEnd }) => {
    const { endOfResultsReached, isLoadingMore, queryFrom, queryPage = 1 } = this.state
    if (!endOfResultsReached && !isLoadingMore) {
      if (distanceFromEnd > -1) {
        this.setState({
          isLoadingMore: true
        }, async () => {
          const newState = await this._queryData(queryFrom, queryPage + 1)
          this.setState(newState)
        })
      }
    }
  }

  _ItemSeparatorComponent = () => {
    return <Divider />
  }

  _handlePodcastPress = (podcast: any) => {
    this.props.navigation.navigate(
      PV.RouteNames.MorePodcastScreen, {
        podcast
      }
    )
  }

  _handleClipPress = (clip: any) => {
    console.log('clip pressed')
  }

  _handlePlaylistPress = (playlist: any) => {
    this.props.navigation.navigate(
      PV.RouteNames.PlaylistScreen, {
        playlist
      }
    )
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
    this.props.navigation.navigate(
      PV.RouteNames.EditProfileScreen,
      { user }
    )
  }

  _handleToggleSubscribe = async (id: string) => {
    const { userId } = this.state
    const wasAlerted = await alertIfNoNetworkConnection('subscribe to profile')
    if (wasAlerted) return

    this.setState({ isSubscribing: true }, async () => {
      try {
        await toggleSubscribeToUser(id)
        const { subscribedUserIds } = this.global.session.userInfo
        const isSubscribed = subscribedUserIds.some((x: string) => userId)
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

  _renderItem = ({ item }) => {
    const { queryFrom } = this.state

    if (queryFrom === _podcastsKey) {
      return (
        <PodcastTableCell
          id={item.id}
          lastEpisodePubDate={item.lastEpisodePubDate}
          onPress={() => this._handlePodcastPress(item)}
          podcastAuthors={generateAuthorsText(item.authors)}
          podcastCategories={generateCategoriesText(item.categories)}
          podcastImageUrl={item.imageUrl}
          podcastTitle={item.title} />
      )
    } else if (queryFrom === _clipsKey) {
      return (
        <ClipTableCell
          endTime={item.endTime}
          episodeId={item.episode.id}
          episodePubDate={readableDate(item.episode.pubDate)}
          episodeTitle={item.episode.title}
          handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(item, null, null))}
          podcastImageUrl={item.episode.podcast.imageUrl}
          podcastTitle={item.episode.podcast.title}
          startTime={item.startTime}
          title={item.title} />
      )
    } else {
      return (
        <PlaylistTableCell
          itemCount={item.itemCount}
          onPress={() => this._handlePlaylistPress(item)}
          title={item.title} />
      )
    }
  }

  _onPressLogin = () => this.props.navigation.navigate(PV.RouteNames.AuthScreen)

  render() {
    const { flatListData, flatListDataTotalCount, isLoading, isLoadingMore, isSubscribed, isSubscribing, queryFrom,
      querySort, selectedItem, showActionSheet, userId } = this.state
    const { profile, session } = this.global
    const { user } = profile
    const { isLoggedIn, userInfo } = session
    const { id } = userInfo
    let rightOptions = [] as any[]
    const { navigation } = this.props
    const isLoggedInUserProfile = userId && id && userId === id

    if (queryFrom === _podcastsKey) {
      rightOptions = rightItemsWithAlphabetical
    } else if (queryFrom === _clipsKey) {
      rightOptions = rightItems
    }

    let resultsText = 'podcasts'
    if (queryFrom === _clipsKey) {
      resultsText = 'clips'
    } else if (queryFrom === _playlistsKey) {
      resultsText = 'playlists'
    }
    const isMyProfile = navigation.getParam('isMyProfile')
    return (
      <View style={styles.view}>
        {
          isMyProfile && !isLoggedIn &&
            <MessageWithAction
              actionHandler={this._onPressLogin}
              actionText='Login'
              message='Login to view your profile' />
        }
        {
          !(isMyProfile && !isLoggedIn) &&
            <View style={styles.view}>
              <ProfileTableHeader
                handleEditPress={isLoggedInUserProfile ? this._handleEditPress : null}
                handleToggleSubscribe={isLoggedInUserProfile ? null : () => this._handleToggleSubscribe(userId)}
                id={userId}
                isLoading={isLoading && !user}
                isNotFound={!isLoading && !user}
                isSubscribed={isSubscribed}
                isSubscribing={isSubscribing}
                name={user && user.name || 'anonymous'} />
              <TableSectionSelectors
                handleSelectLeftItem={this.selectLeftItem}
                handleSelectRightItem={this.selectRightItem}
                leftItems={leftItems}
                rightItems={rightOptions}
                selectedLeftItemKey={queryFrom}
                selectedRightItemKey={querySort} />
              {
                isLoading &&
                  <ActivityIndicator />
              }
              {
                !isLoading && queryFrom && flatListData &&
                  <FlatList
                    data={flatListData}
                    dataTotalCount={flatListDataTotalCount}
                    disableLeftSwipe={true}
                    extraData={flatListData}
                    isLoadingMore={isLoadingMore}
                    ItemSeparatorComponent={this._ItemSeparatorComponent}
                    onEndReached={this._onEndReached}
                    renderItem={this._renderItem}
                    resultsText={resultsText} />
              }
              <ActionSheet
                handleCancelPress={this._handleCancelPress}
                items={() => PV.ActionSheet.media.moreButtons(
                  selectedItem, navigation, this._handleCancelPress, this._handleDownloadPressed
                )}
                showModal={showActionSheet} />
            </View>
        }
      </View>
    )
  }

  _queryPodcasts = async (newState: any, page: number = 1, sort?: string | null) => {
    return new Promise(async (resolve, reject) => {
      const wasAlerted = await alertIfNoNetworkConnection('load podcasts')
      if (wasAlerted) {
        resolve(newState)
        return
      }

      const { flatListData } = this.state
      const query = {
        includeAuthors: true,
        includeCategories: true,
        page,
        podcastIds: this.global.profile.user.subscribedPodcastIds,
        sort
      }

      let results = [[], 0]
      if (this.global.profile.user.subscribedPodcastIds.length > 1) {
        results = await getPodcasts(query, this.global.settings.nsfwMode)
      }

      setGlobal({
        profile: {
          user: this.global.profile.user
        }
      }, () => {
        newState.flatListData = [...flatListData, ...results[0]]
        newState.endOfResultsReached = newState.flatListData.length >= results[1]
        newState.flatListDataTotalCount = results[1]
        newState.queryPage = page
        resolve(newState)
      })
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

      if (isLoggedInUserProfile) {
        results = await getLoggedInUserMediaRefs(query)
      } else {
        results = await getUserMediaRefs(this.global.profile.user.id, query, nsfwMode)
      }

      setGlobal({
        profile: {
          user: this.global.profile.user
        }
      }, () => {
        newState.flatListData = [...flatListData, ...results[0]]
        newState.endOfResultsReached = newState.flatListData.length >= results[1]
        newState.flatListDataTotalCount = results[1]
        newState.queryPage = page
        resolve(newState)
      })
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
      isLoading: false,
      isLoadingMore: false
    } as State

    const wasAlerted = await alertIfNoNetworkConnection('load profile data')
    if (wasAlerted) return newState

    try {
      if (filterKey === _podcastsKey || filterKey === _alphabeticalKey) {
        newState = await this._queryPodcasts(newState, page, querySort)
      } else if (filterKey === _clipsKey) {
        newState = await this._queryMediaRefs(newState, page, querySort)
      } else if (filterKey === _playlistsKey) {
        newState = await this._queryPlaylists(newState, page, querySort)
      } else if (rightItems.some((option) => option.value === filterKey)) {
        if (queryFrom === _podcastsKey) {
          newState = await this._queryPodcasts(newState, page, filterKey)
        } else if (queryFrom === _clipsKey) {
          newState = await this._queryMediaRefs(newState, page, filterKey)
        } else if (queryFrom === _playlistsKey) {
          newState = await this._queryPlaylists(newState, page, filterKey)
        }
      }

      return newState
    } catch (error) {
      return newState
    }

  }
}

const _podcastsKey = 'podcasts'
const _clipsKey = 'clips'
const _playlistsKey = 'playlists'
const _alphabeticalKey = 'alphabetical'
const _mostRecentKey = 'most-recent'
const _topPastDay = 'top-past-day'
const _topPastWeek = 'top-past-week'
const _topPastMonth = 'top-past-month'
const _topPastYear = 'top-past-year'

const leftItems = [
  {
    label: 'Podcasts',
    value: _podcastsKey
  },
  {
    label: 'Clips',
    value: _clipsKey
  },
  {
    label: 'Playlists',
    value: _playlistsKey
  }
]

const rightItems = [
  {
    label: 'most recent',
    value: _mostRecentKey
  },
  {
    label: 'top - past day',
    value: _topPastDay
  },
  {
    label: 'top - past week',
    value: _topPastWeek
  },
  {
    label: 'top - past month',
    value: _topPastMonth
  },
  {
    label: 'top - past year',
    value: _topPastYear
  }
]

const rightItemsWithAlphabetical = [
  {
    label: 'alphabetical',
    value: _alphabeticalKey
  },
  {
    label: 'most recent',
    value: _mostRecentKey
  },
  {
    label: 'top - past day',
    value: _topPastDay
  },
  {
    label: 'top - past week',
    value: _topPastWeek
  },
  {
    label: 'top - past month',
    value: _topPastMonth
  },
  {
    label: 'top - past year',
    value: _topPastYear
  }
]

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
