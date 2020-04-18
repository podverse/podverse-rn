import AsyncStorage from '@react-native-community/async-storage'
import { Alert, Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View as RNView } from 'react-native'
import RNPickerSelect from 'react-native-picker-select'
import Share from 'react-native-share'
import React from 'reactn'
import {
  ActivityIndicator,
  Divider,
  FastImage,
  Icon,
  NavHeaderButtonText,
  PlayerProgressBar,
  SafeAreaView,
  Text,
  TextInput,
  TimeInput,
  View
} from '../components'
import { alertIfNoNetworkConnection } from '../lib/network'
import { PV } from '../resources'
import { gaTrackPageView } from '../services/googleAnalytics'
import { createMediaRef, updateMediaRef } from '../services/mediaRef'
import {
  playerJumpBackward,
  playerJumpForward,
  playerPreviewEndTime,
  playerPreviewStartTime,
  PVTrackPlayer
} from '../services/player'
import { setNowPlayingItem, setPlaybackSpeed, togglePlay } from '../state/actions/player'
import { core, darkTheme, hidePickerIconOnAndroidTransparent, playerStyles } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  endTime: number | null
  isPublicItemSelected: any
  isSaving: boolean
  mediaRefId?: string
  progressValue: number | null
  showHowToModal?: boolean
  startTime?: number
  title?: string
}

export class MakeClipScreen extends React.Component<Props, State> {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('isEditing') ? 'Edit Clip' : 'Make Clip',
    headerRight: (
      <RNView style={styles.navHeaderButtonWrapper}>
        <NavHeaderButtonText handlePress={navigation.getParam('_saveMediaRef')} text='Save' />
      </RNView>
    )
  })

  constructor(props: Props) {
    super(props)
    const { nowPlayingItem = {} } = this.global.player
    const isEditing = this.props.navigation.getParam('isEditing')
    const initialPrivacy = this.props.navigation.getParam('initialPrivacy')
    const initialProgressValue = this.props.navigation.getParam('initialProgressValue')

    const pItems = privacyItems()
    this.state = {
      endTime: isEditing ? nowPlayingItem.clipEndTime : null,
      ...(initialPrivacy ? { isPublicItemSelected: pItems[0] } : { isPublicItemSelected: pItems[1] }),
      isSaving: false,
      ...(isEditing ? { mediaRefId: nowPlayingItem.clipId } : {}),
      progressValue: initialProgressValue || 0,
      startTime: isEditing ? nowPlayingItem.clipStartTime : null
    }
  }

  async componentDidMount() {
    const { navigation } = this.props
    const { player } = this.global
    const { nowPlayingItem } = player
    navigation.setParams({ _saveMediaRef: this._saveMediaRef })
    const currentPosition = await PVTrackPlayer.getPosition()
    const isEditing = this.props.navigation.getParam('isEditing')

    // Prevent the temporary progressValue from sticking in the progress bar
    setTimeout(() => this.setState({ progressValue: null }), 250)

    const hideHowToModal = await AsyncStorage.getItem(PV.Keys.MAKE_CLIP_HOW_TO_HAS_LOADED)

    if (!hideHowToModal) {
      await AsyncStorage.setItem(PV.Keys.MAKE_CLIP_HOW_TO_HAS_LOADED, JSON.stringify(true))
    }

    this.setGlobal(
      {
        player: {
          ...this.global.player,
          showMakeClip: true
        }
      },
      () => {
        this.setState({
          ...(!hideHowToModal ? { showHowToModal: true } : { showHowToModal: false }),
          ...(!isEditing ? { startTime: Math.floor(currentPosition) } : {}),
          title: isEditing ? nowPlayingItem.clipTitle : ''
        })
      }
    )

    gaTrackPageView('/make-clip', 'Make Clip Screen')
  }

  componentWillUnmount() {
    this.setGlobal({
      player: {
        ...this.global.player,
        showMakeClip: false
      }
    })
  }

  _onChangeTitle = (text: string) => {
    this.setState({ title: text })
  }

  _handleSelectPrivacy = async (selectedKey: string) => {
    const items = [placeholderItem, ...privacyItems()]
    const selectedItem = items.find((x) => x.value === selectedKey)
    if (selectedItem) {
      AsyncStorage.setItem(PV.Keys.MAKE_CLIP_IS_PUBLIC, JSON.stringify(selectedItem.value === _publicKey))
    }
    this.setState({ isPublicItemSelected: selectedItem })
  }

  _setStartTime = async () => {
    const currentPosition = await PVTrackPlayer.getPosition()
    this.setState({ startTime: Math.floor(currentPosition) })
  }

  _setEndTime = async () => {
    const currentPosition = await PVTrackPlayer.getPosition()
    if (currentPosition && currentPosition > 0) {
      this.setState({ endTime: Math.floor(currentPosition) })
    }
  }

  _adjustSpeed = async () => {
    const { playbackRate } = this.global.player
    const speeds = await PV.Player.speeds()
    const index = speeds.indexOf(playbackRate)

    let newSpeed
    if (speeds.length - 1 === index) {
      newSpeed = speeds[1]
    } else {
      newSpeed = speeds[index + 1]
    }

    await setPlaybackSpeed(newSpeed, this.global)
  }

  _clearEndTime = () => {
    this.setState({ endTime: null })
  }

  _saveMediaRef = async () => {
    const { navigation } = this.props
    const { endTime, isPublicItemSelected, mediaRefId, startTime, title } = this.state
    const { player, session } = this.global
    const { nowPlayingItem } = player
    const { isLoggedIn } = session

    if (!isLoggedIn) {
      Alert.alert('Login Needed', 'You need to login to make clips.', [
        { text: 'OK' },
        {
          text: 'Go to Login',
          onPress: () => {
            navigation.goBack(null)
            setTimeout(() => {
              navigation.navigate(PV.RouteNames.AuthScreen)
            }, 1000)
          }
        }
      ])
      return
    }

    const wasAlerted = await alertIfNoNetworkConnection('save a clip')
    if (wasAlerted) return

    if (endTime === 0) {
      Alert.alert('Clip Error', 'End time cannot be equal to 0.', PV.Alerts.BUTTONS.OK)
      return
    }

    if (startTime === 0 && !endTime) {
      Alert.alert(
        'Clip Error',
        'The start time must be greater than 0 if no end time is provided.',
        PV.Alerts.BUTTONS.OK
      )
      return
    }

    if (!startTime && startTime !== 0) {
      Alert.alert('Clip Error', 'A start time must be provided.', PV.Alerts.BUTTONS.OK)
      return
    }

    if (endTime && startTime >= endTime) {
      Alert.alert('Clip Error', 'The start time must be before the end time.', PV.Alerts.BUTTONS.OK)
      return
    }

    const isEditing = this.props.navigation.getParam('isEditing')

    this.setState({ isSaving: true }, async () => {
      const data = {
        ...(endTime ? { endTime } : {}),
        episodeId: nowPlayingItem.episodeId,
        ...(isEditing ? { id: mediaRefId } : {}),
        ...(isPublicItemSelected.value === _publicKey ? { isPublic: true } : { isPublic: false }),
        startTime,
        title
      }

      try {
        const mediaRef = isEditing ? await updateMediaRef(data) : await createMediaRef(data)
        const url = PV.URLs.clip + mediaRef.id

        if (isEditing) {
          const newItem = {
            ...nowPlayingItem,
            clipEndTime: mediaRef.endTime,
            clipStartTime: mediaRef.startTime,
            clipTitle: mediaRef.title
          }
          await setNowPlayingItem(newItem)
        }

        this.setState({ isSaving: false }, async () => {
          // NOTE: setTimeout to prevent an error when Modal and Alert modal try to render at the same time
          setTimeout(() => {
            const alertText = isEditing ? 'Clip Updated' : 'Clip Created'
            Alert.alert(alertText, url, [
              {
                text: 'Done',
                onPress: () => {
                  navigation.goBack(null)
                }
              },
              {
                text: 'Share',
                onPress: async () => {
                  const { nowPlayingItem = {} } = this.global.player
                  const title = `${data.title || 'untitled clip'} – ${nowPlayingItem.podcastTitle} – ${
                    nowPlayingItem.episodeTitle
                  } – clip created using Podverse`
                  try {
                    await Share.open({
                      title,
                      subject: title,
                      url
                    })
                  } catch (error) {
                    console.log(error)
                  }
                  navigation.goBack(null)
                }
              }
            ])
          }, 100)
        })
      } catch (error) {
        if (error.response) {
          Alert.alert(PV.Alerts.SOMETHING_WENT_WRONG.title, error.response.data.message, PV.Alerts.BUTTONS.OK)
        }
        console.log(error)
      }
      this.setState({ isSaving: false })
    })
  }

  _hideHowTo = () => {
    this.setState({ showHowToModal: false })
  }

  _playerJumpBackward = async () => {
    const progressValue = await playerJumpBackward(PV.Player.jumpSeconds)
    this.setState({ progressValue })
    setTimeout(() => this.setState({ progressValue: null }), 250)
  }

  _playerJumpForward = async () => {
    const progressValue = await playerJumpForward(PV.Player.jumpSeconds)
    this.setState({ progressValue })
    setTimeout(() => this.setState({ progressValue: null }), 250)
  }

  _playerMiniJumpBackward = async () => {
    const progressValue = await playerJumpBackward(PV.Player.miniJumpSeconds)
    this.setState({ progressValue })
    setTimeout(() => this.setState({ progressValue: null }), 250)
  }

  _playerMiniJumpForward = async () => {
    const progressValue = await playerJumpForward(PV.Player.miniJumpSeconds)
    this.setState({ progressValue })
    setTimeout(() => this.setState({ progressValue: null }), 250)
  }

  _showClipPrivacyNote = async () => {
    Alert.alert(
      'Clip Settings',
      "Only with Link means only people who have your clip's" +
        ' link can play it. These clips will not show up automatically in the Public list on Podverse.' +
        ' A premium account is required to create Public clips.',
      [
        {
          text: 'Premium Info',
          onPress: () => this.props.navigation.navigate(PV.RouteNames.MembershipScreen)
        },
        { text: 'Ok' }
      ]
    )
  }

  render() {
    const { navigation } = this.props
    const { globalTheme, player, session } = this.global
    const isDarkMode = globalTheme === darkTheme
    const { nowPlayingItem, playbackRate, playbackState } = player
    const { isLoggedIn, userInfo } = session
    const { endTime, isPublicItemSelected, isSaving, progressValue, showHowToModal, startTime, title } = this.state

    return (
      <SafeAreaView>
        <View style={styles.view}>
          <View style={styles.wrapperTop}>
            {!isLoggedIn && (
              <RNView>
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.md}
                  numberOfLines={1}
                  style={[core.textInputLabel, styles.loginMessage]}>
                  You must be logged in to make clips.
                </Text>
                <Divider style={styles.divider} />
              </RNView>
            )}
            <View style={[core.row, styles.row]}>
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.md}
                numberOfLines={1}
                style={[core.textInputLabel, styles.textInputLabel]}>
                Clip Title
              </Text>
              <RNPickerSelect
                items={privacyItems()}
                onValueChange={this._handleSelectPrivacy}
                placeholder={placeholderItem}
                style={hidePickerIconOnAndroidTransparent(isDarkMode)}
                useNativeAndroidPickerStyle={false}
                value={isPublicItemSelected.value}>
                <View style={core.selectorWrapper}>
                  <Text
                    fontSizeLargestScale={PV.Fonts.largeSizes.md}
                    numberOfLines={1}
                    style={[styles.isPublicText, globalTheme.text]}>
                    {isPublicItemSelected.label}
                  </Text>
                  <Icon name='angle-down' size={14} style={[styles.isPublicTextIcon, globalTheme.text]} />
                </View>
              </RNPickerSelect>
            </View>
            <TextInput
              autoCapitalize='none'
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              onChangeText={this._onChangeTitle}
              numberOfLines={3}
              placeholder='optional'
              returnKeyType='done'
              style={[styles.textInput, globalTheme.textInput]}
              underlineColorAndroid='transparent'
              value={title}
            />
          </View>
          <View style={styles.wrapperMiddle}>
            <FastImage
              resizeMode='contain'
              source={nowPlayingItem && nowPlayingItem.podcastImageUrl}
              styles={styles.image}
            />
          </View>
          <View style={styles.wrapperBottom}>
            <View style={core.row}>
              <TimeInput
                handlePreview={() => {
                  if (startTime) {
                    playerPreviewStartTime(startTime, endTime)
                  }
                }}
                handleSetTime={this._setStartTime}
                labelText='Start Time'
                placeholder='--:--'
                time={startTime}
                wrapperStyle={styles.timeInput}
              />
              <TimeInput
                handleClearTime={endTime ? this._clearEndTime : null}
                handlePreview={() => {
                  if (endTime) {
                    playerPreviewEndTime(endTime)
                  }
                }}
                handleSetTime={this._setEndTime}
                labelText='End Time'
                placeholder='optional'
                time={endTime}
                wrapperStyle={styles.timeInput}
              />
            </View>
            <View style={styles.progressWrapper}>
              <PlayerProgressBar
                clipEndTime={endTime}
                clipStartTime={startTime}
                globalTheme={globalTheme}
                {...(progressValue || progressValue === 0 ? { value: progressValue } : {})}
              />
            </View>
            <RNView style={[styles.makeClipPlayerControls, globalTheme.makeClipPlayerControlsWrapper]}>
              <TouchableOpacity onPress={this._playerJumpBackward} style={playerStyles.icon}>
                <Icon name='undo-alt' size={32} />
              </TouchableOpacity>
              <TouchableOpacity onPress={this._playerMiniJumpBackward} style={playerStyles.icon}>
                <Icon name='angle-left' size={24} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => togglePlay()} style={[playerStyles.iconLarge, styles.playButton]}>
                {playbackState !== PVTrackPlayer.STATE_BUFFERING && (
                  <Icon
                    name={playbackState === PVTrackPlayer.STATE_PLAYING ? 'pause-circle' : 'play-circle'}
                    size={48}
                  />
                )}
                {playbackState === PVTrackPlayer.STATE_BUFFERING && (
                  <ActivityIndicator styles={styles.activityIndicator} />
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={this._playerMiniJumpForward} style={playerStyles.icon}>
                <Icon name='angle-right' size={24} />
              </TouchableOpacity>
              <TouchableOpacity onPress={this._playerJumpForward} style={playerStyles.icon}>
                <Icon name='redo-alt' size={32} />
              </TouchableOpacity>
            </RNView>
            <View style={styles.bottomRow}>
              <TouchableOpacity
                hitSlop={{
                  bottom: 4,
                  left: 4,
                  right: 4,
                  top: 4
                }}
                onPress={() => navigation.navigate(PV.RouteNames.FAQScreen)}>
                <View>
                  <Text
                    fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                    style={[styles.bottomRowTextMini, globalTheme.link]}>
                    Clips FAQ
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableWithoutFeedback
                hitSlop={{
                  bottom: 4,
                  left: 4,
                  right: 4,
                  top: 4
                }}
                onPress={this._adjustSpeed}>
                <View>
                  <Text
                    fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                    style={[styles.bottomButton, styles.bottomRowText]}>
                    {`${playbackRate}X`}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
              <TouchableOpacity
                hitSlop={{
                  bottom: 4,
                  left: 4,
                  right: 4,
                  top: 4
                }}
                onPress={() =>
                  navigation.navigate(PV.RouteNames.ProfileScreen, {
                    user: userInfo,
                    navigationTitle: 'My Profile',
                    isMyProfile: true,
                    initializeClips: true
                  })
                }>
                <View>
                  <Text
                    fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                    style={[styles.bottomRowTextMini, globalTheme.link]}>
                    My Clips
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {isSaving && (
          <Modal transparent={true} visible={true}>
            <RNView style={[styles.modalBackdrop, globalTheme.modalBackdrop]}>
              <ActivityIndicator styles={styles.activityIndicator} />
            </RNView>
          </Modal>
        )}
        {showHowToModal && (
          <Modal transparent={true} visible={true}>
            <RNView style={[styles.modalBackdrop, globalTheme.modalBackdrop]}>
              <RNView style={[styles.modalInnerWrapper, globalTheme.modalInnerWrapper]}>
                <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.modalText}>
                  ▸ Tap the Start and End Time inputs to set them with the current track time.
                </Text>
                <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.modalText}>
                  ▸ If a podcast uses dynamically inserted ads, its clip start times will not stay 100% accurate.
                </Text>
                <TouchableOpacity onPress={this._hideHowTo}>
                  <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} numberOfLines={1} style={styles.modalButton}>
                    Close
                  </Text>
                </TouchableOpacity>
              </RNView>
            </RNView>
          </Modal>
        )}
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

const privacyItems = () => {
  const items = [
    {
      label: 'Public',
      value: _publicKey
    },
    {
      label: 'Only with link',
      value: _onlyWithLinkKey
    }
  ]

  return items
}

const styles = StyleSheet.create({
  activityIndicator: {
    backgroundColor: 'transparent'
  },
  bottomButton: {
    paddingVertical: 4,
    textAlign: 'center',
    width: 60
  },
  bottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    height: PV.Player.styles.bottomRow.height,
    justifyContent: 'space-around'
  },
  bottomRowTextMini: {
    fontSize: PV.Fonts.sizes.sm
  },
  bottomRowText: {
    fontSize: PV.Fonts.sizes.md
  },
  divider: {
    marginBottom: 8,
    marginTop: 10
  },
  endTime: {
    flex: 1,
    marginLeft: 8
  },
  image: {
    flex: 1,
    marginVertical: 16
  },
  isPublicText: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  },
  isPublicTextIcon: {
    paddingHorizontal: 4
  },
  loginMessage: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    textAlign: 'center',
    marginBottom: 4
  },
  makeClipPlayerControls: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 60,
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
    marginHorizontal: 12,
    padding: 24
  },
  modalText: {
    fontSize: PV.Fonts.sizes.xl,
    marginBottom: 16
  },
  navHeaderButtonWrapper: {
    flexDirection: 'row'
  },
  playButton: {
    marginHorizontal: 'auto'
  },
  progressWrapper: {
    marginVertical: 8
  },
  row: {
    alignItems: 'center'
  },
  textInput: {
    minHeight: PV.TextInputs.multiline.height,
    paddingHorizontal: 8,
    paddingVertical: 6
  },
  textInputLabel: {
    alignItems: 'center',
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
    marginBottom: 8,
    marginHorizontal: 8,
    marginTop: 12
  },
  wrapperTop: {
    flex: 0,
    marginHorizontal: 8,
    marginTop: 16
  }
})
