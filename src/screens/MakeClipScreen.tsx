import AsyncStorage from '@react-native-community/async-storage'
import {
  Alert,
  Modal,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View as RNView,
  Image,
  ImageSourcePropType
} from 'react-native'
import Share from 'react-native-share'
import { State as RNTPState } from 'react-native-track-player'
import React from 'reactn'
import { clearTempMediaRef, saveTempMediaRef } from '../state/actions/mediaRef'
import {
  ActivityIndicator,
  DropdownButtonSelect,
  Icon,
  NavHeaderButtonText,
  PlayerProgressBar,
  Text,
  TextInput,
  TimeInput,
  View
} from '../components'
import { translate } from '../lib/i18n'
import { alertIfNoNetworkConnection } from '../lib/network'
import { requestAppStoreReview } from '../lib/utility'
import { PV } from '../resources'
import { createMediaRef, updateMediaRef } from '../services/mediaRef'
import {
  checkIfStateIsBuffering,
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
  shouldClearClipInfo: boolean
}

const testIDPrefix = 'make_clip_screen'

export class MakeClipScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    const { nowPlayingItem = {} } = this.global.player
    const isEditing = this.props.navigation.getParam('isEditing')
    const initialPrivacy = this.props.navigation.getParam('initialPrivacy')
    const initialProgressValue = this.props.navigation.getParam('initialProgressValue')
    const isLoggedIn = this.props.navigation.getParam('isLoggedIn')

    const pItems = privacyItems()
    this.state = {
      endTime: isEditing ? nowPlayingItem?.clipEndTime : null,
      isLoggedIn,
      ...(initialPrivacy ? { isPublicItemSelected: pItems[0] } : { isPublicItemSelected: pItems[1] }),
      isSaving: false,
      ...(isEditing ? { mediaRefId: nowPlayingItem.clipId } : {}),
      progressValue: initialProgressValue || 0,
      startTime: isEditing ? nowPlayingItem.clipStartTime : null,
      shouldClearClipInfo: false
    }
  }

  static navigationOptions = ({ navigation }) => {
    const globalTheme = navigation.getParam('globalTheme')
    const isLoggedIn = navigation.getParam('isLoggedIn')
    return {
      title: navigation.getParam('isEditing') ? translate('Edit Clip') : translate('Make Clip'),
      headerTransparent: true,
      headerStyle: {},
      headerTintColor: globalTheme.text.color,
      headerRight: () => (
        <RNView style={styles.navHeaderButtonWrapper}>
          <NavHeaderButtonText
            accessibilityHint={isLoggedIn
              ? ''
              : translate('ARIA HINT - go to the login screen')
            }
            accessibilityLabel={isLoggedIn ? translate('Save Clip') : translate('Go to Login')}
            color={globalTheme.text.color}
            handlePress={navigation.getParam('_saveMediaRef')}
            testID={testIDPrefix}
            text={isLoggedIn ? translate('Save Clip') : translate('Go to Login')}
          />
        </RNView>
      )
    }
  }

  async componentDidMount() {
    const { navigation } = this.props
    const { player } = this.global
    const { nowPlayingItem } = player
    navigation.setParams({ _saveMediaRef: this._saveMediaRef })
    const currentPosition = await PVTrackPlayer.getTrackPosition()
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
        const {tempMediaRefInfo} = this.global
        let startTime = null
        let endTime = null
        let title = ''
        if(!isEditing) {
          if(tempMediaRefInfo.startTime) {
            startTime = tempMediaRefInfo.startTime
          } else {
            startTime = Math.floor(currentPosition)
          }

          if(tempMediaRefInfo.endTime) {
            endTime = tempMediaRefInfo.endTime
          }

          if(tempMediaRefInfo.clipTitle) {
            title = tempMediaRefInfo.clipTitle
          }
        } else {
          startTime = nowPlayingItem.clipStartTime
          endTime = nowPlayingItem.clipEndTime
          title = nowPlayingItem.clipTitle
        }

        this.setState({
          ...(!hideHowToModal ? { showHowToModal: true } : { showHowToModal: false }),
          startTime,
          endTime,
          title
        })
      }
    )

    trackPageView('/make-clip', 'Make Clip Screen')
  }

  async componentWillUnmount() {
    if(!this.props.navigation.getParam('isEditing')) {
      await saveTempMediaRef({startTime: this.state.startTime, endTime:this.state.endTime, clipTitle:this.state.title})
    }

    if(this.state.shouldClearClipInfo) {
      await clearTempMediaRef()
    }

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

  _handleSelectPrivacy = (selectedKey: string) => {
    const items = [placeholderItem, ...privacyItems()]
    const selectedItem = items.find((x) => x.value === selectedKey)
    if (selectedItem) {
      AsyncStorage.setItem(PV.Keys.MAKE_CLIP_IS_PUBLIC, JSON.stringify(selectedItem.value === _publicKey))
    }
    this.setState({ isPublicItemSelected: selectedItem })
  }

  _setStartTime = async () => {
    const currentPosition = await PVTrackPlayer.getTrackPosition()
    this.setState({ startTime: Math.floor(currentPosition) })
  }

  _setEndTime = async () => {
    const currentPosition = await PVTrackPlayer.getTrackPosition()
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

    await setPlaybackSpeed(newSpeed)
  }

  _clearEndTime = () => {
    this.setState({ endTime: null })
  }

  _goToLogin = () => {
    const { navigation } = this.props

    navigation.goBack(null)
    setTimeout(() => {
      navigation.navigate(PV.RouteNames.AuthScreen)
    }, 500)
  }

  _saveMediaRef = async () => {
    const { navigation } = this.props
    const { player, session } = this.global

    if (!session?.isLoggedIn) {
      this._goToLogin()
      return
    }

    const { nowPlayingItem } = player
    const { endTime, isPublicItemSelected, mediaRefId, startTime, title } = this.state

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

    this.setState({ isSaving: true }, () => {
      (async () => {
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

          if (isEditing) {
            const newItem = {
              ...nowPlayingItem,
              clipEndTime: mediaRef.endTime,
              clipStartTime: mediaRef.startTime,
              clipTitle: mediaRef.title
            }
            const position = await PVTrackPlayer.getTrackPosition()
            await setNowPlayingItem(newItem, position || 0)
          }

          this.setState({ isSaving: false, shouldClearClipInfo:true }, () => {
            // NOTE: setTimeout to prevent an error when Modal and Alert modal try to render at the same time
            setTimeout(() => {
              const alertText = isEditing ? translate('Clip Updated') : translate('Clip Created')
              const url = this.global.urlsWeb.clip + mediaRef.id
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
                    // the url must be read from global again to ensure the correct state is used
                    const url = this.global.urlsWeb.clip + mediaRef.id
                    let { nowPlayingItem } = this.global.player
                    nowPlayingItem = nowPlayingItem || {}
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
          requestAppStoreReview()
        } catch (error) {
          if (error.response) {
            Alert.alert(PV.Alerts.SOMETHING_WENT_WRONG.title, error.response.data.message, PV.Alerts.BUTTONS.OK)
          }
          console.log(error)
        }
        this.setState({ isSaving: false })
      })()
    })
  }

  _hideHowTo = () => {
    this.setState({ showHowToModal: false })
  }

  _playerJumpBackward = async () => {
    const { jumpBackwardsTime } = this.global
    const progressValue = await playerJumpBackward(jumpBackwardsTime)
    this.setState({ progressValue })
    setTimeout(() => this.setState({ progressValue: null }), 250)
  }

  _playerJumpForward = async () => {
    const { jumpForwardsTime } = this.global
    const progressValue = await playerJumpForward(jumpForwardsTime)
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

  _showClipPrivacyNote = () => {
    Alert.alert(translate('Clip Settings'), translate(`Only with Link means only people who`), [
      {
        text: translate('Premium Info'),
        onPress: () => this.props.navigation.navigate(PV.RouteNames.MembershipScreen)
      },
      { text: translate('Ok') }
    ])
  }

  _renderPlayerControlIcon = (source: ImageSourcePropType) => {
    return (
      <RNView style={styles.iconContainer}>
        <Image source={source} resizeMode='contain' style={styles.icon} />
      </RNView>
    )
  }

  render() {
    const { navigation } = this.props
    const { globalTheme, jumpBackwardsTime, jumpForwardsTime, player } = this.global
    const { backupDuration, playbackRate, playbackState } = player
    const hasErrored = playbackState === PV.Player.errorState
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

    let playButtonIcon = <Icon name='play' size={20} testID={`${testIDPrefix}_play_button`} />
    let playButtonAdjust = { paddingLeft: 2 } as any
    let playButtonAccessibilityHint = translate('ARIA HINT - resume playing')
    let playButtonAccessibilityLabel = translate('Play')
    if (hasErrored) {
      playButtonIcon = (
        <Icon
          color={globalTheme === darkTheme ? iconStyles.lightRed.color : iconStyles.darkRed.color}
          name={'exclamation-triangle'}
          size={35}
          testID={`${testIDPrefix}_error`}
        />
      )
      playButtonAdjust = { paddingBottom: 8 } as any
    } else if (playbackState === RNTPState.Playing) {
      playButtonIcon = <Icon name='pause' size={20} testID={`${testIDPrefix}_pause_button`} />
      playButtonAdjust = {}
      playButtonAccessibilityHint = translate('ARIA HINT - pause playback')
      playButtonAccessibilityLabel = translate('Pause')
    } else if (checkIfStateIsBuffering(playbackState)) {
      playButtonIcon = <ActivityIndicator testID={testIDPrefix} />
      playButtonAdjust = { paddingLeft: 2, paddingTop: 2 }
      playButtonAccessibilityHint = ''
      playButtonAccessibilityLabel = translate('Episode is loading')
    }

    const jumpBackAccessibilityLabel =
      `${translate(`Jump back`)} ${jumpBackwardsTime} ${translate('seconds')}`
    const jumpForwardAccessibilityLabel =
      `${translate(`Jump forward`)} ${jumpForwardsTime} ${translate('seconds')}`
    const miniJumpBackAccessibilityLabel =
      `${translate(`Jump back`)} ${PV.Player.miniJumpSeconds} ${translate('seconds')}`
    const miniJumpForwardAccessibilityLabel =
      `${translate(`Jump forward`)} ${PV.Player.miniJumpSeconds} ${translate('seconds')}`

    return (
      <SafeAreaView style={styles.viewContainer}>
        <View style={styles.view} transparent testID='make_clip_screen_view'>
          <View style={styles.contentContainer}>
            <View style={styles.wrapperTop} transparent>
              <TextInput
                accessibilityHint={translate('ARIA HINT - You can optionally provide a title for your clip here')}
                autoCapitalize='none'
                fontSizeLargestScale={PV.Fonts.largeSizes.md}
                onChangeText={this._onChangeTitle}
                numberOfLines={3}
                placeholder={translate('Clip title')}
                returnKeyType='done'
                style={globalTheme.textInput}
                underlineColorAndroid='transparent'
                testID={`${testIDPrefix}_title`}
                value={title}
                wrapperStyle={styles.textInputTitleWrapper}
              />
            </View>
            <DropdownButtonSelect
              accessibilityHint={translate('ARIA HINT - change the privacy setting for your clip')}
              helpText={translate('Tip: Titling your clips')}
              hideHelpTextInAccessibility
              items={privacyItems()}
              label={isPublicItemSelected.label}
              onValueChange={this._handleSelectPrivacy}
              placeholder={placeholderItem}
              testID={testIDPrefix}
              value={isPublicItemSelected.value}
              wrapperStyle={styles.dropdownButtonSelectWrapper}
            />
            <View style={styles.fillerView} transparent />
            <View style={styles.wrapperBottom} transparent>
              <View style={styles.wrapperBottomInside} transparent>
                <TimeInput
                  // eslint-disable-next-line max-len
                  accessibilityHint={translate('ARIA HINT - tap to set the current playback position as the start time for this clip')}
                  handlePreview={() => {
                    if (startTime) {
                      playerPreviewStartTime(startTime, endTime)
                    }
                  }}
                  handleSetTime={this._setStartTime}
                  labelText={translate('Start time')}
                  placeholder='--:--'
                  previewAccessibilityLabel={translate('Preview Start Time')}
                  testID={`${testIDPrefix}_start`}
                  time={startTime}
                />
                <View style={styles.wrapperBottomInsideSpacer} transparent />
                <TimeInput
                  // eslint-disable-next-line max-len
                  accessibilityHint={translate('ARIA HINT - tap to set the current playback position as the end time for this clip')}
                  handleClearTime={endTime ? this._clearEndTime : null}
                  handlePreview={() => {
                    if (endTime) {
                      playerPreviewEndTime(endTime)
                    }
                  }}
                  handleSetTime={this._setEndTime}
                  labelText={translate('End time')}
                  placeholder={translate('optional')}
                  previewAccessibilityLabel={translate('Preview End Time')}
                  testID={`${testIDPrefix}_end`}
                  time={endTime}
                />
              </View>
              <View style={styles.clearEndTimeWrapper} transparent>
                <View style={styles.clearEndTimeTextSpacer} transparent />
                {endTime && (
                  <TouchableWithoutFeedback
                    accessible
                    accessibilityHint={translate('ARIA HINT - clear the end time for this clip')}
                    accessibilityLabel={translate('Remove end time')}
                    accessibilityRole='button'
                    importantForAccessibility='yes'
                    hitSlop={{
                      bottom: 0,
                      left: 2,
                      right: 8,
                      top: 4
                    }}
                    onPress={this._clearEndTime}
                    testID={`${testIDPrefix}_time_input_clear_button`.prependTestId()}>
                    <Text style={styles.clearEndTimeText}>
                      {translate('Remove end time')}
                    </Text>
                  </TouchableWithoutFeedback>
                )}
              </View>
              <View style={[styles.wrapper, globalTheme.player]} transparent>
                <View style={styles.progressWrapper} transparent>
                  <PlayerProgressBar
                    backupDuration={backupDuration}
                    clipEndTime={endTime}
                    clipStartTime={startTime}
                    globalTheme={globalTheme}
                    isMakeClipScreen
                    {...(progressValue || progressValue === 0 ? { value: progressValue } : {})}
                  />
                </View>
                <View style={styles.playerControlsMiddleRow} transparent>
                  <View style={styles.playerControlsMiddleRowTop} transparent>
                    <TouchableOpacity
                      accessibilityLabel={jumpBackAccessibilityLabel}
                      accessibilityRole='button'
                      onPress={this._playerJumpBackward}
                      style={playerStyles.icon}
                      testID={`${testIDPrefix}_jump_backward`.prependTestId()}>
                      {this._renderPlayerControlIcon(PV.Images.JUMP_BACKWARDS)}
                      <View
                        importantForAccessibility='no-hide-descendants' style={styles.skipTimeTextWrapper} transparent>
                        <Text style={styles.skipTimeText}>{PV.Player.jumpBackSeconds}</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      accessibilityLabel={miniJumpBackAccessibilityLabel}
                      accessibilityRole='button'
                      onPress={this._playerMiniJumpBackward}
                      style={playerStyles.icon}
                      testID={`${testIDPrefix}_mini_jump_backward`.prependTestId()}>
                      {this._renderPlayerControlIcon(PV.Images.JUMP_BACKWARDS)}
                      <View
                        importantForAccessibility='no-hide-descendants'
                        style={styles.skipTimeTextWrapper}
                        transparent>
                        <Text style={styles.skipTimeText}>1</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      accessibilityHint={playButtonAccessibilityHint}
                      accessibilityLabel={playButtonAccessibilityLabel}
                      onPress={() => togglePlay()}
                      testID={`${testIDPrefix}_toggle_play`.prependTestId()}>
                      <View
                        importantForAccessibility='no-hide-descendants'
                        style={[playerStyles.playButton, playButtonAdjust]}>
                        {playButtonIcon}
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      accessibilityLabel={miniJumpForwardAccessibilityLabel}
                      accessibilityRole='button'
                      onPress={this._playerMiniJumpForward}
                      style={playerStyles.icon}
                      testID={`${testIDPrefix}_mini_jump_forward`.prependTestId()}>
                      {this._renderPlayerControlIcon(PV.Images.JUMP_AHEAD)}
                      <View style={styles.skipTimeTextWrapper} transparent>
                        <Text style={styles.skipTimeText}>1</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      accessibilityLabel={jumpForwardAccessibilityLabel}
                      accessibilityRole='button'
                      onPress={this._playerJumpForward}
                      style={playerStyles.icon}
                      testID={`${testIDPrefix}_jump_forward`.prependTestId()}>
                      {this._renderPlayerControlIcon(PV.Images.JUMP_AHEAD)}
                      <View style={styles.skipTimeTextWrapper} transparent>
                        <Text style={styles.skipTimeText}>{jumpForwardsTime}</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.playerControlsBottomRow} transparent>
                  <TouchableOpacity
                    accessibilityHint={translate('ARIA HINT - show how to information for the make clip screen')}
                    accessibilityLabel={translate('How To')}
                    accessibilityRole='button'
                    hitSlop={{
                      bottom: 4,
                      left: 4,
                      right: 4,
                      top: 4
                    }}
                    onPress={() => this.setState({ showHowToModal: true })}
                    testID={`${testIDPrefix}_show_how_to`.prependTestId()}>
                    <View transparent>
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
                    accessibilityHint={translate('ARIA HINT - current playback speed')}
                    accessibilityLabel={`${playbackRate}X`}
                    accessibilityRole='button'
                    hitSlop={{
                      bottom: 4,
                      left: 4,
                      right: 4,
                      top: 4
                    }}
                    onPress={this._adjustSpeed}
                    testID={`${testIDPrefix}_adjust_speed`.prependTestId()}>
                    <View transparent>
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
                    accessibilityHint={translate('ARIA HINT - go to the FAQ page')}
                    accessibilityLabel={translate('FAQ')}
                    accessibilityRole='button'
                    hitSlop={{
                      bottom: 4,
                      left: 4,
                      right: 4,
                      top: 4
                    }}
                    onPress={() => navigation.navigate(PV.RouteNames.PlayerFAQScreen)}
                    testID={`${testIDPrefix}_show_faq`.prependTestId()}>
                    <View transparent>
                      <Text
                        fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                        style={[
                          styles.playerControlsBottomButton,
                          styles.playerControlsBottomRowText,
                          globalTheme.textSecondary
                        ]}>
                        {translate('FAQ')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            {!isLoggedIn && (
              <RNView style={styles.loginBlockedView}>
                <RNView>
                  <Text
                    fontSizeLargestScale={PV.Fonts.largeSizes.md}
                    numberOfLines={1}
                    style={[core.textInputEyeBrow, styles.loginMessage]}>
                    {translate('You must be logged in to make clips')}
                  </Text>
                </RNView>
              </RNView>
            )}
          </View>
        </View>
        {isSaving && (
          <Modal transparent visible>
            <RNView style={[styles.modalBackdrop, globalTheme.modalBackdrop]}>
              <ActivityIndicator isOverlay testID={testIDPrefix} />
            </RNView>
          </Modal>
        )}
        {showHowToModal && (
          <Modal transparent visible>
            <RNView style={[styles.modalBackdrop, globalTheme.modalBackdrop]}>
              <RNView style={[styles.modalInnerWrapper, globalTheme.modalInnerWrapper]}>
                <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.modalText}>
                  {translate('Tap the Start and End Time inputs to set them with the current track time')}
                </Text>
                <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.modalText}>
                  {translate('If a podcast inserts dynamic ads the clip start time may not stay accurate')}
                </Text>
                <TouchableOpacity
                  accessibilityHint={translate('ARIA HINT - continue to the Make Clip screen')}
                  accessibilityLabel={translate('Got It')}
                  accessibilityRole='button'
                  onPress={this._hideHowTo}
                  style={{ marginTop: 12 }}
                  testID={`${testIDPrefix}_close`.prependTestId()}>
                  <Text
                    fontSizeLargestScale={PV.Fonts.largeSizes.md}
                    numberOfLines={1}
                    style={styles.modalButton}>
                    {translate('Got It')}
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
  viewContainer: {
    flex: 1,
    backgroundColor: PV.Colors.ink
  },
  contentContainer: {
    flex: 1,
    marginTop: 56
  },
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
    paddingBottom: 12,
    paddingTop: 10,
    textAlign: 'center'
  },
  clearEndTimeTextSpacer: {
    flex: 1
  },
  clearEndTimeWrapper: {
    flexDirection: 'row',
    marginHorizontal: 8,
    minHeight: 40
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
  fillerView: {
    flex: 1
  },
  isPublicText: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  },
  isPublicTextIcon: {
    paddingHorizontal: 4
  },
  loginMessage: {
    fontSize: PV.Fonts.sizes.xxl,
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
    marginTop: 2,
    marginHorizontal: 10
  },
  modalBackdrop: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  modalButton: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    textAlign: 'center',
    color: PV.Colors.skyLight,
    borderWidth: 1,
    borderColor: PV.Colors.skyLight,
    paddingVertical: 10
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
    marginHorizontal: 8
  },
  loginBlockedView: {
    backgroundColor: PV.Colors.blackOpaque,
    position: 'absolute',
    ...StyleSheet.absoluteFill,
    justifyContent: 'center'
  },
  loginButton: {
    fontSize: PV.Fonts.sizes.xxxl,
    fontWeight: PV.Fonts.weights.bold,
    color: PV.Colors.white,
    borderWidth: 2,
    borderColor: PV.Colors.white,
    textAlign: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    marginHorizontal: 40
  },
  iconContainer: {
    width: 50,
    height: 50
  },
  icon: {
    tintColor: PV.Colors.white,
    width: '100%',
    height: '100%'
  },
  skipTimeTextWrapper: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center'
  },
  skipTimeText: {
    fontSize: 16
  }
})
