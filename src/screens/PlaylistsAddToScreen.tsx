import { Alert, AppState, StyleSheet, Text as RNText, TouchableOpacity } from 'react-native'
import Dialog from 'react-native-dialog'
import { Icon } from 'react-native-elements'
import React from 'reactn'
import { ActivityIndicator, Divider, FlatList, PlaylistTableCell, View } from '../components'
import { alertIfNoNetworkConnection } from '../lib/network'
import { PV } from '../resources'
import { getNowPlayingItem } from '../services/player'
import PlayerEventEmitter from '../services/playerEventEmitter'
import { setNowPlayingItem } from '../state/actions/player'
import { addOrRemovePlaylistItem, createPlaylist } from '../state/actions/playlist'
import { getLoggedInUserPlaylists } from '../state/actions/user'
import { navHeader } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  episodeId?: string
  isLoading: boolean
  mediaRefId?: string
  newPlaylistTitle?: string
  showNewPlaylistDialog?: boolean
}

export class PlaylistsAddToScreen extends React.Component<Props, State> {

  static navigationOptions = ({ navigation }) => ({
    title: 'Add to Playlist',
    headerLeft: (
      <TouchableOpacity
        onPress={navigation.dismiss}>
        <Icon
          color='#fff'
          iconStyle={styles.closeButton}
          name='angle-down'
          size={32}
          type='font-awesome'
          underlayColor={PV.Colors.brandColor} />
      </TouchableOpacity>
    ),
    headerRight: (
      <TouchableOpacity onPress={navigation.getParam('showNewPlaylistDialog')}>
        <RNText style={navHeader.buttonText}>New</RNText>
      </TouchableOpacity>
    )
  })

  constructor(props: Props) {
    super(props)
    const { navigation } = props
    this.state = {
      episodeId: navigation.getParam('episodeId'),
      isLoading: true,
      mediaRefId: navigation.getParam('mediaRefId')
    }
  }

  async componentDidMount() {
    this.props.navigation.setParams({ showNewPlaylistDialog: this._showNewPlaylistDialog })

    try {
      await getLoggedInUserPlaylists(this.global)
    } catch (error) {
      //
    }
    this.setState({ isLoading: false })

    AppState.addEventListener('change', this._handleAppStateChange)
    PlayerEventEmitter.on(PV.Events.PLAYER_QUEUE_ENDED, this._handleAppStateChange)
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange)
    PlayerEventEmitter.removeListener(PV.Events.PLAYER_QUEUE_ENDED)
  }

  _handleAppStateChange = async () => {
    const { dismiss } = this.props.navigation
    const { nowPlayingItem: lastItem } = this.global
    const currentItem = await getNowPlayingItem()

    if (!currentItem) {
      dismiss()
    } else if (lastItem && currentItem.episodeId !== lastItem.episodeId) {
      await setNowPlayingItem(currentItem, this.global)
    }
  }

  _saveNewPlaylist = async () => {
    const wasAlerted = await alertIfNoNetworkConnection('create a playlist')
    if (wasAlerted) return

    this.setState({
      isLoading: true,
      showNewPlaylistDialog: false
    }, async () => {
      const { newPlaylistTitle } = this.state

      try {
        await createPlaylist({ title: newPlaylistTitle }, this.global)
      } catch (error) {
        if (error.response) {
          Alert.alert(PV.Alerts.SOMETHING_WENT_WRONG.title, PV.Alerts.SOMETHING_WENT_WRONG.message, [])
        }
      }

      this.setState({
        isLoading: false
      })
    })
  }

  _showNewPlaylistDialog = () => this.setState({
    newPlaylistTitle: '',
    showNewPlaylistDialog: true
  })

  _handleNewPlaylistTextChange = (text: string) => this.setState({ newPlaylistTitle: text })

  _handleNewPlaylistDismiss = () => this.setState({ showNewPlaylistDialog: false })

  _ItemSeparatorComponent = () => <Divider />

  _renderPlaylistItem = ({ item }) => {
    const { episodeId, mediaRefId } = this.state

    return (
      <PlaylistTableCell
        key={`PlaylistsAddToScreen_${item.id}`}
        itemCount={item.itemCount}
        onPress={() => {
          try {
            addOrRemovePlaylistItem(item.id, episodeId, mediaRefId, this.global)
          } catch (error) {
            //
          }
        }}
        title={item.title} />
    )
  }

  render() {
    const { isLoading, newPlaylistTitle, showNewPlaylistDialog } = this.state
    const { myPlaylists } = this.global.playlists

    return (
      <View style={styles.view}>
        {
          isLoading &&
            <ActivityIndicator />
        }
        {
          !isLoading && myPlaylists && myPlaylists.length > 0 &&
            <FlatList
              data={myPlaylists}
              dataTotalCount={myPlaylists.length}
              disableLeftSwipe={true}
              extraData={myPlaylists}
              ItemSeparatorComponent={this._ItemSeparatorComponent}
              renderItem={this._renderPlaylistItem} />
        }
        {
          !isLoading && myPlaylists && myPlaylists.length === 0 &&
            <FlatList
              data={myPlaylists}
              dataTotalCount={0}
              disableLeftSwipe={true}
              extraData={myPlaylists}
              ItemSeparatorComponent={this._ItemSeparatorComponent}
              renderItem={this._renderPlaylistItem} />
        }
        <Dialog.Container visible={showNewPlaylistDialog}>
          <Dialog.Title>New Playlist</Dialog.Title>
          <Dialog.Input
            onChangeText={this._handleNewPlaylistTextChange}
            placeholder='title of playlist'
            value={newPlaylistTitle} />
          <Dialog.Button
            label='Cancel'
            onPress={this._handleNewPlaylistDismiss} />
          <Dialog.Button
            label='Save'
            onPress={this._saveNewPlaylist} />
        </Dialog.Container>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  closeButton: {
    paddingLeft: 8,
    paddingRight: 16,
    paddingVertical: 8
  },
  view: {
    flex: 1
  }
})
