import { StyleSheet, View as RNView, Alert } from 'react-native'
import React, { getGlobal } from 'reactn'
import {
  ActivityIndicator,
  Divider,
  FlatList,
  MessageWithAction,
  NavHeaderButtonText,
  PlaylistTableCell,
  PVDialog,
  SwipeRowBack,
  TableSectionSelectors,
  View
} from '../components'
import { errorLogger } from '../lib/logger'
import { translate } from '../lib/i18n'
import { alertIfNoNetworkConnection, hasValidNetworkConnection } from '../lib/network'
import { safeKeyExtractor } from '../lib/utility'
import { PV } from '../resources'
import PVEventEmitter from '../services/eventEmitter'
import { trackPageView } from '../services/tracking'
import { createPlaylist, deletePlaylist, toggleSubscribeToPlaylist } from '../state/actions/playlist'
import { getLoggedInUserPlaylistsCombined } from '../state/actions/user'

const _fileName = 'src/screens/PlaylistsScreen.tsx'

type Props = {
  navigation?: any
}

type State = {
  isLoading: boolean
  isLoadingMore: boolean
  isRemoving?: boolean
  newPlaylistTitle?: string
  sections?: any[]
  showNewPlaylistDialog?: boolean
  showNoInternetConnectionMessage?: boolean
}

const testIDPrefix = 'playlists_screen'

export class PlaylistsScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    const { isLoggedIn } = this.global.session

    this.state = {
      isLoading: isLoggedIn,
      isLoadingMore: false
    }
  }

  static navigationOptions = ({ navigation }) => {
    const isLoggedIn = !!getGlobal().session?.isLoggedIn

    return {
      title: translate('Playlists'),
      headerRight: () => (
        <RNView>
          {isLoggedIn && (
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
    const { navigation } = this.props

    navigation.setParams({
      showNewPlaylistDialog: this._showNewPlaylistDialog
    })

    if (this.global.session.isLoggedIn) {
      const newState = await this._queryData()
      this.setState(newState)
    }

    const playlistId = navigation.getParam('navToPlaylistWithId')

    if (playlistId) {
      navigation.navigate(PV.RouteNames.PlaylistScreen, { playlistId })
    }

    PVEventEmitter.on(PV.Events.PLAYLISTS_UPDATED, this._refreshSections)

    trackPageView('/playlists', 'Playlists Screen')
  }

  componentWillUnmount() {
    PVEventEmitter.removeListener(PV.Events.PLAYLISTS_UPDATED, this._refreshSections)
  }

  _refreshSections = () => {
    const sections = this.generatePlaylistsSections()
    this.setState({ sections })
  }

  _ItemSeparatorComponent = () => <Divider optional />

  _renderPlaylistItem = ({ index, item, section }) => {
    const ownerName = (item.owner && item.owner.name) || translate('anonymous')
    const sectionKey = section.value
    const isSubscribed = sectionKey === PV.Filters._sectionSubscribedPlaylistsKey

    return (
      <PlaylistTableCell
        accessibilityHint={translate('ARIA HINT - tap to go to this playlist')}
        {...(isSubscribed ? { createdBy: ownerName } : {})}
        itemCount={item.itemCount}
        onPress={() =>
          this.props.navigation.navigate(PV.RouteNames.PlaylistScreen, {
            playlist: item
          })
        }
        testID={`${testIDPrefix}_playlist_${sectionKey}_item_${index}`}
        title={item.title || translate('Untitled Playlist')}
      />
    )
  }

  _onPressLogin = () => {
    this.props.navigation.goBack(null)
    this.props.navigation.navigate(PV.RouteNames.AuthScreen)
  }

  generatePlaylistsSections = () => {
    const { myPlaylists, subscribedPlaylists } = this.global.playlists

    const sections = []
    if (myPlaylists && myPlaylists.length > 0) {
      sections.push({
        title: translate('My Playlists'),
        data: myPlaylists,
        value: PV.Filters._sectionMyPlaylistsKey
      })
    }

    if (subscribedPlaylists && subscribedPlaylists.length > 0) {
      sections.push({
        title: translate('Subscribed Playlists'),
        data: subscribedPlaylists,
        value: PV.Filters._sectionSubscribedPlaylistsKey
      })
    }

    return sections
  }

  _renderHiddenItem = ({ item, index, section }, rowMap) => {
    const { isRemoving } = this.state
    const sectionKey = section.value
    const buttonText =
      section.value === PV.Filters._sectionMyPlaylistsKey ? translate('Delete') : translate('Unsubscribe')

    const onPress =
      section.value === PV.Filters._sectionMyPlaylistsKey
        ? this._handleHiddenItemPressDelete
        : this._handleHiddenItemPressUnsubscribe

    const testIDSuffix = section.value === PV.Filters._sectionMyPlaylistsKey ? 'delete' : 'unsubscribe'

    return (
      <SwipeRowBack
        isLoading={isRemoving}
        onPress={() => onPress?.(item.id, rowMap)}
        testID={`${testIDPrefix}_playlist_${sectionKey}_item_${index}_${testIDSuffix}`}
        text={buttonText}
      />
    )
  }

  _handleHiddenItemPressUnsubscribe = async (id: string, rowMap: any) => {
    const wasAlerted = await alertIfNoNetworkConnection('subscribe to playlist')
    if (wasAlerted) return

    this.setState({ isRemoving: true }, () => {
      (async () => {
        try {
          await toggleSubscribeToPlaylist(id)
          const ignoreIndex = -1
          const rowId = safeKeyExtractor(testIDPrefix, ignoreIndex, id)
          rowMap[rowId]?.closeRow()

          const sections = this.generatePlaylistsSections()
          this.setState({ isRemoving: false, sections })
        } catch (error) {
          this.setState({ isRemoving: false })
        }
      })()
    })
  }

  _handleHiddenItemPressDelete = async (id: string, rowMap: any) => {
    const wasAlerted = await alertIfNoNetworkConnection('delete playlist')
    if (wasAlerted) return

    this.setState({ isRemoving: true }, () => {
      (async () => {
        try {
          await deletePlaylist(id)
          const ignoreIndex = -1
          const rowId = safeKeyExtractor(testIDPrefix, ignoreIndex, id)
          rowMap[rowId]?.closeRow()

          const sections = this.generatePlaylistsSections()
          this.setState({ isRemoving: false, sections })
        } catch (error) {
          this.setState({ isRemoving: false })
        }
      })()
    })
  }

  _showNewPlaylistDialog = () =>
    this.setState({
      newPlaylistTitle: '',
      showNewPlaylistDialog: true
    })

  _handleNewPlaylistTextChange = (text: string) => this.setState({ newPlaylistTitle: text })

  _handleNewPlaylistDismiss = () => this.setState({ showNewPlaylistDialog: false })

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

  render() {
    const { isLoading, isLoadingMore, newPlaylistTitle, sections,
      showNewPlaylistDialog, showNoInternetConnectionMessage } = this.state
    const { globalTheme } = this.global

    return (
      <View style={styles.view} testID={`${testIDPrefix}_view`}>
        <View style={styles.view}>
          {isLoading && <ActivityIndicator fillSpace testID={testIDPrefix} />}
          {!isLoading && this.global.session.isLoggedIn && (
            <FlatList
              disableLeftSwipe={false}
              extraData={sections}
              isLoadingMore={isLoadingMore}
              ItemSeparatorComponent={this._ItemSeparatorComponent}
              keyExtractor={(item: any, index: number) => safeKeyExtractor(testIDPrefix, index, item?.id)}
              noResultsMessage={translate('No playlists found')}
              renderHiddenItem={this._renderHiddenItem}
              renderItem={this._renderPlaylistItem}
              renderSectionHeader={({ section }) => (
                <TableSectionSelectors
                  disableFilter
                  includePadding
                  selectedFilterLabel={section.title}
                  textStyle={globalTheme.headerText}
                />
              )}
              sections={sections}
              showNoInternetConnectionMessage={showNoInternetConnectionMessage}
            />
          )}
          {!isLoading && !this.global.session.isLoggedIn && (
            <MessageWithAction
              message={translate('Login to view your playlists')}
              testID={testIDPrefix}
              topActionHandler={this._onPressLogin}
              topActionText={translate('Login')}
            />
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
      </View>
    )
  }

  _queryData = async () => {
    const newState = {
      isLoading: false,
      isLoadingMore: false,
      showNoInternetConnectionMessage: false
    } as State

    const hasInternetConnection = await hasValidNetworkConnection()

    if (!hasInternetConnection) {
      newState.showNoInternetConnectionMessage = true
      return newState
    }

    try {
      await getLoggedInUserPlaylistsCombined()
      const sections = this.generatePlaylistsSections()
      newState.sections = sections
    } catch (error) {
      errorLogger(_fileName, '_queryData', error)
      newState.sections = []
    }
    return newState
  }
}

const styles = StyleSheet.create({
  sectionItemText: {
    fontSize: PV.Fonts.sizes.xxxl,
    fontWeight: PV.Fonts.weights.bold,
    paddingHorizontal: 8
  },
  sectionItemWrapper: {
    marginBottom: 20,
    marginTop: 28
  },
  view: {
    flex: 1
  }
})
