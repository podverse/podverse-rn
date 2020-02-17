import {
  Alert,
  StyleSheet,
  Text as RNText,
  TouchableOpacity
} from 'react-native'
import React from 'reactn'
import {
  ActivityIndicator,
  Divider,
  QueueTableCell,
  SortableList,
  SortableListRow,
  Text,
  TextInput,
  View
} from '../components'
import { alertIfNoNetworkConnection } from '../lib/network'
import { combineAndSortPlaylistItems } from '../lib/utility'
import { PV } from '../resources'
import { gaTrackPageView } from '../services/googleAnalytics'
import { getPlaylist } from '../services/playlist'
import { updatePlaylist } from '../state/actions/playlist'
import { core, navHeader } from '../styles'

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
          <RNText style={navHeader.buttonText}>Save</RNText>
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

    try {
      const newPlaylist = await getPlaylist(playlist.id)
      const { episodes, itemsOrder, mediaRefs } = newPlaylist
      const sortableListData = combineAndSortPlaylistItems(
        episodes,
        mediaRefs,
        itemsOrder
      )

      this.setState({
        isLoading: false,
        playlist: newPlaylist,
        sortableListData
      })
    } catch (error) {
      this.setState({ isLoading: false })
    }

    gaTrackPageView('/edit-playlist', 'Edit Playlist Screen')
  }

  _updatePlaylist = async () => {
    const wasAlerted = await alertIfNoNetworkConnection('update the playlist')
    if (wasAlerted) return

    this.setState(
      {
        isLoading: true
      },
      async () => {
        const { newTitle, playlist } = this.state
        const itemsOrder = this._getItemsOrder()
        try {
          await updatePlaylist(
            {
              id: playlist.id,
              ...(itemsOrder.length > 0 ? { itemsOrder } : {}),
              title: newTitle
            },
            this.global
          )
          this.props.navigation.goBack(null)
        } catch (error) {
          if (error.response) {
            Alert.alert(
              PV.Alerts.SOMETHING_WENT_WRONG.title,
              PV.Alerts.SOMETHING_WENT_WRONG.message,
              PV.Alerts.BUTTONS.OK
            )
          }
        }
        this.setState({ isLoading: false })
      }
    )
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
            podcastTitle={data.episode.podcast.title}
            showMoveButton={true}
          />
          <Divider style={styles.tableCellDivider} />
        </View>
      )
    } else {
      cell = (
        <View>
          <QueueTableCell
            episodePubDate={data.pubDate}
            episodeTitle={data.title}
            podcastImageUrl={(data.podcast && data.podcast.imageUrl) || ''}
            podcastTitle={(data.podcast && data.podcast.title) || ''}
            showMoveButton={true}
          />
          <Divider style={styles.tableCellDivider} />
        </View>
      )
    }

    return <SortableListRow active={active} cell={cell} />
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
        <View style={styles.topWrapper}>
          <Text style={core.textInputLabel}>Title</Text>
          <TextInput
            autoCapitalize='none'
            onChangeText={this._onChangeTitle}
            placeholder='playlist title'
            returnKeyType='done'
            style={styles.textInput}
            underlineColorAndroid='transparent'
            value={newTitle}
          />
        </View>
        <Divider />
        {isLoading && <ActivityIndicator />}
        {!isLoading && sortableListData && sortableListData.length > 0 && (
          <SortableList
            data={sortableListData}
            onReleaseRow={this._onReleaseRow}
            renderRow={this._renderRow}
          />
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  tableCellDivider: {
    marginBottom: 2
  },
  textInput: {
    fontSize: PV.Fonts.sizes.xl
  },
  topWrapper: {
    marginHorizontal: 8,
    marginVertical: 16
  },
  view: {
    flex: 1
  }
})
