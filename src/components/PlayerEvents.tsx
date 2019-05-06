import { StyleSheet, View } from 'react-native'
import React from 'reactn'
import { PVTrackPlayer } from '../services/player'
import { setPlaybackState } from '../state/actions/player'

type Props = {}

type State = {}

export class PlayerEvents extends React.PureComponent<Props, State> {

  componentDidMount() {
    this._onTrackChanged = PVTrackPlayer.addEventListener('playback-track-changed', async (data) => {
      console.log('_onTrackChanged')
      console.log(data)
    })

    this._onStateChanged = PVTrackPlayer.addEventListener('playback-state', async (data) => {
      await setPlaybackState(data.state, this.global)
    })

    this._onQueueEnded = PVTrackPlayer.addEventListener('playback-queue-ended', async (data) => {
      console.log('_onQueueEnded')
      console.log(data)
    })

    this._onError = PVTrackPlayer.addEventListener('playback-error', async (data) => {
      console.log('_onError')
      console.log(data)
    })
  }

  componentWillUnmount() {
    this._onTrackChanged.remove()
    this._onStateChanged.remove()
    this._onQueueEnded.remove()
    this._onError.remove()
  }

  render() {
    return (
      <View style={styles.view} />
    )
  }
}

const styles = StyleSheet.create({
  view: {
    height: 0,
    width: 0
  }
})
