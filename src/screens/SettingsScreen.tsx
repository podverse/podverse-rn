import AsyncStorage from '@react-native-community/async-storage'
import NetInfo from '@react-native-community/netinfo'
import { Alert, StyleSheet } from 'react-native'
import Dialog from 'react-native-dialog'
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
import {
  setDownloadedEpisodeLimitGlobalCount,
  setDownloadedEpisodeLimitGlobalDefault,
  updateAllDownloadedEpisodeLimitCounts,
  updateAllDownloadedEpisodeLimitDefaults
} from '../lib/downloadedEpisodeLimiter'
import { removeAllDownloadedPodcasts } from '../lib/downloadedPodcast'
import { refreshDownloads } from '../lib/downloader'
import { translate } from '../lib/i18n'
import { testProps } from '../lib/utility'
import { PV } from '../resources'
import { gaTrackPageView } from '../services/googleAnalytics'
import { deleteLoggedInUser } from '../services/user'
import { logoutUser } from '../state/actions/auth'
import * as DownloadState from '../state/actions/downloads'
import { clearHistoryItems } from '../state/actions/history'
import { setcensorNSFWText } from '../state/actions/settings'
import { core, darkTheme, hidePickerIconOnAndroidTransparent, lightTheme } from '../styles'

type Props = {
  navigation: any
}

type State = {
  autoDeleteEpisodeOnEnd?: boolean
  deleteAccountDialogText: string
  deleteAccountDialogConfirmed?: boolean
  downloadedEpisodeLimitCount: any
  downloadedEpisodeLimitDefault: any
  downloadingWifiOnly?: boolean
  hasLoaded?: boolean
  isLoading?: boolean
  maximumSpeedOptionSelected?: any
  showDeleteAccountDialog?: boolean
  showDeleteDownloadedEpisodesDialog?: boolean
  showSetAllDownloadDialog?: boolean
  showSetAllDownloadDialogIsCount?: boolean
}

export class SettingsScreen extends React.Component<Props, State> {
  static navigationOptions = () => {
    return {
      title: translate('Settings')
    }
  }

  constructor(props: Props) {
    super(props)
    const { downloadedEpisodeLimitCount, downloadedEpisodeLimitDefault } = this.global
    const maximumSpeedSelectOptions = PV.Player.maximumSpeedSelectOptions
    this.state = {
      deleteAccountDialogText: '',
      downloadedEpisodeLimitCount,
      downloadedEpisodeLimitDefault,
      maximumSpeedOptionSelected: maximumSpeedSelectOptions[1]
    }
  }

  async componentDidMount() {
    const downloadingWifiOnly = await AsyncStorage.getItem(PV.Keys.DOWNLOADING_WIFI_ONLY)
    const autoDeleteEpisodeOnEnd = await AsyncStorage.getItem(PV.Keys.AUTO_DELETE_EPISODE_ON_END)
    const downloadedEpisodeLimitCount = await AsyncStorage.getItem(PV.Keys.DOWNLOADED_EPISODE_LIMIT_GLOBAL_COUNT)
    const downloadedEpisodeLimitDefault = await AsyncStorage.getItem(PV.Keys.DOWNLOADED_EPISODE_LIMIT_GLOBAL_DEFAULT)
    const maximumSpeed = await AsyncStorage.getItem(PV.Keys.PLAYER_MAXIMUM_SPEED)
    const maximumSpeedSelectOptions = PV.Player.maximumSpeedSelectOptions
    const maximumSpeedOptionSelected = maximumSpeedSelectOptions.find((x: any) => x.value === Number(maximumSpeed))

    this.setState(
      {
        autoDeleteEpisodeOnEnd: !!autoDeleteEpisodeOnEnd,
        downloadedEpisodeLimitCount,
        downloadedEpisodeLimitDefault,
        downloadingWifiOnly: !!downloadingWifiOnly,
        maximumSpeedOptionSelected: maximumSpeedOptionSelected || maximumSpeedSelectOptions[1]
      },
      () => this.setState({ hasLoaded: true })
    )

    gaTrackPageView('/settings', 'Settings Screen')
  }

  _toggleTheme = (value: boolean) => {
    this.setGlobal({ globalTheme: value ? darkTheme : lightTheme }, async () => {
      value
        ? await AsyncStorage.setItem(PV.Keys.DARK_MODE_ENABLED, 'TRUE')
        : await AsyncStorage.setItem(PV.Keys.DARK_MODE_ENABLED, 'FALSE')
    })
  }

  _toggleDownloadingWifiOnly = (value: boolean) => {
    NetInfo.fetch().then((state) => {
      if (!value && state.type === 'cellular') {
        refreshDownloads()
      }
    })

    this.setState({ downloadingWifiOnly: value }, async () => {
      value
        ? await AsyncStorage.setItem(PV.Keys.DOWNLOADING_WIFI_ONLY, 'TRUE')
        : await AsyncStorage.removeItem(PV.Keys.DOWNLOADING_WIFI_ONLY)
    })
  }

  _toggleAutoDeleteEpisodeOnEnd = (value: boolean) => {
    this.setState({ autoDeleteEpisodeOnEnd: value }, async () => {
      value
        ? await AsyncStorage.setItem(PV.Keys.AUTO_DELETE_EPISODE_ON_END, 'TRUE')
        : await AsyncStorage.removeItem(PV.Keys.AUTO_DELETE_EPISODE_ON_END)
    })
  }

  _setMaximumSpeed = (value: string) => {
    const maximumSpeedSelectOptions = PV.Player.maximumSpeedSelectOptions
    const maximumSpeedOptionSelected = maximumSpeedSelectOptions.find((x: any) => x.value === value) || placeholderItem
    this.setState({ maximumSpeedOptionSelected }, async () => {
      value
        ? await AsyncStorage.setItem(PV.Keys.PLAYER_MAXIMUM_SPEED, value.toString())
        : await AsyncStorage.removeItem(PV.Keys.PLAYER_MAXIMUM_SPEED)
    })
  }

  _handleChangeDownloadedEpisodeLimitCountText = (value: number) => {
    this.setState({ downloadedEpisodeLimitCount: value })
  }

  _handleSetGlobalDownloadedEpisodeLimitCount = async () => {
    const { downloadedEpisodeLimitCount } = this.state
    await setDownloadedEpisodeLimitGlobalCount(downloadedEpisodeLimitCount)
    this._handleToggleSetAllDownloadDialog(true)
    this.setGlobal({ downloadedEpisodeLimitCount })
  }

  _handleSelectDownloadedEpisodeLimitDefault = (value: boolean) => {
    this.setState({ downloadedEpisodeLimitDefault: value }, async () => {
      await setDownloadedEpisodeLimitGlobalDefault(value)
      this._handleToggleSetAllDownloadDialog()
      this.setGlobal({ downloadedEpisodeLimitDefault: value })
    })
  }

  _handleToggleSetAllDownloadDialog = (isCount?: boolean) => {
    this.setState({
      showSetAllDownloadDialog: !this.state.showSetAllDownloadDialog,
      showSetAllDownloadDialogIsCount: isCount
    })
  }

  _handleUpdateAllDownloadedEpiosdeLimitCount = async () => {
    await updateAllDownloadedEpisodeLimitCounts(this.state.downloadedEpisodeLimitCount)
    this.setState({ showSetAllDownloadDialog: false })
  }

  _handleUpdateAllDownloadedEpiosdeLimitDefault = async () => {
    await updateAllDownloadedEpisodeLimitDefaults(this.state.downloadedEpisodeLimitDefault)
    this.setState({ showSetAllDownloadDialog: false })
  }

  _handleToggleNSFWText = async (value: boolean) => {
    await setcensorNSFWText(value)
  }

  _handleClearHistory = () => {
    Alert.alert(translate('Clear History'), translate('Are you sure you want to clear your history'), [
      {
        text: translate('Cancel'),
        style: translate('cancel')
      },
      {
        text: translate('Yes'),
        onPress: () => {
          this.setState(
            {
              isLoading: true
            },
            async () => {
              try {
                await clearHistoryItems()
                this.setState({
                  historyItems: [],
                  isLoading: false
                })
              } catch (error) {
                this.setState({ isLoading: false })
              }
            }
          )
        }
      }
    ])
  }

  _handleToggleDeleteDownloadedEpisodesDialog = () => {
    this.setState({
      showDeleteDownloadedEpisodesDialog: !this.state.showDeleteDownloadedEpisodesDialog
    })
  }

  _handleDeleteDownloadedEpisodes = () => {
    this.setState(
      {
        isLoading: true,
        showDeleteDownloadedEpisodesDialog: false
      },
      async () => {
        try {
          await removeAllDownloadedPodcasts()
        } catch (error) {
          //
        }
        DownloadState.updateDownloadedPodcasts()
        this.setState({ isLoading: false })
      }
    )
  }

  _handleToggleDeleteAccountDialog = () => {
    this.setState({
      deleteAccountDialogText: '',
      deleteAccountDialogConfirmed: false,
      showDeleteAccountDialog: !this.state.showDeleteAccountDialog
    })
  }

  _handleDeleteAccountDialogTextChange = (text: string) => {
    this.setState({
      deleteAccountDialogConfirmed: !!text && text.toUpperCase() === translate('DELETE'),
      deleteAccountDialogText: text
    })
  }

  _handleDeleteAccount = async () => {
    const { deleteAccountDialogText } = this.state

    try {
      if (deleteAccountDialogText && deleteAccountDialogText.toUpperCase() === translate('DELETE')) {
        await deleteLoggedInUser()
        await logoutUser()
        this.setState({ showDeleteAccountDialog: false })
      }
    } catch (error) {
      this.setState({ showDeleteAccountDialog: false }, () => {
        setTimeout(() => {
          Alert.alert(
            PV.Alerts.SOMETHING_WENT_WRONG.title,
            PV.Alerts.SOMETHING_WENT_WRONG.message,
            PV.Alerts.BUTTONS.OK
          )
        }, 1500)
      })
    }
  }

  render() {
    const {
      deleteAccountDialogConfirmed,
      deleteAccountDialogText,
      downloadedEpisodeLimitCount,
      downloadedEpisodeLimitDefault,
      downloadingWifiOnly,
      isLoading,
      maximumSpeedOptionSelected,
      showDeleteAccountDialog,
      showSetAllDownloadDialog,
      showSetAllDownloadDialogIsCount,
      showDeleteDownloadedEpisodesDialog
    } = this.state
    const { censorNSFWText, globalTheme, session } = this.global
    const { isLoggedIn } = session

    const isDarkMode = globalTheme === darkTheme

    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={styles.wrapper} {...testProps('settings_screen_view')}>
        {isLoading && <ActivityIndicator styles={styles.activityIndicator} />}
        {!isLoading && (
          <View>
            <SwitchWithText
              onValueChange={this._toggleTheme}
              text={`${globalTheme === darkTheme ? translate('Dark Mode') : translate('Light Mode')}`}
              value={globalTheme === darkTheme}
            />
            <SwitchWithText
              onValueChange={this._toggleDownloadingWifiOnly}
              text={translate('Only allow downloading when connected to Wifi')}
              value={!!downloadingWifiOnly}
            />
            {/* <SwitchWithText
              onValueChange={this._toggleAutoDeleteEpisodeOnEnd}
              text='Delete downloaded episodes after end is reached'
              value={!!autoDeleteEpisodeOnEnd} /> */}
            <SwitchWithText
              onValueChange={this._handleSelectDownloadedEpisodeLimitDefault}
              text={translate('Limit the number of downloaded episodes for each podcast by default')}
              value={!!downloadedEpisodeLimitDefault}
            />
            <NumberSelectorWithText
              handleChangeText={this._handleChangeDownloadedEpisodeLimitCountText}
              handleSubmitEditing={this._handleSetGlobalDownloadedEpisodeLimitCount}
              selectedNumber={downloadedEpisodeLimitCount}
              text={translate('Default downloaded episode limit for each podcast')}
            />
            <SwitchWithText
              onValueChange={this._handleToggleNSFWText}
              text={translate('Censor NSFW language')}
              value={!!censorNSFWText}
            />
            <RNPickerSelect
              items={PV.Player.maximumSpeedSelectOptions}
              onValueChange={this._setMaximumSpeed}
              placeholder={placeholderItem}
              style={hidePickerIconOnAndroidTransparent(isDarkMode)}
              useNativeAndroidPickerStyle={false}
              value={maximumSpeedOptionSelected.value}>
              <View style={core.selectorWrapper}>
                <View style={core.selectorWrapperLeft}>
                  <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={[styles.pickerSelect, globalTheme.text]}>
                    {maximumSpeedOptionSelected.label}
                  </Text>
                  <Icon name='angle-down' size={14} style={[styles.pickerSelectIcon, globalTheme.text]} />
                </View>
                <View style={core.selectorWrapperRight}>
                  <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={[styles.pickerSelect, globalTheme.text]}>
                    {translate('Max playback speed')}
                  </Text>
                </View>
              </View>
            </RNPickerSelect>
            <Divider style={styles.divider} />
            <Button
              onPress={this._handleClearHistory}
              wrapperStyles={styles.button}
              text={translate('Clear History')}
            />

            <Divider style={styles.divider} />
            <Button
              onPress={this._handleToggleDeleteDownloadedEpisodesDialog}
              wrapperStyles={styles.button}
              text={translate('Delete Downloaded Episodes')}
            />

            {isLoggedIn && (
              <View>
                <Divider style={styles.divider} />
                <Button
                  isWarning={true}
                  onPress={this._handleToggleDeleteAccountDialog}
                  text={translate('Delete Account')}
                  wrapperStyles={styles.button}
                />
              </View>
            )}
          </View>
        )}
        <Dialog.Container visible={showSetAllDownloadDialog}>
          <Dialog.Title>{translate('Global Update')}</Dialog.Title>
          <Dialog.Description>
            {translate('Do you want to update the download limit for all of your currently subscribed podcasts?')}
          </Dialog.Description>
          <Dialog.Button label={translate('No')} onPress={this._handleToggleSetAllDownloadDialog} />
          <Dialog.Button
            label={translate('Yes')}
            onPress={
              showSetAllDownloadDialogIsCount
                ? this._handleUpdateAllDownloadedEpiosdeLimitCount
                : this._handleUpdateAllDownloadedEpiosdeLimitDefault
            }
          />
        </Dialog.Container>

        <Dialog.Container visible={showDeleteDownloadedEpisodesDialog}>
          <Dialog.Title>{translate('Delete All Downloaded Episodes')}</Dialog.Title>
          <Dialog.Description>
            {translate('Are you sure you want to delete all of your downloaded episodes?')}
          </Dialog.Description>
          <Dialog.Button label={translate('No')} onPress={this._handleToggleDeleteDownloadedEpisodesDialog} />
          <Dialog.Button label={translate('Yes')} onPress={this._handleDeleteDownloadedEpisodes} />
        </Dialog.Container>

        <Dialog.Container visible={showDeleteAccountDialog}>
          <Dialog.Title>{translate('Delete Account')}</Dialog.Title>
          <Dialog.Description>{translate('Are you sure you want to delete your account?')}</Dialog.Description>
          <Dialog.Description>{translate('Type DELETE in the input below to confirm')}</Dialog.Description>
          <Dialog.Input
            onChangeText={this._handleDeleteAccountDialogTextChange}
            placeholder=''
            value={deleteAccountDialogText}
          />
          <Dialog.Button label={translate('Cancel')} onPress={this._handleToggleDeleteAccountDialog} />
          <Dialog.Button
            bold={deleteAccountDialogConfirmed}
            color={deleteAccountDialogConfirmed ? PV.Colors.redDarker : PV.Colors.grayDark}
            disabled={!deleteAccountDialogConfirmed}
            label={translate('Delete')}
            onPress={this._handleDeleteAccount}
          />
        </Dialog.Container>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  activityIndicator: {
    paddingTop: 40
  },
  button: {
    marginVertical: 8
  },
  divider: {
    marginVertical: 16
  },
  pickerSelect: {
    flex: 0,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  },
  pickerSelectIcon: {
    flex: 0,
    paddingHorizontal: 4
  },
  wrapper: {
    flex: 1,
    paddingBottom: 40,
    paddingHorizontal: 12,
    paddingTop: 8
  }
})

const placeholderItem = {
  label: 'Select',
  value: null
}
