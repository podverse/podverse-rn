import { StyleSheet } from 'react-native'
import React, { setGlobal } from 'reactn'
import { ActivityIndicator, Divider, FlatList, MessageWithAction, PlaylistTableCell, TableSectionSelectors,
  View } from '../components'
import { alertIfNoNetworkConnection } from '../lib/network'
import { PV } from '../resources'
import { getPlaylists } from '../state/actions/playlist'
import { getLoggedInUserPlaylists } from '../state/actions/user'

type Props = {
  navigation?: any
}

type State = {
  isLoading: boolean
  isLoadingMore: boolean
  queryFrom: string | null
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
      queryFrom: isLoggedIn ? _myPlaylistsKey : _subscribedPlaylistsKey
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
  }

  selectLeftItem = async (selectedKey: string) => {
    if (!selectedKey) {
      this.setState({ queryFrom: null })
      return
    }

    setGlobal({
      playlists: {
        myPlaylists: [],
        subscribedPlaylists: []
      }
    }, () => {
      this.setState({
        isLoading: true,
        queryFrom: selectedKey
      }, async () => {
        const newState = await this._queryData(selectedKey)
        this.setState(newState)
      })
    })
  }

  _ItemSeparatorComponent = () => {
    return <Divider />
  }

  _renderPlaylistItem = ({ item }) => {
    const { queryFrom } = this.state
    const ownerName = (item.owner && item.owner.name) || 'anonymous'

    return (
      <PlaylistTableCell
        key={item.id}
        {...(queryFrom === _subscribedPlaylistsKey ? { createdBy: ownerName } : {})}
        itemCount={item.itemCount}
        onPress={() => this.props.navigation.navigate(
          PV.RouteNames.PlaylistScreen, {
            playlist: item,
            navigationTitle: queryFrom === _myPlaylistsKey ? 'My Playlist' : 'Playlist'
          }
        )}
        title={item.title} />
    )
  }

  _onPressLogin = () => this.props.navigation.navigate(PV.RouteNames.AuthScreen)

  render() {
    const { isLoading, isLoadingMore, queryFrom } = this.state
    const { myPlaylists, subscribedPlaylists } = this.global.playlists
    const flatListData = queryFrom === _myPlaylistsKey ? myPlaylists : subscribedPlaylists

    return (
      <View style={styles.view}>
        <View style={styles.view}>
          <TableSectionSelectors
            handleSelectLeftItem={this.selectLeftItem}
            leftItems={leftItems}
            selectedLeftItemKey={queryFrom} />
          {
            isLoading &&
              <ActivityIndicator />
          }
          {
            !isLoading && flatListData && flatListData.length > 0 &&
              <FlatList
                data={flatListData}
                disableLeftSwipe={true}
                extraData={flatListData}
                isLoadingMore={isLoadingMore}
                ItemSeparatorComponent={this._ItemSeparatorComponent}
                renderItem={this._renderPlaylistItem} />
          }
          {
            !isLoading && queryFrom === _myPlaylistsKey && !this.global.session.isLoggedIn &&
              <MessageWithAction
                actionHandler={this._onPressLogin}
                actionText='Login'
                message='Login to view your playlists' />
          }
          {
            !isLoading && queryFrom === _myPlaylistsKey && this.global.session.isLoggedIn && flatListData.length < 1 &&
              <MessageWithAction message='You have not created a playlist' />
          }
          {
            !isLoading && queryFrom === _subscribedPlaylistsKey && flatListData.length < 1 &&
              <MessageWithAction
                message='You have no subscribed playlists'
                subMessage='Ask a friend to send you a link to one of their playlists, then subscribe to it' />
          }
        </View>
      </View>
    )
  }

  _queryData = async (filterKey: string | null, queryOptions: {
    queryPage?: number, searchAllFieldsText?: string
  } = {}) => {
    const newState = {
      isLoading: false,
      isLoadingMore: false
    } as State

    const wasAlerted = await alertIfNoNetworkConnection('load playlist items')
    if (wasAlerted) return newState

    try {
      if (filterKey === _myPlaylistsKey) {
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

const _myPlaylistsKey = 'myPlaylists'
const _subscribedPlaylistsKey = 'subscribed'

const leftItems = [
  {
    label: 'My Playlists',
    value: _myPlaylistsKey
  },
  {
    label: 'Subscribed',
    value: _subscribedPlaylistsKey
  }
]

const styles = StyleSheet.create({
  ListHeaderComponent: {
    borderBottomWidth: 0,
    borderTopWidth: 0,
    flex: 0,
    height: PV.FlatList.searchBar.height,
    justifyContent: 'center'
  },
  view: {
    flex: 1
  }
})
