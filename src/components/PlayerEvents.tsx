import { StyleSheet, View } from 'react-native'
import React from 'reactn'
import { PVTrackPlayer, setPlaybackPosition } from '../services/player'
import { handleResumeAfterClipHasEnded, playNextFromQueue, setClipHasEnded, setPlaybackState
  } from '../state/actions/player'

type Props = {}

type State = {}

export class PlayerEvents extends React.PureComponent<Props, State> {

  componentDidMount() {
    this._onTrackChanged = PVTrackPlayer.addEventListener('playback-track-changed', async (data) => {

    })

    this._onStateChanged = PVTrackPlayer.addEventListener('playback-state', async (data) => {

    })

    this._onQueueEnded = PVTrackPlayer.addEventListener('playback-queue-ended', async (data) => {
      const { player, session } = this.global
      // const { shouldContinuouslyPlay } = player
      // const { queueItems } = session.userInfo
      // if (shouldContinuouslyPlay && queueItems.length > 0) {
      //   await playNextFromQueue(session.isLoggedIn, this.global)
      // }
    })

    this._onError = PVTrackPlayer.addEventListener('playback-error', async (data) => {
      console.log('_onError')
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
