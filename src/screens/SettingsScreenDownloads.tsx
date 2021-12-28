/* eslint-disable max-len */
import AsyncStorage from '@react-native-community/async-storage'
import NetInfo from '@react-native-community/netinfo'
import { StyleSheet, PermissionsAndroid, Platform, Alert, Linking } from 'react-native'
import Dialog from 'react-native-dialog'
import React from 'reactn'
import RNFS from 'react-native-fs'

import { ActivityIndicator, Button, NumberSelectorWithText, ScrollView, SwitchWithText, View } from '../components'
import {
  setDownloadedEpisodeLimitGlobalCount,
  setDownloadedEpisodeLimitGlobalDefault,
  updateAllDownloadedEpisodeLimitCounts,
  updateAllDownloadedEpisodeLimitDefaults
} from '../lib/downloadedEpisodeLimiter'
import {
  moveDownloadedPodcastsToExternalStorage,
  removeAllDownloadedPodcasts,
  removeDownloadedPodcastsFromInternalStorage
} from '../lib/downloadedPodcast'
import { refreshDownloads } from '../lib/downloader'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import * as DownloadState from '../state/actions/downloads'
import { core } from '../styles'
import { networkSupported } from '../lib/network'

type Props = {
  navigation: any
}

type State = {
  autoDeleteEpisodeOnEnd?: boolean
  downloadedEpisodeLimitCount: any
  downloadedEpisodeLimitDefault: any
  downloadingWifiOnly?: boolean
  isLoading?: boolean
  showDeleteDownloadedEpisodesDialog?: boolean
  showSetAllDownloadDialog?: boolean
  showSetAllDownloadDialogIsCount?: boolean
  customDownloadLocation?: string | null
}

const testIDPrefix = 'settings_screen_downloads'

export class SettingsScreenDownloads extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {}
  }

  static navigationOptions = () => ({
    title: translate('Downloads')
  })

  async componentDidMount() {
    const autoDeleteEpisodeOnEnd = await AsyncStorage.getItem(PV.Keys.AUTO_DELETE_EPISODE_ON_END)
    const downloadedEpisodeLimitCount = await AsyncStorage.getItem(PV.Keys.DOWNLOADED_EPISODE_LIMIT_GLOBAL_COUNT)
    const downloadedEpisodeLimitDefault = await AsyncStorage.getItem(PV.Keys.DOWNLOADED_EPISODE_LIMIT_GLOBAL_DEFAULT)
    const downloadingWifiOnly = await AsyncStorage.getItem(PV.Keys.DOWNLOADING_WIFI_ONLY)
    const customDownloadLocation = await AsyncStorage.getItem(PV.Keys.EXT_STORAGE_DLOAD_LOCATION)

    this.setState({
      autoDeleteEpisodeOnEnd: !!autoDeleteEpisodeOnEnd,
      downloadedEpisodeLimitCount,
      downloadedEpisodeLimitDefault,
      downloadingWifiOnly: !!downloadingWifiOnly,
      customDownloadLocation
    })

    trackPageView('/settings-downloads', 'Settings Screen Downloads')
  }

  _toggleDownloadingWifiOnly = async () => {
    const downloadingWifiOnly = await AsyncStorage.getItem(PV.Keys.DOWNLOADING_WIFI_ONLY)
    const newValue = downloadingWifiOnly !== 'TRUE'

    const state = await NetInfo.fetch()
    if (!newValue && networkSupported(state)) {
      refreshDownloads()
    }

    this.setState({ downloadingWifiOnly: newValue }, () => {
      newValue
        ? AsyncStorage.setItem(PV.Keys.DOWNLOADING_WIFI_ONLY, 'TRUE')
        : AsyncStorage.removeItem(PV.Keys.DOWNLOADING_WIFI_ONLY)
    })
  }

  _toggleAutoDeleteEpisodeOnEnd = (value: boolean) => {
    this.setState({ autoDeleteEpisodeOnEnd: value }, () => {
      (async () => {
        value
          ? await AsyncStorage.setItem(PV.Keys.AUTO_DELETE_EPISODE_ON_END, 'TRUE')
          : await AsyncStorage.removeItem(PV.Keys.AUTO_DELETE_EPISODE_ON_END)
      })()
    })
  }

  _handleSelectDownloadedEpisodeLimitDefault = () => {
    const newDownloadedEpisodeLimitDefault = !this.state.downloadedEpisodeLimitDefault
    this.setState({ downloadedEpisodeLimitDefault: newDownloadedEpisodeLimitDefault }, () => {
      (async () => {
        await setDownloadedEpisodeLimitGlobalDefault(newDownloadedEpisodeLimitDefault)
        this._handleToggleSetAllDownloadDialog()
        this.setGlobal({ downloadedEpisodeLimitDefault: newDownloadedEpisodeLimitDefault })
      })()
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

  _handleChangeDownloadedEpisodeLimitCountText = (value: number) => {
    this.setState({ downloadedEpisodeLimitCount: value })
  }

  _handleSetGlobalDownloadedEpisodeLimitCount = async () => {
    const { downloadedEpisodeLimitCount } = this.state
    await setDownloadedEpisodeLimitGlobalCount(downloadedEpisodeLimitCount)
    this._handleToggleSetAllDownloadDialog(true)
    this.setGlobal({ downloadedEpisodeLimitCount })
  }

  _handleToggleDeleteDownloadedEpisodesDialog = () => {
    this.setState({
      showDeleteDownloadedEpisodesDialog: !this.state.showDeleteDownloadedEpisodesDialog
    })
  }

  _askToTransferDownloads = () => {
    return new Promise((resolve) => {
      Alert.alert(
        translate('External Storage Enabled'),
        translate('Would you like your previous downloads to be transfered or deleted?'),
        [
          {
            text: translate('Transfer'),
            onPress: async () => {
              try {
                await moveDownloadedPodcastsToExternalStorage()
              } catch (err) {
                console.log('Ext Storage Move Error: ', err.message)
              }
              resolve(true)
            }
          },
          {
            text: translate('Delete'),
            onPress: async () => {
              try {
                await removeDownloadedPodcastsFromInternalStorage()
                await DownloadState.updateDownloadedPodcasts()
              } catch (err) {
                console.log('Ext Storage Deletion Error: ', err.message)
              }
              resolve(true)
            }
          }
        ]
      )
    })
  }

  _handleToggleExternalStorage = async () => {
    const { customDownloadLocation } = this.state
    if (customDownloadLocation) {
      Alert.alert(
        translate('Disable External Storage?'),
        translate('All downloaded episodes will be deleted from External Storage.'),
        [
          {
            text: translate('OK'),
            onPress: async () => {
              try {
                await removeAllDownloadedPodcasts()
                await DownloadState.updateDownloadedPodcasts()
              } catch (err) {
                console.log('Ext Storage Deletion Error: ', err.message)
              }
              await AsyncStorage.removeItem(PV.Keys.EXT_STORAGE_DLOAD_LOCATION)
              this.setState({ customDownloadLocation: null })
            }
          },
          {
            text: translate('Nevermind')
          }
        ]
      )
    } else {
      try {
        const grantedWrite = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
          title: translate('Podverse External Storage Permission'),
          message: translate("Podverse would like to access your device's external storage to store downloaded media."),
          buttonNegative: translate('Cancel'),
          buttonPositive: translate('Approve')
        })
        const grantedRead = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE, {
          title: translate('Podverse External Storage Permission'),
          message: translate(
            "Podverse would like to access your device's external storage to access your downloaded media."
          ),
          buttonNegative: translate('Cancel'),
          buttonPositive: translate('Approve')
        })

        if (grantedWrite === PermissionsAndroid.RESULTS.GRANTED && grantedRead === PermissionsAndroid.RESULTS.GRANTED) {
          await this._setExtDownloadFileLocation()
          await this._askToTransferDownloads()
        } else {
          Alert.alert(
            translate('Permission Denied'),
            translate('The device does not allow Podverse to access the external storage for downloads.'),
            [
              {
                text: translate('OK'),
                onPress: async () => {
                  await AsyncStorage.removeItem(PV.Keys.EXT_STORAGE_DLOAD_LOCATION)
                  this.setState({ customDownloadLocation: null })
                }
              },
              {
                text: translate('Go To Settings'),
                onPress: () => {
                  Linking.openSettings()
                }
              }
            ]
          )
        }
      } catch (err) {
        console.log(err)
        await AsyncStorage.removeItem(PV.Keys.EXT_STORAGE_DLOAD_LOCATION)
        this.setState({ customDownloadLocation: null })
      }
    }
  }

  _setExtDownloadFileLocation = async () => {
    try {
      const extPath = RNFS.ExternalStorageDirectoryPath + '/Podverse'
      try {
        const resp = await RNFS.stat(extPath)
        if (!resp.isDirectory()) {
          throw new Error('File does not exist') // This error message is to match RNFS message and attempt to create the folder.
        }
      } catch (error) {
        if (error.message === 'File does not exist') {
          await RNFS.mkdir(extPath)
        }
      }

      await AsyncStorage.setItem(PV.Keys.EXT_STORAGE_DLOAD_LOCATION, extPath)
      this.setState({ customDownloadLocation: extPath })
    } catch (err) {
      Alert.alert(
        translate('Error Setting External Storage'),
        translate(
          'Something went wrong when trying to create a Podverse folder in your external storage card. More Info: '
        ) + err.message,
        [
          {
            text: translate('OK'),
            onPress: async () => {
              await AsyncStorage.removeItem(PV.Keys.EXT_STORAGE_DLOAD_LOCATION)
              this.setState({ customDownloadLocation: null })
            }
          }
        ]
      )
    }
  }

  _handleDeleteDownloadedEpisodes = () => {
    this.setState(
      {
        isLoading: true,
        showDeleteDownloadedEpisodesDialog: false
      },
      () => {
        (async () => {
          try {
            await removeAllDownloadedPodcasts()
          } catch (error) {
            //
          }
          DownloadState.updateDownloadedPodcasts()
          this.setState({ isLoading: false })
        })()
      }
    )
  }

  render() {
    const {
      autoDeleteEpisodeOnEnd,
      downloadedEpisodeLimitCount,
      downloadedEpisodeLimitDefault,
      downloadingWifiOnly,
      isLoading,
      showDeleteDownloadedEpisodesDialog,
      showSetAllDownloadDialog,
      showSetAllDownloadDialogIsCount,
      customDownloadLocation
    } = this.state

    return (
      <ScrollView
        contentContainerStyle={styles.scrollViewContentContainer}
        style={styles.wrapper}
        testID={`${testIDPrefix}_view`}>
        {isLoading && <ActivityIndicator fillSpace testID={testIDPrefix} />}
        {!isLoading && (
          <>
            <View style={core.itemWrapper}>
              <SwitchWithText
                onValueChange={this._toggleDownloadingWifiOnly}
                accessibilityLabel={translate('Only allow downloading episodes when connected to Wifi')}
                testID={`${testIDPrefix}_only_allow_downloading_when_connected_to_wifi`}
                text={translate('Only allow downloading episodes when connected to Wifi')}
                value={!!downloadingWifiOnly}
              />
            </View>
            {Platform.OS === 'android' && (
              <View style={core.itemWrapper}>
                <SwitchWithText
                  accessibilityLabel={translate('Use External Storage For Downloads')}
                  onValueChange={this._handleToggleExternalStorage}
                  testID={`${testIDPrefix}_external_storage_location`}
                  text={translate('Use External Storage For Downloads')}
                  value={!!customDownloadLocation}
                />
              </View>
            )}
            <View style={core.itemWrapper}>
              <SwitchWithText
                accessibilityLabel={translate('Delete downloaded episodes after end is reached')}
                onValueChange={this._toggleAutoDeleteEpisodeOnEnd}
                testID={`${testIDPrefix}_auto_delete_episode`}
                text={translate('Delete downloaded episodes after end is reached')}
                value={!!autoDeleteEpisodeOnEnd}
              />
            </View>
            <View style={core.itemWrapper}>
              <SwitchWithText
                accessibilityLabel={translate('Limit the number of downloaded episodes for each podcast by default')}
                onValueChange={this._handleSelectDownloadedEpisodeLimitDefault}
                testID={`${testIDPrefix}_limit_the_number_of_downloaded_episodes`}
                text={translate('Limit the number of downloaded episodes for each podcast by default')}
                value={!!downloadedEpisodeLimitDefault}
              />
            </View>
            <View style={core.itemWrapper}>
              <NumberSelectorWithText
                // eslint-disable-next-line max-len
                accessibilityHint={translate(
                  'ARIA HINT - set the maximum number of downloaded episodes to save from each podcast on your device'
                )}
                // eslint-disable-next-line max-len
                accessibilityLabel={`${translate('Default downloaded episode limit for each podcast')}`}
                handleChangeText={this._handleChangeDownloadedEpisodeLimitCountText}
                handleSubmitEditing={this._handleSetGlobalDownloadedEpisodeLimitCount}
                selectedNumber={downloadedEpisodeLimitCount}
                testID={`${testIDPrefix}_default_downloaded_episode_limit`}
                text={translate('Default downloaded episode limit for each podcast')}
              />
            </View>
            <Button
              accessibilityLabel={translate('Delete Downloaded Episodes')}
              onPress={this._handleToggleDeleteDownloadedEpisodesDialog}
              testID={`${testIDPrefix}_delete_downloaded_episodes`}
              text={translate('Delete Downloaded Episodes')}
              wrapperStyles={core.button}
            />
            <Dialog.Container visible={showSetAllDownloadDialog}>
              <Dialog.Title>{translate('Global Update')}</Dialog.Title>
              <Dialog.Description>
                {translate('Do you want to update the download limit for all of your currently subscribed podcasts')}
              </Dialog.Description>
              <Dialog.Button
                label={translate('No')}
                onPress={this._handleToggleSetAllDownloadDialog}
                {...(testIDPrefix
                  ? { testID: `${testIDPrefix}_dialog_update_download_limit_no_button`.prependTestId() }
                  : {})}
              />
              <Dialog.Button
                label={translate('Yes')}
                onPress={
                  showSetAllDownloadDialogIsCount
                    ? this._handleUpdateAllDownloadedEpiosdeLimitCount
                    : this._handleUpdateAllDownloadedEpiosdeLimitDefault
                }
                {...(testIDPrefix
                  ? { testID: `${testIDPrefix}_dialog_update_download_limit_yes_button`.prependTestId() }
                  : {})}
              />
            </Dialog.Container>
            <Dialog.Container visible={showDeleteDownloadedEpisodesDialog}>
              <Dialog.Title>{translate('Delete All Downloaded Episodes')}</Dialog.Title>
              <Dialog.Description>
                {translate('Are you sure you want to delete all of your downloaded episodes')}
              </Dialog.Description>
              <Dialog.Button
                label={translate('No')}
                onPress={this._handleToggleDeleteDownloadedEpisodesDialog}
                {...(testIDPrefix
                  ? { testID: `${testIDPrefix}_dialog_delete_downloaded_episodes_no`.prependTestId() }
                  : {})}
              />
              <Dialog.Button
                label={translate('Yes')}
                onPress={this._handleDeleteDownloadedEpisodes}
                {...(testIDPrefix
                  ? { testID: `${testIDPrefix}_dialog_delete_downloaded_episodes_yes`.prependTestId() }
                  : {})}
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
