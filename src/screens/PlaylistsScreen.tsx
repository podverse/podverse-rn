import React from 'reactn'
import { ActivityIndicator, Divider, FlatList, PlaylistTableCell, TableSectionSelectors,
  View } from '../components'
import { PV } from '../resources'
import { getLoggedInUserPlaylists } from '../services/auth';
import { getPlaylists } from '../services/playlist'

type Props = {
  navigation?: any
}

type State = {
  flatListData: any[]
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
    this.state = {
      flatListData: [],
      isLoading: true,
      isLoadingMore: false,
      queryFrom: _myPlaylistsKey
    }
  }

  async componentDidMount() {
    const { queryFrom } = this.state
    const newState = await this._queryPlaylistData(queryFrom)
    this.setState(newState)
  }

  selectLeftItem = async (selectedKey: string) => {
    if (!selectedKey) {
      this.setState({ queryFrom: null })
      return
    }

    this.setState({
      flatListData: [],
      isLoading: true,
      queryFrom: selectedKey
    }, async () => {
      const newState = await this._queryPlaylistData(selectedKey)
      this.setState(newState)
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

  render() {
    const { flatListData, queryFrom, isLoading, isLoadingMore } = this.state

    return (
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
      </View>
    )
  }

  _queryPlaylistData = async (filterKey: string | null, queryOptions: {
    queryPage?: number, searchAllFieldsText?: string
  } = {}) => {
    const newState = {
      isLoading: false,
      isLoadingMore: false
    } as State
    const nsfwMode = this.global.settings.nsfwMode
    if (filterKey === _myPlaylistsKey) {
      const results = await getLoggedInUserPlaylists(nsfwMode)
      newState.flatListData = results[0]
    } else {
      const playlistId = this.global.session.userInfo.subscribedPlaylistIds
      if (playlistId && playlistId.length > 0) {
        const results = await getPlaylists({ playlistId }, nsfwMode)
        newState.flatListData = results
      }
    }

    return newState
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

const styles = {
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
}
