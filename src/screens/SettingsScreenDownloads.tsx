/* eslint-disable max-len */
import AsyncStorage from '@react-native-community/async-storage'
import NetInfo from '@react-native-community/netinfo'
import { StyleSheet, PermissionsAndroid, Platform, Alert, Linking } from 'react-native'
import React from 'reactn'
import RNFS from 'react-native-fs'
import * as ScopedStorage from 'react-native-scoped-storage'
import {
  ActivityIndicator,
  Button,
  Divider,
  NumberSelectorWithText,
  ScrollView,
  SwitchWithText,
  View
} from '../components'
import { errorLogger } from '../lib/logger'
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
import { getAndroidVersion } from '../lib/utility'
import { PV } from '../resources'
import { trackPageView } from '../services/tracking'
import * as DownloadState from '../state/actions/downloads'
import { core } from '../styles'
import { cellNetworkSupported } from '../lib/network'

const _fileName = 'src/screens/SettingsScreenDownloads.tsx'

type Props = {
  navigation: any
}

type State = {
  autoDeleteEpisodeOnEnd?: boolean
  autoDownloadByDefault?: boolean
  downloadedEpisodeLimitCount: any
  downloadedEpisodeLimitDefault: any
  downloadingWifiOnly?: boolean
  isLoading?: boolean
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
    const [
      autoDeleteEpisodeOnEnd,
      autoDownloadByDefault,
      downloadedEpisodeLimitCount,
      downloadedEpisodeLimitDefault,
      downloadingWifiOnly,
      customDownloadLocation
    ] = await Promise.all([
      AsyncStorage.getItem(PV.Keys.AUTO_DELETE_EPISODE_ON_END),
      AsyncStorage.getItem(PV.Keys.AUTO_DOWNLOAD_BY_DEFAULT),
      AsyncStorage.getItem(PV.Keys.DOWNLOADED_EPISODE_LIMIT_GLOBAL_COUNT),
      AsyncStorage.getItem(PV.Keys.DOWNLOADED_EPISODE_LIMIT_GLOBAL_DEFAULT),
      AsyncStorage.getItem(PV.Keys.DOWNLOADING_WIFI_ONLY),
      AsyncStorage.getItem(PV.Keys.EXT_STORAGE_DLOAD_LOCATION)
    ])

    this.setState({
      autoDeleteEpisodeOnEnd: !!autoDeleteEpisodeOnEnd,
      autoDownloadByDefault: !!autoDownloadByDefault,
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
    if (!newValue && cellNetworkSupported(state)) {
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

  _toggleAutoDownloadByDefault = (value: boolean) => {
    this.setState({ autoDownloadByDefault: value }, () => {
      (async () => {
        value
          ? await AsyncStorage.setItem(PV.Keys.AUTO_DOWNLOAD_BY_DEFAULT, 'TRUE')
          : await AsyncStorage.removeItem(PV.Keys.AUTO_DOWNLOAD_BY_DEFAULT)
      })()
    })
  }

  _handleSelectDownloadedEpisodeLimitDefault = () => {
    const newDownloadedEpisodeLimitDefault = !this.state.downloadedEpisodeLimitDefault
    this.setState({ downloadedEpisodeLimitDefault: newDownloadedEpisodeLimitDefault }, () => {
      (async () => {
        await setDownloadedEpisodeLimitGlobalDefault(newDownloadedEpisodeLimitDefault)
        this.setGlobal({ downloadedEpisodeLimitDefault: newDownloadedEpisodeLimitDefault })
      })()
    })
  }

  _handleShowSetAllDownloadDialog = (isCount?: boolean) => {
    const DOWNLOAD_LIMIT_UPDATE = PV.Alerts.DOWNLOAD_LIMIT_UPDATE(() =>
      isCount ? this._handleUpdateAllDownloadedEpiosdeLimitCount : this._handleUpdateAllDownloadedEpiosdeLimitDefault
    )
    Alert.alert(DOWNLOAD_LIMIT_UPDATE.title, DOWNLOAD_LIMIT_UPDATE.message, DOWNLOAD_LIMIT_UPDATE.buttons)
  }

  _handleUpdateAllDownloadedEpiosdeLimitCount = async () => {
    await updateAllDownloadedEpisodeLimitCounts(this.state.downloadedEpisodeLimitCount)
  }

  _handleUpdateAllDownloadedEpiosdeLimitDefault = async () => {
    await updateAllDownloadedEpisodeLimitDefaults(this.state.downloadedEpisodeLimitDefault)
  }

  _handleChangeDownloadedEpisodeLimitCountText = (value: number) => {
    this.setState({ downloadedEpisodeLimitCount: value })
  }

  _handleSetGlobalDownloadedEpisodeLimitCount = async () => {
    const { downloadedEpisodeLimitCount } = this.state
    await setDownloadedEpisodeLimitGlobalCount(downloadedEpisodeLimitCount)
    this._handleShowSetAllDownloadDialog(true)
    this.setGlobal({ downloadedEpisodeLimitCount })
  }

  _handleShowDeleteDownloadedEpisodesDialog = () => {
    const DOWNLOADED_EPISODES_DELETE = PV.Alerts.DOWNLOADED_EPISODES_DELETE(this._handleDeleteDownloadedEpisodes)
    Alert.alert(
      DOWNLOADED_EPISODES_DELETE.title,
      DOWNLOADED_EPISODES_DELETE.message,
      DOWNLOADED_EPISODES_DELETE.buttons
    )
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
                errorLogger(_fileName, 'Ext Storage Move', err.message)
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
                errorLogger(_fileName, 'Ext Storage Deletion', err.message)
              }
              resolve(true)
            }
          }
        ]
      )
    })
  }

  _handleToggleExternalStorage = async () => {
    if (Platform.OS === 'android') {
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
                  errorLogger(_fileName, '_handleToggleExternalStorage delete', err.message)
                }
                await AsyncStorage.removeItem(PV.Keys.EXT_STORAGE_DLOAD_LOCATION)
                this.setState({ customDownloadLocation: null })
              }
            },
            {
              text: translate('Cancel')
            }
          ]
        )
      } else {
        try {
          const androidVersion = getAndroidVersion()
          if (androidVersion >= 10) {
            await this._setExtDownloadFileLocationAndroid10()
            // await this._askToTransferDownloads()
          } else {
            const grantedWrite = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
              {
                title: translate('Podverse External Storage Permission'),
                message: translate(
                  `Podverse would like to access your device's external storage to store downloaded media.`
                ),
                buttonNegative: translate('Cancel'),
                buttonPositive: translate('Approve')
              }
            )
            const grantedRead = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE, {
              title: translate('Podverse External Storage Permission'),
              message: translate(
                "Podverse would like to access your device's external storage to access your downloaded media."
              ),
              buttonNegative: translate('Cancel'),
              buttonPositive: translate('Approve')
            })

            if (
              grantedWrite === PermissionsAndroid.RESULTS.GRANTED &&
              grantedRead === PermissionsAndroid.RESULTS.GRANTED
            ) {
              await this._setExtDownloadFileLocationAndroid9()
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
          }
        } catch (err) {
          errorLogger(_fileName, 'final catch', err)
          await AsyncStorage.removeItem(PV.Keys.EXT_STORAGE_DLOAD_LOCATION)
          this.setState({ customDownloadLocation: null })
        }
      }
    }
  }

  _setExtDownloadFileLocationAndroid10 = async () => {
    const dir = await ScopedStorage.openDocumentTree(true)

    if (dir?.uri) {
      const parsedDownloadLocation = dir.uri
      await AsyncStorage.setItem(PV.Keys.EXT_STORAGE_DLOAD_LOCATION, parsedDownloadLocation)
      this.setState({ customDownloadLocation: parsedDownloadLocation })
    } else {
      await AsyncStorage.removeItem(PV.Keys.EXT_STORAGE_DLOAD_LOCATION)
      this.setState({ customDownloadLocation: null })
    }
  }

  _setExtDownloadFileLocationAndroid9 = async () => {
    try {
      const extPath = RNFS.ExternalStorageDirectoryPath
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
        isLoading: true
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
      autoDownloadByDefault,
      downloadedEpisodeLimitCount,
      downloadedEpisodeLimitDefault,
      downloadingWifiOnly,
      isLoading,
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
              <View style={core.itemWrapper}>
                <SwitchWithText
                  accessibilityLabel={translate('Delete downloaded episodes after end is reached')}
                  onValueChange={this._toggleAutoDeleteEpisodeOnEnd}
                  testID={`${testIDPrefix}_auto_delete_episode`}
                  text={translate('Delete downloaded episodes after end is reached')}
                  value={!!autoDeleteEpisodeOnEnd}
                />
              </View>
              <SwitchWithText
                accessibilityLabel={translate('Auto download by default on subscribe')}
                onValueChange={this._toggleAutoDownloadByDefault}
                subText={
                  !!autoDownloadByDefault
                    ? translate('Auto download by default on subscribe - subtext on')
                    : translate('Auto download by default on subscribe - subtext off')
                }
                subTextAccessible
                testID={`${testIDPrefix}_auto_download_by_default`}
                text={translate('Auto download by default on subscribe')}
                value={!!autoDownloadByDefault}
              />
            </View>
            <Divider style={core.itemWrapper} />
            <View style={core.itemWrapper}>
              <SwitchWithText
                accessibilityLabel={translate('Limit the number of downloaded episodes for each podcast by default')}
                onValueChange={this._handleSelectDownloadedEpisodeLimitDefault}
                testID={`${testIDPrefix}_limit_the_number_of_downloaded_episodes`}
                text={translate('Limit the number of downloaded episodes for each podcast by default')}
                value={!!downloadedEpisodeLimitDefault}
              />
            </View>
            {!!downloadedEpisodeLimitDefault && (
              <View style={core.itemWrapper}>
                <NumberSelectorWithText
                  // eslint-disable-next-line max-len
                  accessibilityHint={translate(
                    'ARIA HINT - set the maximum number of downloaded episodes to save from each podcast on your device'
                  )}
                  // eslint-disable-next-line max-len
                  accessibilityLabel={`${translate('Default downloaded episode limit for each podcast')}`}
                  handleChangeText={this._handleChangeDownloadedEpisodeLimitCountText}
                  handleOnBlur={this._handleSetGlobalDownloadedEpisodeLimitCount}
                  selectedNumber={downloadedEpisodeLimitCount}
                  testID={`${testIDPrefix}_default_downloaded_episode_limit`}
                  text={translate('Limit')}
                />
              </View>
            )}
            <Divider />
            <Button
              accessibilityLabel={translate('Delete Downloaded Episodes')}
              onPress={this._handleShowDeleteDownloadedEpisodesDialog}
              testID={`${testIDPrefix}_delete_downloaded_episodes`}
              text={translate('Delete Downloaded Episodes')}
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
