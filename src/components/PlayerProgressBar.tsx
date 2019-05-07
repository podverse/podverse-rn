import { StyleSheet, View } from 'react-native'
import { Slider } from 'react-native-elements'
import React from 'reactn'
import { convertSecToHHMMSS } from '../lib/utility'
import { PV } from '../resources'
import { PVTrackPlayer, setPlaybackPosition } from '../services/player'
import { Text } from './'

type Props = {}

type State = {
  bufferedPosition: number
  duration: number
  position: number
  slidingPosition: number | null
}

export class PlayerProgressBar extends PVTrackPlayer.ProgressComponent<Props, State> {

  constructor(props: Props) {
    super(props)

    this.state = {
      bufferedPosition: 0,
      duration: 0,
      position: 0,
      slidingPosition: null
    }
  }

  render() {
    const { duration, position, slidingPosition } = this.state
    const pos = slidingPosition || position
    const value = duration > 0 ? pos / duration : 0

    return (
      <View style={styles.wrapper}>
        <Slider
          minimumValue={0}
          maximumValue={1}
          onSlidingComplete={(value) => {
            const position = value * duration
            setPlaybackPosition(position)
            this.setState({
              position,
              slidingPosition: null
            })
          }}
          onValueChange={(value) => this.setState({ slidingPosition: value * duration })}
          thumbStyle={styles.thumbStyle}
          thumbTintColor={PV.Colors.brandColor}
          value={value} />
        <View style={styles.timeRow}>
          <Text style={styles.time}>{convertSecToHHMMSS(slidingPosition || position)}</Text>
          <Text style={styles.time}>{duration > 0 ? convertSecToHHMMSS(duration) : '--:--'}</Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  thumbStyle: {
    borderRadius: 0,
    height: 24,
    width: 6
  },
  time: {
    fontSize: 14,
    lineHeight: 14,
    marginHorizontal: 8
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  wrapper: {
    height: 56
  }
})
