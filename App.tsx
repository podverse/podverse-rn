import AsyncStorage from '@react-native-community/async-storage'
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo'
import React, { Component } from 'react'
import { Image, LogBox, Platform, StatusBar, View } from 'react-native'
import Config from 'react-native-config'
import { getFontScale } from 'react-native-device-info'
import 'react-native-gesture-handler'
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context'
import TrackPlayer from 'react-native-track-player'
import { setGlobal } from 'reactn'
import { isOnMinimumAllowedVersion } from './src/services/versioning'
import { UpdateRequiredOverlay, OverlayAlert, BoostDropdownBanner } from './src/components'
import { refreshDownloads } from './src/lib/downloader'
import { PV } from './src/resources'
import { determineFontScaleMode } from './src/resources/Fonts'
import { GlobalTheme } from './src/resources/Interfaces'
import Router from './src/Router'
import { downloadCategoriesList } from './src/services/category'
import { gaInitialize } from './src/services/googleAnalytics'
import { pauseDownloadingEpisodesAll } from './src/state/actions/downloads'
import initialState from './src/state/initialState'
import { darkTheme, lightTheme } from './src/styles'

LogBox.ignoreLogs(['Warning: componentWillUpdate'])
LogBox.ignoreAllLogs(true)

type Props = any

type State = {
  appReady: boolean
  minVersionMismatch: boolean
}

setGlobal(initialState)

let ignoreHandleNetworkChange = true

class App extends Component<Props, State> {
  unsubscribeNetListener: NetInfoSubscription | null

  constructor(props: Props) {
    super(props)
    this.state = {
      appReady: false,
      minVersionMismatch: false
    }
    this.unsubscribeNetListener = null
    downloadCategoriesList()
  }

  async componentDidMount() {
    TrackPlayer.registerPlaybackService(() => require('./src/services/playerEvents'))
    StatusBar.setBarStyle('light-content')
    Platform.OS === 'android' && StatusBar.setBackgroundColor(PV.Colors.ink, true)
    const darkModeEnabled = await AsyncStorage.getItem(PV.Keys.DARK_MODE_ENABLED)
    let globalTheme = darkTheme
    if (darkModeEnabled === null) {
      globalTheme = Config.DEFAULT_THEME_DARK ? darkTheme : lightTheme
    } else if (darkModeEnabled === 'FALSE') {
      globalTheme = lightTheme
    }

    await this.checkAppVersion()
    await this.setupGlobalState(globalTheme)
    this.unsubscribeNetListener = NetInfo.addEventListener(this.handleNetworkChange)
    await gaInitialize()
  }

  componentWillUnmount() {
    this.unsubscribeNetListener && this.unsubscribeNetListener()
  }

  handleNetworkChange = (state: NetInfoState) => {
    (async () => {
      // isInternetReachable will be false
      if (!state.isInternetReachable) {
        return
      }
  
      // Don't continue handleNetworkChange when internet is first reachable on initial app launch
      if (ignoreHandleNetworkChange) {
        ignoreHandleNetworkChange = false
        return
      }
  
      if (state.type === 'wifi') {
        refreshDownloads()
      } else if (state.type === 'cellular') {
        const downloadingWifiOnly = await AsyncStorage.getItem(PV.Keys.DOWNLOADING_WIFI_ONLY)
        if (downloadingWifiOnly) {
          pauseDownloadingEpisodesAll()
        } else {
          refreshDownloads()
        }
      }
    })()
  }

  setupGlobalState = async (theme: GlobalTheme) => {
    const fontScale = await getFontScale()
    const fontScaleMode = determineFontScaleMode(fontScale)

    setGlobal(
      {
        globalTheme: theme,
        fontScaleMode,
        fontScale
      },
      () => {
        this.setState({ appReady: true })
      }
    )
  }

  checkAppVersion = async () => {
    const versionValid = await isOnMinimumAllowedVersion()
    this.setState({ minVersionMismatch: !versionValid })
  }

  _renderIntersitial = () => {
    if (Platform.OS === 'ios') {
      return null
    }

    return (
      <View style={{ backgroundColor: PV.Colors.ink, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Image source={PV.Images.BANNER} resizeMode='contain' />
      </View>
    )
  }

  render() {
    // Prevent white screen flash on navigation on Android
    const wrapperStyle =
      Platform.OS === 'android'
        ? {
            backgroundColor: PV.Colors.ink,
            borderColor: PV.Colors.ink,
            shadowOpacity: 1,
            opacity: 1
          }
        : {}

    if (this.state.minVersionMismatch) {
      return <UpdateRequiredOverlay />
    }

    return this.state.appReady ? (
      <SafeAreaProvider initialMetrics={initialWindowMetrics} style={wrapperStyle}>
        <View style={{ flex: 1 }}>
          <Router />
          <OverlayAlert />
        </View>
        <BoostDropdownBanner />
      </SafeAreaProvider>
    ) : (
      this._renderIntersitial()
    )
  }
}

export default App
