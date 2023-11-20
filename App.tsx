import 'react-native-gesture-handler'
import AsyncStorage from '@react-native-community/async-storage'
import NetInfo, { NetInfoSubscription } from '@react-native-community/netinfo'
import React, { Component } from 'react'
import { Image, LogBox, Platform, StatusBar, View } from 'react-native'
import Config from 'react-native-config'
import { getFontScale } from 'react-native-device-info'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Orientation from 'react-native-orientation-locker'
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context'
import TrackPlayer from 'react-native-track-player'
import { setGlobal } from 'reactn'
import {
  UpdateRequiredOverlay,
  OverlayAlert,
  ImageFullView,
  BoostDropdownBanner,
  LoadingInterstitialView,
  NotificationBanner
} from './src/components'
import { checkIfFDroidAppVersion, pvIsTablet } from './src/lib/deviceDetection'
import { registerAndroidAutoModule, requestDrawOverAppsPermission,
  unregisterAndroidAutoModule } from './src/lib/carplay/PVCarPlay.android'
import { refreshDownloads } from './src/lib/downloader'
import { PV } from './src/resources'
import { determineFontScaleMode } from './src/resources/Fonts'
import { GlobalTheme } from './src/resources/Interfaces'
import Router from './src/Router'
import { isInitialLoadPodcastsScreen } from './src/screens/PodcastsScreen'
import { downloadCategoriesList } from './src/services/category'
import PVEventEmitter from './src/services/eventEmitter'
import { playerHandlePauseWithUpdate } from './src/services/player'
import { PlayerAudioSetupService } from './src/services/playerAudioSetup'
import { isOnMinimumAllowedVersion } from './src/services/versioning'
import { pauseDownloadingEpisodesAll } from './src/state/actions/downloads'
import { settingsRunEveryStartup } from './src/state/actions/settings'
import initialState from './src/state/initialState'
import { darkTheme, lightTheme } from './src/styles'
import { hasValidDownloadingConnection } from './src/lib/network'
import {
  handleCarPlayPodcastsUpdate,
  handleCarPlayQueueUpdate,
  registerCarModule,
  showRootView,
  unregisterCarModule
} from './src/lib/carplay/PVCarPlay'

LogBox.ignoreLogs(['EventEmitter.removeListener', 'Require cycle'])

type Props = any

type State = {
  appReady: boolean
  minVersionMismatch: boolean
}

setGlobal(initialState)

let ignoreHandleNetworkChange = true
let carplayEventsInitialized = false

class App extends Component<Props, State> {
  unsubscribeNetListener: NetInfoSubscription | null

  constructor(props: Props) {
    super(props)

    if (!pvIsTablet()) {
      Orientation.lockToPortrait()
    }

    this.state = {
      appReady: false,
      minVersionMismatch: false
    }
    this.unsubscribeNetListener = null
    downloadCategoriesList()
  }

  async componentDidMount() {
    // Android Auto
    if (Platform.OS === 'android' && !checkIfFDroidAppVersion()) {
      // initialize Android Auto Tabs with no content. Content will be updated as they are loaded to the global state.
      registerAndroidAutoModule()
      await requestDrawOverAppsPermission()
    }
    
    TrackPlayer.registerPlaybackService(() => require('./src/services/playerAudioEvents'))
    await PlayerAudioSetupService()

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

    await settingsRunEveryStartup()

    this.unsubscribeNetListener = NetInfo.addEventListener(this.handleNetworkChange)

    // iOS CarPlay
    Platform.OS === 'ios' && registerCarModule(this.onConnect, this.onDisconnect)
  }

  componentWillUnmount() {
    this.unsubscribeNetListener && this.unsubscribeNetListener()

    // iOS CarPlay
    Platform.OS === 'ios' && unregisterCarModule(this.onConnect, this.onDisconnect)
    // Android Auto

    if (Platform.OS === 'android' && !checkIfFDroidAppVersion()) {
      unregisterAndroidAutoModule()
    }
  }

  onConnect = () => {
    // Do things now that carplay is connected
    showRootView()
    if (!carplayEventsInitialized) {
      carplayEventsInitialized = true
      PVEventEmitter.on(PV.Events.QUEUE_HAS_UPDATED, handleCarPlayQueueUpdate)
      PVEventEmitter.on(PV.Events.APP_FINISHED_INITALIZING_FOR_CARPLAY, handleCarPlayPodcastsUpdate)

      /*
        This code is intended to correct a race condition when the mobile app is already initialized,
        then CarPlay is connected later.
      */
      if (!isInitialLoadPodcastsScreen) {
        handleCarPlayPodcastsUpdate()
      }
    }
  }

  onDisconnect = () => {
    playerHandlePauseWithUpdate()

    // Do things now that carplay is disconnected
    PVEventEmitter.removeListener(PV.Events.QUEUE_HAS_UPDATED, handleCarPlayQueueUpdate)
    PVEventEmitter.removeListener(PV.Events.APP_FINISHED_INITALIZING_FOR_CARPLAY, handleCarPlayPodcastsUpdate)
  }

  handleNetworkChange = () => {
    ;(async () => {
      // isInternetReachable will be false

      await this.checkAppVersion()
      this.setState({ appReady: true })
      // Don't continue handleNetworkChange when internet is first reachable on initial app launch
      if (ignoreHandleNetworkChange) {
        ignoreHandleNetworkChange = false
        return
      }
      const skipCannotDownloadAlert = true
      if (await hasValidDownloadingConnection(skipCannotDownloadAlert)) {
        refreshDownloads()
      } else {
        pauseDownloadingEpisodesAll()
      }
    })()
  }

  setupGlobalState = async (theme: GlobalTheme) => {
    const fontScale = await getFontScale()
    const fontScaleMode = determineFontScaleMode(fontScale)

    setGlobal({
      globalTheme: theme,
      fontScaleMode,
      fontScale
    })
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
        : {
            flex: 1
          }

    if (this.state.minVersionMismatch) {
      return <UpdateRequiredOverlay />
    }

    const navigation = this.props?.navigation

    return this.state.appReady ? (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics} style={wrapperStyle}>
          <View style={{ flex: 1 }}>
            <Router />
            <OverlayAlert />
          </View>
          <ImageFullView />
          <BoostDropdownBanner />
          <NotificationBanner navigation={navigation} on />
        </SafeAreaProvider>
        <LoadingInterstitialView />
      </GestureHandlerRootView>
    ) : (
      this._renderIntersitial()
    )
  }
}

export default App
