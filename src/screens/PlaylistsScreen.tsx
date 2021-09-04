import { StyleSheet } from 'react-native'
import React from 'reactn'
import { ActivityIndicator, Divider, FlatList, MessageWithAction, PlaylistTableCell,
  SwipeRowBack, TableSectionSelectors, View } from '../components'
import { translate } from '../lib/i18n'
import { alertIfNoNetworkConnection, hasValidNetworkConnection } from '../lib/network'
import { safeKeyExtractor } from '../lib/utility'
import { PV } from '../resources'
import PVEventEmitter from '../services/eventEmitter'
import { trackPageView } from '../services/tracking'
import { deletePlaylist, toggleSubscribeToPlaylist } from '../state/actions/playlist'
import { getLoggedInUserPlaylistsCombined } from '../state/actions/user'

type Props = {
  navigation?: any
}

type State = {
  isLoading: boolean
  isLoadingMore: boolean
  isRemoving?: boolean
  sections?: any[]
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

  static navigationOptions = () => ({
      title: translate('Playlists')
    })

  async componentDidMount() {
    const { navigation } = this.props

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

  _ItemSeparatorComponent = () => <Divider />

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
      
    const onPress = section.value === PV.Filters._sectionMyPlaylistsKey
      ? this._handleHiddenItemPressDelete
      : this._handleHiddenItemPressUnsubscribe

    const testIDSuffix = section.value === PV.Filters._sectionMyPlaylistsKey
      ? 'delete'
      : 'unsubscribe'

    return (
      <SwipeRowBack
        isLoading={isRemoving}
        onPress={() => onPress(item.id, rowMap)}
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
          const row = rowMap[id]
          row?.closeRow()
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
          const row = rowMap[id]
          row?.closeRow()
          const sections = this.generatePlaylistsSections()
          this.setState({ isRemoving: false, sections })
        } catch (error) {
          this.setState({ isRemoving: false })
        }
      })()
    })
  }

  render() {
    const { isLoading, isLoadingMore, sections, showNoInternetConnectionMessage } = this.state
    const { globalTheme, offlineModeEnabled } = this.global
    const showOfflineMessage = offlineModeEnabled

    return (
      <View
        style={styles.view}
        testID={`${testIDPrefix}_view`}>
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
              showNoInternetConnectionMessage={showOfflineMessage || showNoInternetConnectionMessage}
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
      console.log('PlaylistsScreen _queryData', error)
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
