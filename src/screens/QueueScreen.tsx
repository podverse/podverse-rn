import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import React from 'reactn'
import {
  ActivityIndicator,
  Divider,
  FlatList,
  HeaderTitleSelector,
  Icon,
  MessageWithAction,
  QueueTableCell,
  SortableList,
  SortableListRow,
  TableSectionHeader,
  View as PVView
} from '../components'
import { NowPlayingItem } from '../lib/NowPlayingItem'
import { checkIfIdMatchesClipIdOrEpisodeId } from '../lib/utility'
import { PV } from '../resources'
import { movePlayerItemToNewPosition } from '../services/player'
import {
  clearHistoryItems,
  getHistoryItems,
  removeHistoryItem
} from '../state/actions/history'
import { loadItemAndPlayTrack } from '../state/actions/player'
import {
  getQueueItems,
  removeQueueItem,
  updateQueueItems
} from '../state/actions/queue'
import { navHeader } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  isEditing?: boolean
  isLoading?: boolean
  isRemoving?: boolean
  nowPlayingItem?: any
  viewType?: string
}

export class QueueScreen extends React.Component<Props, State> {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: (
      <HeaderTitleSelector
        items={headerTitleItems}
        onValueChange={navigation.getParam('_onViewTypeSelect')}
        placeholder={headerTitleItemPlaceholder}
        selectedItemKey={
          navigation.getParam('viewType') ||
          navigation.getParam('viewType') === false ||
          _queueKey
        }
      />
    ),
    headerLeft: (
      <Icon
        color="#fff"
        name="chevron-down"
        onPress={navigation.dismiss}
        size={PV.Icons.NAV}
        style={navHeader.buttonIcon}
      />
    ),
    headerRight: (
      <View>
        {navigation.getParam('viewType') === _historyKey ? (
          <View>
            {!navigation.getParam('isEditing') ? (
              <View style={styles.headerButtonWrapper}>
                <TouchableOpacity onPress={navigation.getParam('_clearAll')}>
                  <Text style={navHeader.buttonText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={navigation.getParam('_startEditing')}>
                  <Text
                    style={[navHeader.buttonText, styles.navHeaderTextButton]}>
                    Edit
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.headerButtonWrapper}>
                <TouchableOpacity onPress={navigation.getParam('_clearAll')}>
                  <Text style={navHeader.buttonText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={navigation.getParam('_stopEditing')}>
                  <Text
                    style={[navHeader.buttonText, styles.navHeaderTextButton]}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View>
            {!navigation.getParam('isEditing') ? (
              <TouchableOpacity onPress={navigation.getParam('_startEditing')}>
                <Text
                  style={[navHeader.buttonText, styles.navHeaderTextButton]}>
                  Edit
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={navigation.getParam('_stopEditing')}>
                <Text
                  style={[navHeader.buttonText, styles.navHeaderTextButton]}>
                  Done
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    )
  })

  constructor(props: Props) {
    super(props)

    this.state = {
      isLoading: true,
      isRemoving: false,
      nowPlayingItem: null,
      viewType: props.navigation.getParam('viewType') || _queueKey
    }
  }

  async componentDidMount() {
    const { navigation } = this.props

    navigation.setParams({
      _clearAll: this._clearAll,
      _onViewTypeSelect: this._onViewTypeSelect,
      _startEditing: this._startEditing,
      _stopEditing: this._stopEditing
    })

    try {
      const nowPlayingItem = this.global.player.nowPlayingItem
      const queueItems = await getQueueItems()
      this.setState({
        isLoading: false,
        nowPlayingItem,
        queueItems
      })
    } catch (error) {
      this.setState({ isLoading: false })
    }
  }

  _startEditing = () => {
    this.setState({ isEditing: true }, () =>
      this.props.navigation.setParams({ isEditing: true })
    )
  }

  _stopEditing = () => {
    this.setState({ isEditing: false }, () =>
      this.props.navigation.setParams({ isEditing: false })
    )
  }

  _clearAll = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear your history?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Yes',
          onPress: () => {
            this.setState(
              {
                isLoading: true
              },
              async () => {
                try {
                  await clearHistoryItems()
                  this.setState({
                    historyItems: [],
                    isLoading: false
                  })
                } catch (error) {
                  this.setState({ isLoading: false })
                }
              }
            )
          }
        }
      ]
    )
  }

  _onViewTypeSelect = async (x: string) => {
    this.setState({
      isEditing: false,
      isLoading: true,
      nowPlayingItem: null,
      viewType: x
    })
    this.props.navigation.setParams({
      isEditing: false,
      viewType: x
    })

    try {
      if (x === _queueKey) {
        const nowPlayingItem = this.global.player.nowPlayingItem
        await getQueueItems()
        this.setState({
          isLoading: false,
          nowPlayingItem
        })
      } else if (x === _historyKey) {
        await getHistoryItems()
        this.setState({ isLoading: false })
      }
    } catch (error) {
      this.setState({ isLoading: false })
    }
  }

  _handlePlayItem = async (item: NowPlayingItem) => {
    try {
      const { navigation } = this.props
      this.setState({ isLoading: true }, async () => {
        navigation.goBack(null)
        navigation.navigate(PV.RouteNames.PlayerScreen)
        const shouldPlay = true
        await loadItemAndPlayTrack(item, shouldPlay)
        const nowPlayingItem = this.global.player.nowPlayingItem
        getQueueItems()
        this.setState({
          isLoading: false,
          nowPlayingItem
        })
      })
    } catch (error) {
      //
    }
  }

  _onPressRow = async (rowIndex: number) => {
    const { queueItems } = this.global.session.userInfo
    const item = queueItems[rowIndex]
    this._handlePlayItem(item)
  }

  _renderHistoryItem = ({ item = {} as NowPlayingItem }) => {
    const { isEditing } = this.state

    return (
      <TouchableWithoutFeedback onPress={() => this._handlePlayItem(item)}>
        <QueueTableCell
          clipEndTime={item.clipEndTime}
          clipStartTime={item.clipStartTime}
          clipTitle={item.clipTitle}
          episodePubDate={item.episodePubDate}
          episodeTitle={item.episodeTitle}
          handleRemovePress={() => this._handleRemoveHistoryItemPress(item)}
          podcastImageUrl={item.podcastImageUrl}
          podcastTitle={item.podcastTitle}
          showRemoveButton={isEditing}
        />
      </TouchableWithoutFeedback>
    )
  }

  _renderQueueItemRow = ({ active, data = {} as NowPlayingItem }) => {
    const { isEditing } = this.state

    const cell = (
      <View>
        <QueueTableCell
          clipEndTime={data.clipEndTime}
          clipStartTime={data.clipStartTime}
          clipTitle={data.clipTitle}
          episodePubDate={data.episodePubDate}
          episodeTitle={data.episodeTitle}
          handleRemovePress={() => this._handleRemoveQueueItemPress(data)}
          podcastImageUrl={data.podcastImageUrl}
          podcastTitle={data.podcastTitle}
          showMoveButton={!isEditing}
          showRemoveButton={isEditing}
        />
        <Divider style={styles.tableCellDivider} />
      </View>
    )

    return <SortableListRow active={active} cell={cell} />
  }

  _handleRemoveQueueItemPress = async (item: NowPlayingItem) => {
    this.setState({ isRemoving: true }, async () => {
      try {
        await removeQueueItem(item, true)
      } catch (error) {
        //
      }
      this.setState({ isRemoving: false })
    })
  }

  _handleRemoveHistoryItemPress = async (item: NowPlayingItem) => {
    this.setState({ isRemoving: true }, async () => {
      try {
        await removeHistoryItem(item)
      } catch (error) {
        //
      }
      this.setState({ isRemoving: false })
    })
  }

  _onReleaseRow = async (key: number, currentOrder: [string]) => {
    try {
      const { queueItems } = this.global.session.userInfo
      const item = queueItems[key]
      const id = item.clipId || item.episodeId
      const sortedItems = currentOrder.map((index: string) => queueItems[index])

      const newItems = await updateQueueItems(sortedItems)
      const newQueueItemIndex = newItems.findIndex((x: any) =>
        checkIfIdMatchesClipIdOrEpisodeId(id, x.clipId, x.episodeId)
      )

      if (queueItems.length >= newQueueItemIndex) {
        const nextItem = queueItems[newQueueItemIndex]
        await movePlayerItemToNewPosition(
          item.clipId || item.episodeId,
          nextItem.clipId || nextItem.episodeId
        )
      }
    } catch (error) {
      console.log('QueueScreen - _onReleaseRow - ', error)
    }
  }

  _ItemSeparatorComponent = () => {
    return <Divider />
  }

  render() {
    const { historyItems, queueItems } = this.global.session.userInfo
    const { isLoading, isRemoving, nowPlayingItem = {}, viewType } = this.state

    return (
      <PVView style={styles.view}>
        {!isLoading &&
          viewType === _queueKey &&
          (queueItems.length > 0 || nowPlayingItem) && (
            <View>
              {!!nowPlayingItem && (
                <View>
                  <TableSectionHeader
                    containerStyles={styles.headerNowPlayingItem}
                    title="Now Playing"
                  />
                  <QueueTableCell
                    clipEndTime={nowPlayingItem.clipEndTime}
                    clipStartTime={nowPlayingItem.clipStartTime}
                    clipTitle={nowPlayingItem.clipTitle}
                    episodePubDate={nowPlayingItem.episodePubDate}
                    episodeTitle={nowPlayingItem.episodeTitle}
                    podcastImageUrl={nowPlayingItem.podcastImageUrl}
                    podcastTitle={nowPlayingItem.podcastTitle}
                  />
                </View>
              )}
              <TableSectionHeader title="Next Up" />
            </View>
          )}
        {!isLoading && viewType === _queueKey && queueItems.length > 0 && (
          <SortableList
            data={queueItems}
            onPressRow={this._onPressRow}
            onReleaseRow={this._onReleaseRow}
            renderRow={this._renderQueueItemRow}
          />
        )}
        {!isLoading && viewType === _queueKey && queueItems.length < 1 && (
          <MessageWithAction message="Your queue is empty" />
        )}
        {!isLoading && viewType === _historyKey && historyItems.length > 0 && (
          <FlatList
            data={historyItems}
            dataTotalCount={historyItems.length}
            disableLeftSwipe={true}
            extraData={historyItems}
            ItemSeparatorComponent={this._ItemSeparatorComponent}
            renderItem={this._renderHistoryItem}
          />
        )}
        {!isLoading && viewType === _historyKey && historyItems.length < 1 && (
          <MessageWithAction message="No history items found" />
        )}
        {(isLoading || isRemoving) && (
          <ActivityIndicator
            isOverlay={isRemoving}
            styles={styles.activityIndicator}
          />
        )}
      </PVView>
    )
  }
}

const _queueKey = 'queue'
const _historyKey = 'history'

const headerTitleItems = [
  {
    label: 'Queue',
    value: _queueKey
  },
  {
    label: 'History',
    value: _historyKey
  }
]

const headerTitleItemPlaceholder = {
  label: 'Select...',
  value: false
}

const styles = StyleSheet.create({
  activityIndicator: {
    marginTop: 24
  },
  closeButton: {
    paddingLeft: 8,
    paddingRight: 16,
    paddingVertical: 8
  },
  headerButtonWrapper: {
    flexDirection: 'row'
  },
  headerNowPlayingItem: {
    marginBottom: 2
  },
  navHeaderTextButton: {
    marginLeft: 2,
    textAlign: 'right',
    width: 72
  },
  tableCellDivider: {
    marginBottom: 2
  },
  view: {
    flex: 1
  }
})
