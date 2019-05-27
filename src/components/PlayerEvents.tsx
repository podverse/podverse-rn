import { Alert, StyleSheet, View } from 'react-native'
import React from 'reactn'
import { PV } from '../resources'
import { getNowPlayingItem } from '../services/player'
import PlayerEventEmitter from '../services/playerEventEmitter'
import { playNextFromQueue, setNowPlayingItem, updatePlaybackState } from '../state/actions/player'

type Props = {}

type State = {}

export class PlayerEvents extends React.PureComponent<Props, State> {

  componentDidMount() {
    PlayerEventEmitter.on(PV.Events.PLAYER_QUEUE_ENDED, this._handlePlayerQueueEnded)
    PlayerEventEmitter.on(PV.Events.PLAYER_RESUME_AFTER_CLIP_HAS_ENDED, this._handlePlayerResumeAfterClipHasEnded)
    PlayerEventEmitter.on(PV.Events.PLAYER_STATE_CHANGED, this._handlePlayerStateUpdated)
    PlayerEventEmitter.on(PV.Events.PLAYER_CANNOT_STREAM_WITHOUT_WIFI, this._handlePlayerCannotStreamWithoutWifi)
  }

  componentWillUnmount() {
    PlayerEventEmitter.removeListener(PV.Events.PLAYER_QUEUE_ENDED)
    PlayerEventEmitter.removeListener(PV.Events.PLAYER_RESUME_AFTER_CLIP_HAS_ENDED)
    PlayerEventEmitter.removeListener(PV.Events.PLAYER_STATE_CHANGED)
    PlayerEventEmitter.removeListener(PV.Events.PLAYER_CANNOT_STREAM_WITHOUT_WIFI)
  }

  _handlePlayerQueueEnded = async () => {
    const { player, session } = this.global
    const { shouldContinuouslyPlay, showMakeClip } = player
    const { queueItems } = session.userInfo

    if (!showMakeClip.isShowing && shouldContinuouslyPlay && queueItems.length > 0) {
      await playNextFromQueue(session.isLoggedIn, this.global)
    }
  }

  _handlePlayerResumeAfterClipHasEnded = async () => {
    const nowPlayingItem = await getNowPlayingItem()

    await setNowPlayingItem(nowPlayingItem, this.global)
  }

  _handlePlayerStateUpdated = async () => {
    await updatePlaybackState(this.global)
  }

  _handlePlayerCannotStreamWithoutWifi = async () => {
    await Alert.alert(
      PV.Alerts.PLAYER_CANNOT_STREAM_WITHOUT_WIFI.title, PV.Alerts.PLAYER_CANNOT_STREAM_WITHOUT_WIFI.message, []
    )
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
