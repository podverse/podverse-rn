import { TranscriptRow } from 'podverse-shared'
import { AppState, AppStateStatus, StyleSheet } from 'react-native'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import PVEventEmitter from '../services/eventEmitter'
import { getPlaybackSpeed, playerGetPosition, playerHandleSeekTo } from '../services/player'
import { PVSearchBar } from './PVSearchBar'
import { AutoScrollToggle, FlatList, PressableWithOpacity, ScrollView, TableSectionSelectors, Text, View } from './'

type Props = {
  isNowPlaying?: boolean
  navigation?: any
  parsedTranscript: TranscriptRow[]
  width?: number
}

type State = {
  activeTranscriptRowIndexes: number[]
  autoScrollOn: boolean
  searchText: string
  searchResults: never[]
}

const getCellID = (item: TranscriptRow, index: number) => `transcript-cell-${index}`

export class MediaPlayerCarouselTranscripts extends React.PureComponent<Props, State> {
  currentSpeaker?: string
  interval: ReturnType<typeof setInterval> | null = null
  listRef: any | null = null
  appStateListenerChange: any

  constructor() {
    super()

    this.state = {
      activeTranscriptRowIndexes: [],
      autoScrollOn: false,
      searchText: '',
      searchResults: []
    }
  }

  componentDidMount() {
    this.appStateListenerChange = AppState.addEventListener('change', this._handleAppStateChange)
    PVEventEmitter.on(PV.Events.PLAYER_SPEED_UPDATED, this.updateAutoscroll)
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

  disableAutoscroll = () => {
    if (this.interval) {
      this.setState(
        {
          activeTranscriptRowIndexes: [],
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
          activeTranscriptRowIndexes: [],
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
      (async () => {
        const { parsedTranscript } = this.props
        if (parsedTranscript) {
          const currentPosition = await playerGetPosition()

          const firstMatchingIndex = parsedTranscript.findIndex(
            (item: Record<string, any>) => item.startTime < currentPosition && item.endTime > currentPosition
          )

          const activeTranscriptRowIndexes = []
          activeTranscriptRowIndexes.push(firstMatchingIndex)

          const activeItem = firstMatchingIndex >= 0 ? parsedTranscript[firstMatchingIndex] : null

          if (activeItem?.hasTwoLines) {
            activeTranscriptRowIndexes.push(firstMatchingIndex + 1)
          }

          if (activeTranscriptRowIndexes.some((index) => index !== -1)) {
            this.listRef.scrollToOffset({
              offset: PV.FlatList.transcriptRowHeights.singleLine * (firstMatchingIndex - 3), animated: false })
            this.setState({ activeTranscriptRowIndexes })
          }
        }
      })()
    }, intervalTime)
  }

  enableAutoscroll = async () => {
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

  renderItem = ({ item, index }) => {
    const { isNowPlaying } = this.props
    const { activeTranscriptRowIndexes } = this.state
    const transcriptionItem = item
    const { body, isEmptySpace, speaker, startTime, startTimeFormatted } = transcriptionItem
    const cellID = getCellID(transcriptionItem, index)
    const { screenWidth } = this.global.screen

    if (speaker && speaker !== this.currentSpeaker) {
      this.currentSpeaker = speaker
    } else {
      this.currentSpeaker = ''
    }

    const isActive = activeTranscriptRowIndexes.some((activeTranscriptRowIndex) =>
      (activeTranscriptRowIndex >= 0 && activeTranscriptRowIndex === index))
    const activeTranscriptStyle = isActive ? { color: PV.Colors.orange } : {}
      
    const accessibilityLabel = `${this.currentSpeaker ? `${this.currentSpeaker}, ` : ''} ${body}, ${startTimeFormatted}`

    const disable = !isNowPlaying
    const onPress = isNowPlaying ? () => playerHandleSeekTo(startTime) : null

    return (
      <>
        {
          !!isEmptySpace && (
            <View style={{ height: PV.FlatList.transcriptRowHeights.singleLine }} />
          )
        }
        {
          !isEmptySpace && (
            <PressableWithOpacity
              accessible
              accessibilityLabel={accessibilityLabel}
              activeOpacity={0.7}
              disable={disable}
              onPress={onPress}>
              {!!this.currentSpeaker && (
                <Text isSecondary style={styles.speaker} testID={`${cellID}-${this.currentSpeaker}`}>
                  {this.currentSpeaker}
                </Text>
              )}
              {
                !this.currentSpeaker && (
                  <View style={styles.row}>
                    <Text style={[styles.text, activeTranscriptStyle]} testID={cellID}>
                      {body}
                    </Text>
                    {
                      screenWidth > 360 && (
                        <Text style={[styles.startTime, activeTranscriptStyle]} testID={`${cellID}-${startTime}`}>
                          {startTimeFormatted}
                        </Text>
                      )
                    }
                  </View>
                )
              }
            </PressableWithOpacity>

          )
        }
      </>
    )
  }

  renderSingleLineTranscript = (item: any) => {
    const transcriptionItem = item
    const { body } = transcriptionItem
    return (
      <View style={styles.singleLineWrapper}>
        <Text style={styles.singleLineText}>{body}</Text>
      </View>
    )
  }

  render() {
    const { isNowPlaying, width } = this.props
    let { parsedTranscript } = this.props
    const { autoScrollOn } = this.state
    const { screenReaderEnabled } = this.global

    if (this.state.searchText) {
      parsedTranscript = this.state.searchResults || []
    }

    const isSingleLineTranscript = parsedTranscript.length === 1
    const wrapperStyle = width ? { width } : { width: '100%' }

    return (
      <View style={[styles.view, wrapperStyle]}>
        <TableSectionSelectors
          customButtons={
            !screenReaderEnabled && !isSingleLineTranscript && isNowPlaying ? (
              <AutoScrollToggle autoScrollOn={autoScrollOn} toggleAutoscroll={this.toggleAutoscroll} />
            ) : null
          }
          disableFilter
          hideDropdown
          includePadding
          selectedFilterLabel={translate('Transcript')}
        />
        <PVSearchBar
          accessibilityHint={translate(
            'ARIA HINT - Type to show only the transcript text that includes this search term'
          )}
          accessibilityLabel={translate('Transcript search input')}
          containerStyle={{
            backgroundColor: PV.Colors.velvet,
            marginBottom: 10,
            marginHorizontal: 12
          }}
          handleClear={() => {
            this.setState({
              searchText: '',
              searchResults: []
            })
          }}
          onChangeText={(searchText: string) => {
            if (!searchText || searchText?.length === 0) {
              this.setState({
                searchText: '',
                searchResults: []
              })
            } else {
              const searchResults = parsedTranscript.filter((item: Record<string, any>) => {
                return item?.body?.toLowerCase().includes(searchText?.toLowerCase())
              })

              this.setState(
                {
                  searchText,
                  searchResults,
                  autoScrollOn: false
                },
                this.clearAutoScrollInterval
              )
            }
          }}
          testID='transcript_search_bar'
          value={this.state.searchText}
        />
        {isSingleLineTranscript && <ScrollView>{this.renderSingleLineTranscript(parsedTranscript[0])}</ScrollView>}
        {!isSingleLineTranscript && (
          <FlatList
            automaticallyAdjustContentInsets={false}
            contentContainerStyle={styles.contentContainerStyle}
            contentOffset={{ x: 0, y: 0 }}
            customOptimizationProps={PV.FlatList.optimizationPropsFaster}
            data={parsedTranscript}
            dataTotalCount={parsedTranscript.length}
            getItemLayout={(_: any, index: number) => {
              return {
                length: PV.FlatList.transcriptRowHeights.singleLine,
                offset: PV.FlatList.transcriptRowHeights.singleLine * index,
                index
              }
            }}
            ItemSeparatorComponent={() => <></>}
            keyExtractor={(item: TranscriptRow, index: number) => getCellID(item, index)}
            listRef={(ref: any) => {
              this.listRef = ref
            }}
            onScrollBeginDrag={this.disableAutoscroll}
            renderItem={this.renderItem}
            testID='transcript-flat-list'
            transparent
          />
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  contentContainerStyle: {
    marginBottom: 16,
    paddingBottom: 48,
    paddingTop: 0
  },
  header: {
    flexDirection: 'row',
    paddingBottom: 12
  },
  headerText: {
    flex: 0,
    fontSize: PV.Fonts.sizes.xxl,
    fontWeight: PV.Fonts.weights.bold,
    textAlign: 'center'
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 12
  },
  speaker: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    paddingHorizontal: 12,
    height: PV.FlatList.transcriptRowHeights.singleLine,
    lineHeight: PV.FlatList.transcriptRowHeights.singleLine,
    color: PV.Colors.skyLight
  },
  singleLineText: {
    fontSize: PV.Fonts.sizes.xxl,
    height: PV.FlatList.transcriptRowHeights.singleLine,
    lineHeight: PV.FlatList.transcriptRowHeights.singleLine,
    paddingHorizontal: 8
  },
  singleLineWrapper: {
    paddingHorizontal: 12,
  },
  startTime: {
    flex: 0,
    fontSize: PV.Fonts.sizes.lg,
    fontVariant: ['tabular-nums'],
    lineHeight: PV.FlatList.transcriptRowHeights.singleLine - 1,
    paddingLeft: 8
  },
  text: {
    flex: 1,
    flexWrap: 'wrap',
    fontSize: PV.Fonts.sizes.xxl,
    height: PV.FlatList.transcriptRowHeights.singleLine,
    lineHeight: PV.FlatList.transcriptRowHeights.singleLine
  },
  view: {
    flex: 1,
    paddingTop: 0
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: 12
  }
})
