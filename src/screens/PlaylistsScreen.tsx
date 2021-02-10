import { StyleSheet } from 'react-native'
import React from 'reactn'
import { ActivityIndicator, Divider, FlatList, MessageWithAction, PlaylistTableCell, Text, View } from '../components'
import { translate } from '../lib/i18n'
import { hasValidNetworkConnection } from '../lib/network'
import { testProps } from '../lib/utility'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
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
      navigation.navigate(PV.RouteNames.MorePlaylistScreen, { playlistId })
    }

    trackPageView('/playlists', 'Playlists Screen')
  }

  _ItemSeparatorComponent = () => <Divider />

  _renderPlaylistItem = ({ index, item, section }) => {
    const ownerName = (item.owner && item.owner.name) || translate('anonymous')
    const isSubscribed = section.value === PV.Filters._sectionSubscribedPlaylistsKey

    return (
      <PlaylistTableCell
        {...(isSubscribed ? { createdBy: ownerName } : {})}
        itemCount={item.itemCount}
        onPress={() =>
          this.props.navigation.navigate(PV.RouteNames.PlaylistScreen, {
            playlist: item
          })
        }
        testID={`${testIDPrefix}_playlist_item_${index}`}
        title={item.title}
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

  render() {
    const { isLoading, isLoadingMore, sections, showNoInternetConnectionMessage } = this.state
    const { offlineModeEnabled } = this.global

    const showOfflineMessage = offlineModeEnabled

    return (
      <View style={styles.view} {...testProps('playlists_screen_view')}>
        <View style={styles.view}>
          {isLoading && <ActivityIndicator fillSpace />}
          {!isLoading && this.global.session.isLoggedIn && (
            <FlatList
              disableLeftSwipe
              isLoadingMore={isLoadingMore}
              ItemSeparatorComponent={this._ItemSeparatorComponent}
              keyExtractor={(item: any) => item.id}
              noResultsMessage={translate('No playlists found')}
              renderItem={this._renderPlaylistItem}
              renderSectionHeader={({ section }) => (
                  <View style={styles.sectionItemWrapper}>
                    <Text style={styles.sectionItemText}>{section.title}</Text>
                  </View>
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
