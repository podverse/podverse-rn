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
import { OverlayAlert } from './src/components'
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
}

setGlobal(initialState)

let ignoreHandleNetworkChange = true

class App extends Component<Props, State> {
  unsubscribeNetListener: NetInfoSubscription | null

  constructor(props: Props) {
    super(props)
    this.state = {
      appReady: false
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

    await this.setupGlobalState(globalTheme)
    this.unsubscribeNetListener = NetInfo.addEventListener(this.handleNetworkChange)
    await gaInitialize()
  }

  componentWillUnmount() {
    this.unsubscribeNetListener && this.unsubscribeNetListener()
  }

  handleNetworkChange = async (state: NetInfoState) => {
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
  }

  async setupGlobalState(theme: GlobalTheme) {
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
    return this.state.appReady ? (
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <View style={{ flex: 1 }}>
          <Router />
          <OverlayAlert />
        </View>
      </SafeAreaProvider>
    ) : (
      this._renderIntersitial()
    )
  }
}

export default App
