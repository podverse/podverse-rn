import { Alert, StyleSheet, View as RNView } from 'react-native'
import React from 'reactn'
import {
  ActivityIndicator,
  Divider,
  NavHeaderButtonText,
  QueueTableCell,
  SortableList,
  TextInput,
  View
} from '../components'
import { translate } from '../lib/i18n'
import { alertIfNoNetworkConnection } from '../lib/network'
import { combineAndSortPlaylistItems } from '../lib/utility'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { addOrRemovePlaylistItem, getPlaylist, updatePlaylist } from '../state/actions/playlist'

type Props = {
  navigation?: any
}

type State = {
  isEditing: boolean
  isLoading: boolean
  isRemoving: boolean
  isUpdating: boolean
  newTitle?: string
  playlist: any
  sortableListData: any[]
}

const testIDPrefix = 'edit_playlist_screen'

export class EditPlaylistScreen extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    const playlist = props.navigation.getParam('playlist')

    this.state = {
      isEditing: false,
      isLoading: true,
      isRemoving: false,
      isUpdating: false,
      newTitle: playlist.title,
      playlist,
      sortableListData: []
    }
  }

  static navigationOptions = ({ navigation }) => {
    const isEditing = !!navigation.getParam('isEditing')
    const handlePress = navigation.getParam(isEditing ? '_stopEditing' : '_startEditing')
    const text = isEditing ? translate('Done') : translate('Remove')
    const accessibilityHint = isEditing
      ? translate('ARIA HINT - tap to stop removing items from this playlist')
      : translate('ARIA HINT - tap to start removing items from this playlist')

    return {
      title: translate('Edit Playlist'),
      headerRight: () => (
        <RNView style={styles.headerButtonWrapper}>
          <NavHeaderButtonText
            accessibilityHint={accessibilityHint}
            accessibilityLabel={text}
            handlePress={handlePress}
            style={styles.navHeaderTextButton}
            testID={testIDPrefix}
            text={text}
          />
        </RNView>
      )
    }
  }

  async componentDidMount() {
    const { playlist } = this.state

    this.props.navigation.setParams({
      _startEditing: this._startEditing,
      _stopEditing: this._stopEditing
    })

    try {
      const newPlaylist = await getPlaylist(playlist.id)
      const { episodes, itemsOrder, mediaRefs } = newPlaylist
      const sortableListData = combineAndSortPlaylistItems(episodes, mediaRefs, itemsOrder)

      this.setState({
        isLoading: false,
        playlist: newPlaylist,
        sortableListData
      })
    } catch (error) {
      this.setState({ isLoading: false })
    }

    trackPageView('/edit-playlist', 'Edit Playlist Screen')
  }

  _startEditing = () => {
    this.setState({ isEditing: true }, () => this.props.navigation.setParams({ isEditing: true }))
  }

  _stopEditing = () => {
    this.setState({ isEditing: false }, () => this.props.navigation.setParams({ isEditing: false }))
  }

  _updatePlaylist = async () => {
    const wasAlerted = await alertIfNoNetworkConnection('update the playlist')
    if (wasAlerted) return

    this.setState(
      {
        isUpdating: true
      },
      () => {
        (async () => {
          const { newTitle, playlist } = this.state
          const itemsOrder = await this._resortItemsAndGetOrder()
          
          try {
            await updatePlaylist({
              id: playlist.id,
              ...(itemsOrder && Array.isArray(itemsOrder) && itemsOrder.length > 0 ? { itemsOrder } : {}),
              title: newTitle
            })
          } catch (error) {
            if (error.response) {
              Alert.alert(
                PV.Alerts.SOMETHING_WENT_WRONG.title,
                PV.Alerts.SOMETHING_WENT_WRONG.message,
                PV.Alerts.BUTTONS.OK
              )
            }
          }
          this.setState({ isUpdating: false })
        })()
      }
    )
  }

  _resortItemsAndGetOrder = () => new Promise((resolve) => {
      const { sortableListData } = this.state
      const itemsOrder = [] as any
      const newSortableListData = []

      for (const item of sortableListData) {
        itemsOrder.push(item.id)
        newSortableListData.push(item)
      }
      this.setState({ sortableListData: newSortableListData }, () => {
        resolve(itemsOrder)
      })
    })

  _ItemSeparatorComponent = () => <Divider />

  _renderRow = ({ item = {} as NowPlayingItem, index, drag, isActive }) => {
    const { isEditing } = this.state

    if (item.startTime) {
      return (
        <QueueTableCell
          clipEndTime={item.endTime}
          clipStartTime={item.startTime}
          drag={drag}
          {...(item.title ? { clipTitle: item.title } : {})}
          {...(item.episode.pubDate ? { episodePubDate: item.episode.pubDate } : {})}
          {...(item.episode.title ? { episodeTitle: item.episode.title } : {})}
          handleRemovePress={() => this._handleRemovePlaylistItemPress(item)}
          isActive={isActive}
          isPlaylistScreen
          podcastImageUrl={item.episode.podcast.shrunkImageUrl || item.episode.podcast.imageUrl}
          {...(item.episode.podcast.title ? { podcastTitle: item.episode.podcast.title } : {})}
          showMoveButton={!isEditing}
          showRemoveButton={isEditing}
          testID={`${testIDPrefix}_queue_item_${index}`}
        />
      )
    } else {
      return (
        <QueueTableCell
          drag={drag}
          {...(item.pubDate ? { episodePubDate: item.pubDate } : {})}
          {...(item.title ? { episodeTitle: item.title } : {})}
          handleRemovePress={() => this._handleRemovePlaylistItemPress(item)}
          isActive={isActive}
          podcastImageUrl={(item.podcast && (item.podcast.shrunkImageUrl || item.podcast.imageUrl)) || ''}
          {...(item.podcast && item.podcast.title ? { podcastTitle: item.podcast.title } : {})}
          showMoveButton={!isEditing}
          showRemoveButton={isEditing}
          testID={`${testIDPrefix}_queue_item_${index}`}
        />
      )
    }
  }

  _handleRemovePlaylistItemPress = (item: any) => {
    const { playlist, sortableListData } = this.state

    this.setState({ isRemoving: true }, () => {
      (async () => {
        try {
          const episodeId = !item.startTime && item.id
          const mediaRefId = item.startTime || item.startTime === 0 ? item.id : null
          await addOrRemovePlaylistItem(playlist.id, episodeId, mediaRefId)
          await getPlaylist(playlist.id)
          const newSortableListData =
            sortableListData.filter((x) => (mediaRefId && x.id !== mediaRefId) || (episodeId && x.id !== episodeId))
          this.setState({ isRemoving: false, sortableListData: newSortableListData })
        } catch (error) {
          this.setState({ isRemoving: false })
        }
      })()
    })
  }

  _onChangeTitle = (text: string) => {
    this.setState({ newTitle: text })
  }

  _onDragEnd = ({ data }) => {
    this.setState({ sortableListData: data }, () => {
      this._updatePlaylist()
    })
  }

  render() {
    const { isEditing, isLoading, isRemoving, isUpdating, newTitle, sortableListData } = this.state

    return (
      <View
        style={styles.view}
        testID='edit_playlist_screen_view'>
        <View style={styles.topWrapper}>
          <TextInput
            accessibilityHint={translate('ARIA HINT - edit this playlist title')}
            autoCapitalize='none'
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            onBlur={this._updatePlaylist}
            onChangeText={this._onChangeTitle}
            onSubmitEditing={this._updatePlaylist}
            placeholder={translate('Playlist title')}
            returnKeyType='done'
            style={styles.textInput}
            testID={`${testIDPrefix}_title`}
            underlineColorAndroid='transparent'
            value={newTitle}
          />
        </View>
        <Divider />
        {(isUpdating || (!isLoading && sortableListData && sortableListData.length > 0)) && (
          <SortableList
            data={sortableListData} isEditing={isEditing} onDragEnd={this._onDragEnd} renderItem={this._renderRow} />
        )}
        {(isLoading || isRemoving || isUpdating) && <ActivityIndicator isOverlay testID={testIDPrefix} />}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  activityIndicator: {
    marginTop: 124
  },
  headerButtonWrapper: {
    flexDirection: 'row'
  },
  navHeaderTextButton: {
    fontSize: PV.Fonts.sizes.lg,
    marginRight: 8,
    textAlign: 'center'
  },
  tableCellDivider: {
    marginBottom: 2
  },
  textInput: {},
  topWrapper: {
    marginHorizontal: 8,
    marginVertical: 16
  },
  view: {
    flex: 1
  }
})
