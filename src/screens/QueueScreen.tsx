import { Alert, StyleSheet, TouchableOpacity, View as RNView } from 'react-native'
import { Divider, Icon } from 'react-native-elements'
import React from 'reactn'
import { ActivityIndicator, FlatList, HeaderTitleSelector, QueueTableCell, SortableList, SortableListRow,
  TableSectionHeader, Text, View } from '../components'
import { NowPlayingItem } from '../lib/NowPlayingItem'
import { PV } from '../resources'
import { getHistoryItems } from '../services/history'
import { getNowPlayingItem, setNowPlayingItem } from '../services/player'
import { getQueueItems } from '../services/queue'
import { clearUserHistoryItems, removeUserHistoryItem, removeUserQueueItem, updateUserQueueItems
  } from '../state/actions/users'
import { navHeader } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  historyItems: any[]
  isEditing?: boolean
  isLoading?: boolean
  nowPlayingItem?: any
  queueItems: any[]
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
          navigation.getParam('viewType') === false
          || _queueKey
        } />
    ),
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
          navigation.getParam('viewType') === _historyKey ?
            (
              <RNView>
                {
                  !navigation.getParam('isEditing') ? (
                    <RNView style={styles.headerButtonWrapper}>
                      <TouchableOpacity onPress={navigation.getParam('_clearAll')}>
                        <Text style={navHeader.textButton}>Clear</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={navigation.getParam('_startEditing')}>
                        <Text style={[navHeader.textButton, styles.navHeaderTextButton]}>Edit</Text>
                      </TouchableOpacity>
                    </RNView>
                  ) : (
                    <RNView style={styles.headerButtonWrapper}>
                      <TouchableOpacity onPress={navigation.getParam('_clearAll')}>
                        <Text style={navHeader.textButton}>Clear</Text>
                      </TouchableOpacity>
                        <TouchableOpacity onPress={navigation.getParam('_stopEditing')}>
                          <Text style={[navHeader.textButton, styles.navHeaderTextButton]}>Done</Text>
                        </TouchableOpacity>
                    </RNView>
                  )
                }
              </RNView>

            ) : (
              <RNView>
                {
                  !navigation.getParam('isEditing') ? (
                    <TouchableOpacity onPress={navigation.getParam('_startEditing')}>
                      <Text style={[navHeader.textButton, styles.navHeaderTextButton]}>Edit</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={navigation.getParam('_stopEditing')}>
                      <Text style={[navHeader.textButton, styles.navHeaderTextButton]}>Done</Text>
                    </TouchableOpacity>
                  )
                }
              </RNView>
            )
        }
      </RNView>
    )
  })

  constructor(props: Props) {
    super(props)

    this.state = {
      historyItems: [],
      isLoading: true,
      nowPlayingItem: null,
      queueItems: [],
      viewType: props.navigation.getParam('viewType') || _queueKey
    }
  }

  async componentDidMount() {
    const { navigation } = this.props
    const { isLoggedIn } = this.global.session
    navigation.setParams({ _onViewTypeSelect: this._onViewTypeSelect })
    navigation.setParams({ _startEditing: this._startEditing })
    navigation.setParams({ _stopEditing: this._stopEditing })
    navigation.setParams({ _clearAll: this._clearAll })
    const nowPlayingItem = await getNowPlayingItem(isLoggedIn)
    const queueItems = await getQueueItems(isLoggedIn)
    this.setState({
      isLoading: false,
      nowPlayingItem,
      queueItems
    })
  }

  _startEditing = () => {
    this.setState({ isEditing: true }, () => this.props.navigation.setParams({ isEditing: true }))
  }

  _stopEditing = () => {
    this.setState({ isEditing: false }, () => this.props.navigation.setParams({ isEditing: false }))
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
            this.setState({
              isLoading: true
            }, async () => {
              await clearUserHistoryItems(this.global.session.isLoggedIn, this.global)
              this.setState({
                historyItems: [],
                isLoading: false
              })
            })
          }
        }
      ]
    )
    // this.setState({ isEditing: false }, () => this.props.navigation.setParams({ isEditing: false }))
  }

  _onViewTypeSelect = async (x: string) => {
    const { isLoggedIn } = this.global.session
    this.setState({
      historyItems: [],
      isEditing: false,
      isLoading: true,
      nowPlayingItem: null,
      queueItems: [],
      viewType: x
    })
    this.props.navigation.setParams({
      isEditing: false,
      viewType: x
    })

    if (x === _queueKey) {
      const nowPlayingItem = await getNowPlayingItem(isLoggedIn)
      const queueItems = await getQueueItems(isLoggedIn)
      this.setState({
        isLoading: false,
        nowPlayingItem,
        queueItems
      })
    } else if (x === _historyKey) {
      const historyItems = await getHistoryItems(isLoggedIn)
      this.setState({
        historyItems,
        isLoading: false
      })
    }
  }

  _onPressRow = async (rowIndex) => {
    const { queueItems } = this.state
    const item = queueItems[rowIndex]
    const result = await setNowPlayingItem(item, this.global.session.isLoggedIn)
    this.setState({
      nowPlayingItem: result.nowPlayingItem,
      queueItems: result.queueItems
    })
  }

  _renderQueueItemRow = ({ active, data }) => {
    const { isEditing } = this.state

    const cell = (
      <View key={data.clipId || data.episodeId}>
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
          showRemoveButton={isEditing} />
        <Divider style={styles.tableCellDivider} />
      </View>
    )

    return (
      <SortableListRow
        active={active}
        cell={cell} />
    )
  }

  _handleRemoveQueueItemPress = async (item: NowPlayingItem) => {
    const newItems = await removeUserQueueItem(item, this.global.session.isLoggedIn, this.global)
    this.setState({ queueItems: newItems })
  }

  _handleRemoveHistoryItemPress = async (item: NowPlayingItem) => {
    const newItems = await removeUserHistoryItem(item, this.global.session.isLoggedIn, this.global)
    this.setState({ historyItems: newItems })
  }

  _onReleaseRow = async (key: number, currentOrder: [string]) => {
    const { queueItems } = this.state
    const sortedItems = currentOrder.map((index: string) => queueItems[index])
    const newItems = await updateUserQueueItems(sortedItems, this.global.session.isLoggedIn, this.global)
    this.setState({ queueItems: newItems })
  }

  _ItemSeparatorComponent = () => {
    return <Divider />
  }

  _renderHistoryItem = ({ item }) => {
    const { isEditing } = this.state

    return (
      <View>
        <QueueTableCell
          clipEndTime={item.clipEndTime}
          clipStartTime={item.clipStartTime}
          clipTitle={item.clipTitle}
          episodePubDate={item.episodePubDate}
          episodeTitle={item.episodeTitle}
          handleRemovePress={() => this._handleRemoveHistoryItemPress(item)}
          podcastImageUrl={item.podcastImageUrl}
          podcastTitle={item.podcastTitle}
          showRemoveButton={isEditing} />
        <Divider />
      </View>
    )
  }

  render() {
    const { historyItems, isLoading, nowPlayingItem, queueItems, viewType } = this.state

    return (
      <View style={styles.view}>
        {
          isLoading &&
            <ActivityIndicator styles={styles.activityIndicator} />
        }
        {
          !isLoading && viewType === _queueKey &&
            <View>
              <TableSectionHeader
                containerStyles={styles.headerNowPlayingItem}
                title='Now Playing' />
              <QueueTableCell
                clipEndTime={nowPlayingItem.clipEndTime}
                clipStartTime={nowPlayingItem.clipStartTime}
                clipTitle={nowPlayingItem.clipTitle}
                episodePubDate={nowPlayingItem.episodePubDate}
                episodeTitle={nowPlayingItem.episodeTitle}
                podcastImageUrl={nowPlayingItem.podcastImageUrl}
                podcastTitle={nowPlayingItem.podcastTitle} />
              <TableSectionHeader
                containerStyles={styles.headerNextUp}
                title='Next Up' />
            </View>
        }
        {
          !isLoading && viewType === _queueKey &&
            <SortableList
              data={queueItems}
              onPressRow={this._onPressRow}
              onReleaseRow={this._onReleaseRow}
              renderRow={this._renderQueueItemRow} />
        }
        {
          !isLoading && viewType === _historyKey &&
            <FlatList
              data={historyItems}
              disableLeftSwipe={true}
              extraData={historyItems}
              ItemSeparatorComponent={this._ItemSeparatorComponent}
              renderItem={this._renderHistoryItem} />
        }
      </View>
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
    justifyContent: 'flex-start',
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
  headerNextUp: {
    marginBottom: 8,
    marginTop: 2
  },
  headerNowPlayingItem: {
    marginBottom: 2
  },
  navHeaderTextButton: {
    marginLeft: 2,
    textAlign: 'right',
    width: 39
  },
  tableCellDivider: {
    marginBottom: 2
  },
  view: {
    flex: 1
  }
})
