import { Image, StyleSheet, TouchableOpacity, View as RNView } from 'react-native'
import React from 'reactn'
import { ActivityIndicator, Icon, PlayerProgressBar, SafeAreaView, Text, TextInput, TimeInput, View
  } from '../components'
import { PV } from '../resources'
import { playerJumpBackward, playerJumpForward, PVTrackPlayer } from '../services/player'
import { togglePlay } from '../state/actions/player'
import { core, navHeader, playerStyles } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  endTime?: number
  progressValue: number
  startTime?: number
  title?: string
}

export class MakeClipScreen extends React.Component<Props, State> {

  static navigationOptions = ({ navigation }) => ({
    title: 'Make Clip',
    headerRight: (
      <RNView style={styles.navHeaderButtonWrapper}>
        {
          navigation.getParam('isEditing') ?
            <TouchableOpacity onPress={navigation.getParam('_updateMediaRef')}>
              <Text style={[navHeader.buttonText, styles.navHeaderTextButton]}>Update</Text>
            </TouchableOpacity> :
            <TouchableOpacity onPress={navigation.getParam('_saveMediaRef')}>
              <Text style={[navHeader.buttonText, styles.navHeaderTextButton]}>Save</Text>
            </TouchableOpacity>
        }
      </RNView>
    )
  })

  constructor (props: Props) {
    super(props)
    const { nowPlayingItem } = this.global.player
    const isEditing = this.props.navigation.getParam('isEditing')
    const initialProgressValue = this.props.navigation.getParam('initialProgressValue')

    this.state = {
      endTime: isEditing ? nowPlayingItem.clipEndTime : null,
      progressValue: initialProgressValue || 0,
      startTime: isEditing ? nowPlayingItem.clipStartTime : null,
      title: isEditing ? nowPlayingItem.clipTitle : ''
    }
  }

  async componentDidMount() {
    const { navigation } = this.props
    navigation.setParams({ _updateMediaRef: this._updateMediaRef })
    navigation.setParams({ _saveMediaRef: this._saveMediaRef })
    const currentPosition = await PVTrackPlayer.getPosition()
    const isEditing = this.props.navigation.getParam('isEditing')

    if (!isEditing) {
      this.setState({
        startTime: currentPosition
      })
    }
  }

  _onChangeTitle = (text: string) => {
    this.setState({ title: text })
  }

  _setStartTime = () => {
    console.log('set start time')
  }

  _setEndTime = () => {
    console.log('set end time')
  }

  _clearEndTime = () => {
    console.log('clear end time')
  }

  _saveMediaRef = () => {
    console.log('save')
  }

  _updateMediaRef = () => {
    console.log('update')
  }

  _showHowTo = () => {
    console.log('show how to')
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
    const { globalTheme, player } = this.global
    const { nowPlayingItem, playbackState } = player
    const { endTime, progressValue, startTime, title } = this.state

    return (
      <SafeAreaView>
        <View style={styles.view}>
          <View style={styles.wrapperTop}>
            <Text style={core.textInputLabel}>
              Clip Title
            </Text>
            <TextInput
              autoCapitalize='none'
              onChangeText={this._onChangeTitle}
              placeholder='optional'
              style={[core.textInput, globalTheme.textInput]}
              underlineColorAndroid='transparent'
              value={title} />
          </View>
          <View style={styles.wrapperMiddle}>
            <Image
              resizeMode='contain'
              source={{ uri: nowPlayingItem.podcastImageUrl }}
              style={styles.image} />
          </View>
          <View style={styles.wrapperBottom}>
            <View style={core.row}>
              <TimeInput
                handleSetTime={this._setStartTime}
                labelText='Start Time'
                placeholder='tap here'
                time={startTime}
                wrapperStyle={styles.timeInput} />
              <TimeInput
                handleClearTime={endTime ? this._clearEndTime : null}
                handleSetTime={this._setEndTime}
                labelText='End Time'
                placeholder='optional'
                time={endTime}
                wrapperStyle={styles.timeInput} />
            </View>
            <View style={styles.progressWrapper}>
              <PlayerProgressBar value={progressValue} />
            </View>
            <RNView style={[styles.makeClipPlayerControls, globalTheme.makeClipPlayerControlsWrapper]}>
              <TouchableOpacity
                onPress={this._playerJumpBackward}
                style={playerStyles.icon}>
                <Icon
                  name='undo-alt'
                  size={32} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => togglePlay(this.global)}
                style={[playerStyles.iconLarge, styles.playButton]}>
                {
                  playbackState !== PVTrackPlayer.STATE_BUFFERING &&
                    <Icon
                      name={playbackState === PVTrackPlayer.STATE_PLAYING ? 'pause-circle' : 'play-circle'}
                      size={48} />
                }
                {
                  playbackState === PVTrackPlayer.STATE_BUFFERING &&
                    <ActivityIndicator />
                }
              </TouchableOpacity>
              <TouchableOpacity
                onPress={this._playerJumpForward}
                style={playerStyles.icon}>
                <Icon
                  name='redo-alt'
                  size={32} />
              </TouchableOpacity>
            </RNView>
            <View style={styles.bottomButtonRow}>
              <TouchableOpacity onPress={this._showHowTo}>
                <Text style={styles.bottomButton}>How To</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  bottomButton: {
    fontSize: PV.Fonts.sizes.md,
    paddingVertical: 4,
    textAlign: 'center',
    width: 60
  },
  bottomButtonRow: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center'
  },
  endTime: {
    flex: 1,
    marginLeft: 8
  },
  image: {
    flex: 1
  },
  makeClipPlayerControls: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 60,
    justifyContent: 'space-between',
    marginHorizontal: 8
  },
  navHeaderButtonWrapper: {
    flexDirection: 'row'
  },
  navHeaderTextButton: {
    marginLeft: 2,
    textAlign: 'right',
    width: 60
  },
  playButton: {
    marginHorizontal: 'auto'
  },
  progressWrapper: {
    marginVertical: 8
  },
  timeInput: {
    flex: 1,
    marginHorizontal: 8
  },
  timeInputTouchable: {
    flex: 1
  },
  timeInputTouchableDelete: {
    flex: 0,
    width: 44
  },
  view: {
    flex: 1
  },
  wrapperBottom: {
    flex: 0
  },
  wrapperMiddle: {
    flex: 1,
    marginBottom: 24,
    marginHorizontal: 8,
    marginTop: 16
  },
  wrapperTop: {
    flex: 0,
    marginHorizontal: 8,
    marginTop: 16
  }
})
