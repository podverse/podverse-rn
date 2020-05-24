import AsyncStorage from '@react-native-community/async-storage'
import NetInfo from '@react-native-community/netinfo'
import { Alert, StyleSheet } from 'react-native'
import Dialog from 'react-native-dialog'
import RNPickerSelect from 'react-native-picker-select'
import React from 'reactn'
import { Button, Divider, Icon, NumberSelectorWithText, ScrollView, SwitchWithText, Text, View } from '../components'
import {
  setDownloadedEpisodeLimitGlobalCount,
  setDownloadedEpisodeLimitGlobalDefault,
  updateAllDownloadedEpisodeLimitCounts,
  updateAllDownloadedEpisodeLimitDefaults
} from '../lib/downloadedEpisodeLimiter'
import { refreshDownloads } from '../lib/downloader'
import { testProps } from '../lib/utility'
import { PV } from '../resources'
import { gaTrackPageView } from '../services/googleAnalytics'
import { clearHistoryItems } from '../state/actions/history'
import { setcensorNSFWText } from '../state/actions/settings'
import { core, darkTheme, hidePickerIconOnAndroidTransparent, lightTheme } from '../styles'

type Props = {
  navigation: any
}

type State = {
  autoDeleteEpisodeOnEnd?: boolean
  downloadedEpisodeLimitCount: any
  downloadedEpisodeLimitDefault: any
  downloadingWifiOnly?: boolean
  hasLoaded?: boolean
  maximumSpeedOptionSelected?: any
  showSetAllDownloadDialog?: boolean
  showSetAllDownloadDialogIsCount?: boolean
}

export class SettingsScreen extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'Settings'
  }

  constructor(props: Props) {
    super(props)
    const { downloadedEpisodeLimitCount, downloadedEpisodeLimitDefault } = this.global
    const maximumSpeedSelectOptions = PV.Player.maximumSpeedSelectOptions
    this.state = {
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
    Alert.alert('Clear History', 'Are you sure you want to clear your history?', [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      {
        text: 'Yes',
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

  render() {
    const {
      downloadedEpisodeLimitCount,
      downloadedEpisodeLimitDefault,
      downloadingWifiOnly,
      maximumSpeedOptionSelected,
      showSetAllDownloadDialog,
      showSetAllDownloadDialogIsCount
    } = this.state
    const { globalTheme, censorNSFWText } = this.global
    const isDarkMode = globalTheme === darkTheme

    return (
      <ScrollView style={styles.wrapper} {...testProps('settings_screen_view')}>
        <SwitchWithText
          onValueChange={this._toggleTheme}
          text={`${globalTheme === darkTheme ? 'Dark Mode' : 'Light Mode'}`}
          value={globalTheme === darkTheme}
        />
        <SwitchWithText
          onValueChange={this._toggleDownloadingWifiOnly}
          text='Only allow downloading when connected to Wifi'
          value={!!downloadingWifiOnly}
        />
        {/* <SwitchWithText
          onValueChange={this._toggleAutoDeleteEpisodeOnEnd}
          text='Delete downloaded episodes after end is reached'
          value={!!autoDeleteEpisodeOnEnd} /> */}
        <SwitchWithText
          onValueChange={this._handleSelectDownloadedEpisodeLimitDefault}
          text='Limit the number of downloaded episodes for each podcast by default'
          value={!!downloadedEpisodeLimitDefault}
        />
        <NumberSelectorWithText
          handleChangeText={this._handleChangeDownloadedEpisodeLimitCountText}
          handleSubmitEditing={this._handleSetGlobalDownloadedEpisodeLimitCount}
          selectedNumber={downloadedEpisodeLimitCount}
          text='Default downloaded episode limit for each podcast'
        />
        <SwitchWithText
          onValueChange={this._handleToggleNSFWText}
          text='Censor NSFW language'
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
                Max playback speed
              </Text>
            </View>
          </View>
        </RNPickerSelect>
        <Divider style={styles.divider} />
        <Button onPress={this._handleClearHistory} wrapperStyles={styles.button} text={'Clear History'} />
        <Dialog.Container visible={showSetAllDownloadDialog}>
          <Dialog.Title>Global Update</Dialog.Title>
          <Dialog.Description>
            Do you want to update the download limit for all of your currently subscribed podcasts?
          </Dialog.Description>
          <Dialog.Button label='No' onPress={this._handleToggleSetAllDownloadDialog} />
          <Dialog.Button
            label='Yes'
            onPress={
              showSetAllDownloadDialogIsCount
                ? this._handleUpdateAllDownloadedEpiosdeLimitCount
                : this._handleUpdateAllDownloadedEpiosdeLimitDefault
            }
          />
        </Dialog.Container>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
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
    paddingBottom: 40,
    paddingHorizontal: 12,
    paddingTop: 8
  }
})

const placeholderItem = {
  label: 'Select...',
  value: null
}
