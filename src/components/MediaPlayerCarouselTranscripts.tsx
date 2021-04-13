import { StyleSheet } from 'react-native'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { TranscriptRow } from '../lib/transcriptHelpers'
import { PV } from '../resources'
import { PVTrackPlayer, setPlaybackPosition } from '../services/player'
import { PVSearchBar } from './PVSearchBar'
import { FlatList, TableSectionSelectors, Text, View } from './'

type Props = {
  navigation?: any
  width: number
}

type State = {
  searchText: string
  searchResults: never[]
  parsedTranscript: []
  autoScrollTitle: string
}

let currentSpeaker = ''

const getCellID = (item: TranscriptRow) => `transcript-cell-${item.line}`

export class MediaPlayerCarouselTranscripts extends React.PureComponent<Props, State> {
  listRef: any | null = null
  interval: ReturnType<typeof setInterval> | null = null

  constructor() {
    super()

    const { player } = this.global
    const parsedTranscript = player?.nowPlayingItem?.parsedTranscript || []

    this.state = {
      searchText: '',
      searchResults: [],
      parsedTranscript,
      autoScrollTitle: 'Autoscroll Off'
    }
  }

  componentWillUnmount() {
    this.clearAutoScrollInterval()
  }

  renderItem = (item: any) => {
    const transcriptionItem = item.item
    const { speaker, startTime, startTimeHHMMSS, text } = transcriptionItem
    const cellID = getCellID(transcriptionItem)
    if (speaker && speaker !== currentSpeaker) {
      currentSpeaker = speaker
    } else {
      currentSpeaker = ''
    }

    return (
      <View>
        {!!currentSpeaker && (
          <Text isSecondary style={styles.speaker} testID={`${cellID}-${currentSpeaker}`}>
            {currentSpeaker}
          </Text>
        )}
        <View style={styles.row}>
          <Text onPress={() => setPlaybackPosition(startTime)} style={styles.text} testID={cellID}>
            {text}
          </Text>
          <Text style={styles.startTime} testID={`${cellID}-${startTime}`}>
            {startTimeHHMMSS}
          </Text>
        </View>
      </View>
    )
  }

  toggleAutoscroll = () => {
    if (this.interval) {
      this.setState({ autoScrollTitle: 'Autoscroll Off' }, this.clearAutoScrollInterval)
    } else {
      this.setState({ autoScrollTitle: 'Autoscroll On' })
      this.interval = setInterval(() => {
        (async () => {
          const { player } = this.global
          const currentPosition = await PVTrackPlayer.getTrackPosition()
          const parsedTranscript = player?.nowPlayingItem?.parsedTranscript || []

          const index = parsedTranscript.findIndex(
            (item: Record<string, any>) => item.startTime < currentPosition && item.endTime > currentPosition
          )

          if (index !== -1) {
            this.listRef.scrollToIndex({ index, animated: false })
          }
        })()
      }, 1500)
    }
  }

  clearAutoScrollInterval = () => {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }

  render() {
    const { width } = this.props
    let data: never[] | [] = this.state.parsedTranscript
    if (this.state.searchText) {
      data = this.state.searchResults
    }

    return (
      <View style={{ width }}>
        <TableSectionSelectors
          customButtons={
            <Text onPress={this.toggleAutoscroll} style={styles.autoScrollerText} testID='transcript-autoscroll'>
              {this.state.autoScrollTitle}
            </Text>
          }
          disableFilter
          hideDropdown
          includePadding
          selectedFilterLabel={translate('Transcript')}
        />
        <PVSearchBar
          testID='transcript_search_bar'
          value={this.state.searchText}
          onChangeText={(searchText: string) => {
            this.setState(
              {
                searchText,
                searchResults: this.state.parsedTranscript.filter((item: Record<string, any>) => {
                  return item?.text?.includes(searchText)
                }),
                autoScrollTitle: 'Autoscroll Off'
              },
              this.clearAutoScrollInterval
            )
          }}
          onClear={() => {
            this.setState({
              searchText: '',
              searchResults: []
            })
          }}
          handleClear={() => {
            this.setState({
              searchText: '',
              searchResults: []
            })
          }}
          containerStyle={{
            backgroundColor: PV.Colors.velvet,
            marginBottom: 10,
            marginHorizontal: 12
          }}
        />
        <FlatList
          data={data}
          dataTotalCount={data.length}
          disableLeftSwipe
          keyExtractor={(item: TranscriptRow) => getCellID(item)}
          renderItem={this.renderItem}
          listRef={(ref: any) => {
            this.listRef = ref
          }}
          getItemLayout={(_: any, index: number) => {
            return { length: 60, offset: 60 * index, index }
          }}
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
    height: 60
  },
  speaker: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    paddingBottom: 6,
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
  },
  autoScrollerText: {
    borderRadius: 16,
    backgroundColor: PV.Colors.velvet,
    borderColor: PV.Colors.brandBlueLight,
    borderWidth: 2,
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold,
    paddingVertical: 5,
    paddingHorizontal: 10
  }
})
