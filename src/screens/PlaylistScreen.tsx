import React from 'reactn'
import { ActionSheet, ActivityIndicator, ClipTableCell, Divider, EpisodeTableCell, FlatList,
  PlaylistTableHeader, View } from '../components'
import { combineAndSortPlaylistItems, removeHTMLFromString } from '../lib/utility'
import { PV } from '../resources'
import { getPlaylist } from '../services/playlist'
import { toggleSubscribeToPlaylist } from '../state/actions/playlists'

type Props = {
  navigation?: any
}

type State = {
  endOfResultsReached: boolean
  flatListData: any[]
  isLoading: boolean
  isLoadingMore: boolean
  isLoggedInUserPlaylist: boolean
  isSubscribed: boolean
  playlist: any
  showActionSheet: boolean
}

export class PlaylistScreen extends React.Component<Props, State> {

  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('navigationTitle')
  })

  constructor(props: Props) {
    super(props)
    const playlist = props.navigation.getParam('playlist')
    const { id, subscribedPlaylistIds } = this.global.session.userInfo
    const isLoggedInUserPlaylist = playlist.owner.id === id
    const isSubscribed = subscribedPlaylistIds.some((x: string) => playlist.id)

    this.state = {
      endOfResultsReached: false,
      flatListData: [],
      isLoading: true,
      isLoadingMore: false,
      isLoggedInUserPlaylist,
      isSubscribed,
      playlist,
      showActionSheet: false
    }
  }

  async componentDidMount() {
    const { playlist } = this.state
    const newPlaylist = await getPlaylist(playlist.id)
    const { episodes, itemsOrder, mediaRefs } = newPlaylist
    const flatListData = combineAndSortPlaylistItems(episodes, mediaRefs, itemsOrder)

    this.setState({
      flatListData,
      isLoading: false,
      playlist: newPlaylist
    })
  }

  _ItemSeparatorComponent = () => {
    return <Divider />
  }

  _renderItem = ({ item }) => {
    if (item.startTime) {
      return (
        <ClipTableCell
          key={item.id}
          endTime={item.endTime}
          episodePubDate={item.episode.pubDate}
          episodeTitle={item.episode.title}
          handleMorePress={this._handleMorePress}
          podcastImageUrl={item.episode.podcast.imageUrl}
          podcastTitle={item.episode.podcast.title}
          startTime={item.startTime}
          title={item.title} />
      )
    } else {
      return (
        <EpisodeTableCell
          key={item.id}
          description={removeHTMLFromString(item.description)}
          handleMorePress={this._handleMorePress}
          handleNavigationPress={() => this.props.navigation.navigate(
            PV.RouteNames.MoreEpisodeScreen,
            { episode: item })
          }
          podcastImageUrl={item.podcast.imageUrl}
          podcastTitle={item.podcast.title}
          pubDate={item.pubDate}
          title={item.title} />
      )
    }
  }

  _handleEditPress = () => {
    console.log('handleEditPress')
  }

  _handleSubscribeToggle = async (id: string) => {
    const { playlist } = this.state
    await toggleSubscribeToPlaylist(id)
    const { subscribedPlaylistIds } = this.global.session.userInfo
    const isSubscribed = subscribedPlaylistIds.some((x: string) => playlist.id)
    this.setState({ isSubscribed })
  }

  _handleCancelPress = () => {
    this.setState({ showActionSheet: false })
  }

  _handleMorePress = () => {
    this.setState({ showActionSheet: true })
  }

  render() {
    const { flatListData, isLoading, isLoadingMore, isLoggedInUserPlaylist, isSubscribed, playlist,
      showActionSheet } = this.state
    const { globalTheme } = this.global

    return (
      <View style={styles.view}>
        <PlaylistTableHeader
          createdBy={isLoggedInUserPlaylist ? playlist.owner.name : null}
          handleEditPress={isLoggedInUserPlaylist ? this._handleEditPress : null}
          handleSubscribeToggle={isLoggedInUserPlaylist ? null : this._handleSubscribeToggle}
          id={playlist.id}
          isSubscribed={isSubscribed}
          itemCount={playlist.itemCount}
          lastUpdated={playlist.updatedAt}
          title={playlist.title} />
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
              renderItem={this._renderItem} />
        }
        <ActionSheet
          globalTheme={globalTheme}
          handleCancelPress={this._handleCancelPress}
          items={moreButtons}
          showModal={showActionSheet} />
      </View>
    )
  }
}

const moreButtons = [
  {
    key: 'stream',
    text: 'Stream',
    onPress: () => console.log('Stream')
  },
  {
    key: 'download',
    text: 'Download',
    onPress: () => console.log('Download')
  },
  {
    key: 'queueNext',
    text: 'Queue: Next',
    onPress: () => console.log('Queue: Next')
  },
  {
    key: 'queueLast',
    text: 'Queue: Last',
    onPress: () => console.log('Queue: Last')
  },
  {
    key: 'addToPlaylist',
    text: 'Add to Playlist',
    onPress: () => console.log('Add to Playlist')
  }
]

const styles = {
  view: {
    flex: 1
  }
}
