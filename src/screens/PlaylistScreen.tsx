import { convertNowPlayingItemToEpisode, convertToNowPlayingItem } from 'podverse-shared'
import { StyleSheet, View as RNView } from 'react-native'
import { NavigationStackOptions } from 'react-navigation-stack'
import React, { setGlobal } from 'reactn'
import {
  ActionSheet,
  ActivityIndicator,
  ClipTableCell,
  Divider,
  EpisodeTableCell,
  FlatList,
  NavSearchIcon,
  NavShareIcon,
  PlaylistTableHeader,
  View
} from '../components'
import { downloadEpisode } from '../lib/downloader'
import { translate } from '../lib/i18n'
import { navigateToEpisodeScreenWithItem } from '../lib/navigate'
import { alertIfNoNetworkConnection } from '../lib/network'
import { safeKeyExtractor, safelyUnwrapNestedVariable } from '../lib/utility'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { getHistoryItemIndexInfoForEpisode } from '../services/userHistoryItem'
import { getPlaylist, toggleSubscribeToPlaylist } from '../state/actions/playlist'
import { core } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  endOfResultsReached: boolean
  isLoading: boolean
  isLoadingMore: boolean
  isSubscribed: boolean
  isSubscribing: boolean
  playlist?: any
  playlistId?: string
  selectedItem?: any
  showActionSheet: boolean
}

const testIDPrefix = 'playlist_screen'

export class PlaylistScreen extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    const subscribedPlaylistIds = safelyUnwrapNestedVariable(
      () => this.global.session.userInfo.subscribedPlaylistIds,
      []
    )
    const playlist = this.props.navigation.getParam('playlist')
    const playlistId = (playlist && playlist.id) || this.props.navigation.getParam('playlistId')
    const isSubscribed = subscribedPlaylistIds.some((x: string) => x === playlistId)

    if (playlist && playlist.id) {
      this.props.navigation.setParams({ playlistId: playlist.id })
    }

    this.state = {
      endOfResultsReached: false,
      isLoading: true,
      isLoadingMore: false,
      isSubscribed,
      isSubscribing: false,
      playlist,
      playlistId,
      showActionSheet: false
    }

    setGlobal({
      screenPlaylist: {
        flatListData: [],
        flatListDataTotalCount: null,
        playlist: null
      }
    })
  }

  static navigationOptions = ({ navigation }) => {
    const playlistId = navigation.getParam('playlistId')
    const playlistTitle = navigation.getParam('playlistTitle') || translate('Untitled Playlist')

    return {
      title: translate('Playlist'),
      headerRight: () => (
        <RNView style={core.row}>
          <NavShareIcon
            endingText={translate('shared using brandName')}
            playlistTitle={playlistTitle}
            urlId={playlistId}
            urlPath={PV.URLs.webPaths.playlist}
          />
          <NavSearchIcon navigation={navigation} />
        </RNView>
      )
    } as NavigationStackOptions
  }

  componentDidMount() {
    const { playlistId } = this.state
    this._initializePageData()
    trackPageView('/playlist/' + playlistId, 'Playlist Screen')
  }

  _initializePageData() {
    const playlistId = this.props.navigation.getParam('playlistId') || this.state.playlistId

    this.setState(
      {
        endOfResultsReached: false,
        isLoading: true,
        playlistId
      },
      () => {
        setGlobal(
          {
            flatListData: [],
            flatListDataTotalCount: null,
            playlist: null
          },
          async () => {
            try {
              await getPlaylist(playlistId)
            } catch (error) {
              //
            }
            this.setState({ isLoading: false })
          }
        )
      }
    )
  }

  _ItemSeparatorComponent = () => <Divider />

  _renderItem = ({ item, index }) => {
    const { navigation } = this.props
    if (item.startTime) {
      return item.episode && item.episode.podcast ? (
        <ClipTableCell
          handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(item, null, null))}
          item={item}
          showEpisodeInfo
          showPodcastInfo
          testID={`${testIDPrefix}_clip_item_${index}`}
        />
      ) : (
        <></>
      )
    } else {
      const { mediaFileDuration, userPlaybackPosition } = getHistoryItemIndexInfoForEpisode(item.id)

      return (
        <EpisodeTableCell
          handleDownloadPress={() => this._handleDownloadPressed(item)}
          handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(item, null, null, userPlaybackPosition))}
          handleNavigationPress={() =>
            navigateToEpisodeScreenWithItem(navigation, convertToNowPlayingItem(item, null, null, userPlaybackPosition))
          }
          item={item}
          mediaFileDuration={mediaFileDuration}
          showPodcastInfo
          testID={`${testIDPrefix}_episode_item_${index}`}
          userPlaybackPosition={userPlaybackPosition}
        />
      )
    }
  }

  _handleEditPress = () => {
    this.props.navigation.navigate(PV.RouteNames.EditPlaylistScreen, {
      playlist: this.global.screenPlaylist.playlist
    })
  }

  _handleToggleSubscribe = async (id: string) => {
    const wasAlerted = await alertIfNoNetworkConnection('subscribe to playlist')
    if (wasAlerted) return

    this.setState({ isSubscribing: true }, () => {
      (async () => {
        try {
          const subscribedPlaylistIds = await toggleSubscribeToPlaylist(id)
          const isSubscribed = subscribedPlaylistIds.some((x: string) => x === id)
          this.setState({
            isSubscribed,
            isSubscribing: false
          })
        } catch (error) {
          this.setState({ isSubscribing: false })
        }
      })()
    })
  }

  _handleCancelPress = () => new Promise((resolve) => {
    this.setState({ showActionSheet: false }, resolve)
  })

  _handleMorePress = (selectedItem: any) => {
    this.setState({
      selectedItem,
      showActionSheet: true
    })
  }

  _handleDownloadPressed = (selectedItem: any) => {
    const episode = selectedItem || convertNowPlayingItemToEpisode(this.state.selectedItem)
    if (episode) {
      downloadEpisode(episode, episode.podcast)
    }
  }

  render() {
    const { navigation } = this.props
    const {
      isLoading,
      isLoadingMore,
      isSubscribed,
      isSubscribing,
      playlistId,
      selectedItem,
      showActionSheet
    } = this.state
    const { screenPlaylist, session } = this.global
    const playlist = screenPlaylist.playlist ? screenPlaylist.playlist : navigation.getParam('playlist')
    const flatListData = screenPlaylist.flatListData || []
    const flatListDataTotalCount = screenPlaylist.flatListDataTotalCount || 0
    const isLoggedInUserPlaylist = playlist?.owner?.id === session.userInfo.id
    const ownerName = playlist?.owner?.name || translate('anonymous')
    const playlistTitle = playlist?.title || translate('Untitled Playlist')
    
    return (
      <View
        style={styles.view}
        testID={`${testIDPrefix}_view`}>
        <PlaylistTableHeader
          createdBy={ownerName}
          handleEditPress={isLoggedInUserPlaylist ? this._handleEditPress : null}
          handleToggleSubscribe={isLoggedInUserPlaylist ? null : () => this._handleToggleSubscribe(playlistId)}
          id={playlistId}
          isLoading={isLoading && !playlist}
          isNotFound={!isLoading && !playlist}
          isSubscribed={isSubscribed}
          isSubscribing={isSubscribing}
          itemCount={playlist && playlist.itemCount}
          lastUpdated={playlist && playlist.updatedAt}
          testID={testIDPrefix}
          title={playlistTitle}
        />
        {isLoading && <ActivityIndicator fillSpace testID={testIDPrefix} />}
        {!isLoading && flatListData && (
          <FlatList
            data={flatListData}
            dataTotalCount={flatListDataTotalCount}
            disableLeftSwipe
            extraData={flatListData}
            isLoadingMore={isLoadingMore}
            ItemSeparatorComponent={this._ItemSeparatorComponent}
            keyExtractor={(item: any, index: number) => safeKeyExtractor(testIDPrefix, index, item?.id)}
            noResultsMessage={translate('No playlist items found')}
            renderItem={this._renderItem}
          />
        )}
        <ActionSheet
          handleCancelPress={this._handleCancelPress}
          items={() =>
            PV.ActionSheet.media.moreButtons(
              selectedItem,
              navigation,
              {
                handleDismiss: this._handleCancelPress,
                handleDownload: this._handleDownloadPressed,
                includeGoToPodcast: true,
                includeGoToEpisodeInEpisodesStack: true
              },
              !!selectedItem?.startTime ? 'clip' : 'episode'
            )
          }
          showModal={showActionSheet}
          testID={testIDPrefix}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  }
})
