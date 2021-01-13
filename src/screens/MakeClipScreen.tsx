import AsyncStorage from '@react-native-community/async-storage'
import {
  Alert,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View as RNView
} from 'react-native'
import RNPickerSelect from 'react-native-picker-select'
import Share from 'react-native-share'
import React from 'reactn'
import {
  ActivityIndicator,
  Divider,
  FastImage,
  Icon,
  NavHeaderButtonText,
  OpaqueBackground,
  PlayerProgressBar,
  Text,
  TextInput,
  TimeInput,
  View
} from '../components'
import { translate } from '../lib/i18n'
import { alertIfNoNetworkConnection } from '../lib/network'
import { testProps } from '../lib/utility'
import { PV } from '../resources'
import { createMediaRef, updateMediaRef } from '../services/mediaRef'
import {
  playerJumpBackward,
  playerJumpForward,
  playerPreviewEndTime,
  playerPreviewStartTime,
  PVTrackPlayer
} from '../services/player'
import { trackPageView } from '../services/tracking'
import { setNowPlayingItem, setPlaybackSpeed, togglePlay } from '../state/actions/player'
import { core, darkTheme, hidePickerIconOnAndroidTransparent, playerStyles } from '../styles'

type Props = {
  navigation?: any
}

type State = {
  endTime: number | null
  isLoggedIn?: boolean
  isPublicItemSelected: any
  isSaving: boolean
  mediaRefId?: string
  progressValue: number | null
  showHowToModal?: boolean
  startTime?: number
  title?: string
}

const testIDPrefix = 'make_clip_screen'

export class MakeClipScreen extends React.Component<Props, State> {
  static navigationOptions = ({ navigation }) => {
    const globalTheme = navigation.getParam('globalTheme')

    return {
      title: navigation.getParam('isEditing') ? translate('Edit Clip') : translate('Make Clip'),
      headerTransparent: true,
      headerStyle: {},
      headerTintColor: globalTheme.text.color,
      headerRight: (
        <RNView style={styles.navHeaderButtonWrapper}>
          <NavHeaderButtonText
            color={globalTheme.text.color}
            handlePress={navigation.getParam('_saveMediaRef')}
            testID={testIDPrefix}
            text={translate('Save')}
          />
        </RNView>
      )
    }
  }

  constructor(props: Props) {
    super(props)
    const { nowPlayingItem = {} } = this.global.player
    const isEditing = this.props.navigation.getParam('isEditing')
    const initialPrivacy = this.props.navigation.getParam('initialPrivacy')
    const initialProgressValue = this.props.navigation.getParam('initialProgressValue')
    const isLoggedIn = this.props.navigation.getParam('isLoggedIn')

    const pItems = privacyItems()
    this.state = {
      endTime: isEditing ? nowPlayingItem.clipEndTime : null,
      isLoggedIn,
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

    trackPageView('/make-clip', 'Make Clip Screen')
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
      Alert.alert(translate('Login Needed'), translate('You need to login to make clips'), [
        { text: translate('OK') },
        {
          text: translate('Go to Login'),
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
      Alert.alert(translate('Clip Error'), translate('End time cannot be equal to 0'), PV.Alerts.BUTTONS.OK)
      return
    }

    if (startTime === 0 && !endTime) {
      Alert.alert(
        translate('Clip Error'),
        translate('The start time must be greater than 0 if no end time is provided'),
        PV.Alerts.BUTTONS.OK
      )
      return
    }

    if (!startTime && startTime !== 0) {
      Alert.alert(translate('Clip Error'), translate('A start time must be provided'), PV.Alerts.BUTTONS.OK)
      return
    }

    if (endTime && startTime >= endTime) {
      Alert.alert(
        translate('Clip Error'),
        translate('The start time must be before the end time'),
        PV.Alerts.BUTTONS.OK
      )
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
        const url = this.global.urlsWeb.clip + mediaRef.id

        if (isEditing) {
          const newItem = {
            ...nowPlayingItem,
            clipEndTime: mediaRef.endTime,
            clipStartTime: mediaRef.startTime,
            clipTitle: mediaRef.title
          }
          const position = await PVTrackPlayer.getPosition()
          await setNowPlayingItem(newItem, position || 0)
        }

        this.setState({ isSaving: false }, async () => {
          // NOTE: setTimeout to prevent an error when Modal and Alert modal try to render at the same time
          setTimeout(() => {
            const alertText = isEditing ? translate('Clip Updated') : translate('Clip Created')
            Alert.alert(alertText, url, [
              {
                text: translate('Done'),
                onPress: () => {
                  navigation.goBack(null)
                }
              },
              {
                text: translate('Share'),
                onPress: async () => {
                  const { nowPlayingItem = {} } = this.global.player
                  const title = `${data.title || translate('untitled clip')} – ${nowPlayingItem.podcastTitle} – ${
                    nowPlayingItem.episodeTitle
                  }${translate('clip created using brandName')}`
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
    Alert.alert(translate('Clip Settings'), translate(`Only with Link means only people who`), [
      {
        text: translate('Premium Info'),
        onPress: () => this.props.navigation.navigate(PV.RouteNames.MembershipScreen)
      },
      { text: translate('Ok') }
    ])
  }

  render() {
    const { navigation } = this.props
    const { globalTheme, player, session } = this.global
    const isDarkMode = globalTheme === darkTheme
    const { backupDuration, nowPlayingItem, playbackRate, playbackState } = player
    const { userInfo } = session
    const {
      endTime,
      isLoggedIn,
      isPublicItemSelected,
      isSaving,
      progressValue,
      showHowToModal,
      startTime,
      title
    } = this.state

    return (
      <OpaqueBackground nowPlayingItem={nowPlayingItem}>
        <View style={styles.view} transparent={true} {...testProps('make_clip_screen_view')}>
          <View style={styles.wrapperTop} transparent={true}>
            {!isLoggedIn && (
              <RNView>
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.md}
                  numberOfLines={1}
                  style={[core.textInputLabel, styles.loginMessage]}>
                  {translate('You must be logged in to make clips')}
                </Text>
                <Divider style={styles.divider} />
              </RNView>
            )}
            <View style={[core.row, styles.row]} transparent={true}>
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.md}
                numberOfLines={1}
                style={[core.textInputLabel, styles.textInputLabel]}>
                {translate('Clip Title')}
              </Text>
              <RNPickerSelect
                items={privacyItems()}
                onValueChange={this._handleSelectPrivacy}
                placeholder={placeholderItem}
                style={[hidePickerIconOnAndroidTransparent(isDarkMode), { backgroundColor: 'transparent' }]}
                touchableWrapperProps={{ testID: `${testIDPrefix}_picker_select_privacy` }}
                useNativeAndroidPickerStyle={false}
                value={isPublicItemSelected.value}>
                <View style={core.selectorWrapper} transparent={true}>
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
              placeholder={translate('optional')}
              returnKeyType='done'
              style={[styles.textInput, globalTheme.textInput]}
              underlineColorAndroid='transparent'
              testID={`${testIDPrefix}_title`}
              value={title}
            />
          </View>
          <View style={styles.wrapperMiddle} transparent={true}>
            <FastImage
              resizeMode='contain'
              source={nowPlayingItem && nowPlayingItem.podcastImageUrl}
              styles={styles.image}
            />
          </View>
          <View style={styles.wrapperBottom} transparent={true}>
            <View style={core.row} transparent={true}>
              <TimeInput
                handlePreview={() => {
                  if (startTime) {
                    playerPreviewStartTime(startTime, endTime)
                  }
                }}
                handleSetTime={this._setStartTime}
                labelText={translate('Start Time')}
                placeholder='--:--'
                testID={`${testIDPrefix}_start`}
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
                labelText={translate('End Time')}
                placeholder={translate('optional')}
                testID={`${testIDPrefix}_end`}
                time={endTime}
                wrapperStyle={styles.timeInput}
              />
            </View>
            <View style={styles.progressWrapper} transparent={true}>
              <PlayerProgressBar
                backupDuration={backupDuration}
                clipEndTime={endTime}
                clipStartTime={startTime}
                globalTheme={globalTheme}
                {...(progressValue || progressValue === 0 ? { value: progressValue } : {})}
              />
            </View>
            <RNView style={[styles.makeClipPlayerControls, globalTheme.makeClipPlayerControlsWrapper]}>
              <TouchableOpacity
                onPress={this._playerJumpBackward}
                style={playerStyles.icon}
                {...testProps(`${testIDPrefix}_jump_backward`)}>
                <Icon name='undo-alt' size={32} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={this._playerMiniJumpBackward}
                style={playerStyles.icon}
                {...testProps(`${testIDPrefix}_mini_jump_backward`)}>
                <Icon name='angle-left' size={24} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => togglePlay()}
                style={[playerStyles.playButton, styles.playButton]}
                {...testProps(`${testIDPrefix}_toggle_play`)}>
                {playbackState !== PVTrackPlayer.STATE_BUFFERING && (
                  <Icon
                    name={playbackState === PVTrackPlayer.STATE_PLAYING ? 'pause' : 'play'}
                    size={48}
                    testID={`${testIDPrefix}_${playbackState === PVTrackPlayer.STATE_PLAYING ? 'pause' : 'play'}`}
                  />
                )}
                {playbackState === PVTrackPlayer.STATE_BUFFERING && (
                  <ActivityIndicator styles={styles.activityIndicator} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={this._playerMiniJumpForward}
                style={playerStyles.icon}
                {...testProps(`${testIDPrefix}_mini_jump_forward`)}>
                <Icon name='angle-right' size={24} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={this._playerJumpForward}
                style={playerStyles.icon}
                {...testProps(`${testIDPrefix}_jump_forward`)}>
                <Icon name='redo-alt' size={32} />
              </TouchableOpacity>
            </RNView>
            <View style={styles.bottomRow} transparent={true}>
              <TouchableOpacity
                hitSlop={{
                  bottom: 4,
                  left: 4,
                  right: 4,
                  top: 4
                }}
                onPress={() => this.setState({ showHowToModal: true })}
                {...testProps(`${testIDPrefix}_show_how_to`)}>
                <View transparent={true}>
                  <Text
                    fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                    style={[styles.bottomRowTextMini, globalTheme.link]}>
                    {translate('How To')}
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
                onPress={this._adjustSpeed}
                {...testProps(`${testIDPrefix}_adjust_speed`)}>
                <View transparent={true}>
                  <Text
                    fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                    style={[styles.bottomButton, styles.bottomRowText]}
                    testID={`${testIDPrefix}_adjust_speed_label`}>
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
                onPress={() => navigation.navigate(PV.RouteNames.PlayerFAQScreen)}
                {...testProps(`${testIDPrefix}_show_faq`)}>
                <View transparent={true}>
                  <Text
                    fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                    style={[styles.bottomRowTextMini, globalTheme.link]}>
                    FAQ
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
                  {translate('Tap the Start and End Time inputs to set them with the current track time')}
                </Text>
                <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.modalText}>
                  {translate('Press the left or right caret symbols to adjust the time by one second')}
                </Text>
                <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.modalText}>
                  {translate('Press the blue play button to preview the start or end time')}
                </Text>
                <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.modalText}>
                  {translate('If a podcast uses dynamically inserted ads its clip start times will not stay accurate')}
                </Text>
                <TouchableOpacity onPress={this._hideHowTo} {...testProps(`${testIDPrefix}_close`)}>
                  <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} numberOfLines={1} style={styles.modalButton}>
                    {translate('Close')}
                  </Text>
                </TouchableOpacity>
              </RNView>
            </RNView>
          </Modal>
        )}
      </OpaqueBackground>
    )
  }
}

const _publicKey = 'public'
const _onlyWithLinkKey = 'onlyWithLink'

const placeholderItem = {
  label: translate('Select'),
  value: null
}

const privacyItems = () => {
  const items = [
    {
      label: translate('Public'),
      value: _publicKey
    },
    {
      label: translate('Only with link'),
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
    fontSize: PV.Fonts.sizes.sm,
    minWidth: 80,
    textAlign: 'center'
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
    marginVertical: 8
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
    marginTop: Platform.OS === 'ios' ? 16 : 0
  }
})
