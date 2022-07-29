/* eslint-disable max-len */
import AsyncStorage from '@react-native-community/async-storage'
import { StyleSheet } from 'react-native'
import Config from 'react-native-config'
import Dialog from 'react-native-dialog'
import React from 'reactn'
import { ActivityIndicator, Button, Divider, ScrollView, SwitchWithText, View } from '../components'
import { translate } from '../lib/i18n'
import { deleteImageCache } from '../lib/storage'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import { toggleHideNewEpisodesBadges } from '../state/actions/newEpisodesCount'
import { setCensorNSFWText, setHideCompleted } from '../state/actions/settings'
import { core, darkTheme, lightTheme } from '../styles'

type Props = {
  navigation: any
}

type State = {
  isLoading?: boolean
  showDeleteCacheDialog?: boolean
}

const testIDPrefix = 'settings_screen_other'

export class SettingsScreenOther extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      isLoading: false,
      showDeleteCacheDialog: false
    }
  }

  static navigationOptions = () => ({
    title: translate('Other')
  })

  componentDidMount() {
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

  _handleToggleDeleteCacheDialog = () => {
    this.setState({
      showDeleteCacheDialog: !this.state.showDeleteCacheDialog
    })
  }

  _handleDeleteCache = () => {
    this.setState(
      {
        isLoading: true,
        showDeleteCacheDialog: false
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
    const { isLoading, showDeleteCacheDialog } = this.state
    const { censorNSFWText, globalTheme, hideCompleted, hideNewEpisodesBadges } = this.global

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
                  accessibilityLabel={`${globalTheme === darkTheme ? translate('Dark Mode') : translate('Light Mode')}`}
                  onValueChange={this._toggleTheme}
                  testID={`${testIDPrefix}_dark_mode`}
                  text={`${globalTheme === darkTheme ? translate('Dark Mode') : translate('Light Mode')}`}
                  value={globalTheme === darkTheme}
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
            <Divider />
            <Button
              accessibilityLabel={translate('Delete cache')}
              onPress={this._handleToggleDeleteCacheDialog}
              testID={`${testIDPrefix}_delete_cache`}
              text={translate('Delete cache')}
              wrapperStyles={core.buttonWithMarginTop}
            />
            <Dialog.Container visible={showDeleteCacheDialog}>
              <Dialog.Title>{translate('Delete cache')}</Dialog.Title>
              <Dialog.Description>{translate('Are you sure you want to delete the cache')}</Dialog.Description>
              <Dialog.Button
                label={translate('No')}
                onPress={this._handleToggleDeleteCacheDialog}
                {...(testIDPrefix ? { testID: `${testIDPrefix}_dialog_delete_cache_no`.prependTestId() } : {})}
              />
              <Dialog.Button
                label={translate('Yes')}
                onPress={this._handleDeleteCache}
                {...(testIDPrefix ? { testID: `${testIDPrefix}_dialog_delete_cache_yes`.prependTestId() } : {})}
              />
            </Dialog.Container>
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
