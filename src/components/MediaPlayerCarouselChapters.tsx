import { convertToNowPlayingItem } from 'podverse-shared'
import { AppState, AppStateStatus, StyleSheet } from 'react-native'
import React, { setGlobal } from 'reactn'
import { translate } from '../lib/i18n'
import { hasValidNetworkConnection } from '../lib/network'
import { safeKeyExtractor } from '../lib/utility'
import { PV } from '../resources'
import { InitialState, RenderClipTableCellParams } from '../resources/Interfaces'
import { retrieveLatestChaptersForEpisodeId } from '../services/episode'
import PVEventEmitter from '../services/eventEmitter'
import { getPlaybackSpeed } from '../services/player'
import { playerLoadNowPlayingItem } from '../state/actions/player'
import {
  ActionSheet,
  ActivityIndicator,
  AutoScrollToggle,
  ClipTableCell,
  Divider,
  FlatList,
  TableSectionSelectors,
  View
} from './'

type Props = {
  currentChapter: InitialState['currentChapter']
  currentChapters: InitialState['currentChapters']
  downloadsActive: InitialState['downloadsActive']
  downloadedEpisodeIds: InitialState['downloadedEpisodeIds']
  fontScaleMode: InitialState['fontScaleMode']
  isChapters?: boolean
  navigation?: any
  player: InitialState['player']
  screenPlayer: InitialState['screenPlayer']
  screenReaderEnabled: boolean
  width: number
}

type State = {
  activeChapterRowIndex: number | null
  autoScrollOn: boolean
}

const getTestID = () => 'media_player_carousel_chapters'

let lastPlayingChapter: any = null

export class MediaPlayerCarouselChapters extends React.PureComponent<Props, State> {
  interval: ReturnType<typeof setInterval> | null = null
  listRef: any | null = null
  itemHeights: any[]
  appStateListenerChange: any

  constructor(props: Props) {
    super(props)

    this.itemHeights = []

    this.state = {
      activeChapterRowIndex: null,
      autoScrollOn: false
    }
  }

  componentDidMount() {
    this.appStateListenerChange = AppState.addEventListener('change', this._handleAppStateChange)
    PVEventEmitter.on(PV.Events.PLAYER_SPEED_UPDATED, this.updateAutoscroll)
    this._queryData()
  }

  componentWillUnmount() {
    this.appStateListenerChange.remove()
    PVEventEmitter.removeListener(PV.Events.PLAYER_SPEED_UPDATED, this.updateAutoscroll)
    this.clearAutoScrollInterval()
  }

  _handleAppStateChange = (nextAppStateStatus: AppStateStatus) => {
    if (nextAppStateStatus === 'active') {
      this._handleFocus()
    } else if (nextAppStateStatus === 'background' || nextAppStateStatus === 'inactive') {
      this._handleBlur()
    }
  }

  _handleFocus = () => {
    const { autoScrollOn } = this.state
    if (autoScrollOn) {
      this.enableAutoscroll()
    }
  }

  _handleBlur = () => {
    this.disableAutoscroll()
  }

  _handleNavigationPress = (selectedItem: any) => {
    const shouldPlay = true
    const forceUpdateOrderDate = false
    const setCurrentItemNextInQueue = false
    playerLoadNowPlayingItem(selectedItem, shouldPlay, forceUpdateOrderDate, setCurrentItemNextInQueue)
  }

  disableAutoscroll = () => {
    if (this.interval) {
      this.setState(
        {
          activeChapterRowIndex: null,
          autoScrollOn: false
        },
        this.clearAutoScrollInterval
      )
    }
  }

  toggleAutoscroll = () => {
    if (this.interval) {
      this.setState(
        {
          activeChapterRowIndex: null,
          autoScrollOn: false
        },
        this.clearAutoScrollInterval
      )
    } else {
      this.enableAutoscroll()
    }
  }

  updateAutoscroll = () => {
    if (this.interval) {
      this.enableAutoscroll()
    }
  }

  setAutoScrollInterval = async () => {
    const playbackSpeed = await getPlaybackSpeed()
    const intervalTime = 1000 / playbackSpeed
    return setInterval(() => {
      const { currentChapter, currentChapters } = this.props
      const itemHeightsReady = currentChapters.length === this.itemHeights.length

      if (currentChapter?.id && itemHeightsReady) {
        if (lastPlayingChapter && currentChapter.id === lastPlayingChapter.id) return
        lastPlayingChapter = currentChapter

        const index = currentChapters.findIndex((item: Record<string, any>) => item?.id === currentChapter.id)

        if (index !== -1) {
          const indexBefore = index > 0 ? index - 1 : 0
          this.listRef.scrollToIndex({ index: indexBefore, animated: false })
          this.setState({ activeChapterRowIndex: index })
        }
      }
    }, intervalTime)
  }

  enableAutoscroll = async () => {
    lastPlayingChapter = null
    this.clearAutoScrollInterval()
    this.setState({ autoScrollOn: true })
    this.interval = await this.setAutoScrollInterval()
  }

  clearAutoScrollInterval = () => {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }

  _handleMorePress = (selectedItem: any) => {
    setGlobal({
      screenPlayer: {
        ...this.props.screenPlayer,
        selectedItem,
        showMoreActionSheet: true
      }
    })
  }

  _handleMoreCancelPress = () =>
    new Promise((resolve) => {
      setGlobal(
        {
          screenPlayer: {
            ...this.props.screenPlayer,
            showMoreActionSheet: false
          }
        },
        resolve
      )
    })

  _renderItem = ({ item, index }, { currentChapter, downloadsActive, downloadedEpisodeIds,
    fontScaleMode, player, screenReaderEnabled }: RenderClipTableCellParams) => {
    const { navigation } = this.props
    const { episode } = player
    const podcast = episode?.podcast || {}
    const testID = getTestID()

    // item is a MediaRef
    item = {
      ...item,
      episode
    }

    return item?.episode?.id ? (
      <ClipTableCell
        downloadsActive={downloadsActive}
        downloadedEpisodeIds={downloadedEpisodeIds}
        fontScaleMode={fontScaleMode}
        handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(item, null, podcast))}
        isChapter
        isNowPlayingItem={!!currentChapter && currentChapter.id === item.id}
        item={item}
        itemType='chapter'
        loadChapterOnPlay
        navigation={navigation}
        onLayout={(item: any) => (this.itemHeights[index] = item.nativeEvent.layout.height)}
        screenReaderEnabled={screenReaderEnabled}
        showPodcastInfo={false}
        testID={`${testID}_item_${index}`}
        transparent
      />
    ) : (
      <></>
    )
  }
  /* 
  Creating array of itemHeights to determine where to scroll, given the cells
  have a dynamic height. The array can only be populated after the list
  has rendered once, so we're returning a default placehold length and offset
  for initial load, and not allowing autoscroll to happen until the itemHeights
  array is populated.
*/
  _getItemLayout = (data, index) => {
    const { currentChapters } = this.props

    let length = 80
    let offset = 80

    if (currentChapters && currentChapters.length === this.itemHeights.length) {
      length = this.itemHeights[index]
      offset = this.itemHeights.slice(0, index).reduce((a, c) => a + c, 0)
    }

    return { length, offset, index }
  }

  _ItemSeparatorComponent = () => <Divider />

  render() {
    const { currentChapter, currentChapters, downloadsActive, downloadedEpisodeIds,
      fontScaleMode, navigation, player, screenPlayer, screenReaderEnabled,
      width } = this.props
    const { autoScrollOn } = this.state
    const {
      isLoading,
      isLoadingMore,
      isQuerying,
      selectedItem,
      showMoreActionSheet,
      showNoInternetConnectionMessage
    } = screenPlayer

    const noResultsMessage = translate('No chapters found')
    const noResultsSubMessage = translate('Chapters are created by the podcaster')
    const testID = getTestID()

    return (
      <View style={[styles.wrapper, { width }]} transparent>
        <TableSectionSelectors
          customButtons={
            !screenReaderEnabled ? (
              <AutoScrollToggle autoScrollOn={autoScrollOn} toggleAutoscroll={this.toggleAutoscroll} />
            ) : null
          }
          disableFilter
          hideDropdown
          includePadding
          selectedFilterLabel={translate('Chapters')}
          selectedFilterAccessibilityHint={translate('ARIA HINT - This is a list of the chapters for this episode')}
        />
        {isLoading || (isQuerying && <ActivityIndicator fillSpace testID={getTestID()} />)}
        {!isLoading && !isQuerying && currentChapters && (
          <FlatList
            data={currentChapters}
            dataTotalCount={currentChapters.length}
            extraData={currentChapters}
            getItemLayout={this._getItemLayout}
            isLoadingMore={isLoadingMore}
            ItemSeparatorComponent={this._ItemSeparatorComponent}
            keyExtractor={(item: any, index: number) => safeKeyExtractor(getTestID(), index, item?.id)}
            listRef={(ref: any) => {
              this.listRef = ref
            }}
            noResultsMessage={noResultsMessage}
            noResultsSubMessage={noResultsSubMessage}
            onScrollBeginDrag={this.disableAutoscroll}
            renderItem={(x: any) => this._renderItem(x, {
              currentChapter,
              downloadsActive,
              downloadedEpisodeIds,
              fontScaleMode,
              player,
              screenReaderEnabled,
              showLightningIcons
            })}
            showNoInternetConnectionMessage={showNoInternetConnectionMessage}
            transparent
          />
        )}
        <ActionSheet
          handleCancelPress={this._handleMoreCancelPress}
          items={() =>
            PV.ActionSheet.media.moreButtons(
              selectedItem,
              navigation,
              {
                handleDismiss: this._handleMoreCancelPress
              },
              'chapter'
            )
          }
          showModal={showMoreActionSheet}
          testID={`${testID}_more`}
        />
      </View>
    )
  }

  _queryChapters = async () => {
    const { player } = this.props
    const { nowPlayingItem } = player

    if (nowPlayingItem && !nowPlayingItem.addByRSSPodcastFeedUrl) {
      return retrieveLatestChaptersForEpisodeId(nowPlayingItem.episodeId)
    } else {
      return [[], 0]
    }
  }

  _queryData = async () => {
    const { screenPlayer } = this.props
    const { flatListData } = screenPlayer
    const newState = {
      isLoading: false,
      isLoadingMore: false,
      isQuerying: false,
      showNoInternetConnectionMessage: false
    } as any

    const hasInternetConnection = await hasValidNetworkConnection()

    if (!hasInternetConnection) {
      newState.showNoInternetConnectionMessage = true
      return newState
    }

    try {
      const results = await this._queryChapters()
      newState.flatListData = [...flatListData, ...results[0]]
      newState.endOfResultsReached = newState.flatListData.length >= results[1]
      newState.flatListDataTotalCount = results[1]

      return newState
    } catch (error) {
      return newState
    }
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  }
})
