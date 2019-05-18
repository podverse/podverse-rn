import AsyncStorage from '@react-native-community/async-storage'
import { Image, Modal, StyleSheet, TouchableOpacity, View as RNView } from 'react-native'
import RNPickerSelect from 'react-native-picker-select'
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
  endTime: number | null
  isPublicItemSelected: any
  progressValue: number
  showHowToModal?: boolean
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
      isPublicItemSelected: placeholderItem,
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

    const hideHowToModal = await AsyncStorage.getItem(PV.Keys.MAKE_CLIP_HOW_TO_HAS_LOADED)
    const isPublic = await AsyncStorage.getItem(PV.Keys.MAKE_CLIP_IS_PUBLIC)

    this.setState({
      ...(!hideHowToModal ? { showHowToModal: true } : { showHowToModal: false }),
      ...(!isEditing ? { startTime: currentPosition } : {}),
      ...(isPublic || isPublic === null ? { isPublicItemSelected: privacyItems[0] }
        : { isPublicItemSelected: privacyItems[1] })
    })
  }

  _onChangeTitle = (text: string) => {
    this.setState({ title: text })
  }

  _handleSelectPrivacy = async (selectedKey: string) => {
    const items = [placeholderItem, ...privacyItems]
    const selectedItem = items.find((x) => x.value === selectedKey)
    this.setState({ isPublicItemSelected: selectedItem })
  }

  _setStartTime = async () => {
    const currentPosition = await PVTrackPlayer.getPosition()
    this.setState({ startTime: currentPosition })
  }

  _setEndTime = async () => {
    const currentPosition = await PVTrackPlayer.getPosition()
    this.setState({ endTime: currentPosition })
  }

  _clearEndTime = () => {
    this.setState({ endTime: null })
  }

  _saveMediaRef = () => {
    console.log('save')
  }

  _updateMediaRef = () => {
    console.log('update')
  }

  _hideHowTo = () => {
    this.setState({ showHowToModal: false })
  }

  _showHowTo = async () => {
    await AsyncStorage.setItem(PV.Keys.MAKE_CLIP_HOW_TO_HAS_LOADED, JSON.stringify(true))
    this.setState({ showHowToModal: true })
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
    const { endTime, isPublicItemSelected, progressValue, showHowToModal, startTime, title } = this.state

    return (
      <SafeAreaView>
        <View style={styles.view}>
          <View style={styles.wrapperTop}>
            <View style={core.row}>
              <Text style={[core.textInputLabel, styles.textInputLabel]}>
                Clip Title
              </Text>
              <RNPickerSelect
                items={privacyItems}
                onValueChange={this._handleSelectPrivacy}
                placeholder={placeholderItem}
                value={isPublicItemSelected.value}>
                <Text style={[styles.isPublicText, globalTheme.text]}>
                  {isPublicItemSelected.label} &#9662;
                </Text>
              </RNPickerSelect>
            </View>
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
            <View style={styles.bottomButtonRow} />
          </View>
        </View>
        {
          showHowToModal &&
            <Modal
              transparent={true}
              visible={showHowToModal}>
              <RNView style={[styles.modalBackdrop, globalTheme.modalBackdrop]}>
                <RNView style={[styles.modalInnerWrapper, globalTheme.modalInnerWrapper]}>
                  <Text style={styles.modalText}>
                    - Tap the Start and End Time boxes to set them with the current playback time.
                  </Text>
                  <Text style={styles.modalText}>
                    - Swipe left and right on the bottom play button bar to adjust time more precisely.
                  </Text>
                  <Text style={styles.modalText}>
                    - If you set the privacy of a clip to "Only with link",
                    then only people with a link to that clip will be able to play it.
                  </Text>
                  <Text style={styles.modalText}>
                    - If the podcast uses dynamically inserted ads, the clip start/end times may be inaccurate.
                  </Text>
                  <Text style={styles.modalText}>
                    - For more info, visit podverse.fm/faq
                  </Text>
                  <TouchableOpacity
                    onPress={this._hideHowTo}>
                    <Text style={styles.modalButton}>Close</Text>
                  </TouchableOpacity>
                </RNView>
              </RNView>
            </Modal>
        }
      </SafeAreaView>
    )
  }
}

const _publicKey = 'public'
const _onlyWithLinkKey = 'onlyWithLink'

const placeholderItem = {
  label: 'Select...',
  value: null
}

const privacyItems = [
  {
    label: 'Public',
    value: _publicKey
  },
  {
    label: 'Only with link',
    value: _onlyWithLinkKey
  }
]

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
  isPublicText: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  },
  makeClipPlayerControls: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 60,
    justifyContent: 'space-between',
    marginHorizontal: 8
  },
  modalBackdrop: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  modalButton: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    marginTop: 16,
    textAlign: 'center'
  },
  modalInnerWrapper: {
    marginHorizontal: 24,
    padding: 24
  },
  modalText: {
    fontSize: PV.Fonts.sizes.xl,
    marginBottom: 16
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
  textInputLabel: {
    flex: 1
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
