import { Text, TouchableOpacity } from 'react-native'
import React from 'reactn'
import { ActivityIndicator, Divider, QueueTableCell, SortableList, SortableListRow, TextInput,
  View } from '../components'
import { combineAndSortPlaylistItems } from '../lib/utility'
import { PV } from '../resources'
import { getPlaylist } from '../services/playlist'
import { updatePlaylist } from '../state/actions/playlists'
import { navHeader } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  isLoading: boolean
  newItemsOrderByIndex?: [string]
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
          <Text style={navHeader.button}>Save</Text>
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
      isLoading: false,
      playlist: newPlaylist,
      sortableListData
    })
  }

  _updatePlaylist = async () => {
    this.setState({
      isLoading: true
    }, async () => {
      const { newTitle, playlist } = this.state
      const itemsOrder = this._getItemsOrder()
      await updatePlaylist({
        id: playlist.id,
        ...(itemsOrder.length > 0 ? { itemsOrder } : {}),
        title: newTitle
      }, this.global)
      this.props.navigation.goBack(null)
    })
  }

  _getItemsOrder = () => {
    const { newItemsOrderByIndex, sortableListData } = this.state
    const itemsOrder = []
    if (newItemsOrderByIndex && newItemsOrderByIndex.length > 0) {
      for (const index of newItemsOrderByIndex) {
        itemsOrder.push(sortableListData[index].id)
      }
    }
    return itemsOrder
  }

  _ItemSeparatorComponent = () => {
    return <Divider />
  }

  _renderRow = ({ active, data }) => {
    let cell
    if (data.startTime) {
      cell = (
        <View>
          <QueueTableCell
            clipEndTime={data.endTime}
            clipStartTime={data.startTime}
            clipTitle={data.title}
            episodePubDate={data.episode.pubDate}
            episodeTitle={data.episode.title}
            podcastImageUrl={data.episode.podcast.imageUrl}
            podcastTitle={data.episode.podcast.title} />
          <Divider style={styles.tableCellDivider} />
        </View>
      )
    } else {
      cell = (
        <View>
          <QueueTableCell
            episodePubDate={data.pubDate}
            episodeTitle={data.title}
            podcastImageUrl={data.podcast.imageUrl}
            podcastTitle={data.podcast.title} />
          <Divider style={styles.tableCellDivider} />
        </View>
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
    this.setState({ newItemsOrderByIndex: currentOrder })
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
  tableCellDivider: {
    marginBottom: 2
  },
  textInput: {
    fontSize: PV.Fonts.sizes.lg
  },
  view: {
    flex: 1
  }
}
