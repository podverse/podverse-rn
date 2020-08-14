import { Alert, StyleSheet, View as RNView } from 'react-native'
import React from 'reactn'
import {
  ActivityIndicator,
  Divider,
  NavHeaderButtonText,
  QueueTableCell,
  SortableList,
  SortableListRow,
  Text,
  TextInput,
  View
} from '../components'
import { translate } from '../lib/i18n'
import { alertIfNoNetworkConnection } from '../lib/network'
import { combineAndSortPlaylistItems, testProps } from '../lib/utility'
import { PV } from '../resources'
import { gaTrackPageView } from '../services/googleAnalytics'
import { addOrRemovePlaylistItem, getPlaylist, updatePlaylist } from '../state/actions/playlist'
import { core } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  isEditing: boolean
  isLoading: boolean
  isRemoving: boolean
  isUpdating: boolean
  newItemsOrderByIndex?: [string]
  newTitle?: string
  playlist: any
  sortableListData: any[]
}

export class EditPlaylistScreen extends React.Component<Props, State> {
  static navigationOptions = ({ navigation }) => {
    const isEditing = !!navigation.getParam('isEditing')
    const handlePress = navigation.getParam(isEditing ? '_stopEditing' : '_startEditing')
    const text = isEditing ? translate('Done') : translate('Edit')

    return {
      title: translate('Edit Playlist'),
      headerRight: (
        <RNView style={styles.headerButtonWrapper}>
          <NavHeaderButtonText handlePress={handlePress} style={styles.navHeaderTextButton} text={text} />
        </RNView>
      )
    }
  }

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

    gaTrackPageView('/edit-playlist', 'Edit Playlist Screen')
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
      async () => {
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
      }
    )
  }

  _resortItemsAndGetOrder = () => {
    return new Promise((resolve) => {
      const { newItemsOrderByIndex, sortableListData } = this.state
      const itemsOrder = [] as any
      const newSortableListData = []

      if (newItemsOrderByIndex && newItemsOrderByIndex.length > 0) {
        for (const index of newItemsOrderByIndex) {
          itemsOrder.push(sortableListData[index].id)
          newSortableListData.push(sortableListData[index])
        }
        this.setState({ sortableListData: newSortableListData }, () => {
          resolve(itemsOrder)
        })
      } else {
        resolve()
      }
    })
  }

  _ItemSeparatorComponent = () => {
    return <Divider />
  }

  _renderRow = ({ active, data }) => {
    const { isEditing } = this.state
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
            handleRemovePress={() => this._handleRemovePlaylistItemPress(data)}
            podcastImageUrl={data.episode.podcast.shrunkImageUrl || data.episode.podcast.imageUrl}
            podcastTitle={data.episode.podcast.title}
            showMoveButton={!isEditing}
            showRemoveButton={isEditing}
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
            handleRemovePress={() => this._handleRemovePlaylistItemPress(data)}
            podcastImageUrl={(data.podcast && (data.podcast.shrunkImageUrl || data.podcast.imageUrl)) || ''}
            podcastTitle={(data.podcast && data.podcast.title) || ''}
            showMoveButton={!isEditing}
            showRemoveButton={isEditing}
          />
          <Divider style={styles.tableCellDivider} />
        </View>
      )
    }

    return <SortableListRow active={active} cell={cell} />
  }

  _handleRemovePlaylistItemPress = async (item: any) => {
    const { playlist, sortableListData } = this.state

    this.setState({ isRemoving: true }, async () => {
      try {
        const episodeId = !item.startTime && item.id
        const mediaRefId = item.startTime || item.startTime === 0 ? item.id : null
        await addOrRemovePlaylistItem(playlist.id, episodeId, mediaRefId)
        await getPlaylist(playlist.id)
        const newSortableListData = sortableListData.filter((x) => {
          return (mediaRefId && x.id !== mediaRefId) || (episodeId && x.id !== episodeId)
        })
        this.setState({ isRemoving: false, sortableListData: newSortableListData })
      } catch (error) {
        this.setState({ isRemoving: false })
      }
    })
  }

  _onChangeTitle = (text: string) => {
    this.setState({ newTitle: text })
  }

  _onReleaseRow = (key: number, currentOrder: [string]) => {
    this.setState({ newItemsOrderByIndex: currentOrder }, () => {
      this._updatePlaylist()
    })
  }

  render() {
    const { isLoading, isRemoving, isUpdating, newTitle, sortableListData } = this.state

    return (
      <View style={styles.view} {...testProps('edit_playlist_screen_view')}>
        <View style={styles.topWrapper}>
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={core.textInputLabel}>
            Title
          </Text>
          <TextInput
            autoCapitalize='none'
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            onChangeText={this._onChangeTitle}
            onSubmitEditing={this._updatePlaylist}
            placeholder={translate('playlist title')}
            returnKeyType='done'
            style={styles.textInput}
            underlineColorAndroid='transparent'
            value={newTitle}
          />
        </View>
        <Divider />
        {(isUpdating || (!isLoading && sortableListData && sortableListData.length > 0)) && (
          <SortableList data={sortableListData} onReleaseRow={this._onReleaseRow} renderRow={this._renderRow} />
        )}
        {(isLoading || isRemoving || isUpdating) && <ActivityIndicator isOverlay={true} />}
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
