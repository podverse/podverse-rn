import { Alert, AppState, StyleSheet, Text as RNText, TouchableOpacity, View as RNView } from 'react-native'
import Dialog from 'react-native-dialog'
import { Icon } from 'react-native-elements'
import React from 'reactn'
import { ActivityIndicator, Divider, FlatList, MessageWithAction, PlaylistTableCell, View } from '../components'
import { alertIfNoNetworkConnection } from '../lib/network'
import { PV } from '../resources'
import { getNowPlayingItemFromQueueOrHistoryByTrackId, PVTrackPlayer } from '../services/player'
import PlayerEventEmitter from '../services/playerEventEmitter'
import { updatePlayerState } from '../state/actions/player'
import { addOrRemovePlaylistItem, createPlaylist } from '../state/actions/playlist'
import { getLoggedInUserPlaylists } from '../state/actions/user'
import { navHeader } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  episodeId?: string
  isLoading: boolean
  isSavingId?: string
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
      <RNView>
        {
          navigation.getParam('isLoggedIn') &&
            <TouchableOpacity onPress={navigation.getParam('showNewPlaylistDialog')}>
              <RNText style={navHeader.buttonText}>New</RNText>
            </TouchableOpacity>
        }
      </RNView>
    )
  })

  constructor(props: Props) {
    super(props)
    const { navigation } = props
    const { isLoggedIn } = this.global.session
    this.state = {
      episodeId: navigation.getParam('episodeId'),
      isLoading: true,
      mediaRefId: navigation.getParam('mediaRefId')
    }

    navigation.setParams({ isLoggedIn })
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
    const trackId = await PVTrackPlayer.getCurrentTrack()
    const currentItem = await getNowPlayingItemFromQueueOrHistoryByTrackId(trackId)

    if (!currentItem || (!lastItem) || (lastItem && currentItem.episodeId !== lastItem.episodeId)) {
      dismiss()
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
    const { episodeId, isSavingId, mediaRefId } = this.state

    return (
      <PlaylistTableCell
        isSaving={item.id && item.id === isSavingId}
        itemCount={item.itemCount}
        key={`PlaylistsAddToScreen_${item.id}`}
        onPress={() => {
          try {
            this.setState({
              isSavingId: item.id
            }, async () => {
              await addOrRemovePlaylistItem(item.id, episodeId, mediaRefId, this.global)
              this.setState({ isSavingId: '' })
            })
          } catch (error) {
            console.log(error)
            this.setState({ isSavingId: '' })
          }
        }}
        title={item.title} />
    )
  }

  _onPressLogin = () => this.props.navigation.navigate(PV.RouteNames.AuthScreen)

  render() {
    const { isLoading, newPlaylistTitle, showNewPlaylistDialog } = this.state
    const { playlists, session } = this.global
    const { myPlaylists } = playlists
    const { isLoggedIn } = session

    return (
      <View style={styles.view}>
        {
          !isLoggedIn &&
            <MessageWithAction
              actionHandler={this._onPressLogin}
              actionText='Login'
              message='Login to add to playlists' />
        }
        {
          isLoggedIn &&
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
        }
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
