import { TouchableOpacity } from 'react-native'
import { Icon } from 'react-native-elements'
import React from 'reactn'
import { ActivityIndicator, QueueTableCell, SortableList, SortableListRow, TableSectionHeader, Text,
  View } from '../components'
import { NowPlayingItem } from '../lib/NowPlayingItem'
import { PV } from '../resources'
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
}

export class QueueScreen extends React.Component<Props, State> {

  static navigationOptions = ({ navigation }) => ({
    title: 'Queue',
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
    const nowPlayingItem = this.props.navigation.getParam('nowPlayingItem')
    this.state = {
      isLoading: true,
      nowPlayingItem,
      queueItems: []
    }
  }

  async componentDidMount() {
    this.props.navigation.setParams({ _startEditing: this._startEditing })
    this.props.navigation.setParams({ _stopEditing: this._stopEditing })
    const queueItems = await getQueueItems(this.global.session.isLoggedIn)
    this.setState({
      isLoading: false,
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
    const newItems = await removeUserQueueItem(item, this.global.session.isLoggedIn, this.global)
    this.setState({ queueItems: newItems })
  }

  _renderRow = ({ active, data }) => {
    const { isEditing } = this.state

    const cell = (
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
    const { isLoading, nowPlayingItem, queueItems } = this.state

    return (
      <View style={styles.view}>
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
        {
          isLoading &&
            <ActivityIndicator styles={styles.activityIndicator} />
        }
        {
          !isLoading && queueItems && queueItems.length > 0 &&
            <SortableList
              data={queueItems}
              onReleaseRow={this._onReleaseRow}
              renderRow={this._renderRow} />
        }
      </View>
    )
  }
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
  view: {
    flex: 1
  }
}
