import debounce from 'lodash/debounce'
import { Alert, StyleSheet, View } from 'react-native'
import React from 'reactn'
import { refreshDownloadedPodcasts } from '../lib/downloadedPodcast'
import { PV } from '../resources'
import PVEventEmitter from '../services/eventEmitter'
import { getNowPlayingItemLocally } from '../services/userNowPlayingItem'
import { updatePlaybackState, updatePlayerState } from '../state/actions/player'
import { getQueueItems } from '../state/actions/queue'

type Props = any

export class PlayerEvents extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props)

    this._playerCannotStreamWithoutWifi = debounce(this._playerCannotStreamWithoutWifi, 3000) as any
  }

  componentDidMount() {
    PVEventEmitter.on(PV.Events.PLAYER_CANNOT_STREAM_WITHOUT_WIFI, this._playerCannotStreamWithoutWifi)
    PVEventEmitter.on(PV.Events.PLAYER_RESUME_AFTER_CLIP_HAS_ENDED, this._refreshNowPlayingItem)
    PVEventEmitter.on(PV.Events.PLAYER_STATE_CHANGED, this._playerStateUpdated)
    PVEventEmitter.on(PV.Events.PLAYER_TRACK_CHANGED, this._refreshNowPlayingItem)
    PVEventEmitter.on(PV.Events.PLAYER_PLAYBACK_ERROR, this._handlePlayerPlaybackError)
  }

  componentWillUnmount() {
    PVEventEmitter.removeListener(PV.Events.PLAYER_CANNOT_STREAM_WITHOUT_WIFI)
    PVEventEmitter.removeListener(PV.Events.PLAYER_RESUME_AFTER_CLIP_HAS_ENDED)
    PVEventEmitter.removeListener(PV.Events.PLAYER_STATE_CHANGED)
    PVEventEmitter.removeListener(PV.Events.PLAYER_TRACK_CHANGED)
    PVEventEmitter.removeListener(PV.Events.PLAYER_PLAYBACK_ERROR)
  }

  _playerCannotStreamWithoutWifi = () => {
    Alert.alert(
      PV.Alerts.PLAYER_CANNOT_STREAM_WITHOUT_WIFI.title,
      PV.Alerts.PLAYER_CANNOT_STREAM_WITHOUT_WIFI.message,
      PV.Alerts.BUTTONS.OK
    )
  }

  _handlePlayerPlaybackError = () => {
    updatePlaybackState(PV.Player.errorState)
  }

  _playerStateUpdated = () => {
    updatePlaybackState()
  }

  _refreshNowPlayingItem = () => {
    (async () => {
      refreshDownloadedPodcasts()

      const nowPlayingItem = await getNowPlayingItemLocally()
      if (nowPlayingItem) {
        await updatePlayerState(nowPlayingItem)
      }
   
      await updatePlaybackState()
      await getQueueItems()
    })()
  }

  render() {
    return <View style={styles.view} />
  }
}

const styles = StyleSheet.create({
  view: {
    height: 0,
    width: 0
  }
})
