import {
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import React from 'reactn'
import { checkIfIdMatchesClipIdOrEpisodeId } from '../lib/utility'
import { PV } from '../resources'
import {
  checkIfPlayingFromHistory,
  getHistoryItemsLocally
} from '../services/history'
import {
  getNowPlayingItem,
  loadItemAndPlayTrack,
  playerJumpBackward,
  playerJumpForward,
  PVTrackPlayer
} from '../services/player'
import {
  loadAdjacentItemFromHistory,
  playNextFromQueue,
  setPlaybackSpeed,
  togglePlay
} from '../state/actions/player'
import { darkTheme, iconStyles, playerStyles } from '../styles'
import { Icon, PlayerProgressBar, Text } from './'

type Props = {
  navigation: any
}

type State = {
  progressValue: number
}

export class PlayerControls extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      progressValue: 0
    }
  }

  _adjustSpeed = async () => {
    const { playbackRate } = this.global.player
    const speeds = await PV.Player.speeds()
    const index = speeds.indexOf(playbackRate)

    let newSpeed
    if (speeds.length - 1 === index) {
      newSpeed = speeds[0]
    } else {
      newSpeed = speeds[index + 1]
    }

    await setPlaybackSpeed(newSpeed, this.global)
  }

  _playerJumpBackward = async () => {
    const progressValue = await playerJumpBackward(PV.Player.jumpSeconds)
    this.setState({ progressValue })
  }

  _playerJumpForward = async () => {
    const progressValue = await playerJumpForward(PV.Player.jumpSeconds)
    this.setState({ progressValue })
  }

  render() {
    const { progressValue } = this.state
    const { globalTheme, player, screenPlayer } = this.global
    const { nowPlayingItem, playbackRate, playbackState } = player
    const { isLoading } = screenPlayer
    const hasErrored = playbackState === PV.Player.errorState

    return (
      <View style={[styles.wrapper, globalTheme.player]}>
        <View style={styles.progressWrapper}>
          <PlayerProgressBar
            {...(nowPlayingItem && nowPlayingItem.clipEndTime
              ? { clipEndTime: nowPlayingItem.clipEndTime }
              : {})}
            {...(nowPlayingItem && nowPlayingItem.clipStartTime
              ? { clipStartTime: nowPlayingItem.clipStartTime }
              : {})}
            globalTheme={globalTheme}
            isLoading={isLoading}
            value={progressValue}
          />
        </View>
        <View style={styles.middleRow}>
          <TouchableOpacity
            onPress={async () => {
              const playbackState = await PVTrackPlayer.getState()
              const shouldStartPlayback =
                playbackState === PVTrackPlayer.STATE_PLAYING
              const isPlayingFromHistory = await checkIfPlayingFromHistory()
              if (isPlayingFromHistory) {
                loadAdjacentItemFromHistory(shouldStartPlayback)
              } else {
                const historyItems = await getHistoryItemsLocally()
                const mostRecentHistoryItem = historyItems[0]
                const nowPlayingItem = await getNowPlayingItem()
                const id = nowPlayingItem.clipId || nowPlayingItem.episodeId
                if (historyItems[0]) {
                  if (
                    checkIfIdMatchesClipIdOrEpisodeId(
                      id,
                      mostRecentHistoryItem.clipId,
                      mostRecentHistoryItem.episodeId
                    )
                  ) {
                    loadAdjacentItemFromHistory(shouldStartPlayback)
                  } else {
                    const skipUpdateHistory = true
                    loadItemAndPlayTrack(
                      historyItems[0],
                      shouldStartPlayback,
                      skipUpdateHistory
                    )
                  }
                }
              }
            }}
            style={playerStyles.icon}>
            <Icon name='step-backward' size={32} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this._playerJumpBackward}
            style={playerStyles.icon}>
            <Icon name='undo-alt' size={32} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => togglePlay(this.global)}
            style={playerStyles.iconLarge}>
            {hasErrored && (
              <Icon
                color={
                  globalTheme === darkTheme
                    ? iconStyles.lightRed.color
                    : iconStyles.darkRed.color
                }
                name={'exclamation-triangle'}
                size={34}
              />
            )}
            {!hasErrored && (
              <Icon
                name={
                  playbackState === PVTrackPlayer.STATE_PLAYING
                    ? 'pause-circle'
                    : 'play-circle'
                }
                size={48}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this._playerJumpForward}
            style={playerStyles.icon}>
            <Icon name='redo-alt' size={32} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              const playbackState = await PVTrackPlayer.getState()
              const shouldStartPlayback =
                playbackState === PVTrackPlayer.STATE_PLAYING
              const isPlayingFromHistory = await checkIfPlayingFromHistory()
              if (isPlayingFromHistory) {
                const playNext = true
                loadAdjacentItemFromHistory(shouldStartPlayback, playNext)
              } else {
                playNextFromQueue()
              }
            }}
            style={playerStyles.icon}>
            <Icon name='step-forward' size={32} />
          </TouchableOpacity>
        </View>
        <View style={styles.bottomRow}>
          <TouchableWithoutFeedback onPress={this._adjustSpeed}>
            <Text
              style={[
                styles.bottomButton,
                styles.bottomRowText
              ]}>{`${playbackRate}X`}</Text>
          </TouchableWithoutFeedback>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  bottomButton: {
    paddingVertical: 4,
    textAlign: 'center',
    width: 54
  },
  bottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    height: PV.Player.styles.bottomRow.height,
    justifyContent: 'space-around'
  },
  bottomRowText: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  },
  middleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 60,
    justifyContent: 'space-around'
  },
  progressWrapper: {
    marginBottom: 8
  },
  speed: {
    alignItems: 'center',
    paddingVertical: 4,
    width: 54
  },
  topRow: {
    height: 52,
    paddingTop: 5
  },
  wrapper: {
    borderTopWidth: 1
  }
})
