/* eslint-disable max-len */
import AsyncStorage from '@react-native-community/async-storage'
import { StyleSheet } from 'react-native'
import React from 'reactn'
import RNPickerSelect from 'react-native-picker-select'
import {
  Icon,
  NumberSelectorWithText,
  ScrollView,
  Text,
  View
} from '../components'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { handleFinishSettingPlayerTime, setPlayerJumpBackwards, setPlayerJumpForwards } from '../state/actions/settings'
import { core, darkTheme, hidePickerIconOnAndroidTransparent } from '../styles'

type Props = {
  navigation: any
}

type State = {
  maximumSpeedOptionSelected?: any
}

const testIDPrefix = 'settings_screen_player'

export class SettingsScreenPlayer extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)

    const maximumSpeedSelectOptions = PV.Player.maximumSpeedSelectOptions

    this.state = {
      maximumSpeedOptionSelected: maximumSpeedSelectOptions[1],
    }
  }

  static navigationOptions = () => ({
    title: translate('Player')
  })

  async componentDidMount() {
    const maximumSpeed = await AsyncStorage.getItem(PV.Keys.PLAYER_MAXIMUM_SPEED)
    const maximumSpeedSelectOptions = PV.Player.maximumSpeedSelectOptions
    const maximumSpeedOptionSelected = maximumSpeedSelectOptions.find((x: any) => x.value === Number(maximumSpeed))

    this.setState(
      {
        maximumSpeedOptionSelected: maximumSpeedOptionSelected || maximumSpeedSelectOptions[1]
      }
    )

    trackPageView('/settings-player', 'Settings Screen Player')
  }

  _setMaximumSpeed = (value: string) => {
    const maximumSpeedSelectOptions = PV.Player.maximumSpeedSelectOptions
    const maximumSpeedOptionSelected = maximumSpeedSelectOptions.find((x: any) => x.value === value) || placeholderItem
    this.setState({ maximumSpeedOptionSelected }, () => {
      (async () => {
        value
          ? await AsyncStorage.setItem(PV.Keys.PLAYER_MAXIMUM_SPEED, value.toString())
          : await AsyncStorage.removeItem(PV.Keys.PLAYER_MAXIMUM_SPEED)
      })()
    })
  }

  _setJumpBackwards = (value: string) => {
    setPlayerJumpBackwards(value)
  }

  _setJumpForwards = (value: string) => {
    setPlayerJumpForwards(value)
  }

  _finishSettingJumpTime = () => {
    handleFinishSettingPlayerTime()
  }

  render() {
    const { maximumSpeedOptionSelected } = this.state
    const { globalTheme, jumpBackwardsTime, jumpForwardsTime } = this.global
    const isDarkMode = globalTheme === darkTheme

    return (
      <ScrollView
        contentContainerStyle={styles.scrollViewContentContainer}
        style={styles.wrapper}
        testID={`${testIDPrefix}_view`}>
        <View style={core.itemWrapper}>
          <NumberSelectorWithText
            // eslint-disable-next-line max-len
            accessibilityHint={translate('ARIA HINT - set the number of seconds to change when time jump backwards is pressed')}
            // eslint-disable-next-line max-len
            accessibilityLabel={`${translate('Jump backwards seconds')}`}
            handleChangeText={this._setJumpBackwards}
            handleOnBlur={this._finishSettingJumpTime}
            selectedNumber={jumpBackwardsTime}
            testID={`${testIDPrefix}_jump_backwards_time`}
            text={translate('Jump backwards seconds')}
          />
        </View>
        <View style={core.itemWrapper}>
          <NumberSelectorWithText
            // eslint-disable-next-line max-len
            accessibilityHint={translate('ARIA HINT - set the number of seconds to change when time jump forwards is pressed')}
            // eslint-disable-next-line max-len
            accessibilityLabel={`${translate('Jump forwards seconds')}`}
            handleChangeText={this._setJumpForwards}
            handleOnBlur={this._finishSettingJumpTime}
            selectedNumber={jumpForwardsTime}
            testID={`${testIDPrefix}_jump_forwards_time`}
            text={translate('Jump forwards seconds')}
          />
        </View>
        <View style={core.itemWrapperReducedHeight}>
          <RNPickerSelect
            fixAndroidTouchableBug
            items={PV.Player.maximumSpeedSelectOptions}
            onValueChange={this._setMaximumSpeed}
            placeholder={placeholderItem}
            style={hidePickerIconOnAndroidTransparent(isDarkMode)}
            useNativeAndroidPickerStyle={false}
            value={maximumSpeedOptionSelected.value}>
            <View
              accessible
              accessibilityHint={`${translate('ARIA HINT - Max playback speed')}`}
              accessibilityLabel={`${translate('Max playback speed')} ${maximumSpeedOptionSelected.label}`}
              importantForAccessibility='yes'
              style={core.selectorWrapper}>
              <View
                accessible={false}
                importantForAccessibility='no-hide-descendants'
                style={core.selectorWrapperLeft}>
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.md}
                  style={[core.pickerSelect, globalTheme.text]}>
                  {maximumSpeedOptionSelected.label}
                </Text>
                <Icon name='angle-down' size={14} style={[core.pickerSelectIcon, globalTheme.text]} />
              </View>
              <View
                accessible={false}
                importantForAccessibility='no-hide-descendants'
                style={core.selectorWrapperRight}>
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.md}
                  style={[core.pickerSelect, globalTheme.text]}>
                  {translate('Max playback speed')}
                </Text>
              </View>
            </View>
          </RNPickerSelect>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  scrollViewContentContainer: {
    paddingBottom: 48
  },
  wrapper: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 12
  }
})

const placeholderItem = {
  label: 'Select',
  value: null
}
