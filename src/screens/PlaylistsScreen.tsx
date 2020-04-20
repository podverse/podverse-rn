import { StyleSheet } from 'react-native'
import React from 'reactn'
import {
  ActivityIndicator,
  Divider,
  FlatList,
  MessageWithAction,
  PlaylistTableCell,
  TableSectionSelectors,
  View
} from '../components'
import { hasValidNetworkConnection } from '../lib/network'
import { isOdd } from '../lib/utility'
import { PV } from '../resources'
import { gaTrackPageView } from '../services/googleAnalytics'
import { getPlaylists } from '../state/actions/playlist'
import { getLoggedInUserPlaylists } from '../state/actions/user'

type Props = {
  navigation?: any
}

type State = {
  isLoading: boolean
  isLoadingMore: boolean
  queryFrom: string | null
  showNoInternetConnectionMessage?: boolean
}

export class PlaylistsScreen extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'Playlists'
  }

  constructor(props: Props) {
    super(props)
    const { isLoggedIn } = this.global.session

    this.state = {
      isLoading: isLoggedIn,
      isLoadingMore: false,
      queryFrom: isLoggedIn ? PV.Filters._myPlaylistsKey : PV.Filters._subscribedKey
    }
  }

  async componentDidMount() {
    const { navigation } = this.props
    const { queryFrom } = this.state

    if (this.global.session.isLoggedIn) {
      const newState = await this._queryData(queryFrom)
      this.setState(newState)
    }

    const playlistId = navigation.getParam('navToPlaylistWithId')

    if (playlistId) {
      navigation.navigate(PV.RouteNames.MorePlaylistScreen, { playlistId })
    }

    gaTrackPageView('/playlists', 'Playlists Screen')
  }

  selectLeftItem = async (selectedKey: string) => {
    if (!selectedKey) {
      this.setState({ queryFrom: null })
      return
    }

    this.setState(
      {
        isLoading: true,
        queryFrom: selectedKey
      },
      async () => {
        const newState = await this._queryData(selectedKey)
        this.setState(newState)
      }
    )
  }

  _ItemSeparatorComponent = () => {
    return <Divider />
  }

  _renderPlaylistItem = ({ item, index }) => {
    const { queryFrom } = this.state
    const ownerName = (item.owner && item.owner.name) || 'anonymous'

    return (
      <PlaylistTableCell
        {...(queryFrom === PV.Filters._subscribedKey ? { createdBy: ownerName } : {})}
        hasZebraStripe={isOdd(index)}
        itemCount={item.itemCount}
        onPress={() =>
          this.props.navigation.navigate(PV.RouteNames.PlaylistScreen, {
            playlist: item,
            navigationTitle: queryFrom === PV.Filters._myPlaylistsKey ? 'My Playlist' : 'Playlist'
          })
        }
        title={item.title}
      />
    )
  }

  _onPressLogin = () => this.props.navigation.navigate(PV.RouteNames.AuthScreen)

  render() {
    const { isLoading, isLoadingMore, queryFrom, showNoInternetConnectionMessage } = this.state
    const { myPlaylists, subscribedPlaylists } = this.global.playlists
    const flatListData = queryFrom === PV.Filters._myPlaylistsKey ? myPlaylists : subscribedPlaylists

    return (
      <View style={styles.view}>
        <View style={styles.view}>
          <TableSectionSelectors
            handleSelectLeftItem={this.selectLeftItem}
            screenName='PlaylistsScreen'
            selectedLeftItemKey={queryFrom}
          />
          {isLoading && <ActivityIndicator />}
          {!isLoading && flatListData && flatListData.length > 0 && (
            <FlatList
              data={flatListData}
              disableLeftSwipe={true}
              extraData={flatListData}
              isLoadingMore={isLoadingMore}
              ItemSeparatorComponent={this._ItemSeparatorComponent}
              renderItem={this._renderPlaylistItem}
              showNoInternetConnectionMessage={showNoInternetConnectionMessage}
            />
          )}
          {!isLoading && queryFrom === PV.Filters._myPlaylistsKey && !this.global.session.isLoggedIn && (
            <MessageWithAction
              topActionHandler={this._onPressLogin}
              topActionText='Login'
              message='Login to view your playlists'
            />
          )}
          {!isLoading &&
            queryFrom === PV.Filters._myPlaylistsKey &&
            this.global.session.isLoggedIn &&
            flatListData.length < 1 && <MessageWithAction message='You have no subscribed playlists' />}
          {!isLoading && queryFrom === PV.Filters._subscribedKey && flatListData.length < 1 && (
            <MessageWithAction message='You have no subscribed playlists' />
          )}
        </View>
      </View>
    )
  }

  _queryData = async (
    filterKey: string | null,
    queryOptions: {
      queryPage?: number
      searchAllFieldsText?: string
    } = {}
  ) => {
    const newState = {
      isLoading: false,
      isLoadingMore: false,
      showNoInternetConnectionMessage: false
    } as State

    const hasInternetConnection = await hasValidNetworkConnection()
    newState.showNoInternetConnectionMessage = !hasInternetConnection

    try {
      if (filterKey === PV.Filters._myPlaylistsKey) {
        if (this.global.session.isLoggedIn) {
          await getLoggedInUserPlaylists(this.global)
        }
      } else {
        const playlistId = this.global.session.userInfo.subscribedPlaylistIds

        if (playlistId && playlistId.length > 0) {
          await getPlaylists(playlistId, this.global)
        }
      }

      return newState
    } catch (error) {
      return newState
    }
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  }
})
