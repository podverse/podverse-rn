import { TranscriptRow } from 'podverse-shared'
import { StyleSheet, TouchableOpacity } from 'react-native'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import PVEventEmitter from '../services/eventEmitter'
import { getPlaybackSpeed, PVTrackPlayer, setPlaybackPosition } from '../services/player'
import { PVSearchBar } from './PVSearchBar'
import { AutoScrollToggle, FlatList, TableSectionSelectors, Text, View } from './'

type Props = {
  navigation?: any
  width: number
}

type State = {
  activeTranscriptRowIndex: number | null
  autoScrollOn: boolean
  searchText: string
  searchResults: never[]
}

const getCellID = (item: TranscriptRow) => `transcript-cell-${item.line}`

export class MediaPlayerCarouselTranscripts extends React.PureComponent<Props, State> {
  currentSpeaker?: string
  interval: ReturnType<typeof setInterval> | null = null
  listRef: any | null = null

  constructor() {
    super()

    this.state = {
      activeTranscriptRowIndex: null,
      autoScrollOn: false,
      searchText: '',
      searchResults: []
    }
  }

  componentDidMount() {
    PVEventEmitter.on(PV.Events.PLAYER_SPEED_UPDATED, this.updateAutoscroll)
  }

  componentWillUnmount() {
    PVEventEmitter.removeListener(PV.Events.PLAYER_SPEED_UPDATED)
    this.clearAutoScrollInterval()
  }

  renderItem = (item: any) => {
    const { activeTranscriptRowIndex } = this.state
    const transcriptionItem = item.item
    const { speaker, startTime, startTimeHHMMSS, text } = transcriptionItem
    const cellID = getCellID(transcriptionItem)

    if (speaker && speaker !== this.currentSpeaker) {
      this.currentSpeaker = speaker
    } else {
      this.currentSpeaker = ''
    }

    const activeTranscriptStyle = 
      ((activeTranscriptRowIndex && activeTranscriptRowIndex >= 0)
      || activeTranscriptRowIndex === 0)
      && activeTranscriptRowIndex === item.index
      ? { color: PV.Colors.orange }
      : {}

    const accessibilityLabel =
      `${this.currentSpeaker ? `${this.currentSpeaker}, ` : ''} ${text}, ${startTimeHHMMSS}`

    return (
      <TouchableOpacity
        accessible
        accessibilityLabel={accessibilityLabel}
        activeOpacity={0.7}
        onPress={() => setPlaybackPosition(startTime)}>
        {!!this.currentSpeaker && (
          <Text isSecondary style={styles.speaker} testID={`${cellID}-${this.currentSpeaker}`}>
            {this.currentSpeaker}
          </Text>
        )}
        <View style={styles.row}>
          <Text style={[styles.text, activeTranscriptStyle]} testID={cellID}>
            {text}
          </Text>
          <Text style={[styles.startTime, activeTranscriptStyle]} testID={`${cellID}-${startTime}`}>
            {startTimeHHMMSS}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  disableAutoscroll = () => {
    if (this.interval) {
      this.setState({
        activeTranscriptRowIndex: null,
        autoScrollOn: false
      }, this.clearAutoScrollInterval)
    }
  }

  toggleAutoscroll = () => {
    if (this.interval) {
      this.setState({
        activeTranscriptRowIndex: null,
        autoScrollOn: false
      }, this.clearAutoScrollInterval)
    } else {
      this.enableAutoscroll()
    }
  }

  updateAutoscroll = () => {
    if (this.interval) {
      this.enableAutoscroll()
    }
  }

  enableAutoscroll = async () => {
    const playbackSpeed = await getPlaybackSpeed()
    const intervalTime = 1000 / playbackSpeed
    this.clearAutoScrollInterval()

    this.setState({ autoScrollOn: true })
      this.interval = setInterval(() => {
        (async () => {
          const { parsedTranscript } = this.global
          const currentPosition = await PVTrackPlayer.getTrackPosition()

          const index = parsedTranscript.findIndex(
            (item: Record<string, any>) => item.startTime < currentPosition && item.endTime > currentPosition
          )

          if (index !== -1) {
            const indexBefore = index > 0 ? index - 1 : 0
            this.listRef.scrollToIndex({ index: indexBefore, animated: false })
            this.setState({ activeTranscriptRowIndex: index })
          }
        })()
      }, intervalTime)
  }

  clearAutoScrollInterval = () => {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }

  render() {
    const { width } = this.props
    const { autoScrollOn } = this.state
    const { screenReaderEnabled } = this.global

    let data: never[] | [] = this.global.parsedTranscript || []
    if (this.state.searchText) {
      data = this.state.searchResults || []
    }

    return (
      <View style={{ width }}>
        <TableSectionSelectors
          customButtons={!screenReaderEnabled ? (
            <AutoScrollToggle
              autoScrollOn={autoScrollOn}
              toggleAutoscroll={this.toggleAutoscroll}
            />
          ) : null}
          disableFilter
          hideDropdown
          includePadding
          selectedFilterLabel={translate('Transcript')}
        />
        <PVSearchBar
          accessibilityHint={
            translate('ARIA HINT - Type to show only the transcript text that includes this search term')}
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
              const searchResults = this.global.parsedTranscript.filter((item: Record<string, any>) => {
                return item?.text?.toLowerCase().includes(searchText?.toLowerCase())
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
          onClear={() => {
            this.setState({
              searchText: '',
              searchResults: []
            })
          }}
          testID='transcript_search_bar'
          value={this.state.searchText}
        />
        <FlatList
          data={data}
          dataTotalCount={data.length}
          disableLeftSwipe
          getItemLayout={(_: any, index: number) => {
            return { length: 80, offset: 80 * index, index }
          }}
          keyExtractor={(item: TranscriptRow) => getCellID(item)}
          listRef={(ref: any) => {
            this.listRef = ref
          }}
          onScrollBeginDrag={this.disableAutoscroll}
          renderItem={this.renderItem}
          testID='transcript-flat-list'
          transparent
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
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
    paddingBottom: 0,
    paddingHorizontal: 12,
    height: 80
  },
  speaker: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    paddingBottom: 6,
    paddingHorizontal: 12,
    paddingTop: 16
  },
  startTime: {
    flex: 0,
    fontSize: PV.Fonts.sizes.xxl,
    fontVariant: ['tabular-nums'],
    paddingLeft: 16
  },
  text: {
    borderColor: 'white',
    borderRightWidth: 1,
    flex: 1,
    flexWrap: 'wrap',
    fontSize: PV.Fonts.sizes.xxl
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: 12
  }
})
