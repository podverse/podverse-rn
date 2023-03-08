/* eslint-disable max-len */
import AsyncStorage from '@react-native-community/async-storage'
import { Alert, StyleSheet } from 'react-native'
import Config from 'react-native-config'
import RNPickerSelect from 'react-native-picker-select'
import React from 'reactn'
import {
  ActivityIndicator,
  Button,
  Divider,
  Icon,
  NumberSelectorWithText,
  ScrollView,
  SwitchWithText,
  Text,
  View
} from '../components'
import { translate } from '../lib/i18n'
import { deleteImageCache } from '../lib/storage'
import { PV } from '../resources'
import { getCustomLaunchScreenKey, setCustomLaunchScreenKey } from '../services/customLaunchScreen'
import { trackPageView } from '../services/tracking'
import { setCustomRSSParallelParserLimit } from '../state/actions/customRSSParallelParserLimit'
import { toggleHideNewEpisodesBadges } from '../state/actions/newEpisodesCount'
import { toggleHideDividersInLists } from '../state/actions/settings-ui'
import { setCensorNSFWText, setHideCompleted } from '../state/actions/settings'
import { core, darkTheme, hidePickerIconOnAndroidTransparent, lightTheme } from '../styles'

type Props = {
  navigation: any
}

type State = {
  customLaunchScreenOptionSelected: {
    label: string
    value: string
  }
  customRSSParallelParserLimit: string
  isLoading?: boolean
}

const testIDPrefix = 'settings_screen_other'

export class SettingsScreenOther extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    const { customRSSParallelParserLimit } = this.global

    this.state = {
      customLaunchScreenOptionSelected: PV.CustomLaunchScreen.getCustomLaunchScreenOption(
        PV.CustomLaunchScreen.defaultLaunchScreenKey
      ),
      customRSSParallelParserLimit: customRSSParallelParserLimit?.toString(),
      isLoading: false
    }
  }

  static navigationOptions = () => ({
    title: translate('Other')
  })

  async componentDidMount() {
    const customLaunchScreenKey = await getCustomLaunchScreenKey()
    const customLaunchScreenOptionSelected = PV.CustomLaunchScreen.getCustomLaunchScreenOption(customLaunchScreenKey)
    this.setState({ customLaunchScreenOptionSelected })

    trackPageView('/settings-others', 'Settings Screen Other')
  }

  _handleToggleNSFWText = async () => {
    const censorNSFWText = await AsyncStorage.getItem(PV.Keys.CENSOR_NSFW_TEXT)
    setCensorNSFWText(!censorNSFWText)
  }

  _handleToggleHideCompletedByDefault = async () => {
    const hideCompleted = await AsyncStorage.getItem(PV.Keys.HIDE_COMPLETED)
    setHideCompleted(!hideCompleted)
  }

  _toggleTheme = async () => {
    const darkModeEnabled = await AsyncStorage.getItem(PV.Keys.DARK_MODE_ENABLED)
    const newDarkModeSetting = darkModeEnabled === 'TRUE'
    this.setGlobal({ globalTheme: !newDarkModeSetting ? darkTheme : lightTheme }, async () => {
      !newDarkModeSetting
        ? await AsyncStorage.setItem(PV.Keys.DARK_MODE_ENABLED, 'TRUE')
        : await AsyncStorage.setItem(PV.Keys.DARK_MODE_ENABLED, 'FALSE')
    })
  }

  _setCustomLaunchScreen = async (value: string) => {
    const customLaunchScreenOptionSelected = PV.CustomLaunchScreen.getCustomLaunchScreenOption(value)
    this.setState({ customLaunchScreenOptionSelected })
    await setCustomLaunchScreenKey(value)
  }

  _handleChangeCustomRSSParallelParserLimit = (value: string) => {
    this.setState({ customRSSParallelParserLimit: value })
  }

  _handleSetCustomRSSParallelParserLimit = () => {
    const { customRSSParallelParserLimit } = this.state
    const parsedLimit = parseInt(customRSSParallelParserLimit, 10)
    const safeLimit = parsedLimit >= 1 && !isNaN(parsedLimit) ? parsedLimit : 3
    this.setState({ customRSSParallelParserLimit: safeLimit.toString() })
    setCustomRSSParallelParserLimit(safeLimit)
  }

  _handleShowDeleteCacheDialog = () => {
    const DELETE_CACHE = PV.Alerts.DELETE_CACHE(() => this._handleDeleteCache)
    Alert.alert(DELETE_CACHE.title, DELETE_CACHE.message, DELETE_CACHE.buttons)
  }

  _handleDeleteCache = () => {
    this.setState(
      {
        isLoading: true
      },
      () => {
        (async () => {
          try {
            await deleteImageCache()
          } catch (error) {
            //
          }
          this.setState({ isLoading: false })
        })()
      }
    )
  }

  render() {
    const { customLaunchScreenOptionSelected, customRSSParallelParserLimit, isLoading } = this.state
    const { censorNSFWText, globalTheme, hideCompleted, hideDividersInLists, hideNewEpisodesBadges } = this.global
    const isDarkMode = globalTheme === darkTheme

    return (
      <ScrollView
        contentContainerStyle={styles.scrollViewContentContainer}
        style={styles.wrapper}
        testID={`${testIDPrefix}_view`}>
        {isLoading && <ActivityIndicator fillSpace testID={testIDPrefix} />}
        {!isLoading && (
          <>
            {!Config.DISABLE_THEME_SWITCH && (
              <View style={core.itemWrapper}>
                <SwitchWithText
                  accessible={false}
                  accessibilityHint={translate('ARIA HINT - change the colors of the user interface')}
                  accessibilityLabel={`${isDarkMode ? translate('Dark Mode') : translate('Light Mode')}`}
                  onValueChange={this._toggleTheme}
                  testID={`${testIDPrefix}_dark_mode`}
                  text={`${isDarkMode ? translate('Dark Mode') : translate('Light Mode')}`}
                  value={isDarkMode}
                />
              </View>
            )}
            <View style={core.itemWrapper}>
              <SwitchWithText
                accessibilityLabel={translate('Censor NSFW text')}
                onValueChange={this._handleToggleNSFWText}
                testID={`${testIDPrefix}_censor_nsfw_text`}
                text={translate('Censor NSFW text')}
                value={!!censorNSFWText}
              />
            </View>
            <View style={core.itemWrapper}>
              <SwitchWithText
                accessibilityLabel={translate('Hide completed episodes by default')}
                onValueChange={this._handleToggleHideCompletedByDefault}
                testID={`${testIDPrefix}_hide_completed`}
                text={translate('Hide completed episodes by default')}
                value={!!hideCompleted}
              />
            </View>
            <View style={core.itemWrapper}>
              <SwitchWithText
                accessibilityLabel={translate('Hide new episode count badges')}
                onValueChange={toggleHideNewEpisodesBadges}
                testID={`${testIDPrefix}_hide_new_episodes_badges`}
                text={translate('Hide new episode count badges')}
                value={!!hideNewEpisodesBadges}
              />
            </View>
            <View style={core.itemWrapper}>
              <SwitchWithText
                accessibilityLabel={translate('Hide dividers in lists')}
                onValueChange={toggleHideDividersInLists}
                testID={`${testIDPrefix}_hide_dividers_in_lists`}
                text={translate('Hide dividers in lists')}
                value={!!hideDividersInLists}
              />
            </View>
            <View style={core.itemWrapperReducedHeight}>
              <RNPickerSelect
                fixAndroidTouchableBug
                items={PV.CustomLaunchScreen.customLaunchScreenOptions}
                onValueChange={this._setCustomLaunchScreen}
                style={hidePickerIconOnAndroidTransparent(isDarkMode)}
                useNativeAndroidPickerStyle={false}
                value={customLaunchScreenOptionSelected.value}>
                <View
                  accessible
                  accessibilityLabel={`${translate('Launch screen')} ${customLaunchScreenOptionSelected.label}`}
                  importantForAccessibility='yes'
                  style={core.selectorWrapper}>
                  <View
                    accessible={false}
                    importantForAccessibility='no-hide-descendants'
                    style={core.selectorWrapperLeft}>
                    <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={[core.pickerSelect, globalTheme.text]}>
                      {customLaunchScreenOptionSelected.label}
                    </Text>
                    <Icon name='angle-down' size={14} style={[core.pickerSelectIcon, globalTheme.text]} />
                  </View>
                  <View
                    accessible={false}
                    importantForAccessibility='no-hide-descendants'
                    style={core.selectorWrapperRight}>
                    <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={[core.pickerSelect, globalTheme.text]}>
                      {translate('Launch screen')}
                    </Text>
                  </View>
                </View>
              </RNPickerSelect>
            </View>
            <View style={core.itemWrapper}>
              <NumberSelectorWithText
                accessibilityLabel={`${translate('Custom RSS feeds to parse in parallel')}`}
                handleChangeText={this._handleChangeCustomRSSParallelParserLimit}
                handleSubmitEditing={this._handleSetCustomRSSParallelParserLimit}
                selectedNumber={customRSSParallelParserLimit}
                subText={translate('Custom RSS feeds to parse in parallel helper text')}
                testID={`${testIDPrefix}_custom_rss_parallel_parser_limit`}
                text={translate('Custom RSS feeds to parse in parallel')}
              />
            </View>
            <Divider />
            <Button
              accessibilityLabel={translate('Delete cache')}
              onPress={this._handleShowDeleteCacheDialog}
              testID={`${testIDPrefix}_delete_cache`}
              text={translate('Delete cache')}
              wrapperStyles={core.buttonWithMarginTop}
            />
          </>
        )}
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
