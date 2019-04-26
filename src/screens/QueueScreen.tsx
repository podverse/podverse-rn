import { TouchableOpacity } from 'react-native'
import { Divider, Icon } from 'react-native-elements'
import React from 'reactn'
import { ActivityIndicator, HeaderTitleSelector, QueueTableCell, SortableList, SortableListRow, TableSectionHeader,
  Text, View } from '../components'
import { NowPlayingItem } from '../lib/NowPlayingItem'
import { PV } from '../resources'
import { getNowPlayingItem, setNowPlayingItem } from '../services/player'
import { getQueueItems } from '../services/queue'
import { removeUserQueueItem, updateUserQueueItems } from '../state/actions/auth'
import { navHeader } from '../styles'

type Props = {
  navigation?: any
}

type State = {
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
      !navigation.getParam('isEditing') ? (
        <TouchableOpacity onPress={navigation.getParam('_startEditing')}>
          <Text style={navHeader.textButton}>Edit</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={navigation.getParam('_stopEditing')}>
          <Text style={navHeader.textButton}>Done</Text>
        </TouchableOpacity>
      )
    )
  })

  constructor(props: Props) {
    super(props)

    this.state = {
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
    const nowPlayingItem = await getNowPlayingItem(isLoggedIn)
    const queueItems = await getQueueItems(isLoggedIn, navigation)
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

  _handleRemovePress = async (item: NowPlayingItem) => {
    const { navigation } = this.props
    const newItems = await removeUserQueueItem(item, this.global.session.isLoggedIn, this.global, navigation)
    this.setState({ queueItems: newItems })
  }

  _onViewTypeSelect = async (x: string) => {
    this.setState({ viewType: x })
    this.props.navigation.setParams({ viewType: x })
  }

  _onPressRow = async (rowIndex) => {
    const { navigation } = this.props
    const { queueItems } = this.state
    const item = queueItems[rowIndex]
    const result = await setNowPlayingItem(item, this.global.session.isLoggedIn, navigation)
    this.setState({
      nowPlayingItem: result.nowPlayingItem,
      queueItems: result.queueItems
    })
  }

  _renderRow = ({ active, data }) => {
    const { isEditing } = this.state

    const cell = (
      <View>
        <QueueTableCell
          clipEndTime={data.clipEndTime}
          clipStartTime={data.clipStartTime}
          clipTitle={data.clipTitle}
          episodePubDate={data.episodePubDate}
          episodeTitle={data.episodeTitle}
          handleRemovePress={() => this._handleRemovePress(data)}
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

  _onReleaseRow = async (key: number, currentOrder: [string]) => {
    const { queueItems } = this.state
    const sortedItems = currentOrder.map((index: string) => queueItems[index])
    const newItems = await updateUserQueueItems(sortedItems, this.global.session.isLoggedIn, this.global)
    this.setState({ queueItems: newItems })
  }

  render() {
    const { isLoading, nowPlayingItem, queueItems, viewType } = this.state

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
              renderRow={this._renderRow} />
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

const styles = {
  activityIndicator: {
    justifyContent: 'flex-start',
    marginTop: 24
  },
  closeButton: {
    paddingLeft: 8,
    paddingRight: 16,
    paddingVertical: 8
  },
  headerNextUp: {
    marginBottom: 8,
    marginTop: 2
  },
  headerNowPlayingItem: {
    marginBottom: 2
  },
  tableCellDivider: {
    marginBottom: 2
  },
  view: {
    flex: 1
  }
}
