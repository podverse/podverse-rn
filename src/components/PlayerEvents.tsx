import { StyleSheet, View } from 'react-native'
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
  }

  componentWillUnmount() {
    PlayerEventEmitter.removeListener(PV.Events.PLAYER_QUEUE_ENDED)
    PlayerEventEmitter.removeListener(PV.Events.PLAYER_RESUME_AFTER_CLIP_HAS_ENDED)
    PlayerEventEmitter.removeListener(PV.Events.PLAYER_STATE_CHANGED)
  }

  _handlePlayerQueueEnded = async () => {
    const { player, screenMakeClip, session } = this.global
    const { shouldContinuouslyPlay } = player
    const { queueItems } = session.userInfo
    if (!screenMakeClip.isShowing && shouldContinuouslyPlay && queueItems.length > 0) {
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
