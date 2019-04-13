import { Text, TouchableOpacity } from 'react-native'
import React from 'reactn'
import { ActivityIndicator, ClipTableCell, Divider, EpisodeTableCell, SortableList, SortableListRow,
  TextInput, View } from '../components'
import { combineAndSortPlaylistItems, removeHTMLFromString } from '../lib/utility'
import { PV } from '../resources'
import { getPlaylist, updatePlaylist } from '../services/playlist'
import { navHeader } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  isLoading: boolean
  newTitle?: string
  playlist: any
  sortableListData: any[]
}

export class EditPlaylistScreen extends React.Component<Props, State> {

  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Edit Playlist',
      headerRight: (
        <TouchableOpacity onPress={navigation.getParam('updatePlaylist')}>
          <Text style={navHeader.textButton}>Save</Text>
        </TouchableOpacity>
      )
    }
  }

  constructor(props: Props) {
    super(props)
    const playlist = props.navigation.getParam('playlist')

    this.state = {
      isLoading: true,
      newTitle: playlist.title,
      playlist,
      sortableListData: []
    }
  }

  async componentDidMount() {
    const { playlist } = this.state

    this.props.navigation.setParams({ updatePlaylist: this._updatePlaylist })

    const newPlaylist = await getPlaylist(playlist.id)
    const { episodes, itemsOrder, mediaRefs } = newPlaylist
    const sortableListData = combineAndSortPlaylistItems(episodes, mediaRefs, itemsOrder)

    this.setState({
      sortableListData,
      isLoading: false,
      playlist: newPlaylist
    })
  }

  _updatePlaylist = async () => {
    const { newTitle, playlist, sortableListData } = this.state

    console.log(sortableListData)

    await updatePlaylist({
      id: playlist.id,
      title: newTitle
    })
    this.props.navigation.goBack(null)
  }

  _ItemSeparatorComponent = () => {
    return <Divider />
  }

  _renderRow = ({ active, data }) => {
    let cell
    if (data.startTime) {
      cell = (
        <ClipTableCell
          key={data.id}
          endTime={data.endTime}
          episodePubDate={data.episode.pubDate}
          episodeTitle={data.episode.title}
          podcastImageUrl={data.episode.podcast.imageUrl}
          podcastTitle={data.episode.podcast.title}
          startTime={data.startTime}
          title={data.title} />
      )
    } else {
      cell = (
        <EpisodeTableCell
          key={data.id}
          description={removeHTMLFromString(data.description)}
          podcastImageUrl={data.podcast.imageUrl}
          podcastTitle={data.podcast.title}
          pubDate={data.pubDate}
          title={data.title} />
      )
    }

    return (
      <SortableListRow
        active={active}
        cell={cell} />
    )
  }

  _onChangeTitle = (text: string) => {
    this.setState({ newTitle: text })
  }

  _onReleaseRow = (key: number, currentOrder: [string]) => {
    console.log('key', key)
    console.log('currentOrder', currentOrder)
  }

  render() {
    const { sortableListData, isLoading, newTitle } = this.state

    return (
      <View style={styles.view}>
        <TextInput
          autoCapitalize='none'
          onChangeText={this._onChangeTitle}
          placeholder='playlist title'
          style={styles.textInput}
          underlineColorAndroid='transparent'
          value={newTitle} />
        <Divider />
        {
          isLoading &&
          <ActivityIndicator />
        }
        {
          !isLoading && sortableListData && sortableListData.length > 0 &&
            <SortableList
              data={sortableListData}
              onReleaseRow={this._onReleaseRow}
              renderRow={this._renderRow} />
        }
      </View>
    )
  }
}

const styles = {
  textInput: {
    fontSize: PV.Fonts.sizes.lg
  },
  view: {
    flex: 1
  }
}
