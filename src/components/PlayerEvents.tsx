import debounce from 'lodash/debounce'
import { Alert, StyleSheet, View } from 'react-native'
import React from 'reactn'
import { refreshDownloadedPodcasts } from '../lib/downloadedPodcast'
import { PV } from '../resources'
import { getNowPlayingItem } from '../services/player'
import PlayerEventEmitter from '../services/playerEventEmitter'
import { clearNowPlayingItem, setNowPlayingItem, updatePlaybackState } from '../state/actions/player'

type Props = {}

type State = {}

export class PlayerEvents extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props)

    this._playerCannotStreamWithoutWifi = debounce(this._playerCannotStreamWithoutWifi, 3000)
  }

  componentDidMount() {
    PlayerEventEmitter.on(PV.Events.PLAYER_CANNOT_STREAM_WITHOUT_WIFI, this._playerCannotStreamWithoutWifi)
    PlayerEventEmitter.on(PV.Events.PLAYER_QUEUE_ENDED, this._refreshNowPlayingItem)
    PlayerEventEmitter.on(PV.Events.PLAYER_REMOTE_DUCK, this._refreshNowPlayingItem)
    PlayerEventEmitter.on(PV.Events.PLAYER_REMOTE_NEXT, this._refreshNowPlayingItem)
    PlayerEventEmitter.on(PV.Events.PLAYER_REMOTE_PAUSE, this._playerStateUpdated)
    PlayerEventEmitter.on(PV.Events.PLAYER_REMOTE_PLAY, this._playerStateUpdated)
    PlayerEventEmitter.on(PV.Events.PLAYER_REMOTE_PREVIOUS, this._refreshNowPlayingItem)
    PlayerEventEmitter.on(PV.Events.PLAYER_REMOTE_STOP, this._playerStateUpdated)
    PlayerEventEmitter.on(PV.Events.PLAYER_RESUME_AFTER_CLIP_HAS_ENDED, this._refreshNowPlayingItem)
    PlayerEventEmitter.on(PV.Events.PLAYER_STATE_CHANGED, this._playerStateUpdated)
  }

  componentWillUnmount() {
    PlayerEventEmitter.removeListener(PV.Events.PLAYER_CANNOT_STREAM_WITHOUT_WIFI)
    PlayerEventEmitter.removeListener(PV.Events.PLAYER_QUEUE_ENDED)
    PlayerEventEmitter.removeListener(PV.Events.PLAYER_REMOTE_DUCK)
    PlayerEventEmitter.removeListener(PV.Events.PLAYER_REMOTE_NEXT)
    PlayerEventEmitter.removeListener(PV.Events.PLAYER_REMOTE_PAUSE)
    PlayerEventEmitter.removeListener(PV.Events.PLAYER_REMOTE_PLAY)
    PlayerEventEmitter.removeListener(PV.Events.PLAYER_REMOTE_PREVIOUS)
    PlayerEventEmitter.removeListener(PV.Events.PLAYER_REMOTE_STOP)
    PlayerEventEmitter.removeListener(PV.Events.PLAYER_RESUME_AFTER_CLIP_HAS_ENDED)
    PlayerEventEmitter.removeListener(PV.Events.PLAYER_STATE_CHANGED)
  }

  _handleQueueEnded = async () => {
    await this._refreshNowPlayingItem()
    refreshDownloadedPodcasts()
  }

  _playerCannotStreamWithoutWifi = async () => {
    await Alert.alert(
      PV.Alerts.PLAYER_CANNOT_STREAM_WITHOUT_WIFI.title, PV.Alerts.PLAYER_CANNOT_STREAM_WITHOUT_WIFI.message, []
    )
  }

  _playerStateUpdated = async () => {
    await updatePlaybackState(this.global)
  }

  _refreshNowPlayingItem = async () => {
    const nowPlayingItem = await getNowPlayingItem()

    if (nowPlayingItem) {
      await setNowPlayingItem(nowPlayingItem, this.global, false, false, null, false)
    } else {
      await clearNowPlayingItem()
    }
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
