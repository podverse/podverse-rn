import AsyncStorage from '@react-native-community/async-storage'
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo'
import React, { Component } from 'react'
import { Image, Platform, StatusBar, View, YellowBox } from 'react-native'
import { getFontScale } from 'react-native-device-info'
import 'react-native-gesture-handler'
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
import { addOrUpdateHistoryItem } from './src/services/history'
import { getNowPlayingItem, updateUserPlaybackPosition } from './src/services/player'
import initialState from './src/state/initialState'
import { darkTheme, lightTheme } from './src/styles'

YellowBox.ignoreWarnings(['Warning: componentWillUpdate'])

console.disableYellowBox = true

type Props = {}

type State = {
  appReady: boolean
}

setGlobal(initialState)

let ignoreHandleNetworkChange = true

class App extends Component<Props, State> {
  unsubscribeNetListener: NetInfoSubscription | null

  constructor(props: Props) {
    super(props)
    StatusBar.setBarStyle('light-content')
    Platform.OS === 'android' && StatusBar.setBackgroundColor(PV.Colors.brandColor)
    this.state = {
      appReady: false
    }
    this.unsubscribeNetListener = null
    downloadCategoriesList()
  }

  async componentDidMount() {
    TrackPlayer.registerPlaybackService(() => require('./src/services/playerEvents'))
    const darkModeEnabled = await AsyncStorage.getItem(PV.Keys.DARK_MODE_ENABLED)
    await this.setupGlobalState(darkModeEnabled === 'TRUE' || darkModeEnabled === null ? darkTheme : lightTheme)
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

    const nowPlayingItem = await getNowPlayingItem()

    if (state.type === 'wifi') {
      refreshDownloads()
      if (nowPlayingItem) {
        await addOrUpdateHistoryItem(nowPlayingItem)
        await updateUserPlaybackPosition()
      }
    } else if (state.type === 'cellular') {
      const downloadingWifiOnly = await AsyncStorage.getItem(PV.Keys.DOWNLOADING_WIFI_ONLY)
      if (!downloadingWifiOnly) refreshDownloads()
      if (nowPlayingItem) {
        await addOrUpdateHistoryItem(nowPlayingItem)
        await updateUserPlaybackPosition()
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
    return (
      <View style={{ backgroundColor: PV.Colors.brandColor, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Image source={PV.Images.BANNER} resizeMode='contain' />
      </View>
    )
  }

  render() {
    return this.state.appReady ? (
      <View style={{ flex: 1 }}>
        <Router />
        <OverlayAlert />
      </View>
    ) : (
      this._renderIntersitial()
    )
  }
}

export default App
