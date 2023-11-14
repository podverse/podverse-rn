import deepEqual from 'fast-deep-equal'
import { convertToNowPlayingItem } from 'podverse-shared'
import { AppState, AppStateStatus, StyleSheet } from 'react-native'
import React, { getGlobal, setGlobal } from 'reactn'
import { translate } from '../lib/i18n'
import { safeKeyExtractor } from '../lib/utility'
import { PV } from '../resources'
import { InitialState } from '../resources/Interfaces'
import PVEventEmitter from '../services/eventEmitter'
import { getPlaybackSpeed } from '../services/player'
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
  currentTocChapter?: InitialState['currentTocChapter']
  currentTocChapters: InitialState['currentTocChapters']
  isLoading: InitialState['screenPlayer']['isLoading']
  isLoadingMore: InitialState['screenPlayer']['isLoadingMore']
  isQuerying: InitialState['screenPlayer']['isQuerying']
  navigation?: any
  screenReaderEnabled: InitialState['screenReaderEnabled']
  selectedItem: InitialState['screenPlayer']['selectedItem']
  showMoreActionSheet: InitialState['screenPlayer']['showMoreActionSheet']
  showNoInternetConnectionMessage: InitialState['screenPlayer']['showNoInternetConnectionMessage']
  width: number
}

type State = {
  activeChapterRowIndex: number | null
  autoScrollOn: boolean
}

const getTestID = () => 'media_player_carousel_chapters'

let lastPlayingChapter: any = null

export class MediaPlayerCarouselChapters extends React.Component<Props, State> {
  interval: ReturnType<typeof setInterval> | null = null
  listRef: any | null = null
  appStateListenerChange: any

  constructor(props) {
    super(props)

    this.state = {
      activeChapterRowIndex: null,
      autoScrollOn: true
    }
  }

  componentDidMount() {
    this.appStateListenerChange = AppState.addEventListener('change', this._handleAppStateChange)
    PVEventEmitter.on(PV.Events.PLAYER_SPEED_UPDATED, this.updateAutoscroll)
    PVEventEmitter.on(PV.Events.MPC_CHAPTERS_IN_VIEW, this._inViewHandler)
  }

  componentWillUnmount() {
    this.appStateListenerChange.remove()
    PVEventEmitter.removeListener(PV.Events.PLAYER_SPEED_UPDATED, this.updateAutoscroll)
    PVEventEmitter.removeListener(PV.Events.MPC_CHAPTERS_IN_VIEW, this._inViewHandler)
    this.clearAutoScrollInterval()
  }

  shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>, nextContext: any): boolean {
    if (deepEqual(nextProps, this.props) && deepEqual(nextState, this.state)) {
      return false
    }

    return true
  }

  _handleAppStateChange = (nextAppStateStatus: AppStateStatus) => {
    if (nextAppStateStatus === 'active') {
      this._handleFocus()
    } else if (nextAppStateStatus === 'background' || nextAppStateStatus === 'inactive') {
      this._handleBlur()
    }
  }

  _inViewHandler = (isInView: boolean) => {
    if (isInView) {
      this.enableAutoscroll()
    } else {
      this.disableAutoscroll()
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
      const { currentTocChapter, currentTocChapters } = this.props
      if (currentTocChapter?.id) {
        if (lastPlayingChapter && currentTocChapter.id === lastPlayingChapter.id) return
        lastPlayingChapter = currentTocChapter

        const index = currentTocChapters.findIndex((item: Record<string, any>) => item?.id === currentTocChapter.id)

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
        ...this.global.screenPlayer,
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
            ...this.global.screenPlayer,
            showMoreActionSheet: false
          }
        },
        resolve
      )
    })

  _renderItem = ({ item, index }) => {
    const { navigation } = this.props
    const { currentTocChapter } = this.props
    const { episode } = getGlobal().player
    const podcast = episode?.podcast || {}
    const testID = getTestID()

    // item is a MediaRef
    item = {
      ...item,
      episode
    }

    return item?.episode?.id ? (
      <ClipTableCell
        handleMorePress={() => this._handleMorePress(convertToNowPlayingItem(item, null, podcast))}
        isChapter
        isNowPlayingItem={currentTocChapter && currentTocChapter.id === item.id}
        item={item}
        itemType='chapter'
        loadChapterOnPlay
        navigation={navigation}
        showPodcastInfo={false}
        testID={`${testID}_item_${index}`}
        transparent
      />
    ) : (
      <></>
    )
  }

  _ItemSeparatorComponent = () => <Divider />

  _keyExtractor = (item: any, index: number) => safeKeyExtractor(getTestID(), index, item?.id)

  onScrollToIndexFailed = (error) => {
    const { currentTocChapters } = this.props
    if (this.listRef !== null) {
      this.listRef.scrollToOffset({ offset: error.averageItemLength * error.index, animated: false });
      setTimeout(() => {
        if (currentTocChapters.length !== 0 && this.listRef !== null) {
          this.listRef.scrollToIndex({ index: error.index, animated: false });
        }
      }, 100);
    }
  }

  render() {
    const {
      currentTocChapters,
      isLoading,
      isLoadingMore,
      isQuerying,
      navigation,
      selectedItem,
      showMoreActionSheet,
      showNoInternetConnectionMessage,
      screenReaderEnabled,
      width
    } = this.props
    const { autoScrollOn } = this.state

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
        {!isLoading && !isQuerying && currentTocChapters && (
          <FlatList
            customOptimizationProps={PV.FlatList.optimizationPropsFaster}
            data={currentTocChapters}
            dataTotalCount={currentTocChapters.length}
            extraData={currentTocChapters}
            isLoadingMore={isLoadingMore}
            ItemSeparatorComponent={this._ItemSeparatorComponent}
            keyExtractor={this._keyExtractor}
            listRef={(ref: any) => {
              this.listRef = ref
            }}
            noResultsMessage={noResultsMessage}
            noResultsSubMessage={noResultsSubMessage}
            onScrollBeginDrag={this.disableAutoscroll}
            onScrollToIndexFailed={this.onScrollToIndexFailed}
            renderItem={this._renderItem}
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
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  }
})
