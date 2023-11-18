import { NowPlayingItem } from 'podverse-shared'
import { Alert, StyleSheet, TouchableHighlight, View } from 'react-native'
import { Slider } from 'react-native-elements'
import SystemSetting from 'react-native-system-setting'
import React from 'reactn'
import { toggleMarkAsPlayed } from '../state/actions/userHistoryItem'
import { translate } from '../lib/i18n'
import { alertIfNoNetworkConnection } from '../lib/network'
import { safelyUnwrapNestedVariable } from '../lib/utility'
import { PV } from '../resources'
import { playerPlayNextFromQueue } from '../services/player'
import { toggleAddByRSSPodcastFeedUrl } from '../state/actions/parser'
import { checkIfSubscribedToPodcast, toggleSubscribeToPodcast } from '../state/actions/podcast'
import { actionSheetStyles, sliderStyles } from '../styles'
import { ActionSheet, Icon, Text } from './'

type Props = {
  handleDismiss: any
  initialVolume?: number
  navigation: any
  showModal?: boolean
  testID: string
}

type State = {
  volume?: number
}

let volumeListener = null as any

const testIDPrefix = 'player_more_action_sheet'

/**
 * As seen on Android device
 */
type VolumeData = {
  notification?: number | undefined
  ring?: number | undefined
  music?: number | undefined
  call?: number | undefined
  alarm?: number | undefined
  system?: number | undefined
  value?: number | undefined
}
export class PlayerMoreActionSheet extends React.Component<Props, State> {
  constructor() {
    super()

    this.state = {}
  }

  async componentDidMount() {
    const volume = await SystemSetting.getVolume()
    this.setState({ volume })

    volumeListener = SystemSetting.addVolumeListener((data: VolumeData) => {
      const volume = data.value
      this.setState({ volume })
    })
  }

  componentWillUnmount() {
    SystemSetting.removeVolumeListener(volumeListener)
  }

  _updateVolume = (volume: number) => {
    SystemSetting.setVolume(volume)
    this.setState({ volume })
  }

  _handleToggleSubscribe = async () => {
    const { handleDismiss } = this.props

    const wasAlerted = await alertIfNoNetworkConnection(translate('subscribe to podcast'))
    if (wasAlerted) return
    const { nowPlayingItem } = this.global.player

    try {
      if (nowPlayingItem) {
        if (nowPlayingItem.addByRSSPodcastFeedUrl) {
          await toggleAddByRSSPodcastFeedUrl(nowPlayingItem.addByRSSPodcastFeedUrl)
        } else if (nowPlayingItem.podcastId) {
          await toggleSubscribeToPodcast(nowPlayingItem.podcastId)
        }
      }
      handleDismiss()
    } catch (error) {
      handleDismiss()
      if (error.response) {
        Alert.alert(PV.Alerts.SOMETHING_WENT_WRONG.title, PV.Alerts.SOMETHING_WENT_WRONG.message, PV.Alerts.BUTTONS.OK)
      }
    }
  }

  _headerActionSheetButtons = () => {
    const { globalTheme, player, session } = this.global

    // nowPlayingItem will be undefined when loading from a deep link
    let { nowPlayingItem } = player
    nowPlayingItem = nowPlayingItem || {}

    const subscribedPodcastIds = safelyUnwrapNestedVariable(() => session.userInfo.subscribedPodcastIds, [])
    const isLoggedIn = safelyUnwrapNestedVariable(() => session?.isLoggedIn, '')
    const historyItemsIndex = safelyUnwrapNestedVariable(() => session?.userInfo?.historyItemsIndex, {})
    const isSubscribed = checkIfSubscribedToPodcast(
      subscribedPodcastIds,
      nowPlayingItem.podcastId,
      nowPlayingItem.addByRSSPodcastFeedUrl
    )

    const children = [
      <TouchableHighlight
        key='toggleSubscribe'
        onPress={this._handleToggleSubscribe}
        style={[actionSheetStyles.button, globalTheme.actionSheetButton]}
        underlayColor={safelyUnwrapNestedVariable(() => globalTheme.actionSheetButtonUnderlay.backgroundColor, '')}>
        <Text
          style={[actionSheetStyles.buttonText, globalTheme.actionSheetButtonText]}
          testID={`${testIDPrefix}_toggle_subscribe`}>
          {isSubscribed ? translate('Unsubscribe') : translate('Subscribe')}
        </Text>
      </TouchableHighlight>
    ]

    const completed = !!nowPlayingItem.episodeId && !!historyItemsIndex?.episodes?.[nowPlayingItem.episodeId]?.completed
    const label = completed ? translate('Mark as Unplayed') : translate('Mark as Played')
    if (!nowPlayingItem.liveItem && !nowPlayingItem.addByRSSPodcastFeedUrl) {
      children.push(
        <TouchableHighlight
          accessibilityLabel={label}
          key='mark_as_played'
          onPress={() => this._handleMarkAsPlayed(nowPlayingItem, completed, isLoggedIn)}
          style={[actionSheetStyles.button, globalTheme.actionSheetButton]}
          underlayColor={safelyUnwrapNestedVariable(() => globalTheme.actionSheetButtonUnderlay.backgroundColor, '')}>
          <Text
            style={[actionSheetStyles.buttonText, globalTheme.actionSheetButtonText]}
            testID={`${testIDPrefix}_go_to_podcast`}>
            {label}
          </Text>
        </TouchableHighlight>
      )
    }
    return children
  }

  _handleMarkAsPlayed = async (nowPlayingItem: NowPlayingItem, completed: boolean, isLoggedIn: boolean) => {
    if (isLoggedIn) {
      const shouldMarkAsPlayed = !completed
      await toggleMarkAsPlayed(nowPlayingItem, shouldMarkAsPlayed)
      if (shouldMarkAsPlayed) {
        playerPlayNextFromQueue()
      }
      this.props.handleDismiss()
    } else {
      Alert.alert(
        PV.Alerts.LOGIN_TO_MARK_EPISODES_AS_PLAYED.title,
        PV.Alerts.LOGIN_TO_MARK_EPISODES_AS_PLAYED.message,
        PV.Alerts.GO_TO_LOGIN_BUTTONS(this.props.navigation)
      )
    }
  }

  render() {
    const { handleDismiss, showModal, testID } = this.props
    const { volume } = this.state
    const { globalTheme } = this.global
    const items = this._headerActionSheetButtons()

    return (
      <ActionSheet showModal={showModal} testID={testID} handleCancelPress={handleDismiss}>
        {items}
        <View
          accessible={false}
          importantForAccessibility='no-hide-descendants'
          key='volume'
          style={[actionSheetStyles.button, actionSheetStyles.buttonBottom, globalTheme.actionSheetButton]}>
          <View style={styles.volumeSliderWrapper}>
            <Icon accessible={false} name='volume-down' size={28} style={styles.volumeSliderIcon} />
            <Slider
              minimumValue={0}
              maximumValue={1}
              onSlidingComplete={(value) => this._updateVolume(value)}
              onValueChange={(value) => this._updateVolume(value)}
              style={styles.volumeSlider}
              thumbStyle={sliderStyles.thumbStyle}
              thumbTintColor={PV.Colors.brandColor}
              value={volume}
            />
            <Icon accessible={false} name='volume-up' size={28} />
          </View>
        </View>
        <TouchableHighlight
          key='cancel'
          onPress={handleDismiss}
          style={[actionSheetStyles.buttonCancel, globalTheme.actionSheetButtonCancel]}
          testID={`${testIDPrefix}_cancel`.prependTestId()}
          underlayColor={safelyUnwrapNestedVariable(
            () => globalTheme.actionSheetButtonCancelUnderlay.backgroundColor,
            ''
          )}>
          <Text style={[actionSheetStyles.buttonText, globalTheme.actionSheetButtonTextCancel]}>Cancel</Text>
        </TouchableHighlight>
      </ActionSheet>
    )
  }
}

const styles = StyleSheet.create({
  volumeSliderIcon: {},
  volumeSlider: {
    flex: 1,
    marginHorizontal: 20
  },
  volumeSliderWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: 16
  }
})
