import { StyleSheet } from 'react-native'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { TranscriptRow } from '../lib/transcriptHelpers'
import { PV } from '../resources'
import { setPlaybackPosition } from '../services/player'
import { Button, FlatList, TableSectionSelectors, Text, View } from './'

type Props = {
  navigation?: any
  width: number
}

let currentSpeaker = ''

const getCellID = (item: TranscriptRow) => `transcript-cell-${item.line}`

export class MediaPlayerCarouselTranscripts extends React.PureComponent<Props> {
  constructor(props) {
    super(props)
    this.state = {}
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
        {
          !!currentSpeaker && 
            <Text
              isSecondary
              style={styles.speaker}
              testID={`${cellID}-${currentSpeaker}`}>
              {currentSpeaker}  
            </Text>
        }
        <View style={styles.row}>
          <Text
            onPress={() => setPlaybackPosition(startTime)}
            style={styles.text}
            testID={cellID}>
            {text}
          </Text>
          <Text style={styles.startTime} testID={`${cellID}-${startTime}`}>{startTimeHHMMSS}</Text>
        </View>
      </View>
    )
  }

  toggleAutoscroll = () => {
    console.log('toggle autoscroll')
  }

  render() {
    const { width } = this.props
    const { player } = this.global
    const parsedTranscript = player?.nowPlayingItem?.parsedTranscript || []

    return (
      <View style={{ width }}>
        <TableSectionSelectors
          customButtons={
            <Text
              onPress={this.toggleAutoscroll}
              style={styles.autoscroll}
              testID='transcript-autoscroll'>
              Autoscroll On
            </Text>
          }
          disableFilter
          hideDropdown
          includePadding
          selectedFilterLabel={translate('Transcript')}
        />
        <FlatList
          data={parsedTranscript}
          dataTotalCount={parsedTranscript.length}
          disableLeftSwipe
          keyExtractor={(item: TranscriptRow) => getCellID(item)}
          renderItem={this.renderItem}
          testID='transcript-flat-list'
          transparent />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  autoscroll: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold,
    textAlign: 'right'
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
    paddingBottom: 8,
    paddingHorizontal: 12
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
    paddingLeft: 16,
  },
  text: {
    borderColor:'white',
    borderRightWidth: 1,
    flex: 1,
    flexWrap:'wrap',
    fontSize: PV.Fonts.sizes.xxl
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: 12
  }
})
