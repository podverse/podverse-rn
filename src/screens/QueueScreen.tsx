import { NowPlayingItem } from 'podverse-shared'
import { StyleSheet, View as RNView } from 'react-native'
import { NavigationStackOptions } from 'react-navigation-stack'
import React, { getGlobal } from 'reactn'
import { getHistoryItemIndexInfoForEpisode, getHistoryItemsIndex } from '../services/userHistoryItem'
import {
  ActivityIndicator,
  FlatList,
  HeaderTitleSelector,
  MessageWithAction,
  NavHeaderButtonText,
  QueueTableCell,
  SortableList,
  View
} from '../components'
import { errorLogger } from '../lib/logger'
import { translate } from '../lib/i18n'
import { safeKeyExtractor } from '../lib/utility'
import { PV } from '../resources'
import { checkIfShouldUseServerData } from '../services/auth'
import PVEventEmitter from '../services/eventEmitter'
import { audioMovePlayerItemToNewPosition } from '../services/playerAudio'
import { playerSyncPlayerWithQueue } from '../services/player'
import { trackPageView } from '../services/tracking'
import { playerLoadNowPlayingItem } from '../state/actions/player'
import { addQueueItemToServer, getQueueItems, removeQueueItem, setAllQueueItemsLocally } from '../state/actions/queue'
import { getHistoryItems, removeHistoryItem } from '../state/actions/userHistoryItem'
import { core } from '../styles'
import { HistoryIndexListenerScreen } from './HistoryIndexListenerScreen'

const _fileName = 'src/screens/QueueScreen.tsx'

type Props = {
  navigation?: any
}

type State = {
  endOfResultsReached?: boolean
  isEditing?: boolean
  isLoading?: boolean
  isLoadingMore?: boolean
  isRemoving?: boolean
  viewType?: string
}

const testIDPrefix = 'queue_screen'

export class QueueScreen extends HistoryIndexListenerScreen<Props, State> {
  shouldLoad: boolean

  constructor(props: Props) {
    super(props)

    this.shouldLoad = true

    this.state = {
      endOfResultsReached: false,
      isLoading: true,
      isLoadingMore: false,
      isRemoving: false,
      viewType: props.navigation.getParam('viewType') || _queueKey
    }
  }

  static navigationOptions = ({ navigation }) => {
    const { globalTheme } = getGlobal()
    const textColor = globalTheme.text.color
    const allowViewTypeChange = navigation.getParam('allowViewTypeChange')

    return {
      headerStyle: {
        backgroundColor: globalTheme.view.backgroundColor
      },
      headerTintColor: textColor,
      headerTitle: allowViewTypeChange ? (
        <HeaderTitleSelector
          color={textColor}
          items={headerTitleItems}
          onValueChange={navigation.getParam('_onViewTypeSelect')}
          placeholder={headerTitleItemPlaceholder}
          selectedItemKey={navigation.getParam('viewType') || navigation.getParam('viewType') === false || _queueKey}
        />
      ) : (
        translate('Queue')
      ),
      headerRight: () => (
        <RNView style={[core.row]}>
          {navigation.getParam('viewType') === _historyKey ? (
            <RNView>
              {!navigation.getParam('isEditing') ? (
                <RNView style={styles.headerButtonWrapper}>
                  <NavHeaderButtonText
                    accessibilityHint={translate('ARIA HINT - tap to start removing items from your history')}
                    accessibilityLabel={translate('Remove')}
                    color={textColor}
                    handlePress={navigation.getParam('_startEditing')}
                    style={styles.navHeaderTextButton}
                    testID={`${testIDPrefix}_header_edit`}
                    text={translate('Remove')}
                  />
                </RNView>
              ) : (
                <RNView style={styles.headerButtonWrapper}>
                  <NavHeaderButtonText
                    accessibilityHint={translate('ARIA HINT - tap to stop removing items from your history')}
                    accessibilityLabel={translate('Done')}
                    color={textColor}
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
                  accessibilityHint={translate('ARIA HINT - tap to start removing items from your queue')}
                  accessibilityLabel={translate('Remove')}
                  color={textColor}
                  handlePress={navigation.getParam('_startEditing')}
                  style={styles.navHeaderTextButton}
                  testID={`${testIDPrefix}_header_edit`}
                  text={translate('Remove')}
                />
              ) : (
                <NavHeaderButtonText
                  accessibilityHint={translate('ARIA HINT - tap to stop removing items from your queue')}
                  accessibilityLabel={translate('Done')}
                  color={textColor}
                  handlePress={navigation.getParam('_stopEditing')}
                  style={styles.navHeaderTextButton}
                  testID={`${testIDPrefix}_header_done`}
                  text={translate('Done')}
                />
              )}
            </RNView>
          )}
          {/* {navigation.getParam('showMoreNavButton') && <NavSearchIcon navigation={navigation} />} */}
        </RNView>
      )
    } as NavigationStackOptions
  }

  componentDidMount() {
    super.componentDidMount()

    const { navigation } = this.props

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    PVEventEmitter.on(PV.Events.QUEUE_HAS_UPDATED, this._getQueueItems)

    navigation.setParams({
      _onViewTypeSelect: this._onViewTypeSelect,
      _startEditing: this._startEditing,
      _stopEditing: this._stopEditing
    })

    this._getQueueItems()

    trackPageView('/queue', 'Queue Screen')
  }

  componentWillUnmount() {
    super.componentWillUnmount()
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    PVEventEmitter.removeListener(PV.Events.QUEUE_HAS_UPDATED, this._getQueueItems)
  }

  _getQueueItems = async () => {
    try {
      await getQueueItems()
      this.setState({ isLoading: false })
    } catch (error) {
      this.setState({ isLoading: false })
    }
  }

  _startEditing = () => {
    this.setState({ isEditing: true }, () => this.props.navigation.setParams({ isEditing: true }))
  }

  _stopEditing = () => {
    this.setState({ isEditing: false }, () => this.props.navigation.setParams({ isEditing: false }))
  }

  _onViewTypeSelect = async (x: string) => {
    this.setState({
      endOfResultsReached: false,
      isEditing: false,
      isLoading: true,
      isLoadingMore: true,
      viewType: x
    })
    this.props.navigation.setParams({
      isEditing: false,
      viewType: x
    })

    try {
      if (x === _queueKey) {
        await getQueueItems()
        this.setState({ isLoading: false, isLoadingMore: false })
      } else if (x === _historyKey) {
        await getHistoryItems(1)
        this.setState({ isLoading: false, isLoadingMore: false })
      }
    } catch (error) {
      this.setState({ isLoading: false, isLoadingMore: false })
    }
  }

  _handlePlayItem = async (item: NowPlayingItem) => {
    try {
      if (item && !item?.clipId) {
        const { episodes } = await getHistoryItemsIndex()
        if (episodes) {
          const foundEpisode = item?.episodeId ? episodes[item.episodeId] : null
          if (foundEpisode) {
            item.userPlaybackPosition = foundEpisode.userPlaybackPosition
          }
        }
      }

      await playerLoadNowPlayingItem(item, {
        forceUpdateOrderDate: false,
        setCurrentItemNextInQueue: true,
        shouldPlay: true
      })
      await getQueueItems()
      this.setState({ isLoading: false })
    } catch (error) {
      //
    }
  }

  _onPressRow = async (rowIndex: number) => {
    const { queueItems } = this.global.session.userInfo
    if (queueItems && queueItems[rowIndex]) {
      const item = queueItems[rowIndex]
      await removeQueueItem(item)
      await playerSyncPlayerWithQueue()
      this._handlePlayItem(item)
    }
  }

  _renderHistoryItem = ({ item = {} as NowPlayingItem, index }) => {
    const { isEditing } = this.state
    item = item || {}
    const { episodeDuration, episodeId } = item
    const { mediaFileDuration, userPlaybackPosition } = getHistoryItemIndexInfoForEpisode(episodeId)

    return (
      <View>
        <QueueTableCell
          clipEndTime={item.clipEndTime}
          clipStartTime={item.clipStartTime}
          {...(item.clipTitle ? { clipTitle: item.clipTitle } : {})}
          episodeDuration={episodeDuration}
          {...(item.episodePubDate ? { episodePubDate: item.episodePubDate } : {})}
          {...(item.episodeTitle ? { episodeTitle: item.episodeTitle } : {})}
          handleRemovePress={() => {
            this._handleRemoveHistoryItemPress(item)
          }}
          liveItem={item.liveItem}
          mediaFileDuration={mediaFileDuration}
          onPress={() => {
            if (!isEditing) {
              this._handlePlayItem(item)
            }
          }}
          podcastImageUrl={item.podcastImageUrl}
          podcastMedium={item?.podcastMedium}
          {...(item?.podcastTitle ? { podcastTitle: item.podcastTitle } : {})}
          showRemoveButton={isEditing}
          testID={`${testIDPrefix}_history_item_${index}`}
          userPlaybackPosition={userPlaybackPosition}
        />
      </View>
    )
  }

  _renderQueueItemRow = ({ item = {} as NowPlayingItem, index, drag, isActive }) => {
    const { isEditing } = this.state
    item = item || {}
    const { episodeDuration, episodeId } = item
    const { mediaFileDuration, userPlaybackPosition } = getHistoryItemIndexInfoForEpisode(episodeId)

    return (
      <QueueTableCell
        clipEndTime={item.clipEndTime}
        clipStartTime={item.clipStartTime}
        {...(item.clipTitle ? { clipTitle: item.clipTitle } : {})}
        drag={drag}
        episodeDuration={episodeDuration}
        episodeId={episodeId}
        {...(item.episodePubDate ? { episodePubDate: item.episodePubDate } : {})}
        {...(item.episodeTitle ? { episodeTitle: item.episodeTitle } : {})}
        handleRemovePress={() => this._handleRemoveQueueItemPress(item)}
        isActive={isActive}
        liveItem={item.liveItem}
        mediaFileDuration={mediaFileDuration}
        onPress={() => this._onPressRow(index)}
        podcastImageUrl={item.podcastImageUrl}
        podcastMedium={item?.podcastMedium}
        {...(item?.podcastTitle ? { podcastTitle: item.podcastTitle } : {})}
        showMoveButton={!isEditing}
        showRemoveButton={isEditing}
        testID={`${testIDPrefix}_queue_item_${index}`}
        userPlaybackPosition={userPlaybackPosition}
      />
    )
  }

  _handleRemoveQueueItemPress = (item: NowPlayingItem) => {
    this.setState({ isRemoving: true }, () => {
      (async () => {
        try {
          await removeQueueItem(item)
          await playerSyncPlayerWithQueue()
        } catch (error) {
          //
        }
        this.setState({ isRemoving: false })
      })()
    })
  }

  _handleRemoveHistoryItemPress = (item: NowPlayingItem) => {
    this.setState({ isRemoving: true }, () => {
      (async () => {
        try {
          await removeHistoryItem(item)
        } catch (error) {
          //
        }
        this.setState({ isRemoving: false })
      })()
    })
  }

  _onDragEnd = async ({ data, from, to }: { data: NowPlayingItem[]; from: number; to: number }) => {
    try {
      const { queueItems: previousQueueItems = [] } = this.global.session.userInfo
      const item = previousQueueItems[from] as any

      await setAllQueueItemsLocally(data)

      const offset = to < from ? -1 : 0
      to = (to + 1) * 1000 + offset

      const useServerData = await checkIfShouldUseServerData()
      if (useServerData && to > -1) {
        addQueueItemToServer(item, to)
      }

      if (item && previousQueueItems.length >= to) {
        await audioMovePlayerItemToNewPosition(item.clipId || item.episodeId, to)
      }
    } catch (error) {
      errorLogger(_fileName, '_onReleaseRow - _onDragEnd', error)
    }
  }

  _onEndReached = ({ distanceFromEnd }) => {
    const { historyQueryPage } = this.global.session.userInfo
    const queryPage = historyQueryPage || 1
    const { endOfResultsReached } = this.state

    if (!endOfResultsReached && this.shouldLoad && distanceFromEnd > -1) {
      this.shouldLoad = false
      this.setState({ isLoadingMore: true }, () => {
        (async () => {
          await this._queryHistoryData(queryPage)
        })()
      })
    }
  }
  render() {
    const { session } = this.global
    const { historyItems, historyItemsCount, queueItems } = session.userInfo
    const { isEditing, isLoading, isLoadingMore, isRemoving, viewType } = this.state

    const view = (
      <View style={styles.view} testID={`${testIDPrefix}_view`}>
        {!isLoading && viewType === _queueKey && queueItems && queueItems.length > 0 && (
          <SortableList
            data={queueItems}
            isEditing={isEditing}
            onDragEnd={this._onDragEnd}
            renderItem={this._renderQueueItemRow}
          />
        )}
        {!isLoading && viewType === _queueKey && queueItems && queueItems.length < 1 && (
          <MessageWithAction message={translate('Your queue is empty')} testID={testIDPrefix} />
        )}
        {!isLoading && viewType === _historyKey && historyItems && (
          <FlatList
            data={historyItems}
            dataTotalCount={historyItemsCount}
            extraData={historyItems}
            isLoadingMore={isLoadingMore}
            keyExtractor={(item: any, index: number) =>
              safeKeyExtractor(testIDPrefix, index, item?.clipId || item?.episodeId || item?.id)
            }
            noResultsMessage={translate('No history items found')}
            onEndReached={this._onEndReached}
            renderItem={this._renderHistoryItem}
          />
        )}
        {(isLoading || isRemoving) && (
          <ActivityIndicator isOverlay={isRemoving} styles={styles.activityIndicator} testID={testIDPrefix} />
        )}
      </View>
    )

    return view
  }

  _queryHistoryData = async (queryPage = 1) => {
    try {
      const { historyItems, historyItemsCount } = this.global.session.userInfo
      const endOfResultsReached = historyItems && historyItems.length <= historyItemsCount

      if (endOfResultsReached) {
        await getHistoryItems(queryPage + 1)
        const endOfResultsReached = historyItems && historyItems.length >= historyItemsCount
        this.shouldLoad = true
        this.setState({ isLoading: false, isLoadingMore: false, endOfResultsReached })
      } else {
        this.shouldLoad = true
        this.setState({ isLoading: false, isLoadingMore: false, endOfResultsReached: true })
      }
    } catch (error) {
      this.shouldLoad = true
      this.setState({ isLoading: false, isLoadingMore: false, endOfResultsReached: false })
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
  headerNowPlayingItemDivider: {
    marginTop: 10,
    height: 2
  },
  headerNowPlayingItemWrapper: {
    flex: 0
  },
  navHeaderSpacer: {
    width: 36
  },
  navHeaderTextButton: {
    fontSize: PV.Fonts.sizes.lg,
    marginRight: 8,
    textAlign: 'center'
  },
  queueCellDivider: {},
  view: {
    flex: 1
  },
  sectionHeaderText: {
    color: PV.Colors.skyDark,
    fontSize: PV.Fonts.sizes.xxxl
  }
})
