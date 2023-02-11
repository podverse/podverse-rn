import debounce from 'lodash/debounce'
import { Alert, StyleSheet, View } from 'react-native'
import { State } from 'react-native-track-player'
import React from 'reactn'
import { clearTempMediaRef } from '../state/actions/mediaRef'
import { refreshDownloadedPodcasts } from '../lib/downloadedPodcast'
import { PV } from '../resources'
import PVEventEmitter from '../services/eventEmitter'
import { playerGetState } from '../services/player'
import { getNowPlayingItemLocally } from '../services/userNowPlayingItem'
import { playerUpdatePlaybackState, playerUpdatePlayerState } from '../state/actions/player'
import { getQueueItems } from '../state/actions/queue'
import { updateHistoryItemsIndex } from '../state/actions/userHistoryItem'

type Props = any

export class PlayerEvents extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props)

    this._playerCannotStreamWithoutWifi = debounce(this._playerCannotStreamWithoutWifi, 3000, {
      leading: true,
      trailing: false
    }) as any
    this._playerCannotDownloadWithoutWifi = debounce(this._playerCannotDownloadWithoutWifi, 3000, {
      leading: true,
      trailing: false
    }) as any
  }

  componentDidMount() {
    PVEventEmitter.on(PV.Events.PLAYER_CANNOT_STREAM_WITHOUT_WIFI, this._playerCannotStreamWithoutWifi)
    PVEventEmitter.on(PV.Events.PLAYER_CANNOT_DOWNLOAD_WITHOUT_WIFI, this._playerCannotDownloadWithoutWifi)
    PVEventEmitter.on(PV.Events.PLAYER_HISTORY_INDEX_SHOULD_UPDATE, this._historyItemsShouldUpdate)
    PVEventEmitter.on(PV.Events.PLAYER_PLAYBACK_ERROR, this._handlePlayerPlaybackError)
    PVEventEmitter.on(PV.Events.PLAYER_RESUME_AFTER_CLIP_HAS_ENDED, this._refreshNowPlayingItem)
    PVEventEmitter.on(PV.Events.PLAYER_STATE_BUFFERING, this._playerStateBuffering)
    PVEventEmitter.on(PV.Events.PLAYER_STATE_CHANGED, this._playerStateUpdated)
    PVEventEmitter.on(PV.Events.PLAYER_TRACK_CHANGED, this._refreshNowPlayingItem)
  }

  componentWillUnmount() {
    PVEventEmitter.removeListener(PV.Events.PLAYER_CANNOT_STREAM_WITHOUT_WIFI, this._playerCannotStreamWithoutWifi)
    PVEventEmitter.removeListener(PV.Events.PLAYER_CANNOT_DOWNLOAD_WITHOUT_WIFI, this._playerCannotDownloadWithoutWifi)
    PVEventEmitter.removeListener(PV.Events.PLAYER_HISTORY_INDEX_SHOULD_UPDATE, this._historyItemsShouldUpdate)
    PVEventEmitter.removeListener(PV.Events.PLAYER_PLAYBACK_ERROR, this._handlePlayerPlaybackError)
    PVEventEmitter.removeListener(PV.Events.PLAYER_RESUME_AFTER_CLIP_HAS_ENDED, this._refreshNowPlayingItem)
    PVEventEmitter.removeListener(PV.Events.PLAYER_STATE_BUFFERING, this._playerStateBuffering)
    PVEventEmitter.removeListener(PV.Events.PLAYER_STATE_CHANGED, this._playerStateUpdated)
    PVEventEmitter.removeListener(PV.Events.PLAYER_TRACK_CHANGED, this._refreshNowPlayingItem)
  }

  _playerCannotStreamWithoutWifi = () => {
    Alert.alert(
      PV.Alerts.PLAYER_CANNOT_STREAM_WITHOUT_WIFI.title,
      PV.Alerts.PLAYER_CANNOT_STREAM_WITHOUT_WIFI.message,
      PV.Alerts.BUTTONS.OK
    )
  }

  _playerCannotDownloadWithoutWifi = () => {
    Alert.alert(
      PV.Alerts.PLAYER_CANNOT_DOWNLOAD_WITHOUT_WIFI.title,
      PV.Alerts.PLAYER_CANNOT_DOWNLOAD_WITHOUT_WIFI.message,
      PV.Alerts.BUTTONS.OK
    )
  }

  _handlePlayerPlaybackError = () => {
    playerUpdatePlaybackState(PV.Player.errorState)
  }

  _playerStateBuffering = () => {
    playerUpdatePlaybackState(State.Playing)
    setTimeout(() => {
      (async () => {
        const currentState = await playerGetState()
        if (currentState === State.Buffering) {
          playerUpdatePlaybackState()
        }
      })()
    }, 1000)
  }

  _playerStateUpdated = () => {
    playerUpdatePlaybackState()
  }

  _refreshNowPlayingItem = () => {
    (async () => {
      clearTempMediaRef()
      refreshDownloadedPodcasts()

      const nowPlayingItem = await getNowPlayingItemLocally()
      if (nowPlayingItem) {
        playerUpdatePlayerState(nowPlayingItem)
      }

      await playerUpdatePlaybackState()
      getQueueItems()
    })()
  }

  _historyItemsShouldUpdate = () => {
    (async () => {
      await updateHistoryItemsIndex()
      PVEventEmitter.emit(PV.Events.PLAYER_HISTORY_INDEX_DID_UPDATE)
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
