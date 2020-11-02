import { NowPlayingItem } from 'podverse-shared'
import { StyleSheet, TouchableWithoutFeedback, View as RNView } from 'react-native'
import React, { getGlobal } from 'reactn'
import {
  ActivityIndicator,
  Divider,
  FlatList,
  HeaderTitleSelector,
  MessageWithAction,
  NavHeaderButtonText,
  NavSearchIcon,
  OpaqueBackground,
  QueueTableCell,
  SortableList,
  SortableListRow,
  TableSectionHeader,
  View
} from '../components'
import { translate } from '../lib/i18n'
import { checkIfIdMatchesClipIdOrEpisodeId, isOdd, testProps } from '../lib/utility'
import { PV } from '../resources'
import { gaTrackPageView } from '../services/googleAnalytics'
import { movePlayerItemToNewPosition } from '../services/player'
import { getHistoryItems, removeHistoryItem } from '../state/actions/history'
import { loadItemAndPlayTrack } from '../state/actions/player'
import { getQueueItems, removeQueueItem, updateQueueItems } from '../state/actions/queue'
import { core, darkTheme } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  isEditing?: boolean
  isLoading?: boolean
  isRemoving?: boolean
  isTransparent?: boolean
  viewType?: string
}

const testIDPrefix = 'queue_screen'

export class QueueScreen extends React.Component<Props, State> {
  static navigationOptions = ({ navigation }) => {
    const { globalTheme } = getGlobal()
    const isTransparent = !!navigation.getParam('isTransparent')

    return {
      ...(!isTransparent
        ? {}
        : {
            headerTransparent: true,
            headerStyle: {},
            headerTintColor: globalTheme.text.color
          }),
      headerTitle: (
        <HeaderTitleSelector
          items={headerTitleItems}
          onValueChange={navigation.getParam('_onViewTypeSelect')}
          placeholder={headerTitleItemPlaceholder}
          selectedItemKey={navigation.getParam('viewType') || navigation.getParam('viewType') === false || _queueKey}
        />
      ),
      headerRight: (
        <RNView style={[core.row]}>
          {navigation.getParam('viewType') === _historyKey ? (
            <RNView>
              {!navigation.getParam('isEditing') ? (
                <RNView style={styles.headerButtonWrapper}>
                  <NavHeaderButtonText
                    handlePress={navigation.getParam('_startEditing')}
                    style={styles.navHeaderTextButton}
                    testID={`${testIDPrefix}_header_edit`}
                    text={translate('Edit')}
                  />
                </RNView>
              ) : (
                <RNView style={styles.headerButtonWrapper}>
                  <NavHeaderButtonText
                    handlePress={navigation.getParam('_stopEditing')}
                    style={styles.navHeaderTextButton}
                    testID={`${testIDPrefix}_header_done`}
                    text={translate('Done')}
                  />
                </RNView>
              )}
            </RNView>
          ) : (
            <RNView>
              {!navigation.getParam('isEditing') ? (
                <NavHeaderButtonText
                  handlePress={navigation.getParam('_startEditing')}
                  style={styles.navHeaderTextButton}
                  testID={`${testIDPrefix}_header_edit`}
                  text={translate('Edit')}
                />
              ) : (
                <NavHeaderButtonText
                  handlePress={navigation.getParam('_stopEditing')}
                  style={styles.navHeaderTextButton}
                  testID={`${testIDPrefix}_header_done`}
                  text={translate('Done')}
                />
              )}
            </RNView>
          )}
          {navigation.getParam('showMoreNavButton') && <NavSearchIcon navigation={navigation} />}
        </RNView>
      )
    }
  }

  constructor(props: Props) {
    super(props)

    this.state = {
      isLoading: true,
      isRemoving: false,
      isTransparent: !!props.navigation.getParam('isTransparent'),
      viewType: props.navigation.getParam('viewType') || _queueKey
    }
  }

  async componentDidMount() {
    const { navigation } = this.props

    navigation.setParams({
      _onViewTypeSelect: this._onViewTypeSelect,
      _startEditing: this._startEditing,
      _stopEditing: this._stopEditing
    })

    try {
      await getQueueItems()
      this.setState({
        isLoading: false
      })
    } catch (error) {
      this.setState({ isLoading: false })
    }

    gaTrackPageView('/queue', 'Queue Screen')
  }

  _startEditing = () => {
    this.setState({ isEditing: true }, () => this.props.navigation.setParams({ isEditing: true }))
  }

  _stopEditing = () => {
    this.setState({ isEditing: false }, () => this.props.navigation.setParams({ isEditing: false }))
  }

  _onViewTypeSelect = async (x: string) => {
    this.setState({
      isEditing: false,
      isLoading: true,
      viewType: x
    })
    this.props.navigation.setParams({
      isEditing: false,
      viewType: x
    })

    try {
      if (x === _queueKey) {
        await getQueueItems()
        this.setState({
          isLoading: false
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
    const isDarkMode = this.global.globalTheme === darkTheme
    try {
      const { navigation } = this.props
      this.setState({ isLoading: true }, async () => {
        navigation.navigate(PV.RouteNames.PlayerScreen, { isDarkMode })
        const shouldPlay = true
        await loadItemAndPlayTrack(item, shouldPlay)
        await getQueueItems()
        this.setState({
          isLoading: false
        })
      })
    } catch (error) {
      //
    }
  }

  _onPressRow = async (rowIndex: number) => {
    const { queueItems } = this.global.session.userInfo
    if (queueItems && queueItems[rowIndex]) {
      const item = queueItems[rowIndex]
      await removeQueueItem(item)
      this._handlePlayItem(item)
    }
  }

  _renderHistoryItem = ({ item = {} as NowPlayingItem, index }) => {
    const { isEditing, isTransparent } = this.state

    return (
      <TouchableWithoutFeedback
        onPress={() => {
          if (!isEditing) {
            this._handlePlayItem(item)
          }
        }}>
        <View transparent={isTransparent}>
          <QueueTableCell
            clipEndTime={item.clipEndTime}
            clipStartTime={item.clipStartTime}
            clipTitle={item.clipTitle}
            episodePubDate={item.episodePubDate}
            episodeTitle={item.episodeTitle}
            handleRemovePress={() => this._handleRemoveHistoryItemPress(item)}
            hasZebraStripe={isOdd(index)}
            podcastImageUrl={item.podcastImageUrl}
            podcastTitle={item.podcastTitle}
            showRemoveButton={isEditing}
            transparent={isTransparent}
          />
        </View>
      </TouchableWithoutFeedback>
    )
  }

  _renderQueueItemRow = ({ active, data = {} as NowPlayingItem, index }) => {
    const { isEditing, isTransparent } = this.state

    const cell = (
      <View transparent={isTransparent}>
        <QueueTableCell
          clipEndTime={data.clipEndTime}
          clipStartTime={data.clipStartTime}
          clipTitle={data.clipTitle}
          episodePubDate={data.episodePubDate}
          episodeTitle={data.episodeTitle}
          handleRemovePress={() => this._handleRemoveQueueItemPress(data)}
          hasZebraStripe={isOdd(index)}
          podcastImageUrl={data.podcastImageUrl}
          podcastTitle={data.podcastTitle}
          showMoveButton={!isEditing}
          showRemoveButton={isEditing}
          transparent={isTransparent}
        />
        <Divider style={styles.tableCellDivider} />
      </View>
    )

    return <SortableListRow active={active} cell={cell} />
  }

  _handleRemoveQueueItemPress = async (item: NowPlayingItem) => {
    this.setState({ isRemoving: true }, async () => {
      try {
        await removeQueueItem(item)
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
      const { queueItems = [] } = this.global.session.userInfo
      const item = queueItems[key]
      const id = item.clipId || item.episodeId
      const sortedItems = currentOrder.map((index: string) => queueItems[index])

      const newItems = await updateQueueItems(sortedItems)
      const newQueueItemIndex = newItems.findIndex((x: any) =>
        checkIfIdMatchesClipIdOrEpisodeId(id, x.clipId, x.episodeId)
      )

      if (queueItems.length >= newQueueItemIndex) {
        const nextItem = queueItems[newQueueItemIndex]
        await movePlayerItemToNewPosition(item.clipId || item.episodeId, nextItem.clipId || nextItem.episodeId)
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
    const { nowPlayingItem } = this.global.player
    const { isEditing, isLoading, isRemoving, isTransparent, viewType } = this.state

    const view = (
      <View style={styles.view} transparent={isTransparent} {...testProps('queue_screen_view')}>
        {!isLoading && viewType === _queueKey && ((queueItems && queueItems.length > 0) || nowPlayingItem) && (
          <View transparent={isTransparent}>
            {!!nowPlayingItem && (
              <View transparent={isTransparent}>
                <TableSectionHeader containerStyles={styles.headerNowPlayingItem} title={translate('Now Playing')} />
                <QueueTableCell
                  clipEndTime={nowPlayingItem.clipEndTime}
                  clipStartTime={nowPlayingItem.clipStartTime}
                  clipTitle={nowPlayingItem.clipTitle}
                  episodePubDate={nowPlayingItem.episodePubDate}
                  episodeTitle={nowPlayingItem.episodeTitle}
                  podcastImageUrl={nowPlayingItem.podcastImageUrl}
                  podcastTitle={nowPlayingItem.podcastTitle}
                  transparent={isTransparent}
                />
              </View>
            )}
            <TableSectionHeader title={translate('Next Up')} />
          </View>
        )}
        {!isLoading && viewType === _queueKey && queueItems && queueItems.length > 0 && (
          <SortableList
            data={queueItems}
            onPressRow={!isEditing && this._onPressRow}
            onReleaseRow={!isEditing && this._onReleaseRow}
            renderRow={this._renderQueueItemRow}
          />
        )}
        {!isLoading && viewType === _queueKey && queueItems && queueItems.length < 1 && (
          <MessageWithAction message={translate('Your queue is empty')} transparent={isTransparent} />
        )}
        {!isLoading && viewType === _historyKey && historyItems && (
          <FlatList
            data={historyItems}
            dataTotalCount={historyItems.length}
            disableLeftSwipe={true}
            extraData={historyItems}
            ItemSeparatorComponent={this._ItemSeparatorComponent}
            keyExtractor={(item: any) => item.clipId || item.episodeId}
            noResultsMessage={translate('No history items found')}
            renderItem={this._renderHistoryItem}
            transparent={isTransparent}
          />
        )}
        {(isLoading || isRemoving) && <ActivityIndicator isOverlay={isRemoving} styles={styles.activityIndicator} />}
      </View>
    )

    if (isTransparent) {
      return <OpaqueBackground nowPlayingItem={nowPlayingItem}>{view}</OpaqueBackground>
    } else {
      return view
    }
  }
}

const _queueKey = 'queue'
const _historyKey = 'history'

const headerTitleItems = [
  {
    label: translate('Queue'),
    value: _queueKey
  },
  {
    label: translate('History'),
    value: _historyKey
  }
]

const headerTitleItemPlaceholder = {
  label: translate('Select'),
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
  navHeaderSpacer: {
    width: 36
  },
  navHeaderTextButton: {
    fontSize: PV.Fonts.sizes.lg,
    marginRight: 8,
    textAlign: 'center'
  },
  tableCellDivider: {
    marginBottom: 2
  },
  view: {
    flex: 1
  }
})
