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
import Share from 'react-native-share'
import React from 'reactn'
import {
  ActivityIndicator,
  Divider,
  DropdownButtonSelect,
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
import { core, darkTheme, iconStyles, playerStyles } from '../styles'

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
            text={translate('Save Clip')}
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
                  const title = `${data.title || translate('Untitled Clip')} – ${nowPlayingItem.podcastTitle} – ${
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
    const { globalTheme, player } = this.global
    const { backupDuration, nowPlayingItem, playbackRate, playbackState } = player
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
    const imageHeight = navigation.getParam('imageHeight')
    const imageWidth = navigation.getParam('imageWidth')
    const imageStyle = [styles.image, { height: imageHeight, width: imageWidth }]
    const imageUrl = nowPlayingItem ? nowPlayingItem.podcastImageUrl : ''

    return (
      <OpaqueBackground imageUrl={imageUrl}>
        <View style={styles.view} transparent={true} {...testProps('make_clip_screen_view')}>
          <View style={styles.wrapperTop} transparent={true}>
            {!isLoggedIn && (
              <RNView>
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.md}
                  numberOfLines={1}
                  style={[core.textInputEyeBrow, styles.loginMessage]}>
                  {translate('You must be logged in to make clips')}
                </Text>
                <Divider style={styles.divider} />
              </RNView>
            )}
            <TextInput
              autoCapitalize='none'
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              onChangeText={this._onChangeTitle}
              numberOfLines={3}
              placeholder={translate('Clip name')}
              returnKeyType='done'
              style={globalTheme.textInput}
              underlineColorAndroid='transparent'
              testID={`${testIDPrefix}_title`}
              value={title}
              wrapperStyle={styles.textInputTitleWrapper}
            />
          </View>
          <DropdownButtonSelect
            helpText={translate('Tip: Naming your clips')}
            items={privacyItems()}
            label={isPublicItemSelected.label}
            onValueChange={this._handleSelectPrivacy}
            placeholder={placeholderItem}
            testID={testIDPrefix}
            value={isPublicItemSelected.value}
            wrapperStyle={styles.dropdownButtonSelectWrapper}
          />
          <View style={styles.imageWrapper} transparent={true}>
            <FastImage
              resizeMode='contain'
              source={nowPlayingItem && nowPlayingItem.podcastImageUrl}
              styles={imageStyle}
            />
          </View>
          <View style={styles.wrapperBottom} transparent={true}>
            <View style={styles.wrapperBottomInside} transparent={true}>
              <TimeInput
                handlePreview={() => {
                  if (startTime) {
                    playerPreviewStartTime(startTime, endTime)
                  }
                }}
                handleSetTime={this._setStartTime}
                labelText={translate('Start time')}
                placeholder='--:--'
                testID={`${testIDPrefix}_start`}
                time={startTime}
              />
              <View style={styles.wrapperBottomInsideSpacer} transparent={true} />
              <TimeInput
                handleClearTime={endTime ? this._clearEndTime : null}
                handlePreview={() => {
                  if (endTime) {
                    playerPreviewEndTime(endTime)
                  }
                }}
                handleSetTime={this._setEndTime}
                labelText={translate('End time')}
                placeholder={translate('optional')}
                testID={`${testIDPrefix}_end`}
                time={endTime}
              />
            </View>
            <View style={styles.clearEndTimeWrapper} transparent={true}>
              <View style={styles.clearEndTimeTextSpacer} transparent={true} />
              {endTime && (
                <TouchableWithoutFeedback
                  hitSlop={{
                    bottom: 0,
                    left: 2,
                    right: 8,
                    top: 4
                  }}
                  onPress={this._clearEndTime}
                  {...testProps(`${testIDPrefix}_time_input_clear_button`)}>
                  <Text style={styles.clearEndTimeText}>Remove end time</Text>
                </TouchableWithoutFeedback>
              )}
            </View>
            <View style={[styles.wrapper, globalTheme.player]} transparent={true}>
              <View style={styles.progressWrapper} transparent={true}>
                <PlayerProgressBar
                  backupDuration={backupDuration}
                  clipEndTime={endTime}
                  clipStartTime={startTime}
                  globalTheme={globalTheme}
                  isMakeClipScreen={true}
                  {...(progressValue || progressValue === 0 ? { value: progressValue } : {})}
                />
              </View>
              <View style={styles.playerControlsMiddleRow} transparent={true}>
                <View style={styles.playerControlsMiddleRowTop} transparent={true}>
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
                    style={playerStyles.playButton}
                    {...testProps(`${testIDPrefix}_toggle_play`)}>
                    {playbackState !== PVTrackPlayer.STATE_BUFFERING && (
                      <Icon
                        name={playbackState === PVTrackPlayer.STATE_PLAYING ? 'pause' : 'play'}
                        size={20}
                        testID={`${testIDPrefix}_${playbackState === PVTrackPlayer.STATE_PLAYING ? 'pause' : 'play'}`}
                      />
                    )}
                    {playbackState === PVTrackPlayer.STATE_BUFFERING && <ActivityIndicator />}
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
                </View>
              </View>
              <View style={styles.playerControlsBottomRow} transparent={true}>
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
                      style={[
                        styles.playerControlsBottomButton,
                        styles.playerControlsBottomRowText,
                        globalTheme.textSecondary
                      ]}>
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
                      style={[
                        styles.playerControlsBottomButton,
                        styles.playerControlsBottomRowText,
                        globalTheme.textSecondary
                      ]}
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
                      style={[
                        styles.playerControlsBottomButton,
                        styles.playerControlsBottomRowText,
                        globalTheme.textSecondary
                      ]}>
                      FAQ
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        {isSaving && (
          <Modal transparent={true} visible={true}>
            <RNView style={[styles.modalBackdrop, globalTheme.modalBackdrop]}>
              <ActivityIndicator isOverlay={true} />
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
                  {translate('Press the left or right caret symbols to adjust the current time by one second')}
                </Text>
                <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.modalText}>
                  {translate('If a podcast inserts dynamic ads the clip start time may not stay accurate')}
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
  dropdownButtonSelectWrapper: {
    marginTop: 16
  },
  playerControlsBottomButton: {
    alignItems: 'center',
    minHeight: 32,
    paddingVertical: 4,
    textAlign: 'center',
    minWidth: 54
  },
  playerControlsBottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: PV.Player.styles.bottomRow.height,
    justifyContent: 'space-evenly',
    marginHorizontal: 15,
    marginTop: 10
  },
  playerControlsBottomRowText: {
    fontSize: PV.Fonts.sizes.md,
    fontWeight: PV.Fonts.weights.bold
  },
  clearEndTimeText: {
    color: PV.Colors.skyLight,
    flex: 1,
    fontSize: PV.Fonts.sizes.sm,
    paddingBottom: 14,
    paddingTop: 8,
    textAlign: 'center'
  },
  clearEndTimeTextSpacer: {
    flex: 1
  },
  clearEndTimeWrapper: {
    minHeight: 40,
    flexDirection: 'row'
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
  imageWrapper: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 16
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
  playerControlsMiddleRow: {
    marginTop: 2
  },
  playerControlsMiddleRowTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 2
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
  progressWrapper: {
    marginTop: 5
  },
  textInputEyeBrow: {
    alignItems: 'center',
    flex: 1
  },
  textInputTitleWrapper: {
    marginBottom: 0
  },
  view: {
    flex: 1
  },
  wrapper: {
    borderTopWidth: 1
  },
  wrapperBottom: {
    flex: 0,
    paddingHorizontal: 0
  },
  wrapperBottomInside: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 8
  },
  wrapperBottomInsideSpacer: {
    width: 16
  },
  wrapperTop: {
    flex: 0,
    marginHorizontal: 8,
    marginTop: Platform.OS === 'ios' ? 16 : 0
  }
})
