import { StyleSheet } from 'react-native'
import React from 'reactn'
import { translate } from 'src/lib/i18n'
import {
  ActivityIndicator,
  Divider,
  FlatList,
  MessageWithAction,
  PlaylistTableCell,
  SwipeRowBack,
  TableSectionSelectors,
  View
} from '../components'
import { translate } from '../lib/i18n'
import { alertIfNoNetworkConnection, hasValidNetworkConnection } from '../lib/network'
import { isOdd, testProps } from '../lib/utility'
import { PV } from '../resources'
import { gaTrackPageView } from '../services/googleAnalytics'
import { deletePlaylist, getPlaylists, toggleSubscribeToPlaylist } from '../state/actions/playlist'
import { getLoggedInUserPlaylists } from '../state/actions/user'

type Props = {
  navigation?: any
}

type State = {
  isLoading: boolean
  isLoadingMore: boolean
  isRemoving?: boolean
  queryFrom: string | null
  showNoInternetConnectionMessage?: boolean
}

export class PlaylistsScreen extends React.Component<Props, State> {
  static navigationOptions = () => {
    return {
      title: translate('Playlists')
    }
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

  _renderHiddenItem = ({ item }, rowMap) => {
    const { isRemoving, queryFrom } = this.state
    const text = queryFrom === PV.Filters._myPlaylistsKey ? 'Delete' : 'Unsubscribe'
    return (
      <SwipeRowBack isLoading={isRemoving} onPress={() => this._handleHiddenItemPress(item.id, rowMap)} text={text} />
    )
  }

  _handleHiddenItemPress = async (selectedId, rowMap) => {
    const { queryFrom } = this.state
    const text = queryFrom === PV.Filters._myPlaylistsKey ? 'Delete' : 'Unsubscribe from'

    const wasAlerted = await alertIfNoNetworkConnection(`${text} this profile`)
    if (wasAlerted) return

    this.setState({ isRemoving: true }, async () => {
      try {
        if (queryFrom === PV.Filters._myPlaylistsKey) {
          await deletePlaylist(selectedId)
        } else {
          await toggleSubscribeToPlaylist(selectedId)
        }
        rowMap[selectedId].closeRow()
        this.setState({ isRemoving: false })
      } catch (error) {
        this.setState({ isRemoving: false })
      }
    })
  }

  _onPressLogin = () => this.props.navigation.navigate(PV.RouteNames.AuthScreen)

  render() {
    const { isLoading, isLoadingMore, queryFrom, showNoInternetConnectionMessage } = this.state
    const { myPlaylists, subscribedPlaylists } = this.global.playlists
    const flatListData = queryFrom === PV.Filters._myPlaylistsKey ? myPlaylists : subscribedPlaylists

    return (
      <View style={styles.view} {...testProps('playlists_screen_view')}>
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
              disableLeftSwipe={false}
              extraData={flatListData}
              isLoadingMore={isLoadingMore}
              ItemSeparatorComponent={this._ItemSeparatorComponent}
              keyExtractor={(item: any) => item.id}
              renderHiddenItem={this._renderHiddenItem}
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
            flatListData.length < 1 && <MessageWithAction message='You have no created playlists' />}
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
          await getLoggedInUserPlaylists()
        }
      } else {
        const playlistId = this.global.session.userInfo.subscribedPlaylistIds

        if (playlistId && playlistId.length > 0) {
          await getPlaylists(playlistId)
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
