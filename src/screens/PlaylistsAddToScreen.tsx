import { Episode, MediaRef, Playlist, PodcastMedium, isOdd } from 'podverse-shared'
import { Alert, StyleSheet, View as RNView } from 'react-native'
import React from 'reactn'
import {
  ActivityIndicator,
  Divider,
  FastImage,
  FlatList,
  MessageWithAction,
  NavDismissIcon,
  NavHeaderButtonText,
  PlaylistTableCell,
  PVDialog,
  Text,
  View
} from '../components'
import { errorLogger } from '../lib/logger'
import { translate } from '../lib/i18n'
import { alertIfNoNetworkConnection } from '../lib/network'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { addOrRemovePlaylistItem, createPlaylist } from '../state/actions/playlist'
import { getLoggedInUserPlaylists } from '../state/actions/user'

const _fileName = 'src/screens/PlaylistsAddToScreen.tsx'

type Props = {
  navigation?: any
}

type State = {
  episode?: Episode
  isLoading: boolean
  isSavingId?: string
  mediaRef?: MediaRef
  medium: PodcastMedium
  newPlaylistTitle?: string
  showNewPlaylistDialog?: boolean
}

const testIDPrefix = 'playlists_add_to_screen'

export class PlaylistsAddToScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    const { navigation } = props
    const { isLoggedIn } = this.global.session
    this.state = {
      episode: navigation.getParam('episode'),
      isLoading: true,
      mediaRef: navigation.getParam('mediaRef')
    }

    navigation.setParams({ isLoggedIn })
  }

  static navigationOptions = ({ navigation }) => {
    const headerLeft = navigation.getParam('isModal') ? (
      <NavDismissIcon handlePress={navigation.dismiss} testID={testIDPrefix} />
    ) : null

    return {
      title: translate('Add to Playlist'),
      ...(headerLeft ? { headerLeft } : {}),
      headerRight: () => (
        <RNView>
          {navigation.getParam('isLoggedIn') && (
            <NavHeaderButtonText
              accessibilityHint={translate('ARIA HINT - create a new playlist')}
              accessibilityLabel={translate('New')}
              handlePress={navigation.getParam('showNewPlaylistDialog')}
              testID={`${testIDPrefix}_new`}
              text={translate('New')}
            />
          )}
        </RNView>
      )
    }
  }

  async componentDidMount() {
    this.props.navigation.setParams({
      showNewPlaylistDialog: this._showNewPlaylistDialog
    })

    try {
      await getLoggedInUserPlaylists(this.global)
    } catch (error) {
      //
    }
    this.setState({ isLoading: false })
    trackPageView('/playlists-add-to', 'Playlists Add To Screen')
  }

  _saveNewPlaylist = async () => {
    const wasAlerted = await alertIfNoNetworkConnection('create a playlist')
    if (wasAlerted) return

    this.setState(
      {
        isLoading: true,
        showNewPlaylistDialog: false
      },
      () => {
        (async () => {
          const { newPlaylistTitle } = this.state

          try {
            await createPlaylist({ title: newPlaylistTitle }, this.global)
          } catch (error) {
            if (error.response) {
              Alert.alert(
                PV.Alerts.SOMETHING_WENT_WRONG.title,
                PV.Alerts.SOMETHING_WENT_WRONG.message,
                PV.Alerts.BUTTONS.OK
              )
            }
          }

          this.setState({
            isLoading: false
          })
        })()
      }
    )
  }

  _showNewPlaylistDialog = () =>
    this.setState({
      newPlaylistTitle: '',
      showNewPlaylistDialog: true
    })

  _handleNewPlaylistTextChange = (text: string) => this.setState({ newPlaylistTitle: text })

  _handleNewPlaylistDismiss = () => this.setState({ showNewPlaylistDialog: false })

  _ItemSeparatorComponent = () => <Divider optional />

  _renderPlaylistItem = ({ item, index }) => {
    const { episode, isSavingId, mediaRef } = this.state

    const episodeId = episode?.id
    const mediaRefId = mediaRef?.id

    return (
      <PlaylistTableCell
        accessibilityHint={translate('ARIA HINT - Tap to add to this playlist')}
        hasZebraStripe={isOdd(index)}
        isSaving={item.id && item.id === isSavingId}
        itemCount={item.itemCount}
        itemId={episodeId || mediaRefId}
        itemsOrder={item.itemsOrder}
        onPress={() => {
          try {
            this.setState(
              {
                isSavingId: item.id
              },
              () => {
                (async () => {
                  try {
                    await addOrRemovePlaylistItem(item.id, episodeId, mediaRefId)
                  } catch (error) {
                    //
                  }
                  this.setState({ isSavingId: '' })
                })()
              }
            )
          } catch (error) {
            errorLogger(_fileName, '_renderPlaylistItem', error)
            this.setState({ isSavingId: '' })
          }
        }}
        showCheckmarks
        testID={`${testIDPrefix}_playlist_item_${index}`}
        title={item.title || translate('Untitled Playlist')}
      />
    )
  }

  _onPressLogin = () => this.props.navigation.navigate(PV.RouteNames.AuthScreen)

  render() {
    const { episode, isLoading, mediaRef, newPlaylistTitle, showNewPlaylistDialog } = this.state
    const { playlists, session } = this.global
    const { myPlaylists } = playlists
    const { isLoggedIn } = session

    const medium = mediaRef?.episode?.podcast?.medium
      || episode?.podcast?.medium
      || PV.Medium.mixed

    // Don't include playlists that are incompatible with the item on
    // the PlaylistsAddToScreen's medium type.
    const finalPlaylists = myPlaylists?.filter((myPlaylist: Playlist) =>
      myPlaylist?.medium === PV.Medium.mixed || myPlaylist?.medium === medium)

    const headerTitle = mediaRef?.title || episode?.title
    const headerSubtitle = mediaRef?.episode?.podcast?.title || episode?.podcast?.title
    const headerImage = mediaRef?.episode?.imageUrl
      || mediaRef?.episode?.podcast?.imageUrl
      || episode?.imageUrl
      || episode?.podcast?.imageUrl

    return (
      <View style={styles.view} testID={`${testIDPrefix}_view`}>
        {!isLoggedIn && (
          <MessageWithAction
            testID={testIDPrefix}
            topActionHandler={this._onPressLogin}
            topActionText={translate('Login')}
            message={translate('Login to add to playlists')}
          />
        )}
        {isLoggedIn && (
          <View style={styles.view}>
            {isLoading && <ActivityIndicator fillSpace testID={testIDPrefix} />}
            {!isLoading && finalPlaylists && (
              <>
                <View style={styles.headerWrapper}>
                  <FastImage
                    allowFullView
                    source={headerImage}
                    styles={styles.headerImage}
                  />
                  <View style={styles.headerTextWrapper}>
                    {headerTitle && (
                      <Text numberOfLines={1} style={styles.headerTitle}>{headerTitle}</Text>
                    )}
                    {headerSubtitle && (
                      <Text numberOfLines={1} style={styles.headerSubtitle}>{headerSubtitle}</Text>
                    )}
                  </View>
                </View>
                <Divider />
                <FlatList
                  data={finalPlaylists}
                  dataTotalCount={finalPlaylists.length}
                  extraData={finalPlaylists}
                  ItemSeparatorComponent={this._ItemSeparatorComponent}
                  keyExtractor={(item: any, index: number) => `myPlaylists_${index}`}
                  noResultsMessage={translate('No playlists found')}
                  renderItem={this._renderPlaylistItem}
                />
              </>
            )}
            <PVDialog
              buttonProps={[
                {
                  label: translate('Cancel'),
                  onPress: this._handleNewPlaylistDismiss,
                  testID: 'new_playlist_title_cancel'.prependTestId()
                },
                {
                  bold: true,
                  label: translate('Save'),
                  onPress: this._saveNewPlaylist,
                  testID: 'new_playlist_title_save'.prependTestId()
                }
              ]}
              inputProps={[
                {
                  onChangeText: this._handleNewPlaylistTextChange,
                  placeholder: translate('title of playlist'),
                  testID: 'new_playlist_title_input'.prependTestId(),
                  value: newPlaylistTitle || ''
                }
              ]}
              title={translate('New Playlist')}
              visible={showNewPlaylistDialog}
            />
          </View>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  },
  headerWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row'
  },
  headerImage: {
    height: PV.Table.cells.standard.height,
    width: PV.Table.cells.standard.height,
    marginRight: 16
  },
  headerTextWrapper: {
    flexDirection: 'column',
    flex: 1
  },
  headerTitle: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    marginTop: 4
  },
  headerSubtitle: {
    fontSize: PV.Fonts.sizes.sm,
    fontWeight: PV.Fonts.weights.semibold,
    color: PV.Colors.skyLight,
    marginTop: 6
  }
})
