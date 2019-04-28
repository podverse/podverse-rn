import React, { setGlobal } from 'reactn'
import { ActionSheet, ActivityIndicator, ClipTableCell, Divider, EpisodeTableCell, FlatList,
  PlaylistTableHeader, View } from '../components'
import { convertToNowPlayingItem } from '../lib/NowPlayingItem'
import { removeHTMLFromString } from '../lib/utility'
import { PV } from '../resources'
import { getPlaylist, toggleSubscribeToPlaylist } from '../state/actions/playlists'

type Props = {
  navigation?: any
}

type State = {
  endOfResultsReached: boolean
  isLoading: boolean
  isLoadingMore: boolean
  isLoggedInUserPlaylist: boolean
  isSubscribed: boolean
  selectedItem?: any
  showActionSheet: boolean
}

export class PlaylistScreen extends React.Component<Props, State> {

  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('navigationTitle')
  })

  constructor(props: Props) {
    super(props)
    const { id, subscribedPlaylistIds } = this.global.session.userInfo
    const playlist = this.props.navigation.getParam('playlist')
    const isLoggedInUserPlaylist = playlist.owner.id === id
    const isSubscribed = subscribedPlaylistIds.some((x: string) => playlist.id)

    this.state = {
      endOfResultsReached: false,
      isLoading: true,
      isLoadingMore: false,
      isLoggedInUserPlaylist,
      isSubscribed,
      showActionSheet: false
    }

    setGlobal({
      screenPlaylist: {
        flatListData: [],
        playlist: null
      }
    })
  }

  async componentDidMount() {
    const playlist = this.props.navigation.getParam('playlist')
    await getPlaylist(playlist.id, this.global)
    this.setState({ isLoading: false })
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
          handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(item, null, null))}
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
          handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(item, null, null))}
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
    this.props.navigation.navigate(
      PV.RouteNames.EditPlaylistScreen,
      { playlist: this.global.screenPlaylist.playlist }
    )
  }

  _handleSubscribeToggle = async (id: string) => {
    const { playlist } = this.global.screenPlaylist
    await toggleSubscribeToPlaylist(id)
    const { subscribedPlaylistIds } = this.global.session.userInfo
    const isSubscribed = subscribedPlaylistIds.some((x: string) => playlist.id)
    this.setState({ isSubscribed })
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

  render() {
    const { isLoading, isLoadingMore, isLoggedInUserPlaylist, isSubscribed, selectedItem,
      showActionSheet } = this.state
    const { globalTheme, screenPlaylist, session } = this.global
    const { navigation } = this.props
    const playlist = screenPlaylist.playlist ? screenPlaylist.playlist : navigation.getParam('playlist')
    const flatListData = screenPlaylist.flatListData || []

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
          !isLoading && flatListData &&
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
          items={PV.ActionSheet.media.moreButtons(
            selectedItem, this.global.session.isLoggedIn, this.global, navigation, this._handleCancelPress
          )}
          showModal={showActionSheet} />
      </View>
    )
  }
}

const styles = {
  view: {
    flex: 1
  }
}
