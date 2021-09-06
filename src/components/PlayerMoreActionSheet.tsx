import { Alert, StyleSheet, TouchableHighlight, View } from 'react-native'
import { Slider } from 'react-native-elements'
import SystemSetting from 'react-native-system-setting'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { navigateToPodcastScreenWithPodcast } from '../lib/navigate'
import { alertIfNoNetworkConnection } from '../lib/network'
import { safelyUnwrapNestedVariable } from '../lib/utility'
import { PV } from '../resources'
import { getAddByRSSPodcastLocally } from '../services/parser'
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

export class PlayerMoreActionSheet extends React.Component<Props, State> {
  constructor() {
    super()

    this.state = {}
  }

  async componentDidMount() {
    const volume = await SystemSetting.getVolume()
    this.setState({ volume })

    volumeListener = SystemSetting.addVolumeListener((data: any) => {
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
        } else {
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

  _handlePodcastPagePress = async () => {
    const { navigation } = this.props
    const { player } = this.global
    const { episode, nowPlayingItem } = player
    let podcast = episode?.podcast || {}

    if (nowPlayingItem && nowPlayingItem.addByRSSPodcastFeedUrl) {
      podcast = await getAddByRSSPodcastLocally(nowPlayingItem.addByRSSPodcastFeedUrl)
    }

    navigateToPodcastScreenWithPodcast(navigation, podcast)
  }

  _headerActionSheetButtons = () => {
    const { globalTheme, player, session } = this.global

    // nowPlayingItem will be undefined when loading from a deep link
    let { nowPlayingItem } = player
    nowPlayingItem = nowPlayingItem || {}

    const subscribedPodcastIds = safelyUnwrapNestedVariable(() => session.userInfo.subscribedPodcastIds, [])
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
      </TouchableHighlight>,
      <TouchableHighlight
        key='podcastPage'
        onPress={this._handlePodcastPagePress}
        style={[actionSheetStyles.button, globalTheme.actionSheetButton]}
        underlayColor={safelyUnwrapNestedVariable(() => globalTheme.actionSheetButtonUnderlay.backgroundColor, '')}>
        <Text
          style={[actionSheetStyles.buttonText, globalTheme.actionSheetButtonText]}
          testID={`${testIDPrefix}_go_to_podcast`}>
          {translate('Go to Podcast')}
        </Text>
      </TouchableHighlight>
    ]

    return children
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
            <Icon
              accessible={false}
              name='volume-down'
              size={28}
              style={styles.volumeSliderIcon} />
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
