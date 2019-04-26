import React, { setGlobal } from 'reactn'
import { ActionSheet, ActivityIndicator, ClipTableCell, Divider, FlatList, PlaylistTableCell,
  PodcastTableCell, ProfileTableHeader, TableSectionSelectors, View } from '../components'
import { convertToNowPlayingItem } from '../lib/NowPlayingItem'
import { generateAuthorsText, generateCategoriesText, readableDate } from '../lib/utility'
import { PV } from '../resources'
import { setNowPlayingItem } from '../services/player'
import { getPodcasts } from '../services/podcast'
import { getUserMediaRefs, getUserPlaylists } from '../services/user'
import { addUserQueueItemLast, addUserQueueItemNext, getAuthUserInfo } from '../state/actions/auth'
import { getPublicUser, toggleSubscribeToUser } from '../state/actions/users'

type Props = {
  navigation?: any
}

type State = {
  endOfResultsReached: boolean
  isLoading: boolean
  isLoadingMore: boolean
  isLoggedInUserProfile: boolean
  isSubscribed: boolean
  preventSortQuery?: boolean
  queryFrom: string | null
  queryPage: number
  querySort?: string | null
  selectedItem?: any
  showActionSheet: boolean
}

export class ProfileScreen extends React.Component<Props, State> {

  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('navigationTitle')
  })

  constructor(props: Props) {
    super(props)
    const { id, subscribedUserIds } = this.global.session.userInfo
    const user = this.props.navigation.getParam('user')
    const isLoggedInUserProfile = user.id === id
    const isSubscribed = subscribedUserIds.some((x: string) => user.id)

    this.state = {
      endOfResultsReached: false,
      isLoading: true,
      isLoadingMore: false,
      isLoggedInUserProfile,
      isSubscribed,
      queryFrom: _podcastsKey,
      queryPage: 1,
      querySort: _alphabeticalKey,
      showActionSheet: false
    }

    setGlobal({
      screenProfile: {
        flatListData: [],
        user
      }
    })
  }

  async componentDidMount() {
    const { isLoggedInUserProfile } = this.state

    if (isLoggedInUserProfile) {
      await getAuthUserInfo(this.props.navigation)

      let newState = {
        isLoading: false,
        isLoadingMore: false,
        queryPage: 1
      } as State

      newState = await this._queryPodcasts(newState, 1, _alphabeticalKey)
      this.setState(newState)
    } else {
      const user = this.props.navigation.getParam('user')
      await getPublicUser(user.id, this.global)

      let newState = {
        isLoading: false,
        isLoadingMore: false,
        queryPage: 1
      } as State
      newState = await this._queryPodcasts(newState, 1, _alphabeticalKey)
      this.setState(newState)
    }
  }

  selectLeftItem = async (selectedKey: string) => {
    const { querySort } = this.state
    if (!selectedKey) {
      this.setState({ queryFrom: null })
      return
    }

    setGlobal({
      screenProfile: {
        flatListData: [],
        user: this.global.screenProfile.user
      }
    }, () => {
      this.setState({
        endOfResultsReached: false,
        isLoading: true,
        preventSortQuery: true,
        queryFrom: selectedKey,
        queryPage: 1,
        ...(querySort === _alphabeticalKey && selectedKey !== _podcastsKey ? { querySort: _topPastWeek } : {})
      }, async () => {
        const newState = await this._queryData(selectedKey, 1)
        this.setState(newState)
      })
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
      isLoading: true,
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
    console.log('podcast pressed')
  }

  _handleClipPress = (clip: any) => {
    console.log('clip pressed')
  }

  _handleCancelPress = () => {
    this.setState({ showActionSheet: false })
  }

  _handleMorePress = (selectedItem: any) => {
    this.setState({
      selectedItem,
      showActionSheet: true
    })
  }

  _handlePlaylistPress = (playlist: any) => {
    console.log('playlist pressed')
  }

  _handleEditPress = () => {
    const { user } = this.global.screenProfile
    this.props.navigation.navigate(
      PV.RouteNames.EditProfileScreen,
      { user }
    )
  }

  _handleSubscribeToggle = async (id: string) => {
    const { user } = this.global.screenProfile
    await toggleSubscribeToUser(id)
    const { subscribedUserIds } = this.global.session.userInfo
    const isSubscribed = subscribedUserIds.some((x: string) => user.id)
    this.setState({ isSubscribed })
  }

  _renderItem = ({ item }) => {
    const { queryFrom } = this.state

    if (queryFrom === _podcastsKey) {
      return (
        <PodcastTableCell
          key={item.id}
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
          key={item.id}
          endTime={item.endTime}
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
          key={item.id}
          itemCount={item.itemCount}
          onPress={() => this.props.navigation.navigate(
            PV.RouteNames.PlaylistScreen, {
              playlist: item,
              navigationTitle: 'Playlist'
            }
          )}
          title={item.title} />
      )
    }
  }

  render() {
    const { isLoading, isLoadingMore, isLoggedInUserProfile, isSubscribed, queryFrom,
      querySort, selectedItem, showActionSheet } = this.state
    const { globalTheme, screenProfile } = this.global
    const { flatListData, user } = screenProfile
    let rightOptions = [] as any[]
    const { navigation } = this.props

    if (queryFrom === _podcastsKey) {
      rightOptions = rightItemsWithAlphabetical
    } else if (queryFrom === _clipsKey) {
      rightOptions = rightItems
    }

    return (
      <View style={styles.view}>
        <ProfileTableHeader
          handleEditPress={isLoggedInUserProfile ? this._handleEditPress : null}
          handleSubscribeToggle={isLoggedInUserProfile ? null : this._handleSubscribeToggle}
          id={user.id}
          isSubscribed={isSubscribed}
          name={user.name} />
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
              disableLeftSwipe={true}
              extraData={flatListData}
              isLoadingMore={isLoadingMore}
              ItemSeparatorComponent={this._ItemSeparatorComponent}
              onEndReached={this._onEndReached}
              renderItem={this._renderItem} />
        }
        <ActionSheet
          globalTheme={globalTheme}
          handleCancelPress={this._handleCancelPress}
          items={PV.ActionSheet.media.moreButtons(selectedItem, this.global.session.isLoggedIn, this.global, navigation)}
          showModal={showActionSheet} />
      </View>
    )
  }

  _queryPodcasts = async (newState: any, page: number = 1, sort?: string | null) => {
    return new Promise(async (resolve, reject) => {
      const query = {
        includeAuthors: true,
        includeCategories: true,
        page,
        podcastIds: this.global.screenProfile.user.subscribedPodcastIds,
        sort
      }

      const results = await getPodcasts(query, this.global.settings.nsfwMode)

      setGlobal({
        screenProfile: {
          flatListData: [...this.global.screenProfile.flatListData, ...results[0]],
          user: this.global.screenProfile.user
        }
      }, () => {
        newState.endOfResultsReached = this.global.screenProfile.flatListData.length >= results[1]
        resolve(newState)
      })
    })
  }

  _queryMediaRefs = async (newState: any, page: number = 1, sort?: string | null) => {
    return new Promise(async (resolve, reject) => {
      const { settings } = this.global
      const { nsfwMode } = settings
      const query = { page }
      const results = await getUserMediaRefs(this.global.screenProfile.user.id, query, nsfwMode)

      setGlobal({
        screenProfile: {
          flatListData: [...this.global.screenProfile.flatListData, ...results[0]],
          user: this.global.screenProfile.user
        }
      }, () => {
        newState.endOfResultsReached = this.global.screenProfile.flatListData.length >= results[1]
        resolve(newState)
      })
    })
  }

  _queryPlaylists = async (newState: any, page: number = 1, sort?: string | null) => {
    return new Promise(async (resolve, reject) => {
      const query = { page, sort }
      const results = await getUserPlaylists(this.global.screenProfile.user.id, query)

      setGlobal({
        screenProfile: {
          flatListData: [...this.global.screenProfile.flatListData, ...results[0]],
          user: this.global.screenProfile.user
        }
      }, () => {
        newState.endOfResultsReached = this.global.screenProfile.flatListData.length >= results[1]
        resolve(newState)
      })
    })
  }

  _queryData = async (filterKey: string | null, page: number = 1) => {
    const { queryFrom, querySort } = this.state
    let newState = {
      isLoading: false,
      isLoadingMore: false,
      queryPage: page
    } as State

    if (filterKey === _podcastsKey) {
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

const styles = {
  view: {
    flex: 1
  }
}
