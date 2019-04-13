import React from 'reactn'
import { ActionSheet, ActivityIndicator, ClipTableCell, Divider, EpisodeTableCell, FlatList,
  TextInput, View } from '../components'
import { combineAndSortPlaylistItems, removeHTMLFromString } from '../lib/utility'
import { PV } from '../resources'
import { getPlaylist } from '../services/playlist'

type Props = {
  navigation?: any
}

type State = {
  flatListData: any[]
  isLoading: boolean
  newTitle?: string
  playlist: any
}

export class EditPlaylistScreen extends React.Component<Props, State> {

  static navigationOptions = {
    title: 'Edit Playlist'
  }

  constructor(props: Props) {
    super(props)
    const playlist = props.navigation.getParam('playlist')

    this.state = {
      flatListData: [],
      isLoading: true,
      newTitle: playlist.title,
      playlist
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

  _onChangeTitle = (text) => {
    this.setState({ newTitle: text })
  }

  render() {
    const { flatListData, isLoading, newTitle } = this.state

    return (
      <View style={styles.view}>
        <TextInput
          autoCapitalize='none'
          onChangeText={this._onChangeTitle}
          placeholder='playlist title'
          underlineColorAndroid='transparent'
          value={newTitle} />
        <Divider />
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
              ItemSeparatorComponent={this._ItemSeparatorComponent}
              renderItem={this._renderItem} />
        }
      </View>
    )
  }
}

const styles = {
  view: {
    flex: 1
  }
}
